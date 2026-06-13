const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { getAllProducts, getProductById, addProduct, editProduct, deleteProduct } = require("../controllers/productController");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", upload.single("gambar"), addProduct);
router.put("/:id", upload.single("gambar"), editProduct);
router.delete("/:id", deleteProduct);

module.exports = router;