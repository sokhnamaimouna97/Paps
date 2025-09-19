const Livraison = require("../models/Livraison");

async function getLivraisonParLivreur(livreurId) {
  const livraisons = await Livraison.find({ livreur_id: livreurId })
                                  .populate("client_id")  // si tu veux aussi les infos client
                                  .exec();

  return livraisons;
}

exports.getLivraisonByLivreur = async (req, res) => {
  try {
    const livreurId = req.params.livreurId;
    const livraisons = await getLivraisonParLivreur(livreurId);

    res.json({ success: true, livraisons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}