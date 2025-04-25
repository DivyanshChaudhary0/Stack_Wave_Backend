
const { body, validationResult } = require("express-validator");

const questionValidation = [
    body("title")
        .notEmpty().withMessage("Title is required")
        .isLength({ min: 5, max: 50 }).withMessage("Title must be between 5 to 50 characters")
        .trim(),

    body("body")
        .notEmpty().withMessage("Body is required")
        .isLength({ max: 1000 }).withMessage("Body cannot be more than 300 characters long"),

    body("tags")
        .isArray({ min: 1, max: 10 }).withMessage("Tags must be an array with 1 to 10 items")
        .custom((tags) => {
            if (!tags.every(tag => typeof tag === "string")) {
                throw new Error("All tags must be strings");
            }
            return true;
        }),

    function(req,res,next){
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({ message: errors.array() })
        }
        next();
    }
];

module.exports = questionValidation;
