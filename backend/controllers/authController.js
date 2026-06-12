const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {

    const { nama, email, password } = req.body;

    try {

        const hashPassword =
            await bcrypt.hash(password, 10);

        db.query(
            "INSERT INTO users (nama,email,password) VALUES (?,?,?)",
            [nama, email, hashPassword],
            (err, result) => {

                if (err)
                    return res.status(500).json(err);

                res.json({
                    message: "Register berhasil"
                });

            }
        );

    } catch (error) {
        res.status(500).json(error);
    }
};

exports.login = (req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email=?",
        [email],
        async (err, result) => {

            if (err)
                return res.status(500).json(err);

            if (result.length === 0)
                return res.status(404).json({
                    message: "User tidak ditemukan"
                });

            const user = result[0];

            const match =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!match)
                return res.status(400).json({
                    message: "Password salah"
                });

            const token = jwt.sign(
                {
                    id: user.id,
                    role: user.role
                },
                "RENTTECH_SECRET",
                {
                    expiresIn: "1d"
                }
            );

            res.json({
                token,
                role: user.role,
                nama: user.nama
            });

        }
    );
};