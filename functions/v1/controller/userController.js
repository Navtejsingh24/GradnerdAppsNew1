const admin = require("firebase-admin");
const db = admin.firestore();
const axios = require("axios")

// const viewFunction = async (req, res) => {
//     res.send("hello")
// };

const saveUserData = async (req, res) => {
    try {
        const { name, phone, email } = req.body;

        // Get the authenticated user's UID using optional chaining
        // req.user?.uid;
        const id = "test-user"

        // Validate required fields and UID
        if (!name || !phone || !id) {
            return res.status(400).send({ error: "Name, phone, and valid UID are required fields" });
        }
        const userData = {
            name,
            phone,
            id,
            email: email || null
        };

        await db.collection('users').doc(id).set(userData);
        res.status(200).send({ message: "User data saved successfully" });
    } catch (error) {
        console.error("Error saving user data:", error);
        res.status(500).send({ error: "Internal server error" });
    }
};

const getUserData = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate the ID
        if (!id) {
            return res.status(400).send({ error: "User ID is required" });
        }

        const userDoc = await db.collection('users').doc(id).get();

        if (!userDoc.exists) {
            return res.status(404).send({ error: "User not found" });
        }

        res.status(200).send(userDoc.data());
    } catch (error) {
        console.error("Error getting user data:", error);
        res.status(500).send({ error: "Internal server error" });
    }
};

const updateUserData = async (req, res) => {
    try {

        const { id, name } = req.body;

        // Validate the ID
        if (!id) {
            return res.status(400).send({ error: "User ID is required" });
        }

        // Get the user document
        const userDoc = db.collection('users').doc(id);

        // Check if the user exists
        const user = await userDoc.get();

        if (!user.exists) {
            return res.status(404).send({ error: "User not found" });
        }

        // Prepare the update data
        const updateData = {};
        if (name) updateData.name = name;

        // Update the user document
        await userDoc.update(updateData);

        res.status(200).send({ message: "User data updated successfully" });
    } catch (error) {
        console.error("Error updating user data:", error);
        res.status(500).send({ error: "Internal server error" });
    }
};



const goldRate = (async (req, res) => {
    try {
        let city = req.params.city;
        if (city && typeof city === 'string') {
            if (city === city.toUpperCase()) {
                city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
            } else {
                city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
            }
            city = city.toLowerCase() === 'new delhi' || city.toLowerCase() === 'delhi' ? 'New-delhi' : city;
        }
        const docRef = db.collection('goldRates').doc('monthlyData');
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).send({ error: 'No data found' });
        }

        const data = doc.data();
        const cityData = data.GoldHistory.find(item => item.city.toLowerCase() === city.toLowerCase());

        if (!cityData) {
            return res.status(404).send({ error: `No data found for city: ${city}` });
        }

        const historicalData = cityData.historicalData;

        if (historicalData.length < 2) {
            return res.status(404).send({ error: 'Not enough data available' });
        }

        const todayEntry = historicalData[0];
        const yesterdayEntry = historicalData[1];

        // For TenGram24K
        const todayPrice24K = parseInt(todayEntry.TenGram24K);
        const yesterdayPrice24K = parseInt(yesterdayEntry.TenGram24K);
        const change24K = todayPrice24K - yesterdayPrice24K;

        // For TenGram22K
        const todayPrice22K = parseInt(todayEntry.TenGram22K);
        const yesterdayPrice22K = parseInt(yesterdayEntry.TenGram22K);
        const change22K = todayPrice22K - yesterdayPrice22K;

        const transformedData = [
            {
                Carat: "24K",
                gram: 1,
                Today: todayPrice24K / 10,
                change: change24K / 10
            },
            {
                Carat: "22K",
                gram: 1,
                Today: todayPrice22K / 10,
                change: change22K / 10
            }
        ];

        res.status(200).send(transformedData);
    } catch (error) {
        console.error('Error fetching or transforming data:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});

const calculateGoldPrice = async (req, res) => {
    try {
        const userId = "user"
        const { carat, grams } = req.body;
        let city = req.body.city;

        // Normalize city name
        if (city && typeof city === 'string') {
            city = city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
            city = city.toLowerCase() === 'new delhi' || city.toLowerCase() === 'delhi' ? 'New-delhi' : city;
        }

        // Fetch gold rates
        const docRef = db.collection('goldRates').doc('monthlyData');
        const doc = await docRef.get();

        if (!doc.exists) {
            return res.status(404).send({ error: 'No data found' });
        }

        const data = doc.data();
        const cityData = data.GoldHistory.find(item => item.city.toLowerCase() === city.toLowerCase());

        if (!cityData) {
            return res.status(404).send({ error: `No data found for city: ${city}` });
        }

        const historicalData = cityData.historicalData;

        if (historicalData.length < 2) {
            return res.status(404).send({ error: 'Not enough data available' });
        }

        const todayEntry = historicalData[0];
        let todayPricePerGram;

        if (carat === "24K") {
            todayPricePerGram = parseInt(todayEntry.TenGram24K) / 10;
        } else if (carat === "22K") {
            todayPricePerGram = parseInt(todayEntry.TenGram22K) / 10;
        } else {
            return res.status(400).send({ error: 'Invalid carat value. Only 24K and 22K are supported.' });
        }

        const totalPrice = todayPricePerGram * grams;

        // Generate unique ID and timestamp
        const timestamp = new Date().getTime();
        const uniqueId = `${userId}_${timestamp}`;

        // Prepare the history data
        const historyData = {
            userId,
            carat,
            grams,
            city,
            totalPrice,
            pricePerGram: todayPricePerGram,
            timestamp
        };

        // Save the history data into a new collection
        const historyRef = await db.collection('goldPriceHistory').add(historyData);
        const historyId = historyRef.id;

        // Optionally, store the last calculated price ID in the user's document
        // await db.collection('users').doc(userId).update({
        //     lastCalculatedPriceId: historyId,
        // });

        res.status(200).send({ totalPrice });
    } catch (error) {
        console.error('Error calculating gold price:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};

const getGoldPriceHistory = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).send({ error: 'User ID is required' });
        }

        const historyRef = db.collection('goldPriceHistory');
        const snapshot = await historyRef.where('userId', '==', userId).get();

        if (snapshot.empty) {
            return res.status(404).send({ error: 'No history found for this user' });
        }

        const historyData = [];
        snapshot.forEach(doc => {
            historyData.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).send({ history: historyData });
    } catch (error) {
        console.error('Error fetching gold price history:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
};



const autoCompleteCityName = (async (req, res) => {
    const { text } = req.query;

    if (!text) {
        return res.status(400).send({ error: 'Query parameter "text" is required' });
    }

    try {
        const response = await axios.get(`https://api.geoapify.com/v1/geocode/autocomplete`, {
            params: {
                text,
                type: 'city',
                filter: 'countrycode:in',
                apiKey: '5eac308e89254b77ae9f7ee07d7533ea'
            }
        });

        const features = response.data.features;
        const cityNames = features.map(feature => feature.properties.city || feature.properties.address_line1);

        res.status(200).send(cityNames);
    } catch (error) {
        console.error('Error fetching city names:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});



module.exports = { saveUserData, goldRate, calculateGoldPrice, autoCompleteCityName, getGoldPriceHistory, getUserData, updateUserData };
