const Drop = require("./models/Drop");
const Post = require("./models/Post");

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3001;

const multer = require("multer");
const path = require("path");

// Serve images statically
app.use("/uploads", express.static("uploads"));

// Multer setup
const storage = multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique filename
    }, 
});
const upload = multer({ storage });


app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
    console.log("GET / route was called");
    res.send("Welcome to Droply API!");
});

// MongoDB Connect
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

// --- ROUTES ---

// Get all drops
app.get("/drops", async (req, res) => {
    try {
        const drops = await Drop.find().sort({ createdAt: -1 });
        res.json(drops);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get all posts for a given drop
app.get("/posts/:dropId", async (req, res) => {
    try {
        const posts = await Post.find({ dropId: req.params.dropId }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new drop
app.post("/drops", async (req, res) => {
    const { title, expiresAt } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });

    try {
        const newDrop = new Drop({ title, expiresAt });
        await newDrop.save();
        res.status(201).json(newDrop);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new post inside a drop
app.post("/posts", async (req, res) => {
    const { dropId, content, userId, phone } = req.body;

    if (!dropId || !content) {
        return res.status(400).json({ message: "dropId and content are required" });
    }

    try {
        const newPost = new Post({
            dropId,
            content,
            userId: userId || null,
            phone: phone || null,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Vote on a post (increment votes by 1)
app.post("/posts/:postId/vote", async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post) return res.status(404).json({ message: "Post not found" });

      // Get vote change from request body, default to +1 if not provided
        const { vote } = req.body;
        const voteChange = vote === -1 ? -1 : 1;

        post.votes = (post.votes || 0) + voteChange;
        await post.save();

        res.json(post);
    }   catch (err) {
            res.status(500).json({ message: err.message });
    }
});

app.post("/drops", upload.single("image"), async (req, res) => {
    const { title, expiresAt } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!title) return res.status(400).json({ message: "Title is required" });

    try {
        const newDrop = new Drop({ title, expiresAt, image });
        await newDrop.save();
        res.status(201).json(newDrop);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.post("/posts", upload.single("image"), async (req, res) => {
    const { dropId, content, userId, phone } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!dropId || !content) {
        return res.status(400).json({ message: "dropId and content are required" });
    }

    try {
        const newPost = new Post({
        dropId,
        content,
        image,
        userId: userId || null,
        phone: phone || null,
        });

        await newPost.save();
        res.status(201).json(newPost);
    }   catch (err) {
            res.status(500).json({ message: err.message });
    }
});


// Start Server (at the end)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
