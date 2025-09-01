const mongoose = require("mongoose");

const CommandeSchema = new mongoose.Schema({
  client_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  produit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Produit" },
  quantity: { type: Number, required: true, default: 1 },
  total_price: { type: Number, required: true },
  status: { type: String, default: "en attente", enum: ["en attente", "confirmé", "en préparation", "en livraison", "livré", "annulé"] }
}, {
  timestamps: true
});

module.exports = mongoose.model("Commande", CommandeSchema);
