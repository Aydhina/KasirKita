const Penjualan = require("../models/penjualanModel");
const Produk = require("../models/produkModel");
const User = require("../models/userModel");
const DetailPenjualan = require("../models/detailPenjualanModel");
// const PDFDocument = require("pdfkit");
// const ExcelJS = require("exceljs");
const ejs = require("ejs");
const puppeteer = require("puppeteer");
const path = require("path");


const penjualanController = {
  penjualanProduk: async (req, res) => {
  try {
    const produk_id = req.params.id;
    const jumlah = parseInt(req.query.jumlah) || 1; // ✅ ambil jumlah dari query
    const produk = await Produk.findById(produk_id);

    if (!produk) {
      return res.status(404).send("Produk tidak ditemukan");
    }

    if (produk.stok < jumlah) {
      return res.status(400).send("Stok tidak mencukupi");
    }

    const subtotal = produk.harga * jumlah;

    // Simpan transaksi penjualan utama
    const penjualan = new Penjualan({
      pelangganId: req.session.user.id,
      totalBiaya: subtotal,
      tanggalPenjualan: new Date(),
    });

    await penjualan.save();

    // Kurangi stok
    produk.stok -= jumlah;
    await produk.save();

    // Detail penjualan
    const detail = new DetailPenjualan({
      penjualanId: penjualan._id,
      produkId: produk._id,
      jumlahProduk: jumlah,
      subtotal: subtotal,
    });

    await detail.save();

    res.redirect("/produk/pelanggan");
  } catch (error) {
    console.error("Error adding penjualan:", error);
    res.status(500).send("Internal Server Error");
  }
},


  getDaftarPenjualan: async (req, res) => {
    try {
      const penjualanList = await Penjualan.find()
        .populate("pelangganId", "nama_pelanggan") // ambil nama pelanggan
        .sort({ tanggalPenjualan: -1 });

      const penjualan = penjualanList.map((p) => ({
        id: p._id,
        tanggal: p.tanggalPenjualan.toLocaleDateString("id-ID"),
        total: p.totalBiaya,
        pelanggan: p.pelangganId?.nama_pelanggan || "Tidak diketahui",
      }));

      res.render("riwayatPenjualan", { penjualan });
    } catch (error) {
      console.error("Error getDaftarPenjualan:", error);
      res.status(500).send("Terjadi kesalahan server");
    }
  },

getDaftarPenjualanPelanggan: async (req, res) => {
    try {
      const pelangganId = req.session.user.id;

      if (!pelangganId) {
        return res.status(401).send("Unauthorized");
      }

      // Ambil semua penjualan milik pelanggan
      const penjualan = await Penjualan.find({ pelangganId }).sort({
        tanggalPenjualan: -1,
      });

      // Format tanggal dan ambil detail per transaksi
      const riwayatPembelian = [];

      for (const p of penjualan) { //perulangan loop yg didalamnya terdapat map
        const detailList = await DetailPenjualan.find({
          penjualanId: p._id,
        }).populate("produkId", "nama harga");

        const detailProduk = detailList.map((item) => ({ //array map
          namaProduk: item.produkId?.nama || "Produk tidak ditemukan",
          harga: item.produkId?.harga || 0,
          jumlah: item.jumlahProduk,
          subtotal: item.subtotal,
        }));

        riwayatPembelian.push({
          tanggal: new Date(p.tanggalPenjualan).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          total: p.totalBiaya,
          detailProduk,
        });
      }

      res.render("riwayatPelanggan", { penjualan: riwayatPembelian });
    } catch (error) {
      console.error("Error fetching penjualan:", error);
      res.status(500).send("Internal Server Error");
    }
  },


  getDetailPenjualan: async (req, res) => {
    try {
      // Ambil data penjualan & pelanggan
      const penjualan = await Penjualan.findById(req.params.id)
        .populate("pelangganId", "nama_pelanggan alamat telepon")
        .lean();

      if (!penjualan) {
        return res.status(404).send("Penjualan tidak ditemukan");
      }

      // Ambil semua produk dari detail penjualan
      const detailList = await DetailPenjualan.find({
        penjualanId: req.params.id,
      })
        .populate("produkId", "nama harga")
        .lean();

      // Siapkan data untuk ditampilkan
      const detailProduk = detailList.map((item) => ({
        namaProduk: item.produkId?.nama || "Produk tidak ditemukan",
        harga: item.produkId?.harga || 0,
        jumlah: item.jumlahProduk,
        subtotal: item.subtotal,
      }));

      res.render("detailPenjualan", {
        penjualan: {
          id: penjualan._id,
          tanggal: new Date(penjualan.tanggalPenjualan).toLocaleDateString(
            "id-ID"
          ),
          total: penjualan.totalBiaya,
          pelanggan: penjualan.pelangganId,
          detailProduk,
        },
      });
    } catch (error) {
      console.error("Error getDetailPenjualan:", error);
      res.status(500).send("Terjadi kesalahan server");
    }
  },

generatePDF: async (req, res) => {
  try {
    const penjualanList = await Penjualan.find()
      .populate("pelangganId", "nama_pelanggan alamat telepon")
      .sort({ tanggalPenjualan: -1 });

    const daftarPenjualan = [];

    for (const p of penjualanList) {
      const detailList = await DetailPenjualan.find({
        penjualanId: p._id,
      }).populate("produkId", "nama harga");

      const detailProduk = detailList.map((item) => ({
        namaProduk: item.produkId?.nama || "Produk tidak ditemukan",
        harga: item.produkId?.harga || 0,
        jumlah: item.jumlahProduk,
        subtotal: item.subtotal,
      }));

      daftarPenjualan.push({
        tanggal: p.tanggalPenjualan.toLocaleDateString("id-ID"),
        total: p.totalBiaya,
        pelanggan: {
          nama: p.pelangganId?.nama_pelanggan || "Tidak diketahui",
          alamat: p.pelangganId?.alamat || "-",
          telepon: p.pelangganId?.telepon || "-",
        },
        detailProduk,
      });
    }

    const html = await ejs.renderFile(
      path.join(__dirname, "../views/templatePenjualanPDF.ejs"),
      { penjualan: daftarPenjualan }
    );

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="laporan_penjualan.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).send("Gagal membuat laporan PDF");
  }
},

generatePDFPelanggan: async (req, res) => {
  try {
    const pelangganId = req.session.user?.id;

    if (!pelangganId) {
      return res.status(401).send("Unauthorized - sesi tidak tersedia");
    }

    const penjualan = await Penjualan.find({ pelangganId }).sort({
      tanggalPenjualan: -1,
    });

    const riwayatPembelian = [];

    for (const p of penjualan) {
      const detailList = await DetailPenjualan.find({
        penjualanId: p._id,
      }).populate("produkId", "nama harga");

      const detailProduk = detailList.map((item) => ({
        namaProduk: item.produkId?.nama || "Produk tidak ditemukan",
        harga: item.produkId?.harga || 0,
        jumlah: item.jumlahProduk,
        subtotal: item.subtotal,
      }));

      riwayatPembelian.push({
        tanggal: new Date(p.tanggalPenjualan).toLocaleDateString("id-ID", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        total: p.totalBiaya,
        detailProduk,
      });
    }

    const html = await ejs.renderFile(
      path.join(__dirname, "../views/templatePembelianPelangganPDF.ejs"),
      { penjualan: riwayatPembelian }
    );

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="riwayat_pembelian.pdf"');
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating PDF pelanggan:", error);
    res.status(500).send("Gagal membuat laporan PDF pelanggan");
  }
},


};

module.exports = penjualanController;
