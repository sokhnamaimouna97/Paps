const mongoose = require("mongoose");

const LivreurSchema = new mongoose.Schema({
  commercant_id: { type: mongoose.Schema.Types.ObjectId, ref: "Commercant" },
  livraisons: [{ type: mongoose.Schema.Types.ObjectId, ref: "Livraison" }]
});



module.exports = mongoose.model("Livreur", LivreurSchema);
