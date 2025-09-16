import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './ui/alert-dialog';
import { ArrowLeft, Plus, Edit, Trash2, Package, ShoppingCart, Users, TrendingUp, Phone, Mail, MapPin, CheckCircle, Clock, Truck, Share2, Copy, MessageCircle, Facebook, Twitter, Instagram, Crown, Settings } from 'lucide-react';
import StoreSettings from './StoreSettings';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  imageUrl: string;
}

interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: { productId: string; productName: string; quantity: number; price: number }[];
  total: number;
  status: string;
  createdAt: string;
  deliveryPersonId?: string;
}

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  status: string;
}

interface MerchantDashboardProps {
  merchantId: string;
  onBack: () => void;
  onSwitchToStore?: () => void;
}

export default function MerchantDashboard({ merchantId, onBack, onSwitchToStore }: MerchantDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryPeople, setDeliveryPeople] = useState<DeliveryPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingDelivery, setIsAddingDelivery] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isPremium, setIsPremium] = useState(false); // Version freemium par défaut
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [storeSettings, setStoreSettings] = useState({
    name: 'Ma Boutique',
    description: 'Commerce local de produits frais',
    logo: '',
    headerImage: ''
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    imageUrl: ''
  });

  const [newDeliveryPerson, setNewDeliveryPerson] = useState({
    name: '',
    phone: '',
    email: ''
  });

  useEffect(() => {
    loadData();
  }, [merchantId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [productsRes, ordersRes, deliveryRes] = await Promise.all([
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/products`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/orders`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }),
        fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/delivery-people`, {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        })
      ]);

      const productsData = await productsRes.json();
      const ordersData = await ordersRes.json();
      const deliveryData = await deliveryRes.json();

      setProducts(productsData.products || []);
      setOrders(ordersData.orders || []);
      
      // Ajouter Paps comme livreur par défaut s'il n'existe pas déjà
      const deliveryPeopleList = deliveryData.deliveryPeople || [];
      const papsExists = deliveryPeopleList.some(dp => dp.id === 'paps_default');
      
      if (!papsExists) {
        deliveryPeopleList.unshift({
          id: 'paps_default',
          name: 'Paps (Service de livraison)',
          phone: '+221 33 XXX XX XX',
          email: 'support@paps.sn',
          status: 'online'
        });
      }
      
      setDeliveryPeople(deliveryPeopleList);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Limitation freemium : max 25 produits
    if (!isPremium && products.length >= 25) {
      toast.error('Version freemium limitée à 25 produits. Passez en Premium pour plus de produits.');
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(newProduct)
      });

      if (response.ok) {
        const result = await response.json();
        setProducts([...products, result.product]);
        setNewProduct({ name: '', description: '', price: 0, category: '', stock: 0, imageUrl: '' });
        setIsAddingProduct(false);
        toast.success('Produit ajouté avec succès');
      } else {
        toast.error('Erreur lors de l\'ajout du produit');
      }
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Erreur lors de l\'ajout du produit');
    }
  };

  const handleEditProduct = async () => {
    if (!editingProduct) return;

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(editingProduct)
      });

      if (response.ok) {
        const result = await response.json();
        setProducts(products.map(p => p.id === editingProduct.id ? result.product : p));
        setEditingProduct(null);
        toast.success('Produit modifié avec succès');
      } else {
        toast.error('Erreur lors de la modification du produit');
      }
    } catch (error) {
      console.error('Error editing product:', error);
      toast.error('Erreur lors de la modification du produit');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${publicAnonKey}` }
      });

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId));
        toast.success('Produit supprimé avec succès');
      } else {
        toast.error('Erreur lors de la suppression du produit');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Erreur lors de la suppression du produit');
    }
  };

  const handleAddDeliveryPerson = async () => {
    if (!newDeliveryPerson.name || !newDeliveryPerson.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Limitation freemium : max 1 livreur personnalisé (+ Paps par défaut)
    const customDeliveryPeople = deliveryPeople.filter(dp => dp.id !== 'paps_default');
    if (!isPremium && customDeliveryPeople.length >= 1) {
      toast.error('Version freemium limitée à 1 livreur. Passez en Premium pour plus de livreurs.');
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/delivery-people`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(newDeliveryPerson)
      });

      if (response.ok) {
        const result = await response.json();
        setDeliveryPeople([...deliveryPeople, result.deliveryPerson]);
        setNewDeliveryPerson({ name: '', phone: '', email: '' });
        setIsAddingDelivery(false);
        toast.success('Livreur ajouté avec succès');
      } else {
        toast.error('Erreur lors de l\'ajout du livreur');
      }
    } catch (error) {
      console.error('Error adding delivery person:', error);
      toast.error('Erreur lors de l\'ajout du livreur');
    }
  };

  const handleAssignOrder = async (orderId: string, deliveryPersonId: string) => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-9f9491c0/merchant/${merchantId}/orders/${orderId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ deliveryPersonId })
      });

      if (response.ok) {
        const result = await response.json();
        setOrders(orders.map(o => o.id === orderId ? result.order : o));
        toast.success('Commande assignée avec succès');
      } else {
        toast.error('Erreur lors de l\'assignation de la commande');
      }
    } catch (error) {
      console.error('Error assigning order:', error);
      toast.error('Erreur lors de l\'assignation de la commande');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      pending: { label: 'En attente', variant: 'secondary' as const },
      assigned: { label: 'Assignée', variant: 'default' as const },
      accepted: { label: 'Acceptée', variant: 'default' as const },
      in_progress: { label: 'En cours', variant: 'default' as const },
      delivered: { label: 'Livrée', variant: 'default' as const }
    };
    
    const statusInfo = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  // Fonctions de partage
  const getStoreUrl = () => {
    return `${window.location.origin}${window.location.pathname}?merchant=${merchantId}`;
  };

  const shareToWhatsApp = () => {
    const storeUrl = getStoreUrl();
    const message = `🛍️ Découvrez ma boutique en ligne !\n\nVenez découvrir mes produits locaux et passez commande facilement :\n${storeUrl}\n\n#CommerceLocal #Livraison`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareToFacebook = () => {
    const storeUrl = getStoreUrl();
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(storeUrl)}`;
    window.open(facebookUrl, '_blank');
  };

  const shareToTwitter = () => {
    const storeUrl = getStoreUrl();
    const message = "🛍️ Découvrez ma boutique en ligne ! Produits locaux et livraison rapide.";
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(storeUrl)}`;
    window.open(twitterUrl, '_blank');
  };

  const copyStoreLink = async () => {
    const storeUrl = getStoreUrl();
    try {
      await navigator.clipboard.writeText(storeUrl);
      toast.success('Lien copié dans le presse-papiers !');
    } catch (err) {
      toast.error('Erreur lors de la copie du lien');
    }
  };

  // Calcul des statistiques
  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const todayOrders = orders.filter(order => 
    new Date(order.createdAt).toDateString() === new Date().toDateString()
  ).length;
  const lowStockProducts = products.filter(product => product.stock < 5).length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur border-b dark:border-gray-700" role="banner">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Button variant="ghost" onClick={onBack} className="mr-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-xl text-gray-900 dark:text-white">Dashboard Commerçant</h1>
              {isPremium && (
                <Badge className="ml-3 bg-[#FFC107] text-[#2C3E50]">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <StoreSettings 
                merchantId={merchantId}
                currentSettings={storeSettings}
                onSettingsUpdate={setStoreSettings}
              />
              
              {onSwitchToStore && (
                <Button variant="outline" onClick={onSwitchToStore} className="border-[#5CBCB6] text-[#5CBCB6] hover:bg-[#E8F6F5]">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Voir ma boutique
                </Button>
              )}
              
              <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-[#5CBCB6] text-[#5CBCB6] hover:bg-[#E8F6F5]">
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager ma boutique
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Partager votre boutique</DialogTitle>
                    <DialogDescription>
                      Partagez le lien de votre boutique sur les réseaux sociaux ou copiez le lien directement.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-2">Lien de votre boutique :</p>
                      <p className="text-sm font-mono bg-white p-2 rounded border break-all">
                        {getStoreUrl()}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button onClick={shareToWhatsApp} className="bg-green-600 hover:bg-green-700">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        WhatsApp
                      </Button>
                      <Button onClick={shareToFacebook} className="bg-blue-600 hover:bg-blue-700">
                        <Facebook className="w-4 h-4 mr-2" />
                        Facebook
                      </Button>
                      <Button onClick={shareToTwitter} className="bg-sky-500 hover:bg-sky-600">
                        <Twitter className="w-4 h-4 mr-2" />
                        Twitter
                      </Button>
                      <Button onClick={copyStoreLink} variant="outline">
                        <Copy className="w-4 h-4 mr-2" />
                        Copier le lien
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              {!isPremium && (
                <Button 
                  onClick={() => setIsPremium(true)} 
                  className="bg-[#FFC107] text-[#2C3E50] hover:bg-[#E0A800]"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Passer en Premium
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main" aria-label="Contenu principal du dashboard commerçant">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="delivery">Livreurs</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Ventes totales</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{totalSales.toLocaleString('fr-FR')} XOF</div>
                  <p className="text-xs text-muted-foreground">
                    Toutes les commandes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Commandes aujourd'hui</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{todayOrders}</div>
                  <p className="text-xs text-muted-foreground">
                    Nouvelles commandes
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Produits en stock</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{products.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Produits actifs
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Stock faible</CardTitle>
                  <Package className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-red-500">{lowStockProducts}</div>
                  <p className="text-xs text-muted-foreground">
                    Produits &lt; 5 unités
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Commandes récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">{order.customerName}</p>
                          <p className="text-xs text-gray-500">{order.total.toLocaleString('fr-FR')} XOF</p>
                        </div>
                        {getStatusBadge(order.status)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Produits en stock faible</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {products.filter(p => p.stock < 5).slice(0, 5).map((product) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm">{product.name}</p>
                          <p className="text-xs text-red-500">Stock: {product.stock}</p>
                        </div>
                        <Badge variant="destructive">Faible</Badge>
                      </div>
                    ))}
                    {products.filter(p => p.stock < 5).length === 0 && (
                      <p className="text-sm text-gray-500">Tous les produits ont un stock suffisant</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl">Gestion des produits</h2>
                {!isPremium && (
                  <p className="text-sm text-gray-600 mt-1">
                    Version freemium : {products.length}/25 produits
                  </p>
                )}
              </div>
              <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
                <DialogTrigger asChild>
                  <Button disabled={!isPremium && products.length >= 25}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un produit
                    {!isPremium && products.length >= 25 && (
                      <Crown className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau produit</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations du produit ci-dessous.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">Nom</Label>
                      <Input
                        id="name"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="price" className="text-right">Prix (XOF)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newProduct.price}
                        onChange={(e) => setNewProduct({...newProduct, price: parseFloat(e.target.value) || 0})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="category" className="text-right">Catégorie</Label>
                      <Input
                        id="category"
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="stock" className="text-right">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={newProduct.stock}
                        onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="imageUrl" className="text-right">Image URL</Label>
                      <Input
                        id="imageUrl"
                        value={newProduct.imageUrl}
                        onChange={(e) => setNewProduct({...newProduct, imageUrl: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label htmlFor="description" className="text-right">Description</Label>
                      <Textarea
                        id="description"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddProduct}>
                      Ajouter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <Card key={product.id} className="bg-white/80 dark:bg-gray-800/60 backdrop-blur">
                  <CardContent className="p-4">
                    {product.imageUrl && (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-md mb-4"
                      />
                    )}
                    <h3 className="text-lg mb-2">{product.name}</h3>
                    <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl">{product.price.toLocaleString('fr-FR')} XOF</span>
                      <Badge variant={product.stock < 5 ? "destructive" : "secondary"}>
                        Stock: {product.stock}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingProduct(product)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Modifier le produit</DialogTitle>
                          </DialogHeader>
                          {editingProduct && (
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-name" className="text-right">Nom</Label>
                                <Input
                                  id="edit-name"
                                  value={editingProduct.name}
                                  onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-price" className="text-right">Prix (€)</Label>
                                <Input
                                  id="edit-price"
                                  type="number"
                                  value={editingProduct.price}
                                  onChange={(e) => setEditingProduct({...editingProduct, price: parseFloat(e.target.value) || 0})}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="edit-stock" className="text-right">Stock</Label>
                                <Input
                                  id="edit-stock"
                                  type="number"
                                  value={editingProduct.stock}
                                  onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                                  className="col-span-3"
                                />
                              </div>
                            </div>
                          )}
                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setEditingProduct(null)}>
                              Annuler
                            </Button>
                            <Button onClick={handleEditProduct}>
                              Sauvegarder
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Supprimer le produit</AlertDialogTitle>
                            <AlertDialogDescription>
                              Êtes-vous sûr de vouloir supprimer "{product.name}" ? Cette action est irréversible.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteProduct(product.id)}>
                              Supprimer
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <h2 className="text-2xl">Gestion des commandes</h2>
            
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg">Commande #{order.id.slice(-8)}</h3>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      {getStatusBadge(order.status)}
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h4 className="text-sm mb-2">Informations client</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p className="flex items-center"><Users className="w-4 h-4 mr-2" />{order.customerName}</p>
                          <p className="flex items-center"><Phone className="w-4 h-4 mr-2" />{order.customerPhone}</p>
                          <p className="flex items-center"><MapPin className="w-4 h-4 mr-2" />{order.customerAddress}</p>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm mb-2">Articles commandés</h4>
                        <div className="space-y-1">
                          {order.items.map((item, index) => (
                            <p key={index} className="text-sm text-gray-600">
                              {item.quantity}x {item.productName} - {(item.price * item.quantity).toFixed(2)} €
                            </p>
                          ))}
                          <p className="font-semibold text-sm">Total: {order.total.toFixed(2)} €</p>
                        </div>
                      </div>
                    </div>

                    {order.status === 'pending' && (
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="text-sm mb-2">Assigner à un livreur</h4>
                        <div className="flex gap-2 flex-wrap">
                          {deliveryPeople.filter(dp => dp.status === 'online').map((deliveryPerson) => (
                            <Button
                              key={deliveryPerson.id}
                              variant="outline"
                              size="sm"
                              onClick={() => handleAssignOrder(order.id, deliveryPerson.id)}
                            >
                              <Truck className="w-4 h-4 mr-2" />
                              {deliveryPerson.name}
                            </Button>
                          ))}
                          {deliveryPeople.filter(dp => dp.status === 'online').length === 0 && (
                            <p className="text-sm text-gray-500">Aucun livreur disponible</p>
                          )}
                        </div>
                      </div>
                    )}

                    {order.deliveryPersonId && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm text-gray-600">
                          Assignée à: {deliveryPeople.find(dp => dp.id === order.deliveryPersonId)?.name}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="delivery" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl">Gestion des livreurs</h2>
                {!isPremium && (
                  <p className="text-sm text-gray-600 mt-1">
                    Version freemium : 1 livreur personnalisé + Paps inclus
                  </p>
                )}
              </div>
              <Dialog open={isAddingDelivery} onOpenChange={setIsAddingDelivery}>
                <DialogTrigger asChild>
                  <Button disabled={!isPremium && deliveryPeople.filter(dp => dp.id !== 'paps_default').length >= 1}>
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un livreur
                    {!isPremium && deliveryPeople.filter(dp => dp.id !== 'paps_default').length >= 1 && (
                      <Crown className="w-4 h-4 ml-2" />
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Ajouter un nouveau livreur</DialogTitle>
                    <DialogDescription>
                      Remplissez les informations du livreur ci-dessous.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="delivery-name" className="text-right">Nom</Label>
                      <Input
                        id="delivery-name"
                        value={newDeliveryPerson.name}
                        onChange={(e) => setNewDeliveryPerson({...newDeliveryPerson, name: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="delivery-phone" className="text-right">Téléphone</Label>
                      <Input
                        id="delivery-phone"
                        value={newDeliveryPerson.phone}
                        onChange={(e) => setNewDeliveryPerson({...newDeliveryPerson, phone: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="delivery-email" className="text-right">Email</Label>
                      <Input
                        id="delivery-email"
                        type="email"
                        value={newDeliveryPerson.email}
                        onChange={(e) => setNewDeliveryPerson({...newDeliveryPerson, email: e.target.value})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setIsAddingDelivery(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleAddDeliveryPerson}>
                      Ajouter
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deliveryPeople.map((deliveryPerson) => (
                <Card key={deliveryPerson.id} className={deliveryPerson.id === 'paps_default' ? 'border-blue-200 bg-blue-50' : 'bg-white/80 dark:bg-gray-800/60 backdrop-blur'}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center">
                        <h3 className="text-lg">{deliveryPerson.name}</h3>
                        {deliveryPerson.id === 'paps_default' && (
                          <Badge className="ml-2 bg-blue-600">
                            <Truck className="w-3 h-3 mr-1" />
                            Partenaire
                          </Badge>
                        )}
                      </div>
                      <Badge variant={deliveryPerson.status === 'online' ? "default" : "secondary"}>
                        {deliveryPerson.status === 'online' ? 'En ligne' : 'Hors ligne'}
                      </Badge>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p className="flex items-center"><Phone className="w-4 h-4 mr-2" />{deliveryPerson.phone}</p>
                      {deliveryPerson.email && (
                        <p className="flex items-center"><Mail className="w-4 h-4 mr-2" />{deliveryPerson.email}</p>
                      )}
                    </div>
                    {deliveryPerson.id === 'paps_default' && (
                      <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                        ✓ Service de livraison professionnel
                        <br />✓ Couverture étendue
                        <br />✓ Suivi en temps réel
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}