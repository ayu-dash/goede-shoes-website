const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();

const authController = require("./controllers/authController");
const connectDB = require("./config/db");


const app = express();

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes (nanti diisi)
app.get("/", (req, res) => res.render("index"));
app.get("/login", (req, res) => res.render("login"));
app.get("/register", (req, res) => res.render("register"));
app.get("/verify", (req, res) => res.render("verify"));
app.get("/forgot-password", (req, res) => res.render("forgot-password"));
app.get("/reset-password", (req, res) => res.render("reset-password"));

// API Routes
app.post("/api/auth/register", authController.register);
app.post("/api/auth/verify-otp", authController.verifyOTP);
app.post("/api/auth/resend-otp", authController.resendOTP);
app.post("/api/auth/login", authController.login);



// Database connection
connectDB();


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Goede Shoes running on port ${PORT}`));
