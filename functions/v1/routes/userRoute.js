const express = require("express");
const router = express.Router()
const { saveUserData, goldRate, calculateGoldPrice, autoCompleteCityName } = require("../controller/userController");

router.route("/create-user").post(saveUserData)
router.route("/getCityData/:city").get(goldRate)
router.route("/calculate-price").get(calculateGoldPrice)
router.route("/autocomplete-city").get(autoCompleteCityName)
// router.route("/view").get(viewFunction)


module.exports = router;