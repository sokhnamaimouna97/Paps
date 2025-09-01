const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Client = require("../models/Client");
const User = require("../models/User");
const Produit = require("../models/Product");
const Commande = require("../models/Commande");
const Categorie = require("../models/Categorie");

const secretKey = process.env.JWT_KEY;

// Fonction pour créer un token
const createToken = (id, email, role) => {
    return jwt.sign({ id, email, role }, secretKey, { expiresIn: "7d" });
};

// 🔐 Inscription d'un client (conservé pour compatibilité)
const signUpClient = async (req, res) => {
    try {
        const { prenom, nom, telephone, email, password, adress } = req.body;

        // Vérifie si un utilisateur avec cet email existe déjà
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(409).json({ message: "Cet email est déjà utilisé." });
        }

        // Hash du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Création du client
        const client = new Client({ adress });
        await client.save();

        // Création de l'utilisateur associé
        const user = new User({
            prenom,
            nom,
            telephone,
            role: "client",
            email,
            password: hashedPassword,
            client_id: client._id
        });

        await user.save();

        // Générer un token
        const token = createToken(user._id, user.email, user.role);

        res.status(201).json({
            message: "Compte client créé avec succès.",
            user: {
                _id: user._id,
                prenom: user.prenom,
                nom: user.nom,
                telephone: user.telephone,
                email: user.email,
                role: user.role,
                client_id: user.client_id
            },
            token
        });
    } catch (err) {
        console.error("Erreur lors de l'inscription du client :", err);
        res.status(500).json({ message: "Erreur serveur", error: err.message });
    }
};

// 🔐 Connexion d'un client (conservé pour compatibilité)
const signInClient = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Rechercher l'utilisateur par email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        if (user.role !== "client") {
            return res.status(403).json({ message: "Accès réservé aux clients." });
        }

        // Vérifier le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Email ou mot de passe incorrect." });
        }

        // Générer un token
        const token = createToken(user._id, user.email, user.role);

        res.status(200).json({
            message: "Connexion réussie.",
            user: {
                _id: user._id,
                prenom: user.prenom,
                nom: user.nom,
                telephone: user.telephone,
                email: user.email,
                role: user.role,
                client_id: user.client_id
            },
            token
        });
    } catch (error) {
        console.error("Erreur de connexion client :", error);
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// 🏪 Récupérer une boutique par ID (accès par invitation)
const getBoutiqueById = async (req, res) => {
    try {
        const { boutiqueId } = req.params;
        
        // Vérifier que l'ID est valide
        if (!boutiqueId || boutiqueId.length !== 24) {
            return res.status(400).json({ 
                success: false,
                message: "ID de boutique invalide" 
            });
        }

        const boutique = await User.findOne({ 
            _id: boutiqueId, 
            role: "commercant" 
        }).select('nom_boutique description adresse telephone email');

        if (!boutique) {
            return res.status(404).json({ 
                success: false,
                message: "Boutique non trouvée ou lien d'invitation invalide" 
            });
        }

        res.status(200).json({
            success: true,
            data: {
                _id: boutique._id,
                nom_boutique: boutique.nom_boutique,
                description: boutique.description,
                adresse: boutique.adresse,
                telephone: boutique.telephone,
                email: boutique.email
            },
            message: "Boutique accessible"
        });
    } catch (error) {
        console.error("Erreur lors de la récupération de la boutique:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de l'accès à la boutique", 
            error: error.message 
        });
    }
};

// 📦 Récupérer les produits d'une boutique (optimisé)
const getBoutiqueProducts = async (req, res) => {
    try {
        const { boutiqueId } = req.params;
        
        // Vérifier que la boutique existe
        const boutique = await User.findOne({ _id: boutiqueId, role: "commercant" });
        if (!boutique) {
            return res.status(404).json({ 
                success: false,
                message: "Boutique non trouvée" 
            });
        }

        // Récupérer les produits avec pagination et tri
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const sort = req.query.sort || 'nom'; // nom, prix, stock
        const order = req.query.order === 'desc' ? -1 : 1;

        const skip = (page - 1) * limit;

        // Construire le tri
        let sortObject = {};
        if (sort === 'prix') sortObject.prix = order;
        else if (sort === 'stock') sortObject.stock = order;
        else sortObject.nom = order;

        const produits = await Produit.find({ 
            commercant_id: boutiqueId,
            stock: { $gt: 0 } 
        })
        .populate("categorie_id", "nom")
        .sort(sortObject)
        .skip(skip)
        .limit(limit);

        // Compter le total pour la pagination
        const total = await Produit.countDocuments({ 
            commercant_id: boutiqueId,
            stock: { $gt: 0 } 
        });

        res.status(200).json({
            success: true,
            data: {
                produits,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            },
            message: "Produits récupérés avec succès"
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la récupération des produits", 
            error: error.message 
        });
    }
};

// 📂 Récupérer les catégories d'une boutique (optimisé)
const getBoutiqueCategories = async (req, res) => {
    try {
        const { boutiqueId } = req.params;
        
        // Vérifier que la boutique existe
        const boutique = await User.findOne({ _id: boutiqueId, role: "commercant" });
        if (!boutique) {
            return res.status(404).json({ 
                success: false,
                message: "Boutique non trouvée" 
            });
        }

        // Récupérer les catégories avec le nombre de produits
        const categoriesWithCount = await Produit.aggregate([
            { $match: { commercant_id: boutiqueId, stock: { $gt: 0 } } },
            { $group: { 
                _id: "$categorie_id", 
                count: { $sum: 1 } 
            }},
            { $lookup: {
                from: "categories",
                localField: "_id",
                foreignField: "_id",
                as: "categorie"
            }},
            { $unwind: "$categorie" },
            { $project: {
                _id: "$categorie._id",
                nom: "$categorie.nom",
                count: 1
            }}
        ]);

        res.status(200).json({
            success: true,
            data: categoriesWithCount,
            message: "Catégories récupérées avec succès"
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la récupération des catégories", 
            error: error.message 
        });
    }
};

// 🔍 Rechercher des produits dans une boutique (optimisé)
const searchBoutiqueProducts = async (req, res) => {
    try {
        const { boutiqueId } = req.params;
        const { q, categorie, minPrix, maxPrix, sort, order } = req.query;
        
        // Vérifier que la boutique existe
        const boutique = await User.findOne({ _id: boutiqueId, role: "commercant" });
        if (!boutique) {
            return res.status(404).json({ 
                success: false,
                message: "Boutique non trouvée" 
            });
        }

        // Construire les filtres
        let filters = { 
            commercant_id: boutiqueId,
            stock: { $gt: 0 } 
        };

        // Recherche textuelle
        if (q && q.trim()) {
            filters.$or = [
                { nom: { $regex: q.trim(), $options: 'i' } },
                { description: { $regex: q.trim(), $options: 'i' } }
            ];
        }

        // Filtre par catégorie
        if (categorie) {
            filters.categorie_id = categorie;
        }

        // Filtre par prix
        if (minPrix || maxPrix) {
            filters.prix = {};
            if (minPrix) filters.prix.$gte = parseFloat(minPrix);
            if (maxPrix) filters.prix.$lte = parseFloat(maxPrix);
        }

        // Construire le tri
        let sortObject = {};
        if (sort === 'prix') sortObject.prix = order === 'desc' ? -1 : 1;
        else if (sort === 'stock') sortObject.stock = order === 'desc' ? -1 : 1;
        else sortObject.nom = order === 'desc' ? -1 : 1;

        const produits = await Produit.find(filters)
            .populate("categorie_id", "nom")
            .sort(sortObject)
            .limit(50); // Limite pour éviter les surcharges

        res.status(200).json({
            success: true,
            data: produits,
            message: "Recherche effectuée avec succès"
        });
    } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la recherche", 
            error: error.message 
        });
    }
};

// 💳 Créer une commande invité (simplifié et optimisé)
const createGuestOrder = async (req, res) => {
    try {
        const { boutique_id, client_info, items, total, message } = req.body;

        // Validation des données
        if (!boutique_id || !client_info || !items || items.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: "Données de commande incomplètes" 
            });
        }

        // Vérifier que la boutique existe
        const boutique = await User.findOne({ _id: boutique_id, role: "commercant" });
        if (!boutique) {
            return res.status(404).json({ 
                success: false,
                message: "Boutique non trouvée" 
            });
        }

        // Validation des informations client
        const { prenom, nom, telephone, email, adresse } = client_info;
        if (!prenom || !nom || !telephone || !email || !adresse) {
            return res.status(400).json({ 
                success: false,
                message: "Informations client incomplètes" 
            });
        }

        // Validation du total
        let calculatedTotal = 0;
        const validatedItems = [];

        // Vérifier chaque produit
        for (const item of items) {
            const produit = await Produit.findById(item.produit_id);
            if (!produit) {
                return res.status(404).json({ 
                    success: false,
                    message: `Produit ${item.produit_id} non trouvé` 
                });
            }

            if (produit.commercant_id.toString() !== boutique_id) {
                return res.status(400).json({ 
                    success: false,
                    message: `Produit ${produit.nom} n'appartient pas à cette boutique` 
                });
            }

            if (produit.stock < item.quantity) {
                return res.status(400).json({ 
                    success: false,
                    message: `Stock insuffisant pour ${produit.nom} (disponible: ${produit.stock})` 
                });
            }

            const itemTotal = produit.prix * item.quantity;
            calculatedTotal += itemTotal;

            validatedItems.push({
                produit: produit,
                quantity: item.quantity,
                prix_unitaire: produit.prix,
                total: itemTotal
            });
        }

        // Vérifier que le total correspond
        if (Math.abs(calculatedTotal - total) > 0.01) {
            return res.status(400).json({ 
                success: false,
                message: "Le total de la commande ne correspond pas" 
            });
        }

        // Créer les commandes
        const commandes = [];
        for (const item of validatedItems) {
            const commande = new Commande({
                client_info: {
                    prenom,
                    nom,
                    telephone,
                    email,
                    adresse
                },
                produit_id: item.produit._id,
                quantity: item.quantity,
                total_price: item.total,
                status: "en attente",
                boutique_id: boutique_id,
                message: message || ""
            });

            await commande.save();
            commandes.push(commande);

            // Mettre à jour le stock
            item.produit.stock -= item.quantity;
            await item.produit.save();
        }

        // Préparer la réponse
        const orderSummary = {
            numero_commande: `CMD-${Date.now()}`,
            boutique: {
                nom: boutique.nom_boutique,
                telephone: boutique.telephone,
                email: boutique.email
            },
            client: {
                prenom,
                nom,
                telephone,
                email,
                adresse
            },
            items: validatedItems.map(item => ({
                produit: item.produit.nom,
                quantity: item.quantity,
                prix_unitaire: item.prix_unitaire,
                total: item.total
            })),
            total: calculatedTotal,
            status: "en attente",
            date_commande: new Date(),
            message: message || ""
        };

        // TODO: Envoyer un email de confirmation
        // await sendOrderConfirmationEmail(email, orderSummary);

        res.status(201).json({
            success: true,
            data: orderSummary,
            message: "Commande créée avec succès ! Vous recevrez un email de confirmation."
        });
    } catch (error) {
        console.error("Erreur lors de la création de la commande:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la création de la commande", 
            error: error.message 
        });
    }
};

// 📦 Récupérer un produit spécifique d'une boutique
const getBoutiqueProductById = async (req, res) => {
    try {
        const { boutiqueId, productId } = req.params;
        
        // Vérifier que la boutique existe
        const boutique = await User.findOne({ _id: boutiqueId, role: "commercant" });
        if (!boutique) {
            return res.status(404).json({ 
                success: false,
                message: "Boutique non trouvée" 
            });
        }

        const produit = await Produit.findOne({
            _id: productId,
            commercant_id: boutiqueId
        }).populate("categorie_id", "nom");

        if (!produit) {
            return res.status(404).json({ 
                success: false,
                message: "Produit non trouvé dans cette boutique" 
            });
        }

        res.status(200).json({
            success: true,
            data: produit,
            message: "Produit récupéré avec succès"
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du produit:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la récupération du produit", 
            error: error.message 
        });
    }
};

// Fonctions conservées pour compatibilité (simplifiées)
const getAllProducts = async (req, res) => {
    try {
        const produits = await Produit.find({ stock: { $gt: 0 } })
            .populate("categorie_id", "nom")
            .populate("commercant_id", "nom_boutique")
            .limit(20);

        res.status(200).json({
            success: true,
            data: produits,
            message: "Produits récupérés avec succès"
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des produits:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la récupération des produits", 
            error: error.message 
        });
    }
};

const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const produit = await Produit.findById(id)
            .populate("categorie_id", "nom")
            .populate("commercant_id", "nom_boutique");

        if (!produit) {
            return res.status(404).json({ 
                success: false,
                message: "Produit non trouvé" 
            });
        }

        res.status(200).json({
            success: true,
            data: produit,
            message: "Produit récupéré avec succès"
        });
    } catch (error) {
        console.error("Erreur lors de la récupération du produit:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la récupération du produit", 
            error: error.message 
        });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const categories = await Categorie.find().limit(20);

        res.status(200).json({
            success: true,
            data: categories,
            message: "Catégories récupérées avec succès"
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des catégories:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la récupération des catégories", 
            error: error.message 
        });
    }
};

const getProductsByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        
        const produits = await Produit.find({ 
            categorie_id: categoryId,
            stock: { $gt: 0 }
        })
        .populate("categorie_id", "nom")
        .populate("commercant_id", "nom_boutique")
        .limit(20);

        res.status(200).json({
            success: true,
            data: produits,
            message: "Produits récupérés avec succès"
        });
    } catch (error) {
        console.error("Erreur lors de la récupération des produits par catégorie:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la récupération des produits", 
            error: error.message 
        });
    }
};

const searchProducts = async (req, res) => {
    try {
        const { q } = req.query;
        
        if (!q) {
            return res.status(400).json({ 
                success: false,
                message: "Terme de recherche requis" 
            });
        }

        const produits = await Produit.find({
            stock: { $gt: 0 },
            $or: [
                { nom: { $regex: q, $options: 'i' } },
                { description: { $regex: q, $options: 'i' } }
            ]
        })
        .populate("categorie_id", "nom")
        .populate("commercant_id", "nom_boutique")
        .limit(20);

        res.status(200).json({
            success: true,
            data: produits,
            message: "Recherche effectuée avec succès"
        });
    } catch (error) {
        console.error("Erreur lors de la recherche:", error);
        res.status(500).json({ 
            success: false,
            message: "Erreur lors de la recherche", 
            error: error.message 
        });
    }
};

// Fonctions d'authentification conservées (simplifiées)
const createOrder = async (req, res) => {
    res.status(400).json({ 
        success: false,
        message: "Cette fonctionnalité nécessite une authentification. Utilisez la commande invité." 
    });
};

const getClientOrders = async (req, res) => {
    res.status(400).json({ 
        success: false,
        message: "Cette fonctionnalité nécessite une authentification." 
    });
};

const cancelOrder = async (req, res) => {
    res.status(400).json({ 
        success: false,
        message: "Cette fonctionnalité nécessite une authentification." 
    });
};

const updateClientProfile = async (req, res) => {
    res.status(400).json({ 
        success: false,
        message: "Cette fonctionnalité nécessite une authentification." 
    });
};

module.exports = {
    // Fonctions d'authentification (conservées pour compatibilité)
    signUpClient,
    signInClient,
    
    // Fonctions d'accès par invitation (principales)
    getBoutiqueById,
    getBoutiqueProducts,
    getBoutiqueCategories,
    searchBoutiqueProducts,
    getBoutiqueProductById,
    createGuestOrder,
    
    // Fonctions générales (simplifiées)
    getAllProducts,
    getProductById,
    getAllCategories,
    getProductsByCategory,
    searchProducts,
    
    // Fonctions d'authentification (désactivées)
    createOrder,
    getClientOrders,
    cancelOrder,
    updateClientProfile
};