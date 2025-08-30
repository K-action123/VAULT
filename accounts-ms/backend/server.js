const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Import The User routes
const userRoutes  = require('./src/routes/userRoutes');

// loading environment variable
dotenv.config();
const app=express();
const PORT = process.env.PORT || 5000;

// connecting to mongoDB
const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MONGODB connected Successfully!");
    }catch(error){
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
connectDB();

// MIDDLEWARE to parse incoming json Requests

app.use(express.json());
app.use('/api/auth',userRoutes); // connecting routes to the server

app.listen(PORT, ()=>{
    console.log(`Server is running on Port ${PORT}`);
});
