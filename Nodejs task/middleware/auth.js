'use strict';
const jwt = require("jsonwebtoken");
const redisService = require('../config/redisService')

const config = process.env;

const verifyToken = (req, res, next) => {
  const bearerToken = req.headers['authorization'];

  if (!bearerToken) {
    return res.status(403).send("A token is required for authentication");
  }
  const token = bearerToken.split(" ")[1];
  if (!token) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY, async(err, decoded)=>{
      //const userId = user.id
      const  userId = decoded.userId
        //redis se getValue 
        const redisToken = await redisService.getValue(userId)

        if(token === redisToken)
        {
          return next();
        }

  
    });
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
};

module.exports = verifyToken;