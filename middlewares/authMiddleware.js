const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
    try {
        let token;
        if (req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.redirect("/login");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const currentUser = await User.findById(decoded.id);
        if (!currentUser) {
            return res.redirect("/login");
        }

        req.user = currentUser;
        res.locals.user = currentUser;
        next();
    } catch (err) {
        return res.redirect("/login");
    }
};

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).render("error", {
                message: "You do not have permission to perform this action",
            });
        }
        next();
    };
};

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET);

            const currentUser = await User.findById(decoded.id);
            if (!currentUser) {
                return next();
            }

            res.locals.user = currentUser;
            req.user = currentUser;
            return next();
        } catch (err) {
            return next();
        }
    }
    next();
};
