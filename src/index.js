const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const mongo = require("./controller/mongodb")

const templatePath = path.join(__dirname, "../templates");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "hbs");
app.set("views", templatePath);

const router = require("./controller/auth");
app.use(router);

app.get("/", (req, res) => {
  res.render("login");
});

app.get("/signup", (req, res) => {
  res.render("signup"); 
});

app.get("/delete", (req, res) => {
  res.render("delete");
});

app.get("/update", (req, res) => {
  res.render("update");
});

app.get("/user", (req, res) => {
  res.send("User Page");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
