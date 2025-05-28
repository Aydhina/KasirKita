const produkController = require("../controllers/produkController");
const express = require("express");
const router = express.Router();
const checkSession = require("../middleware/checkSession");
const uploadImage = require("../middleware/uploadImage");
const checkRole = require("../middleware/checkRole");

router.get("/", checkSession, produkController.getDaftarProduk);

router.get("/pelanggan", checkSession, produkController.getDaftarProdukPelanggan);

router.get("/tambah", checkSession, produkController.getTambahProduk);

router.get("/edit/:id", checkSession, produkController.getEditProduk);

router.post("/tambah", checkSession, uploadImage.single("foto"), produkController.tambahProduk);

router.post("/edit/:id", checkSession, uploadImage.single("foto"), produkController.editProduk);

router.get("/delete/:id", checkSession, produkController.deleteProduk);

module.exports = router;