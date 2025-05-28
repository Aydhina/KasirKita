const Produk = require("../models/produkModel");
const path = require('path');
const fs = require('fs');

const produkController = {
  getDaftarProduk: async (req, res) => {
    try {
      const produkList = await Produk.find();
      res.render('daftarProduk', { produkList });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  getTambahProduk: (req, res) => {
    try {
      res.render('formTambahProduk');
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  tambahProduk: async (req, res) => {
    try {
      const { nama, deskripsi, harga, stok } = req.body;
      const fotoPath = req.file ? req.file.filename : null;
      const produk = new Produk({
        foto: fotoPath,
        nama: nama,
        deskripsi: deskripsi,
        harga: harga,
        stok: stok
      });
      await produk.save();
      res.redirect('/produk');
    } catch (error) {
      console.error("Error adding produk:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  getEditProduk: async (req, res) => {
    try {
      const produkId = req.params.id;
      const produk = await Produk.findById(produkId);
      res.render('formEditProduk', { produk });
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  editProduk: async (req, res) => {
    try {
      const produkId = req.params.id;
      const { nama, deskripsi, harga, stok } = req.body;
      const fotoPath = req.file ? req.file.filename : null;

      // Cari produk berdasarkan ID
      const produk = await Produk.findById(produkId);
      if (!produk) {
        return res.status(404).send("Produk tidak ditemukan");
      }

      if (fotoPath && produk.foto) {
        const oldImagePath = path.join(__dirname, '..', 'public/img', produk.foto);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update hanya jika ada input baru, jika kosong tetap pakai nilai lama
      produk.nama = nama || produk.nama;
      produk.deskripsi = deskripsi || produk.deskripsi;
      produk.harga = harga || produk.harga;
      produk.stok = stok || produk.stok;
      produk.foto = fotoPath || produk.foto;

      // Simpan perubahan
      await produk.save();
      res.redirect('/produk');
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  deleteProduk: async (req, res) => {
    try {
      const produkId = req.params.id;
      const produk = await Produk.findById(produkId);

      if (!produk) {
        return res.status(404).send("Produk tidak ditemukan");
      }

      // Hapus gambar jika ada
      if (produk.foto) {
        const imagePath = path.join(__dirname, '..', 'public/image/', produk.foto);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      // Hapus buku dari database
      await Produk.findByIdAndDelete(produkId);

      res.redirect('/produk');
    } catch (error) {
      console.error("Error deleting produk:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  getDaftarProdukPelanggan: async (req, res) => {
    try {
      const produkList = await Produk.find({ stok: { $gt: 0 }});
      res.render('daftarProdukPelanggan', { produkList });
    } catch (error) {
      console.error("Error fetching produk:", error);
      res.status(500).send("Internal Server Error");
    }
  },

};

module.exports = produkController;