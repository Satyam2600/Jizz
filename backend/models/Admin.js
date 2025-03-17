const mongoose = require("mongoose");

const AdminSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  role: { type: String, enum: ["admin", "moderator"], required: true },
});

module.exports = mongoose.model("Admin", AdminSchema);
