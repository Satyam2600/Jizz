const express = require('express');
const emojiData = require('@emoji-mart/data');

const router = express.Router();

// Route to serve emoji data
router.get('/emoji-data', (req, res) => {
    res.json(emojiData);
});

module.exports = router;