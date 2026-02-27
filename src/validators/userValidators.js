const Joi = require("joi");

// Define the validation schema for registration
const userSchema = Joi.object({
  username: Joi.string().min(3).max(30).required().messages({
    "string.empty": "Username is required.",
    "string.min": "Username must be at least 3 characters long.",
    "string.max": "Username must be less than or equal to 30 characters.",
  }),
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Please provide a valid email address.",
  }),
  password: Joi.string()
    .min(8) // Minimum 8 characters
    .pattern(new RegExp("(?=.*[a-z])")) // At least one lowercase letter
    .pattern(new RegExp("(?=.*[A-Z])")) // At least one uppercase letter
    .pattern(new RegExp("(?=.*[0-9])")) // At least one number
    .pattern(new RegExp("(?=.*[!@#$%^&*])")) // At least one special character
    .required()
    .messages({
      "string.min": "Password must be at least 8 characters long.",
      "string.pattern.base":
        "Password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      "any.required": "Password is required.",
    }),
  first_name: Joi.string().max(100).optional(),
  last_name: Joi.string().max(100).optional(),
  sex: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
  date_of_birth: Joi.date().iso().optional(),
});

// Middleware to validate user data (Registration)
const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  next();
};

const updateUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).optional(),
  email: Joi.string().email().optional(),
  first_name: Joi.string().max(100).optional(),
  last_name: Joi.string().max(100).optional(),
  sex: Joi.string().valid("MALE", "FEMALE", "OTHER").optional(),
  date_of_birth: Joi.date().iso().optional(),
});

const validateUserUpdate = (req, res, next) => {
  const { error } = updateUserSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  next();
};

const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp("(?=.*[a-z])"))
    .pattern(new RegExp("(?=.*[A-Z])"))
    .pattern(new RegExp("(?=.*[0-9])"))
    .pattern(new RegExp("(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.min": "New password must be at least 8 characters long.",
      "string.pattern.base":
        "New password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
});

const validatePassword = (req, res, next) => {
  const { error } = updatePasswordSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  next();
};

const loginSchema = Joi.object({
  identifier: Joi.string().required().messages({
    "string.empty": "Email or Username is required.",
  }),
  password: Joi.string().required().messages({
    "any.required": "Password is required.",
  }),
});

const validateLogin = (req, res, next) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  next();
};

const emailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.empty": "Email is required.",
    "string.email": "Please provide a valid email address.",
  }),
});

const validateEmail = (req, res, next) => {
  const { error } = emailSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  next();
};

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    "any.required": "Reset token is required.",
  }),
  newPassword: Joi.string()
    .min(8)
    .pattern(new RegExp("(?=.*[a-z])"))
    .pattern(new RegExp("(?=.*[A-Z])"))
    .pattern(new RegExp("(?=.*[0-9])"))
    .pattern(new RegExp("(?=.*[!@#$%^&*])"))
    .required()
    .messages({
      "string.min": "New password must be at least 8 characters long.",
      "string.pattern.base":
        "New password must include at least one uppercase letter, one lowercase letter, one number, and one special character.",
    }),
});

const validateResetPassword = (req, res, next) => {
  const { error } = resetPasswordSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }
  next();
};

module.exports = {
  validateUser,
  validateUserUpdate,
  validatePassword,
  validateLogin,
  validateEmail,
  validateResetPassword,
};
