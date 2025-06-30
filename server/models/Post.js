const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    dropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Drop",
    required: true,
    },
    content: { type: String, required: true },
    votes: { type: Number, default: 0 },
    userId: String,
    phone: String,
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Post", PostSchema);
