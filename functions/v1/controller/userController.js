const admin = require("firebase-admin");

const viewFunction = async (req, res) => {
    res.send("hello")
};

module.exports = { viewFunction };
