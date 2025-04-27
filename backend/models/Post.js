const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    content: {
      type: String,
      required: function() {
        return !this.image && !this.video;
      },
      trim: true,
      maxlength: 5000
    },
    image: {
      type: String,
      default: null
    },
    video: {
      type: String,
      default: null
    },
    likes: {
      type: Number,
      default: 0
    },
    likedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    comments: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Users mentioned in the post
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true
        },
        reason: {
          type: String,
          required: true
        },
        createdAt: {
          type: Date,
          default: Date.now
        }
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Create indexes for better query performance
PostSchema.index({ user: 1, createdAt: -1 });
PostSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Post", PostSchema);
