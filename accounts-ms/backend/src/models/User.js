const mongoose=require('mongoose');
const bcrypt = require("bcrypt");

const UserSchema= new mongoose.Schema({
    firstName:{
        type: String,
        required:   [true, 'First Name is required']
    },
    lastName:{
        type: String,
        required:[true, 'Last Name is required']
    },
    email:{
        type:String,
        unique: true,
        sparse: true, // ALLOW NULL Values, so email or telephone could be empty
        trim: true
    },
    telephone:{
        type:String,
        unique:true,
        sparse: true,
        trim: true  
    },
    password:{
        type:String,
        required:[true,'Password is required'],
        minlength: 6,
        select: false // hides the password when querying it from DB
    }
},{ timestamps:true });

// Hash password before saving new user
UserSchema.pre('save', async function(next){
    if(!this.isModified('password')){
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();    
});

// method to compare entered password with the hashed ones
UserSchema.methods.matchPassword= async function(enteredPassword){
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);