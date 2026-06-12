const express = require("express");
const cors = require("cors");
const db = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/rentals", rentalRoutes);

app.get("/test", (req, res) => {
    console.log("ROUTE TEST DIPANGGIL");
    res.send("TEST BERHASIL");
});

app.get("/", (req, res) => {
    res.send("RentTech API Running...");
});

app.get("/users", (req, res) => {
    db.query("SELECT * FROM users", (err, result) => {
        if (err) return res.json(err);
        res.json(result);
    });
});

console.log("ROUTE TEST TERDAFTAR");

app.listen(5000, () => {
    console.log("TEST 123");
});