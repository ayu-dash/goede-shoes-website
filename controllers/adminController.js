const User = require("../models/User");

exports.getAllStaff = async (req, res) => {
  try {
    const staff = await User.find({ role: "staff" }).sort("-createdAt");
    res.status(200).json({
      status: "success",
      results: staff.length,
      data: { staff },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    const newStaff = await User.create({
      name,
      email,
      phone,
      password,
      role: "staff",
      isVerified: true // Admin created staff are verified by default
    });

    res.status(201).json({
      status: "success",
      data: { staff: newStaff },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const staff = await User.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        status: "fail",
        message: "Staff not found",
      });
    }

    // Update fields
    if (req.body.name) staff.name = req.body.name;
    if (req.body.email) staff.email = req.body.email;
    if (req.body.phone) staff.phone = req.body.phone;
    if (req.body.password) staff.password = req.body.password;
    if (req.body.isActive !== undefined) staff.isActive = req.body.isActive;

    await staff.save();

    res.status(200).json({
      status: "success",
      data: { staff },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await User.findByIdAndDelete(req.params.id);

    if (!staff) {
      return res.status(404).json({
        status: "fail",
        message: "Staff not found",
      });
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};
