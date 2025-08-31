const asyncHandler = require('express-async-handler');
const User = require('../models/User');

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
module.exports = { registerUser };