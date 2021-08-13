'use strict';
require("dotenv").config()
const auth = require("./middleware/auth")
const express = require('express')
const app = express()
const userController = require('./controller/userController')


app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));



app.post("/register", userController.register)

app.post("/login", userController.login)

app.delete("/logout", auth, userController.logout)

app.post("/imageupload",auth, userController.imageUpload)

app.get("/imagefetch/:id",auth, userController.imageFetch)

app.delete("/imagedelete/:id", auth, userController.imageDel)

app.put("/imageupdate/:id", auth, userController.imageUpdate)




module.exports = app;

