const mongoose = require("mongoose");

const penjualanSchema = new mongoose.Schema({
  tanggalPenjualan: {
    type: Date,
    default: Date.now,
    required: true
  },
  totalBiaya: {
    type: Number,
    required: true
  },
  pelangganId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Penjualan", penjualanSchema);
