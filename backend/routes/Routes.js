const express = require("express");
const router = express.Router();
const { signIn, signUpCommercant, checkAndGetUserByToken } = require("../controllers/userController");
const { createLivreur, getLivreurById, updateLivreur, deleteLivreur, getAllLivreurs, getAllLivreursByCommercants, recupererCommandes } = require("../controllers/livreurController");
const authMiddleware = require("../Middlewares/Authorize");
const { getCategoriesByCommercant, createCategorie, getOneCategorie, getProductsByCategorie, updateCategorie, deleteCategorie } = require("../controllers/categorieController");
const { getOneProduct, getProductsByCommercant, createProduct, updateProducts, updateStockProducts, deleteProducts } = require("../controllers/productController");
const { getLivraisonByLivreur} = require("../controllers/livraisonController")


router.post("/signup", signUpCommercant);
router.post("/signin", signIn);
router.get('/verify-token/:token', checkAndGetUserByToken);
//routes related to livreur
router.post("/createLivreur",createLivreur);
router.get("/getOnelivreur/:id", getLivreurById);
router.put("/updatelivreur/:id", updateLivreur);
router.delete("/deletelivreur/:id", deleteLivreur);
router.get("/getAlllivreurs", getAllLivreurs);
router.get("/getAlllivreursByCommercants",authMiddleware.authenticate, getAllLivreursByCommercants);
//router.get("/:id/livraisons", recupererCommandes);
router.get("/getLivraisonByLivreur/:livreurId", getLivraisonByLivreur);

//relatives au categorie
// 📦 Récupérer tous les produits du commerçant
router.get("/getProductByCommercant",authMiddleware.authenticateCommercant,getProductsByCommercant);
router.get("/getOneProduct/:id",authMiddleware.authenticateCommercant, getOneProduct);
router.post("/createProduct",authMiddleware.authenticateCommercant, createProduct);
router.put("/UpdateProduct/:id",authMiddleware.authenticateCommercant, updateProducts);
router.patch("/updateStockProduct/:id/stock", authMiddleware.authenticateCommercant,updateStockProducts);
router.delete("/deleteProduct/:id", authMiddleware.authenticateCommercant,deleteProducts);



router.get("/getcategoriesByCommercant", authMiddleware.authenticateCommercant, getCategoriesByCommercant);
router.post("/createCategories", authMiddleware.authenticateCommercant, createCategorie);
router.get("/getOnecategories/:id", authMiddleware.authenticateCommercant, getOneCategorie);
router.get("/getOneProductByCategories/:id/products", authMiddleware.authenticateCommercant, getProductsByCategorie);
router.put("/updateCategories/:id",authMiddleware.authenticateCommercant, updateCategorie);
router.delete("/deleteCategories/:id", authMiddleware.authenticateCommercant, deleteCategorie);
module.exports = router;