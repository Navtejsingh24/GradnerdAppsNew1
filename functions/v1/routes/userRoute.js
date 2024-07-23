const express = require("express");
const router = express.Router()
const { goldRate, calculateGoldPrice, autoCompleteCityName, getGoldPriceHistory, updateUserData, getOrUpdateUserData } = require("../controller/userController");

// router.route("/create-user").post(saveUserData)
router.route("/getCityData/:city").get(goldRate)
router.route("/calculate-price").get(calculateGoldPrice)
router.route("/autocomplete-city").get(autoCompleteCityName)
router.route("/get-history/:userId").get(getGoldPriceHistory)
// router.route("/get-user").get(getUserData)
router.route("/update-profile").post(getOrUpdateUserData)
// router.route("/isnumber-exist").get(checkPhoneNumberExists)
// router.route("/view").get(viewFunction)


module.exports = router;