const express = require("express");
const cors = require("cors");
const http = require("http");
const https = require("https");

// const ufs = require("url-file-size");

const socketio = require("socket.io");
const socket = require("./src/app/socket");
const routes = require("./src/routes");
const handleErr = require("./src/middleware/handleEror");
const morgan = require("morgan");
const bodyParser = require("body-parser");
require("dotenv").config();
const connectDB = require("./src/config/connectDB");
const app = express();
const useragent = require("express-useragent");
const rd = require("./src/app/redis");
const fs = require("fs");

const key = fs.readFileSync("private.key");
const cert = fs.readFileSync("certificate.crt");

const cred = {
  key,
  cert,
};


// Connect to MongoDB
connectDB();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(cors({ origin: true, credentials: true }));
app.use(useragent.express());
app.use(morgan("common"));

const serverTest = http.createServer(app);
// const io = socketio(server);

const server = https.createServer(cred, app);

const io = socketio(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});


// const io = socketio(serverTest,{
//     cors:{
//         origin:'*',
//         credentials:true
//     }
// });


socket(io);
app.use(handleErr);

routes(app, io);

// rd.set("Ix7UVDUIrmRYOB6uGFc715drn2H4", {
//     uid:"Ix7UVDUIrmRYOB6uGFc715drn2H4",
//     first_name:"Cuong",
//     last_name:"Den",
//     avatar:"https://chatapp-bucket.s3.ap-southeast-1.amazonaws.com/zale_1665942529351_New%20Text%20Document.png",
//     isOnline: true,
//     lastLogin: null,
// });
const port = process.env.PORT;

server.listen(port, () => {
  console.log("Example app listening on http://localhost:" + port);
});


// serverTest.listen(5005, () => {
//   console.log("Example app listening on http://localhost:" + 5005);
// });
