const express = require('express')
const cors = require('cors');
const http = require('http');

const socketio = require('socket.io');
const socket = require('./src/app/socket');
const routes = require('./src/routes');
const handleErr = require('./src/middleware/handleEror');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config()
const connectDB = require('./src/config/connectDB')
// const redisService = require('./src/services/redisService');
const redisDb = require('./src/app/redis');
const app = express()
const useragent = require('express-useragent');
// Connect to MongoDB
connectDB()

app.use(bodyParser.json({limit:"50mb"}));
app.use(cors());
app.use(useragent.express());
app.use(morgan("common"));



const server = http.createServer(app);
const io = socketio(server);
socket(io);
app.use(handleErr);

app.use('/api', (res,req)=>{
    res.send("hello")
});

routes(app,io);



const port = process.env.PORT



server.listen(port, () => {
    console.log('Example app listening on http://localhost:'+port)
    }
)
