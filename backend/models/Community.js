const mongoose = require('mongoose');
const communitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  privacy: { type: String, enum: ['public', 'private'], default: 'public' },
  avatar: String,
  coverImage: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Community', communitySchema);