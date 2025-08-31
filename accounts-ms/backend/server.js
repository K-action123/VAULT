const express = require('express');

const mongoose = require('mongoose');

// Import The User routes
const userRoutes  = require('./src/routes/userRoutes');

// loading environment variable

const app=express();
const PORT = process.env.PORT || 5000;

// connecting to mongoDB
const connectDB=async()=>{
    try{
        let mongoUri;
        if(process.env.MONGO_URI){
            mongoUri =  process.env.MONGO_URI;
        }else{
            const user= process.env.MONGO_USER;
            const password = process.env.MONGO_PASSWORD;
            const host = process.env.MONGO_HOST;
            const dbName = process.env.MONGO_DB_NAME;

            if(!user || !password ||!host || !dbName){
                throw new Error('MongoDB details are missing from the environment variables.');
            }
            mongoUri=`mongodb+srv://${user}:${password}@${host}/${dbName}?retryWrites=true&w=majority&appName=FIRST`;
        }
        await mongoose.connect(mongoUri);
        console.log("MongoDB Connected Successfully");
        
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
