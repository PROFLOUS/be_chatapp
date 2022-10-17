const client = require("../app/redis");
const { promisify } = require("util");

const setAsync = promisify(client.set).bind(client);
const getAsync = promisify(client.get).bind(client);
const redisService = {
  setClient: async (key, value) => {
    try {
      await setAsync(key, value);
    } catch (err) {
      console.log(err);
    }
  },

  getClient: async (key) => {
    console.log(key);
    const value = await getAsync(key);
    console.log(value);
    if (value) return JSON.parse(value);
  },
};

module.exports = redisService;
