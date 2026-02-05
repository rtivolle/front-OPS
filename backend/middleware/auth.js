const admin = require('../firebase');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Verify token with Firebase Admin
      const decodedToken = await admin.auth().verifyIdToken(token);

      // Attach the decoded token to the request
      // We can also attach the user from DB here if needed
      req.user = decodedToken;

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      res.status(401).json({ success: false, error: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, error: 'Not authorized, no token' });
  }
};

module.exports = { protect };
