const mongoose = require("mongoose");

const produkSchema = new mongoose.Schema({
  foto: {
    type: String,
    required: true
  },
  nama: {
    type: String,
    required: true
  },
  deskripsi: {
    type: String,
    required: true
  },
  harga: {
    type: Number,
    required: true
  },
  stok: {
    type: Number,
    required: true
  }
  
});

module.exports = mongoose.model("Produk", produkSchema);