import { Request, Response, NextFunction } from 'express';

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    // return res.status(400).json({
    //   success: false,
    //   message: 'Invalid email format'
    // });
    next({
      success: false,
      message: 'Invalid email format'
    });
  }

  // Validate password strength
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  next();
};