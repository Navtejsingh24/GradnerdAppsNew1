// Firebase SDK
const admin = require("firebase-admin");
// const functions = require("firebase-functions");

// Third Party Libraries
const express = require("express");
const cors = require("cors");
const axios = require("axios")

// Middlewares
// const authMiddleware = require("../middlewares/auth");

const app = express();
app.use(cors({ origin: true }));
const db = admin.firestore();
app.get('/fetchAndSaveGoldData', async (req, res) => {
    try {
        const response = await axios.get('https://gold-rates-india.p.rapidapi.com/api/gold-city-history?type=weekly', {
            headers: {
                'x-rapidapi-host': 'gold-rates-india.p.rapidapi.com',
                'x-rapidapi-key': 'f6e0abeccdmsh07e741fdc6de36bp1663cbjsn4487c78219e9'
            }
        });

        const data = response.data;

        // Save data to Firestore
        const docRef = db.collection('goldRates').doc('monthlyData');
        await docRef.set(data);

        res.status(200).send({ message: 'Data fetched and saved successfully' });
    } catch (error) {
        console.error('Error fetching or saving data:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});



app.get("/test", async (req, res) => {
    res.send("hiiiii")
})
app.use("/user", require('./routes/userRoute'))

// app.use(authMiddleware);


app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).send(err.message || "Unexpected error!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});