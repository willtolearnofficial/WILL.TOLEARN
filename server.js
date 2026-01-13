const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- SERVE ALL FILES (About, Experience, home, etc.) ---
// This line makes all your files in the screenshot accessible
app.use(express.static(__dirname));

// --- MONGODB CONNECTION ---
const mongoURI = process.env.MONGO_URI || "mongodb+srv://will_123:will12345@cluster0.bynok57.mongodb.net/WillToLearnDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connected to MongoDB Atlas"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- USER SCHEMA ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// --- ROUTES ---

// 1. Send the Profile Page on load
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index1.html'));
});

// 2. Signup Logic
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Success" });
    } catch (err) {
        res.status(400).json({ error: "Username already exists!" });
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Server flying on port ${PORT}`));
