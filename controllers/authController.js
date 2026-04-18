const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/email");

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    user.password = undefined; // Hide password from output

    res.status(statusCode).json({
        status: "success",
        token,
        data: {
            user,
        },
    });
};

exports.register = async (req, res) => {
    try {
        const { name, email, phone, address, password } = req.body;

        // 1) Generate random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // 2) Create new user (unverified)
        const newUser = await User.create({
            name,
            email,
            phone,
            address,
            password,
            otp,
            otpExpires,
        });


        // 3) Send OTP to email
        const message = `Your Goede Shoes verification code is: ${otp}. It will expire in 10 minutes.`;
        
        try {
            await sendEmail({
                email: newUser.email,
                subject: "Goede Shoes - Email Verification",
                message,
            });

            res.status(201).json({
                status: "success",
                message: "OTP sent to email!",
                data: {
                    user: {
                        id: newUser._id,
                        email: newUser.email,
                        name: newUser.name,
                    }
                }
            });
        } catch (err) {
            console.error("Email error:", err);
            // If email fails, we should ideally handle it by deleting user or letting them retry
            return res.status(500).json({
                status: "error",
                message: "There was an error sending the verification email. Try again later!",
            });
        }
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        // 1) Find user by email and check if OTP matches and hasn't expired
        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({
                status: "fail",
                message: "OTP is invalid or has expired",
            });
        }

        // 2) OTP is correct, mark user as verified and clear OTP fields
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        // 3) Generate JWT and send response
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                status: "fail",
                message: "Email is required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                status: "fail",
                message: "User not found",
            });
        }

        // 1) Generate new random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        // 2) Update user record
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        // 3) Send new OTP to email
        const message = `Your new Goede Shoes verification code is: ${otp}. It will expire in 10 minutes.`;
        
        try {
            await sendEmail({
                email: user.email,
                subject: "Goede Shoes - New Verification Code",
                message,
            });

            res.status(200).json({
                status: "success",
                message: "A new OTP has been sent to your email!",
            });
        } catch (err) {
            console.error("Email error:", err);
            return res.status(500).json({
                status: "error",
                message: "There was an error sending the verification email. Try again later!",
            });
        }
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1) Check if email and password exist
        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide email and password!",
            });
        }

        // 2) Check if user exists && password is correct
        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: "fail",
                message: "Email or password incorrect",
            });
        }

        // 3) Check if user is verified
        if (!user.isVerified) {
            // Generate new OTP and send it
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = otp;
            user.otpExpires = Date.now() + 10 * 60 * 1000;
            await user.save();

            const message = `Your account is not verified. Your new verification code is: ${otp}`;
            
            try {
                await sendEmail({
                    email: user.email,
                    subject: "Goede Shoes - Account Verification",
                    message,
                });

                return res.status(200).json({
                    status: "unverified",
                    message: "Account not verified. New OTP sent to email!",
                });
            } catch (err) {
                console.error("Email error:", err);
                return res.status(500).json({
                    status: "error",
                    message: "Error sending verification email. Please try again later!",
                });
            }
        }

        // 4) Everything OK, send token
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};


