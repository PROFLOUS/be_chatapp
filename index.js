const express = require('express')
const cors = require('cors');
const http = require('http');
const socket = require('./src/app/socket');
const socketio = require('socket.io');
const routes = require('./src/routes');
const handleErr = require('./src/middleware/handleEror');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config()
const connectDB = require('./src/config/connectDB')



const app = express()

// Connect to MongoDB
connectDB()

app.use(bodyParser.json({limit:"50mb"}));
app.use(cors());
app.use(morgan("common"));



const server = http.createServer(app);
const io = socketio(server);
socket(io);
app.use(handleErr);

routes(app,io);



const port = process.env.PORT



app.listen(port, () => {
    console.log('Example app listening on http://localhost:'+port)
    }
)
