const mongoose = require("mongoose");

const DropSchema = new mongoose.Schema({
    title: String,
    createdAt: { type: Date, default: Date.now },
    expiresAt: Date,
});

module.exports = mongoose.model("Drop", DropSchema);
