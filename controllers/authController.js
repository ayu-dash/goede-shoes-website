const jwt = require("jsonwebtoken");
const User = require("../models/User");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

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

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000; 

        const newUser = await User.create({
            name,
            email,
            phone,
            address,
            password,
            otp,
            otpExpires,
        });

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

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

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

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = Date.now() + 10 * 60 * 1000;

        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

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

        if (!email || !password) {
            return res.status(400).json({
                status: "fail",
                message: "Please provide email and password!",
            });
        }

        const user = await User.findOne({ email }).select("+password");

        if (!user || !(await user.correctPassword(password, user.password))) {
            return res.status(401).json({
                status: "fail",
                message: "Email or password incorrect",
            });
        }

        if (!user.isVerified) {
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

        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

exports.forgotPassword = async (req, res) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({
            status: "fail",
            message: "There is no user with that email address.",
        });
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3) Send it to user's email
    const resetURL = `${req.protocol}://${req.get("host")}/reset-password?token=${resetToken}`;
    const message = `Forgot your password? Submit a new password to reset it here: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Your password reset token (valid for 10 min)",
            message,
        });

        res.status(200).json({
            status: "success",
            message: "Token sent to email!",
        });
    } catch (err) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });

        return res.status(500).json({
            status: "error",
            message: "There was an error sending the email. Try again later!",
        });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        // 1) Get user based on the token
        const hashedToken = crypto
            .createHash("sha256")
            .update(req.body.token)
            .digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        // 2) If token has not expired, and there is user, set the new password
        if (!user) {
            return res.status(400).json({
                status: "fail",
                message: "Token is invalid or has expired",
            });
        }

        user.password = req.body.password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        // 3) Log the user in, send JWT
        createSendToken(user, 200, res);
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};
