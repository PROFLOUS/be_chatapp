const util = require("util");
const redis = require("redis");
require("dotenv").config();

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

const client = redis.createClient({
  socket: {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
  },
  password: process.env.REDIS_PASSWORD,
});
client.connect();

const setClient = util.promisify(client.set).bind(client);
// const getClient = util.promisify(client.get).bind(client);

const set = async (key, value) => {
  await setClient(key, JSON.stringify(value));
};

module.exports = {
  set,
  // get,
  client,
};
