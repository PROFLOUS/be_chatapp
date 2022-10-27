const firebase = require("../config/firebaseConfig");
require("firebase/compat/firestore");
const db = firebase.firestore().collection("/users");
const FirebaseService = {
  async getById(id) {
    return await db
      .doc(id)
      .get()
      .then((result) => {
        console.log("getById ", result.data());
        const data = result.data();

        return {
          userLastName: data.last_name,
          userFistName: data.first_name,
          avaUser: data.avatar,
        };
      })
      .catch((err) => {
        console.log("err", err);
      });
  },
};

module.exports = FirebaseService;
