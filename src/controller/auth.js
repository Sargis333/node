const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("./mongodb");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, password } = req.body;

    const existingUser = await User.findOne({ name });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const newUser = new User({ name, password });
    await newUser.save();

    const token = generateToken(newUser);

    res.json({ message: "User created", token });
  } catch (error) {
    res.status(500).json({ message: "Error occurred" });
  }
});

router.post("/login", authenticateToken, async (req, res) => {
  try {
    const { name, password } = req.body;

    const user = await User.findOne({ name });
    if (!user || password !== user.password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (name !== req.user.name) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const token = generateToken(user);

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ message: "Error occurred" });
  }
});

router.post("/delete", authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    if (name !== req.user.name) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const deletedUser = await User.findOneAndDelete({ name });
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error occurred" });
  }
});
router.post("/update", authenticateToken, async (req, res) => {
  try {
    const { name, password, newpassword } = req.body;

    if (!name || !password || !newpassword) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const user = await User.findOne({ name });
    if (!user || password !== user.password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (req.user.name !== user.name) {
      return res.status(403).json({ message: "Forbidden" });
    }

    user.password = newpassword;
    await user.save();

    res.json({ message: "Password updated" });
  } catch (error) {
    res.status(500).json({ message: "Error occurred" });
  }
});

function generateToken(user) {
  return jwt.sign({ name: user.name }, "secretKey", { expiresIn: "1h" });
}

function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify(token, "secretKey", (error, user) => {
    if (error) {
      return res.status(403).json({ message: "Forbidden" });
    }

    req.user = user;
    next();
  });
}

module.exports = router;
