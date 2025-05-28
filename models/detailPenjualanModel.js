const mongoose = require("mongoose");

const detailPenjualanSchema = new mongoose.Schema({
  penjualanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Penjualan',
    required: true
  },
  produkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produk',
    required: true
  },
  jumlahProduk: {
    type: Number,
    required: true,
    min: 1
  },
  subtotal: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("DetailPenjualan", detailPenjualanSchema);
