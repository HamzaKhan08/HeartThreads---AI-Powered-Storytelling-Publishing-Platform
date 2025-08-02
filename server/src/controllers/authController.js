const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

exports.signup = async (req, res) => {
  const { username, email, password, isAnonymous, googleId, name } = req.body;
  
  try {
    // Validate input
    if (!username || !email) {
      return res.status(400).json({ 
        message: 'Username and email are required' 
      });
    }

    // For non-Google users, password is required
    if (!googleId && !password) {
      return res.status(400).json({ 
        message: 'Password is required' 
      });
    }

    if (password && password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters long' 
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ 
          message: 'An account with this email already exists' 
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ 
          message: 'Username is already taken' 
        });
      }
    }

    // Hash password if provided
    let passwordHash = null;
    if (password) {
      passwordHash = await bcrypt.hash(password, 12);
    }
    
    // Create user
    const user = await User.create({ 
      username, 
      email, 
      passwordHash, 
      googleId,
      name,
      isAnonymous: isAnonymous || false 
    });
    
    // Generate token
    const token = generateToken(user);
    
    res.status(201).json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        name: user.name,
        password: password, // Include plain password for dashboard display
        googleId: user.googleId,
        isAnonymous: user.isAnonymous 
      },
      message: 'Account created successfully'
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ 
      message: 'Server error. Please try again later.' 
    });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email and password are required' 
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Check if user has a password (not a Google user)
    if (!user.passwordHash) {
      return res.status(400).json({ 
        message: 'This account was created with Google. Please use Google login.' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ 
        message: 'Invalid email or password' 
      });
    }

    // Generate token
    const token = generateToken(user);
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        name: user.name,
        password: password, // Include plain password for dashboard display
        googleId: user.googleId,
        isAnonymous: user.isAnonymous 
      },
      message: 'Login successful'
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ 
      message: 'Server error. Please try again later.' 
    });
  }
};

// Google OAuth login
exports.googleLogin = async (req, res) => {
  const { googleId, email, name, username } = req.body;
  
  try {
    // Validate input
    if (!googleId || !email) {
      return res.status(400).json({ 
        message: 'Google ID and email are required' 
      });
    }

    // Find user by Google ID or email
    let user = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        googleId,
        email,
        name,
        username: username || email.split('@')[0], // Use email prefix as username if not provided
        isAnonymous: false
      });
    } else if (!user.googleId) {
      // Link existing email account to Google
      user.googleId = googleId;
      user.name = name || user.name;
      await user.save();
    }

    // Generate token
    const token = generateToken(user);
    
    res.json({ 
      token, 
      user: { 
        id: user._id, 
        username: user.username, 
        email: user.email,
        name: user.name,
        password: null, // No password for Google users
        googleId: user.googleId,
        isAnonymous: user.isAnonymous 
      },
      message: 'Google login successful'
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ 
      message: 'Server error. Please try again later.' 
    });
  }
};

// Optional: Add logout endpoint (client-side token removal)
exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};
