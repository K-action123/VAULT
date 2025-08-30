const express= require('express');
const router  = express.Router();
const { registerUser } = require("../controllers/userController");

// Define User Registration
router.post('/register', registerUser);

module.exports= router;