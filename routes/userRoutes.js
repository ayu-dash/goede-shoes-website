const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { protect } = require("../middlewares/authMiddleware");

// All routes after this middleware are protected
router.use(protect);

router.patch("/updateMe", userController.updateMe);
router.post("/addAddress", userController.addAddress);
router.patch("/updateAddress/:addressId", userController.updateAddress);

module.exports = router;
