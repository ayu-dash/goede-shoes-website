const express = require("express");
const path = require("path");
require("dotenv").config();

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Goede Shoes running on port ${PORT}`));
