const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');
require('dotenv').config();

const app = express();

// --- MIDDLEWARE ---
app.use(express.json());
app.use(cors()); // Allows your HTML frontend to communicate with this backend

// --- MONGODB CONNECTION ---
// On Render, it will use the environment variable. Locally, it uses your string.
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

// 1. Signup Route: Encrypts password and saves new user
app.post('/signup', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ error: "Username already taken" });
        }

        // Hash the password (Security step)
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

// 2. Login Route: Verifies credentials
app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Compare encrypted passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid password" });
        }

        // Success
        res.status(200).json({ 
            message: "Login successful",
            username: user.username 
        });
    } catch (err) {
        res.status(500).json({ error: "Server error during login" });
    }
});

// 3. Root Route (For health check)
app.get('/', (req, res) => {
    res.send("Will.ToLearn API is running...");
});

// --- START SERVER ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`🚀 Server is flying on port ${PORT}`);
});