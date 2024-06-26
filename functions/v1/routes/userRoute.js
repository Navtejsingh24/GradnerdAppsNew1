const express = require("express");
const router = express.Router()
const { saveUserData, goldRate, calculateGoldPrice, autoCompleteCityName, getGoldPriceHistory, getUserData, updateUserData } = require("../controller/userController");

router.route("/create-user").post(saveUserData)
router.route("/getCityData/:city").get(goldRate)
router.route("/calculate-price").get(calculateGoldPrice)
router.route("/autocomplete-city").get(autoCompleteCityName)
router.route("/get-history/:userId").get(getGoldPriceHistory)
router.route("/get-user/:id").get(getUserData)
router.route("/update-profile").put(updateUserData)
// router.route("/view").get(viewFunction)


module.exports = router;