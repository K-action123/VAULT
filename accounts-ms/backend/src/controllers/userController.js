require('dotenv').config()
const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto= require('crypto');
const sendEmail = require("../utils/sendEmail");


const registerUser= asyncHandler(async(req, res)=>{
    const {firstName, lastName, email, telephone, password} = req.body;

    // Simple Validation to ensure all fields are present
    if(!firstName || !lastName || !password || (!email && !telephone)){
        res.status(400);
        throw new Error('Please fill all required fields');
    }

    // Checking if a user with the same email or telephone exists
    const userExists = await User.findOne({
        $or: [{ email: email }, { telephone: telephone }]
    });

    if (userExists){
        res.status(400);
        throw new Error(" User already exists with this Email or telephone number");
    }
    // Create the new User 
    const user = await User.create({
        firstName,
        lastName,
        email,
        telephone,
        password,
    });
    if (user){
        res.status(201).json({message:"User registered Successfully!"});
    }else{
        res.status(400);
        throw new Error('Invalid user Data');
    }
});

const loginUser= asyncHandler(async(req, res)=>{
    const {email, telephone, password}= req.body;

    // finding user by his email/telephone and password
    const user = await User.findOne({
        $or:[{email:email},{telephone:telephone}]        
    }).select('+password'); //Select password field as it's Hidden defaultly
    
    //check if user exist and password is corrext
    if(user &&(await user.matchPassword(password))){
        const payload = {
            user:{
                id:user.id,
            }
        }
        const token = jwt.sign(payload, process.env.JWT_SECRET,{
            expiresIn: '1h' // Token be invalid in 30 days
        });        
        res.json({ message:"Login Successful", token});
    }else{
        res.status(401);
        throw new Error("Invalid Email/Telephone number or Password.")
    }
});

// setting New Password once first was forgotten forgotPassword Function
const forgotPassword = asyncHandler(async (req, res)=>{
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error("User not found with that Email address.");
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpire = Date.now()+ 10 * 60 * 1000; //Token Expires in 10 minutes

    await user.save();
    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/reset-password/${resetToken}`;
    const message = `You are receiving this email because you( or someone else) have requested the reset of the password.
                    Please go to the following link to reset your password: \n\n ${resetUrl} \n\n If you did not request this, Please ignore this Email.`;
    
    try{
        await sendEmail({
            email: user.email,
            subject: 'Password reset Request',
            message,
        });
        res.status(200).json({success: true, message: "Email sent successFully!"});
    }catch(err){
        user.resetPasswordToken =undefined;
        user.resetPasswordExpire =undefined;
        await user.save();
        res.status(500);
        throw new Error("Email could not be sent. Please Try again Later.")

    }
});

const resetPassword = asyncHandler(async(req, res)=>{
    try{
        const { token }= req.params; //get token from the url
        const { password } =  req.body; // get the new password from the body

        // Hash the plain-text password token to match the one in the database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        //find the uswer with the matching user_id  and validate the expiration date
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpire: { $gt: Date.now() }, //$gt stands for greater than
        });
        if(!user){
            return res.status(400).json({message: 'Invalid or expired Token'})
        };

        // Hash the new password  and update the user's document
        user.password = password;
        
        //clear the reset token fields to prevent reuse
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({message: "Password has been resetted successfully."});


    }catch(error){
        console.error(error);
        res.status(500).json({message: "Server internal Error, Please try again later."})
    }
});
module.exports = { registerUser, loginUser, forgotPassword, resetPassword };