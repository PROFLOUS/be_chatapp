const firebase = require("../config/firebaseConfig");
require("firebase/compat/firestore");
const db = firebase.firestore().collection("/users");
const getById = (id) => {
  var array;
  const result = db
    .doc(id)
    .get()
    .then((result) => {
      console.log("getById ", result.data());
      return result.data();
    });

  console.log("array ", array);

  return db.doc(id).get();
};

const UserService = {
  getById,
};
module.exports = UserService;
