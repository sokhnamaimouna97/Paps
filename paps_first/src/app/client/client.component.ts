import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

interface Product {
  _id: string;
  nom: string;
  prix: number;
  stock: number;
  image?: string;
  categorie_id?: {
    _id: string;
    nom: string;
  };
  commercant_id?: {
    _id: string;
    nom_boutique: string;
  };
}

interface Category {
  _id: string;
  nom: string;
}

interface Order {
  _id: string;
  produit_id: Product;
  quantity: number;
  total_price: number;
  status: string;
  createdAt: string;
}

interface Boutique {
  _id: string;
  nom_boutique: string;
  description?: string;
  adresse?: string;
  telephone?: string;
  email?: string;
}

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css']
})
export class ClientComponent implements OnInit {
  private readonly API_URL = 'http://localhost:5000/api/client';

  // États de l'application
  currentView: 'welcome' | 'boutique' | 'cart' | 'checkout' = 'welcome';
  isLoading = false;

  // Données
  products: Product[] = [];
  categories: Category[] = [];
  cart: { product: Product; quantity: number }[] = [];
  currentBoutique: Boutique | null = null;
  boutiqueId: string | null = null;

  // Formulaires
  checkoutForm: FormGroup;

  // Filtres
  selectedCategory = '';
  searchQuery = '';

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.checkoutForm = this.fb.group({
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      nom: ['', [Validators.required, Validators.minLength(2)]],
      telephone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      adresse: ['', [Validators.required, Validators.minLength(10)]],
      message: ['']
    });
  }

  ngOnInit(): void {
    // Vérifier s'il y a un ID de boutique dans l'URL
    this.route.params.subscribe(params => {
      this.boutiqueId = params['boutiqueId'];
      if (this.boutiqueId) {
        this.accessBoutique(this.boutiqueId);
      } else {
        this.currentView = 'welcome';
      }
    });
  }

  // 🔗 Accès à la boutique via invitation
  async accessBoutique(boutiqueId: string): Promise<void> {
    this.isLoading = true;
    try {
      // Charger les informations de la boutique
      const boutiqueResponse: any = await this.http.get(`${this.API_URL}/boutiques/${boutiqueId}`).toPromise();
      this.currentBoutique = boutiqueResponse.data;

      // Charger les produits de la boutique
      await this.loadBoutiqueProducts(boutiqueId);

      this.currentView = 'boutique';
      console.log('Accès à la boutique:', this.currentBoutique?.nom_boutique);
    } catch (error: any) {
      console.error('Erreur d\'accès à la boutique:', error);
      alert('Boutique non trouvée ou lien invalide');
      this.currentView = 'welcome';
    } finally {
      this.isLoading = false;
    }
  }

  // 📦 Charger les produits de la boutique
  async loadBoutiqueProducts(boutiqueId: string): Promise<void> {
    try {
      const response: any = await this.http.get(`${this.API_URL}/boutiques/${boutiqueId}/products`).toPromise();
      this.products = response.data || [];
      console.log('Produits de la boutique chargés:', this.products.length);
    } catch (error) {
      console.error('Erreur lors du chargement des produits:', error);
    }
  }

  // 📂 Charger les catégories de la boutique
  async loadBoutiqueCategories(boutiqueId: string): Promise<void> {
    try {
      const response: any = await this.http.get(`${this.API_URL}/boutiques/${boutiqueId}/categories`).toPromise();
      this.categories = response.data || [];
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
    }
  }

  // 🔍 Rechercher des produits dans la boutique
  async searchProducts(): Promise<void> {
    if (!this.boutiqueId) return;

    if (this.searchQuery.trim()) {
      try {
        const response: any = await this.http.get(`${this.API_URL}/boutiques/${this.boutiqueId}/products/search?q=${this.searchQuery}`).toPromise();
        this.products = response.data || [];
      } catch (error) {
        console.error('Erreur lors de la recherche:', error);
      }
    } else {
      this.loadBoutiqueProducts(this.boutiqueId);
    }
  }

  // 📂 Filtrer par catégorie
  async filterByCategory(): Promise<void> {
    if (!this.boutiqueId) return;

    if (this.selectedCategory) {
      try {
        const response: any = await this.http.get(`${this.API_URL}/boutiques/${this.boutiqueId}/categories/${this.selectedCategory}/products`).toPromise();
        this.products = response.data || [];
      } catch (error) {
        console.error('Erreur lors du filtrage:', error);
      }
    } else {
      this.loadBoutiqueProducts(this.boutiqueId);
    }
  }

  // 🛒 Panier
  addToCart(product: Product): void {
    const existingItem = this.cart.find(item => item.product._id === product._id);
    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cart.push({ product, quantity: 1 });
    }
    console.log('Produit ajouté au panier:', product.nom);
  }

  removeFromCart(productId: string): void {
    this.cart = this.cart.filter(item => item.product._id !== productId);
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.cart.find(item => item.product._id === productId);
    if (item) {
      if (quantity <= 0) {
        this.removeFromCart(productId);
      } else {
        item.quantity = quantity;
      }
    }
  }

  getCartTotal(): number {
    return this.cart.reduce((total, item) => total + (item.product.prix * item.quantity), 0);
  }

  // 💳 Passer la commande
  async placeOrder(): Promise<void> {
    if (this.cart.length === 0) {
      alert('Votre panier est vide');
      return;
    }

    if (this.checkoutForm.invalid) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    this.isLoading = true;
    try {
      const orderData = {
        boutique_id: this.boutiqueId,
        client_info: this.checkoutForm.value,
        items: this.cart.map(item => ({
          produit_id: item.product._id,
          quantity: item.quantity,
          prix_unitaire: item.product.prix
        })),
        total: this.getCartTotal()
      };

      const response: any = await this.http.post(`${this.API_URL}/orders/guest`, orderData).toPromise();

      // Vider le panier
      this.cart = [];

      // Rediriger vers une page de confirmation
      alert('Commande passée avec succès ! Vous recevrez un email de confirmation.');
      this.currentView = 'boutique';
    } catch (error: any) {
      console.error('Erreur lors de la commande:', error);
      alert(error.error?.message || 'Erreur lors de la commande');
    } finally {
      this.isLoading = false;
    }
  }

  // Navigation
  navigateTo(view: any): void {
    this.currentView = view;
    if (view === 'boutique' && this.boutiqueId) {
      this.loadBoutiqueProducts(this.boutiqueId);
    }
  }

  // Retour à la boutique
  backToBoutique(): void {
    this.currentView = 'boutique';
  }

  // Utilitaires
  getBoutiqueDisplayName(): string {
    return this.currentBoutique?.nom_boutique || 'Boutique';
  }

  getCartItemCount(): number {
    return this.cart.reduce((total, item) => total + item.quantity, 0);
  }
}
