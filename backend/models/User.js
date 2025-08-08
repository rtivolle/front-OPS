const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'Please provide a first name'],
    maxlength: [50, 'First name cannot be more than 50 characters'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-ZÀ-ÿ\s-']+$/.test(v);
      },
      message: 'First name can only contain letters, spaces, hyphens and apostrophes'
    }
  },
  lastName: {
    type: String,
    required: [true, 'Please provide a last name'],
    maxlength: [50, 'Last name cannot be more than 50 characters'],
    trim: true,
    validate: {
      validator: function(v) {
        return /^[a-zA-ZÀ-ÿ\s-']+$/.test(v);
      },
      message: 'Last name can only contain letters, spaces, hyphens and apostrophes'
    }
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false, // Do not return password by default
    validate: {
      validator: function(v) {
        // Password must contain at least one uppercase, one lowercase, one number and one special character
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  },
  passwordChangedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });

// Virtual for full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Update passwordChangedAt field
  this.passwordChangedAt = Date.now() - 1000; // 1 second ago to ensure token is always created after password change

  next();
});

// Instance method to check password
UserSchema.methods.matchPassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to check if password changed after JWT was issued
UserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Instance method to handle failed login attempts
UserSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we have hit max attempts and it's not locked already, lock the account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // Lock for 2 hours
  }
  
  return this.updateOne(updates);
};

// Instance method to reset login attempts
UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: Date.now() }
  });
};

// Static method to find by credentials and handle account locking
UserSchema.statics.getAuthenticated = async function(email, password) {
  const user = await this.findOne({ email }).select('+password');
  
  if (!user) {
    return { user: null, reason: 'USER_NOT_FOUND' };
  }

  // Check if the account is currently locked
  if (user.isLocked) {
    // Just increment login attempts and return
    await user.incLoginAttempts();
    return { user: null, reason: 'ACCOUNT_LOCKED' };
  }

  // Test for a matching password
  const isMatch = await user.matchPassword(password);
  
  if (isMatch) {
    // If there's no lock or failed attempts, just return the user
    if (!user.loginAttempts && !user.lockUntil) {
      await user.resetLoginAttempts();
      return { user, reason: null };
    }
    
    // Reset attempts and return user
    await user.resetLoginAttempts();
    return { user, reason: null };
  }

  // Password is incorrect, so increment login attempts before responding
  await user.incLoginAttempts();
  return { user: null, reason: 'PASSWORD_INCORRECT' };
};

module.exports = mongoose.model('User', UserSchema);
