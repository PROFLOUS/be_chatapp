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
const app = express()
const useragent = require('express-useragent');
const rd = require('./src/app/redis');
const fs = require('fs');

const file =fs.readFileSync('./BF086B07CE81DC8267A25EE61C70F337.txt')
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

app.get('/.well-known/pki-validation/BF086B07CE81DC8267A25EE61C70F337.txt', (req, res) =>{
    res.sendFile("/home/ec2-user/be-chatapp/BF086B07CE81DC8267A25EE61C70F337.txt");
})

// routes(app,io);

// rd.set("Ix7UVDUIrmRYOB6uGFc715drn2H4", {
//     uid:"Ix7UVDUIrmRYOB6uGFc715drn2H4",
//     first_name:"Cuong",
//     last_name:"Den",
//     avatar:"https://chatapp-bucket.s3.ap-southeast-1.amazonaws.com/zale_1665942529351_New%20Text%20Document.png",    
//     isOnline: true,
//     lastLogin: null,
// });


const port = process.env.PORT

app.listen(port, () => {
    console.log('Example app listening on http://localhost:'+port)
    }
)
