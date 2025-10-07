import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const isAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({
        message: 'User not authenticated',
        success: false,
      });
    }

    const data = jwt.verify(token, process.env.JWT_SECRET);
    if (!data) {
      return res.status(401).json({
        message: 'Invalid token',
        success: false,
      });
    }

    req.user = { id: data.userId };

    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: 'Authentication failed',
      success: false,
    });
  }
};
