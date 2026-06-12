const express = require("express");
const router = express.Router();
const { getAllProducts, getProductById, addProduct, editProduct, deleteProduct } = require("../controllers/productController");

router.get("/", getAllProducts);
router.get("/:id", getProductById);
router.post("/", addProduct);
router.put("/:id", editProduct);
router.delete("/:id", deleteProduct);

module.exports = router;