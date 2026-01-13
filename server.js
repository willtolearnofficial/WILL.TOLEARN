const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path'); // Added for file path handling
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors());

// --- SERVE STATIC FILES ---
// This tells Express to serve your images (LOGO.jpeg), CSS, and JS files 
// from your project folder automatically.
app.use(express.static(__dirname));

// --- MONGODB CONNECTION ---
const mongoURI = process.env.MONGO_URI || "mongodb+srv://will_123:will12345@cluster0.bynok57.mongodb.net/WillToLearnDB?retryWrites=true&w=majority";

mongoose.connect(mongoURI)
    .then(() => console.log("✅ Connected to MongoDB Atlas (Cluster0)"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err));

// --- USER SCHEMA & MODEL ---
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// --- ROUTES ---

/**
 * 1. Root Route 
 * This is what users see when they go to https://will-tolearn.onrender.com/
 * We are now sending the actual HTML file instead of just text.
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index1.html'));
});

// 2. Signup Route
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already taken" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            password: hashedPassword
        });

        await newUser.save();
        res.status(201).json({ message: "User registered successfully!" });
    } catch (err) {
        res.status(500).json({ error: "Server error during signup" });
    }
});

// 3. Login Route
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid password" });
        }

        res.status(200).json({ 
            message: "Login successful",
            username: user.username 
        });
    } catch (err) {
        res.status(500).json({ error: "Server error during login" });
    }
});

// --- START SERVER ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server is flying on port ${PORT}`);
});
