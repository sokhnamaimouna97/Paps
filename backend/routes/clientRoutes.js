const express = require("express");
const router = express.Router();
const {
    signUpClient,
    signInClient,
    getAllProducts,
    getProductById,
    getAllCategories,
    getProductsByCategory,
    searchProducts,
    createOrder,
    getClientOrders,
    cancelOrder,
    updateClientProfile,
    // Nouvelles fonctions pour l'accès par invitation
    getBoutiqueById,
    getBoutiqueProducts,
    getBoutiqueCategories,
    searchBoutiqueProducts,
    createGuestOrder
} = require("../controllers/clientController");

// Routes publiques (sans authentification)
router.post("/register", signUpClient);
router.post("/login", signInClient);
router.get("/products", getAllProducts);
router.get("/products/search", searchProducts); // Route de recherche AVANT les routes avec paramètres
router.get("/products/:id", getProductById);
router.get("/categories", getAllCategories);
router.get("/categories/:categoryId/products", getProductsByCategory);

// Routes d'accès par invitation aux boutiques
router.get("/boutiques/:boutiqueId", getBoutiqueById);
router.get("/boutiques/:boutiqueId/products", getBoutiqueProducts);
router.get("/boutiques/:boutiqueId/categories", getBoutiqueCategories);
router.get("/boutiques/:boutiqueId/products/search", searchBoutiqueProducts);

// Routes de commandes invitées (sans authentification)
router.post("/orders/guest", createGuestOrder);

// Routes (sans authentification)
router.post("/orders", createOrder);
router.get("/orders", getClientOrders);
router.put("/orders/:orderId/cancel", cancelOrder);
router.put("/profile", updateClientProfile);

module.exports = router;
