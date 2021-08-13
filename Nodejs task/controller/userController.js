'use strict';
const auth = require('../middleware/auth')
const models = require('../models/index')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary')
const redisService = require('../config/redisService')
const config = process.env;


cloudinary.config({ 
  cloud_name: 'dnewmhiid', 
  api_key: '715516958584478', 
  api_secret: 'vTQwJoZS46cj0xWssDPghym5P2I' 
});


exports.register = async(req, res) => {

    try {
        const first_name = req.body.first_name
        const last_name = req.body.last_name
        const email = req.body.email
        const password = req.body.password
    
        // Validate user input
        if (!(email && password && first_name && last_name)) {
          res.status(400).send("All input is required");
        }
    
        // check if user already exist
        // Validate if user exist in our database
        
        const oldUser = await models.user.findOne({
             where:{email: email}
            });
    
        if (oldUser) {
          return res.status(409).send("User Already Exist");
        }
    
        //Encrypt user password
        encryptedPassword = await bcrypt.hash(password, 10);
    
        // Create user in our database
        const user = await models.user.create({
          first_name: first_name,
          last_name: last_name,
          email: email.toLowerCase(), 
          password: encryptedPassword
          
        });

        // extract userId from user as "userId"
        const userId = user.id
      
        //generate token as token with key as {userId}
        const token = jwt.sign({userId},process.env.TOKEN_KEY)
        
        //when you get token then save it in redis with key userId and value token
        const userToken = await redisService.setValue(userId, token);

        // return new user
        if(userToken){
          res.status(201).send({
              user,
              token
          })
        }
    
      } catch (err) {
        console.log(err);
      }
  }


exports.login = async(req, res) => {
  try {
    // Get user input
    const email = req.body.email
    const password = req.body.password

    // Validate user input
    if (!(email && password)) {
      res.status(400).send("All input is required");
    }
    // Validate if user exist in our database
    const user = await models.user.findOne({ where :{email: email} });

    if (user && (await bcrypt.compare(password, user.password))) {

      const userId = user.id
      // Create token
      const token = jwt.sign(
        {userId},
        process.env.TOKEN_KEY
      );

    const userToken = await redisService.setValue(userId, token);

  // return new user
  if(userToken){
    res.status(201).send({
        message:'user login successfully',
        token
    })
  }
    }else
    res.status(400).send("Invalid Credentials");
  } catch (err) {
    console.log(err);
  }
}


exports.logout = async(req,res) =>{
  try
  {
    const token = req.headers['authorization'].split(" ")[1]
    const decoded = jwt.verify(token, config.TOKEN_KEY, async(err, decoded)=>{
    const  userId = decoded.userId

    redisService.deleteValue(userId)
      .then((replyFromRedis) =>{
        if(replyFromRedis){
          res.send("user log out")
        }
      })
    })
}catch(err){
  console.log(err);
}}


exports.imageUpload = async(req,res) =>{
  const image = await cloudinary.uploader.upload(req.body.data)
  .then((image) => {
    const token = req.headers['authorization'].split(" ")[1]
    const decoded = jwt.verify(token, config.TOKEN_KEY, async(err, decoded)=>{
    const userId = decoded.userId
    
    const existed = await models.image.findOne({
      where:{
        user_id: userId
      }
    })

    if(!existed){
    models.image.create({
      user_id: userId,
      image_url: image.url,
      public_id: image.public_id
    })
    res.send({
      message:'image uploaded',
      id:userId,
      public_id:image.public_id,
      image_url:image.url
    })
  } else {
    res.send({
      message:'image already uploaded'
    })
  }
}
)}
).catch((err) => {
    if (err) { console.warn(err) }
  })
}


exports.imageFetch = async(req,res) =>{
  try{
  const image_id = req.params.id
  const image_url = await models.image.findOne({
    where:{
      id: image_id
    },
  })
  if(image_url.image_url){
    const image = await cloudinary.image(image_url.image_url, {type: "fetch"})
    res.send({
      image:image
    })
  }
  }catch(err){
    console.log(err)
  }
}


exports.imageDel = async(req,res) =>{
    const cloudinary_id = req.params.id;
  // delete image from cloudinary first
    await cloudinary.uploader
      .destroy(cloudinary_id)
      .then(() =>{
       models.image.destroy({
          where:{
            public_id: cloudinary_id
          }
        })
      }).then((deleteResult) =>{
        res.send({
          message:'image deleted successfully',
          deleteResult
        })
      }).catch((err) =>{
        console.log(err);
      })
  }


exports.imageUpdate = async(req,res) =>{
  const cloudinary_id = req.params.id;

  cloudinary.uploader.destroy(cloudinary_id)
  const image = await cloudinary.uploader.upload(req.body.data)

        models.image.update({
          image_url: image.url,
          public_id: image.public_id
        },{
          where:{
            public_id: cloudinary_id
          }
        })
        res.send({
          message:'image updated',
          public_id:image.public_id,
          image_url:image.url
        })
      .catch((err) =>{
        console.log(err);
      })
}