const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Sync Firebase user with MongoDB
// @route   POST /api/auth/sync
router.post('/sync', protect, async (req, res) => {
  try {
    const { uid, email, email_verified } = req.user; // req.user is set by protect middleware (Firebase decoded token)

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Check if user exists by email (legacy or first time sync)
      user = await User.findOne({ email });

      if (user) {
        // Link existing user to firebase only if email is verified
        if (!email_verified) {
            return res.status(403).json({ success: false, error: 'Email must be verified to link accounts' });
        }
        user.firebaseUid = uid;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          email,
          firebaseUid: uid,
        });
      }
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Sync Error:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;
