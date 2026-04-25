const express = require("express");
const authController = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", authController.register);
router.post("/verify-otp", authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);
router.post("/login", authController.login);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.get("/logout", authController.logout);

// Protected routes
router.use(protect);
router.patch("/updateMyPassword", authController.updateMyPassword);

module.exports = router;


