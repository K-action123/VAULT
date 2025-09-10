const express = require('express');
const { body, validationResult } = require("express-validator");
const { registerUser, loginUser, forgotPassword, resetPassword } = require("../controllers/userController");
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

// This is where routes go in and API endpoints

router.post('/register', 
    [
        body('email')
            .isEmail()
            .withMessage("please enter a valid email address"),
        body('password')
            .isLength({min: 6})
            .withMessage("password must be at least 6 characters long"),

    ],(req, res, next) => {

        //check for validation errors

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const SanitizedErrors = errors.array().map(error=>({
                msg:error.msg
            }));
            return res.status(400).json({errors: SanitizedErrors})
        }
        //if no errors , proceed  to the controller
        next();
    }
    ,registerUser);

router.post('/login', 
    [
        body('email')
            .isEmail()
            .withMessage("please enter a valid email address"),
        body('password')
            .isLength({min: 6})
            .withMessage("password must be at least 6 characters long"),

    ],(req, res, next) => {

        //check for validation errors

        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const SanitizedErrors = errors.array().map(error=>({
                msg:error.msg
            }));
            return res.status(400).json({errors: SanitizedErrors})
        }
        //if no errors , proceed  to the controller
        next();
    }
    ,loginUser);

router.get('/profile', authMiddleware, (req, res)=>{
        try{
            //req.user is available here because of the middleware 
            res.status(200).json({message:"Access Granted!", user: req.user });
        }catch(error){
            res.status(500).json({message:"Server internal error, try again later."});
        }
});

router.post('/forgot-password',[
    body('email')
        .isEmail()
        .withMessage("please enter a valid email address"),
    ],(req, res, next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const SanitizedErrors = errors.array().map(error=>({
                error: error.msg
            }));
            return res.status(400).json({errors: SanitizedErrors });
        }
        next();
    }
    , forgotPassword);

router.post('/reset-password/:token',[
    body('password')
        .isLength({min: 6})
        .withMessage("password should 6 character minimum."),
    ],(req, res, next)=>{
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            const SanitizedErrors = errors.array().map(error=>({
                error:error.msg
            }));  
            return res.status(400).json({message: SanitizedErrors});
        };
    next();
}
    ,resetPassword);
module.exports = router;