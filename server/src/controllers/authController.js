import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Session from '../models/Session.js';
import { logAudit } from '../utils/auditLogger.js';

const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'member',
    });

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save session in DB
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await Session.create({
      userId: user._id,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    });

    logAudit('LOGIN', user._id.toString(), user._id.toString(), null, { email: user.email });

    res.status(201).json({
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: 'Invalid user data received' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save session in DB
    const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await Session.create({
      userId: user._id,
      refreshToken,
      userAgent,
      ipAddress,
      expiresAt,
    });

    logAudit('LOGIN', user._id.toString(), user._id.toString(), null, { email: user.email });

    res.status(200).json({
      token,
      refreshToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(400).json({ message: 'Login request failed' });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Failed to retrieve user data' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }
    const users = await User.find(query).select('name email role');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to retrieve users list', error: error.message });
  }
};

export const refreshToken = async (req, res) => {
  try {
    const { refreshToken: tokenFromRequest } = req.body || {};

    if (!tokenFromRequest) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    let decoded;
    try {
      decoded = jwt.verify(tokenFromRequest, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const session = await Session.findOne({ refreshToken: tokenFromRequest });
    if (!session) {
      return res.status(401).json({ message: 'Session not found or revoked' });
    }

    const newAccessToken = generateAccessToken(session.userId);
    const newRefreshToken = generateRefreshToken(session.userId);

    session.refreshToken = newRefreshToken;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    session.expiresAt = expiresAt;
    await session.save();

    return res.status(200).json({
      token: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Refresh token process failed', error: error.message });
  }
};

export const getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(sessions);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving active sessions', error: error.message });
  }
};

export const revokeSession = async (req, res) => {
  try {
    const { id } = req.params;
    const session = await Session.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    return res.status(200).json({ message: 'Session revoked successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Error revoking session', error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    const { refreshToken: tokenFromRequest } = req.body || {};
    
    if (tokenFromRequest) {
      await Session.findOneAndDelete({ refreshToken: tokenFromRequest });
    }

    logAudit('LOGOUT', req.user.id, req.user.id, null);

    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Logout failed', error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body || {};

    if (!password || !password.trim()) {
      return res.status(400).json({ message: 'Password is required' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    user.passwordHash = passwordHash;
    await user.save();

    await Session.deleteMany({ userId: user._id });

    logAudit('PASSWORD_RESET', req.user.id, user._id.toString(), null, {
      resetTargetEmail: user.email,
    });

    return res.status(200).json({ message: 'Password reset successfully. User sessions have been revoked.' });
  } catch (error) {
    return res.status(500).json({ message: 'Error resetting password', error: error.message });
  }
};
