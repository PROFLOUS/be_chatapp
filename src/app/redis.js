const util = require('util');
const redis = require('redis');
require('dotenv').config()

// const client = redis.createClient({
//     // url:process.env.REDIS_URI
//     socket: {
//         host: process.env.REDIS_HOST,
//         port: process.env.REDIS_PORT,
//     },
//     password: process.env.REDIS_PASSWORD
//     // port: 10023,
//     // host: "redis-10023.c252.ap-southeast-1-1.ec2.cloud.redislabs.com",
   
// });

// client.on('connect', function () {
//     console.log('Redis Connected!');
// });

// client.on('error', function (error) {
//     console.error('Redis Error: ', error);
// });

// process.on('SIGINT', function () {
//     client.quit();
// });

// const setPromise = util.promisify(client.set).bind(client);
// const getPromise = util.promisify(client.get).bind(client);
// const existsPromise = util.promisify(client.exists).bind(client);

// 
// const set = async (key, value) => {
//     await setPromise(key, JSON.stringify(value));
// };

// const get = async (key) => {
//     console.log(key);

//     const value = await getPromise(key);
//     console.log("value");
//     if(value) return JSON.parse(value);

// };
// const exists = async (key) => {
//     const isExists= await existsPromise(key);
//     return isExists===1;
// };


const client = redis.createClient({
        socket: {
            host: process.env.REDIS_HOST,
            port: process.env.REDIS_PORT,
        },
        password: process.env.REDIS_PASSWORD
});
client.connect();
    
const setClient = util.promisify(client.set).bind(client);
// const getClient = util.promisify(client.get).bind(client);

const set = async (key, value) => {
        await setClient(key, JSON.stringify(value));
    };
    
// const get = async (key) => {
//         const data = await getClient(key);
//         return JSON.parse(data);
//     };

// const get = (key) => {
//         const data = getClient(key).then();
//         console.log(data);
//         if(data) return JSON.parse(data);
// };


module.exports = {
    set,
    // get,
    client
};