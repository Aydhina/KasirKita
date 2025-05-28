const penjualanController = require("../controllers/penjualanController");
const express = require("express");
const router = express.Router();
const checkSession = require("../middleware/checkSession");
const checkRole = require("../middleware/checkRole");

router.get("/order/:id", checkSession, penjualanController.penjualanProduk);

router.get("/", checkSession, penjualanController.getDaftarPenjualan);

router.get(
  "/pelanggan",
  checkSession,
  penjualanController.getDaftarPenjualanPelanggan
);

router.get("/:id", penjualanController.getDetailPenjualan);

router.get("/export/pdf", penjualanController.generatePDF);
router.get("/pelanggan/pdf", penjualanController.generatePDFPelanggan);


module.exports = router;
