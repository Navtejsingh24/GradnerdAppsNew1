const admin = require("firebase-admin");

var serviceAccount = require("./serviceAccount1.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

module.exports = {
    v1: require("./v1"),
};
