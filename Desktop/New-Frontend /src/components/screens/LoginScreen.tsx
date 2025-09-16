import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ArrowLeft, Store, Truck, LogIn } from 'lucide-react';
import { toast } from 'sonner';

interface LoginScreenProps {
  onBack: () => void;
  onLogin: (type: 'merchant' | 'delivery', id: string) => void;
}

export default function LoginScreen({ onBack, onLogin }: LoginScreenProps) {
  const [merchantLogin, setMerchantLogin] = useState({
    email: '',
    password: ''
  });
  const [deliveryLogin, setDeliveryLogin] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleMerchantLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantLogin.email || !merchantLogin.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      // Simulation de connexion - en production, appeler l'API d'authentification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Pour la démo, générer un ID basé sur l'email
      const merchantId = `merchant_${merchantLogin.email.split('@')[0]}`;
      toast.success('Connexion réussie !');
      onLogin('merchant', merchantId);
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliveryLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryLogin.email || !deliveryLogin.password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      // Simulation de connexion - en production, appeler l'API d'authentification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Pour la démo, générer un ID basé sur l'email
      const deliveryId = `delivery_${deliveryLogin.email.split('@')[0]}`;
      toast.success('Connexion réussie !');
      onLogin('delivery', deliveryId);
    } catch (error) {
      toast.error('Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (type: 'merchant' | 'delivery') => {
    if (type === 'merchant') {
      setMerchantLogin({
        email: 'demo@boutique.sn',
        password: 'demo123'
      });
      toast.info('Identifiants de démo remplis');
    } else {
      setDeliveryLogin({
        email: 'demo@livreur.sn',
        password: 'demo123'
      });
      toast.info('Identifiants de démo remplis');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E8F6F5] to-white dark:from-[#0B1A1A] dark:to-[#0E131A] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8" role="banner">
          <Button variant="ghost" onClick={onBack} className="mr-4 text-[#2C3E50] hover:bg-[#E8F6F5]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-3xl text-[#2C3E50] dark:text-white">Connexion Professionnelle</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Tabs defaultValue="merchant" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-[#E8F6F5]">
              <TabsTrigger value="merchant" className="flex items-center data-[state=active]:bg-[#5CBCB6] data-[state=active]:text-white">
                <Store className="w-4 h-4 mr-2" />
                Commerçant
              </TabsTrigger>
              <TabsTrigger value="delivery" className="flex items-center data-[state=active]:bg-[#5CBCB6] data-[state=active]:text-white">
                <Truck className="w-4 h-4 mr-2" />
                Livreur
              </TabsTrigger>
            </TabsList>

            <TabsContent value="merchant">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Store className="w-6 h-6 mr-3 text-blue-600" />
                    Espace Commerçant
                  </CardTitle>
                  <CardDescription>
                    Connectez-vous pour accéder à votre dashboard de gestion
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleMerchantLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="merchant-email">Email</Label>
                      <Input
                        id="merchant-email"
                        type="email"
                        placeholder="votre@email.sn"
                        value={merchantLogin.email}
                        onChange={(e) => setMerchantLogin({...merchantLogin, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="merchant-password">Mot de passe</Label>
                      <Input
                        id="merchant-password"
                        type="password"
                        placeholder="••••••••"
                        value={merchantLogin.password}
                        onChange={(e) => setMerchantLogin({...merchantLogin, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#5CBCB6] hover:bg-[#4AA9A3] text-white" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Connexion...
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          Se connecter
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full border-[#5CBCB6] text-[#5CBCB6] hover:bg-[#E8F6F5]"
                      onClick={() => handleDemoLogin('merchant')}
                    >
                      Utiliser le compte démo
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="delivery">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Truck className="w-6 h-6 mr-3 text-green-600" />
                    Espace Livreur
                  </CardTitle>
                  <CardDescription>
                    Connectez-vous pour gérer vos livraisons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleDeliveryLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="delivery-email">Email</Label>
                      <Input
                        id="delivery-email"
                        type="email"
                        placeholder="votre@email.sn"
                        value={deliveryLogin.email}
                        onChange={(e) => setDeliveryLogin({...deliveryLogin, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery-password">Mot de passe</Label>
                      <Input
                        id="delivery-password"
                        type="password"
                        placeholder="••••••••"
                        value={deliveryLogin.password}
                        onChange={(e) => setDeliveryLogin({...deliveryLogin, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full bg-[#28A745] hover:bg-[#218838] text-white" 
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                          Connexion...
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4 mr-2" />
                          Se connecter
                        </>
                      )}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="w-full border-[#28A745] text-[#28A745] hover:bg-[#f8f9fa]"
                      onClick={() => handleDemoLogin('delivery')}
                    >
                      Utiliser le compte démo
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Informations supplémentaires */}
          <div className="space-y-6">
            <Card className="bg-white/60 dark:bg-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="dark:text-white">Pourquoi se connecter ?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Store className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Commerçants</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Gérez vos produits, suivez vos commandes, assignez des livreurs et analysez vos ventes.
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Truck className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">Livreurs</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Recevez des commandes, mettez à jour les statuts de livraison et communiquez avec les clients.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 border-yellow-200 dark:border-yellow-800">
              <CardHeader>
                <CardTitle className="text-orange-800 dark:text-orange-300">Compte démo disponible</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-700 dark:text-orange-300 mb-4">
                  Testez la plateforme avec nos comptes de démonstration. Toutes les fonctionnalités sont disponibles.
                </p>
                <div className="space-y-2 text-xs text-orange-600 dark:text-orange-300">
                  <p><strong>Commerçant :</strong> demo@boutique.sn / demo123</p>
                  <p><strong>Livreur :</strong> demo@livreur.sn / demo123</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}