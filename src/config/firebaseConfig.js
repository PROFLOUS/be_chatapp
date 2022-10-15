
const admin = require("firebase-admin");

const serviceAccount = require("./serviceFire.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://chatapp-react-17ab5-default-rtdb.asia-southeast1.firebasedatabase.app"
});

module.exports = admin;

