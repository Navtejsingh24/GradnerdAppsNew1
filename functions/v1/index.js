// Firebase SDK
const admin = require("firebase-admin");
const functions = require("firebase-functions");

// Third Party Libraries
const express = require("express");
const cors = require("cors");


// Middlewares
// const authMiddleware = require("../middlewares/auth");

const Firestore = admin.firestore();
const app = express();
app.use(cors({ origin: true }));

app.get("/test", async (req, res) => {
    res.send("hiiiii")
})
app.use("/user", require('./routes/userRoute'))

// app.use(authMiddleware);


app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).send(err.message || "Unexpected error!");
});

module.exports = functions.https.onRequest(app);
