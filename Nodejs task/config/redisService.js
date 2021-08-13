require('dotenv').config();
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_PORT, process.env.REDIS_HOST);
let redisService = {}
redisService.setValue = (key, value)=>{
    return new Promise((resolve, reject)=>{
        if(key && value){
            client.set(key, value, (err, reply)=>{
                if(err){
                    reject(err)
                }else if(reply === 'OK'){
                    resolve(true)
                }else{
                    reject(false)
                }
            })
        }else{
            reject(false)
        }
    })
}

redisService.getValue = (key)=>{
    return new Promise((resolve, reject)=>{
        if(key){
            client.get(key, (err, reply)=>{
                if(err){
                    reject(err)
                }else if(reply === null){
                    reject(false)
                }else{
                    resolve(reply)
                }
            })
        }else{
            reject(false);
        }
    })
}

redisService.deleteValue = (key)=>{
    return new Promise((resolve, reject)=>{
        if(key){
            client.del(key, (err, reply)=>{
                if(err){
                    reject(err)
                }else if(reply === 0){
                    reject(false)
                }else{
                    resolve(true)
                }
            })
        }else{
            reject(false)
        }
    })
}


 module.exports = redisService;
