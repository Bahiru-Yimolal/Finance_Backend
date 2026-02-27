const Joi = require("joi");

const transactionSchema = Joi.object({
    amount: Joi.number().positive().precision(2).required().messages({
        "number.base": "Amount must be a number.",
        "number.positive": "Amount must be greater than zero.",
        "any.required": "Amount is required.",
    }),
    type: Joi.string().valid("income", "expense").required().messages({
        "any.only": "Type must be either 'income' or 'expense'.",
        "any.required": "Type is required.",
    }),
    category: Joi.string().required().messages({
        "string.empty": "Category name is required.",
        "any.required": "Category name is required.",
    }),
    description: Joi.string().allow("").max(500).optional(),
    date: Joi.date().required().messages({
        "date.base": "Invalid date format. Use YYYY-MM-DD.",
        "any.required": "Date is required.",
    }),
});

const validateTransaction = (req, res, next) => {
    const { error } = transactionSchema.validate(req.body);
    if (error) {
        return res.status(400).json({
            success: false,
            message: error.details[0].message,
        });
    }
    next();
};

module.exports = {
    validateTransaction,
};
