const AppError = require('../utils/AppError');

/**
 * Middleware factory: validate that required fields exist in req.body.
 * Usage: validate('title', 'category_id')
 */
function validate(...requiredFields) {
  return (req, res, next) => {
    const missing = requiredFields.filter(f => {
      const val = req.body[f];
      return val === undefined || val === null || val === '';
    });

    if (missing.length > 0) {
      return next(AppError.badRequest(`Missing required fields: ${missing.join(', ')}`));
    }
    next();
  };
}

module.exports = validate;
