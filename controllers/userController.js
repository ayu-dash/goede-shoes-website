const User = require("../models/User");

exports.updateMe = async (req, res) => {
    try {
        // 1) Filter out unwanted fields that are not allowed to be updated
        const { name, email, phone } = req.body;
        
        // 2) Update user document
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { name, email, phone },
            {
                new: true,
                runValidators: true,
            }
        );

        res.status(200).json({
            status: "success",
            data: {
                user: updatedUser,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const { label, recipientName, fullAddress, phone, notes } = req.body;

        const user = await User.findById(req.user.id);
        user.addresses.push({ label, recipientName, fullAddress, phone, notes });
        await user.save({ validateBeforeSave: false });

        res.status(200).json({
            status: "success",
            data: {
                user,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const { addressId } = req.params;
        const { label, recipientName, fullAddress, phone, notes } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { _id: req.user.id, "addresses._id": addressId },
            {
                $set: {
                    "addresses.$.label": label,
                    "addresses.$.recipientName": recipientName,
                    "addresses.$.fullAddress": fullAddress,
                    "addresses.$.phone": phone,
                    "addresses.$.notes": notes,
                },
            },
            {
                new: true,
                runValidators: true,
            }
        );

        if (!updatedUser) {
            return res.status(404).json({
                status: "fail",
                message: "Alamat tidak ditemukan.",
            });
        }

        res.status(200).json({
            status: "success",
            data: {
                user: updatedUser,
            },
        });
    } catch (err) {
        res.status(400).json({
            status: "fail",
            message: err.message,
        });
    }
};
