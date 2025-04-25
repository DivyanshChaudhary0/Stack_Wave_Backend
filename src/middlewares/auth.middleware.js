
const userModel = require("../models/user.model");
const {validationResult,body} = require("express-validator")
const redis = require("../utils/redisConnection");
const imagekit = require("../utils/imagekit");
const { default: mongoose } = require("mongoose");

const userAuth = async function(req,res,next){
    try{
        const token = req?.headers?.authorization?.split(" ")[1];
        if(!token){
            return res.status(401).json({ message: "Unauthorized: Invalid token" })
        }

        const isBlacklisted = await redis.get(token);
        if (isBlacklisted) {
            return res.status(401).json({ message: "Token is blacklisted" });
        }

        const decode = userModel.verifyToken(token);

        req.user = decode;

        next();

    }
    catch(err){
        if (err.name === "JsonWebTokenError") {
            return res.status(401).json({ message: "Unauthorized: Invalid token" });
        } 
        else if (err.name === "TokenExpiredError") {
            return res.status(401).json({ message: "Unauthorized: Token expired" });
        } 
        else {
            console.error("Auth Middleware Error:", err);
            return res.status(500).json({ message: "Internal Server Error" });
        }
    }
}

const signUpValidations = [
    body("username")
        .notEmpty().withMessage("Name is required")
        .isLength({ min: 3, max: 15 }).withMessage("Name must be between 3 to 15 characters"),

    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Enter a valid email address")
        .isLength({ min: 3, max: 50 }).withMessage("Email must be between 3 to 50 characters"),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

    body("bio")
        .optional()
        .isLength({min: 5, max:100}).withMessage("Bio should be less than 100 characters"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

const loginValidation = [
    body("email")
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Enter a valid email address")
        .isLength({ min: 3, max: 50 }).withMessage("Email must be between 3 to 50 characters"),

    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
]

const imageUpload = async(req,res,next) => {

    try{
        if(req.file){
            const result = await imagekit.upload({
                file: req.file.buffer,
                fileName: new mongoose.Types.ObjectId()
            });
    
            req.avatar = result.url;
        }
        next();
    }
    catch(err){
        res.status(500).json({
            message: err.message
        })
    }
}

module.exports = {
    userAuth,
    signUpValidations,
    loginValidation,
    imageUpload
}