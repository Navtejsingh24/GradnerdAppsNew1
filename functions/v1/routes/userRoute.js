const express = require("express");
const router = express.Router()
const { saveUserData, goldRate, calculateGoldPrice, autoCompleteCityName, getGoldPriceHistory } = require("../controller/userController");

router.route("/create-user").post(saveUserData)
router.route("/getCityData/:city").get(goldRate)
router.route("/calculate-price").get(calculateGoldPrice)
router.route("/autocomplete-city").get(autoCompleteCityName)
router.route("/get-history/:userId").get(getGoldPriceHistory)
// router.route("/view").get(viewFunction)


module.exports = router;