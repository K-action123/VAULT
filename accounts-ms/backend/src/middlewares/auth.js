const jwt = require('jsonwebtoken');

const authMiddleware = async(req, res, next)=>{
    
    const authHeader = req.header('Authorization');
    if(!authHeader || !authHeader.startsWith('Bearer ')){
        return res.status(401).json({message:"No Token, Authorization denied."});        
    }

    // obtain the token from the request Header

    const token = authHeader.split(' ')[1];
    try{
        //verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Adding user payload to the request object
        req.user = decoded.user;
        next();
    }catch(error){
        res.status(401).json({message:"Invalid Token."});
    }
};
module.exports = authMiddleware;