const admin = require("firebase-admin");
const db = admin.firestore();

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


const goldRate = (async (req, res) => {
    try {
        const city = req.params.city;
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

        const transformedData = cityData.historicalData.map((entry, index, arr) => {
            const yesterdayEntry = arr[index - 1] || { TenGram24K: entry.TenGram24K }; // Use today's value if yesterday's data is not available
            const gram1Today = parseInt(entry.TenGram24K) / 10;
            const gram1Yesterday = parseInt(yesterdayEntry.TenGram24K) / 10;
            const change1Gram = gram1Today - gram1Yesterday;

            const gram8Today = gram1Today * 8;
            const gram8Yesterday = gram1Yesterday * 8;
            const change8Gram = gram8Today - gram8Yesterday;

            return [
                {
                    gram: 1,
                    today: gram1Today,
                    yesterday: gram1Yesterday,
                    change: change1Gram
                },
                {
                    gram: 8,
                    today: gram8Today,
                    yesterday: gram8Yesterday,
                    change: change8Gram
                }
            ];
        }).flat();

        res.status(200).send(transformedData);
    } catch (error) {
        console.error('Error fetching or transforming data:', error);
        res.status(500).send({ error: 'Internal server error' });
    }
});
module.exports = { saveUserData, goldRate };
