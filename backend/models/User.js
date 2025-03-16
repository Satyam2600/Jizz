const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  uid: { type: String, required: true, unique: true }, // College UID/Roll No.
  password: { type: String, required: true },
  profilePicture: { type: String, default: "" },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: "Badge" }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);
