const { body, validationResult } = require('express-validator');

const validateProvince = [
  body('province_name')
    .notEmpty()
    .withMessage('Province name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Province name must be between 2 and 100 characters'),
  
  body('latitude')
    .isFloat({ min: -90, max: 90 })
    .withMessage('Latitude must be a valid number between -90 and 90'),
  
  body('longitude')
    .isFloat({ min: -180, max: 180 })
    .withMessage('Longitude must be a valid number between -180 and 180'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    next();
  }
];

module.exports = { validateProvince };