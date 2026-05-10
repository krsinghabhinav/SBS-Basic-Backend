const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const User = require("../models/user_modeld"); // make sure path is correct
const jwt = require("jsonwebtoken");
const check_auth_user = require("../middlewares/check_auth_user");
// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { fullName, email, phone, password, address } = req.body;

    // Basic validations
    if (!fullName || !email || !phone || !password || !address) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long!" });
    }

    if (phone.toString().length !== 10) {
      return res
        .status(400)
        .json({ message: "Phone number must be 10 digits!" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address!" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      fullName,
      email,
      phone,
      password: hashedPassword,
      address,
    });

    await newUser.save();
    res
      .status(201)
      .json({ message: "User registered successfully!", userData: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// Login Route (basic)
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required!" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password!" });
    }
    const token = jwt.sign(
      {
        userId: user._id,
        fullName: user.fullName,
        email: user.email,
        address: user.address,
        gender: user.gender,
        phone: user.phone

      },
      process.env.JWT_SECRET || "tokenkey",
      { expiresIn: "10d" }
    );




    res.status(200).json({ message: "User logged in successfully!", token: token, userData: user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});
// UPDATE USER USING PATCH
router.patch("/update-user", check_auth_user, async (req, res) => {
  try {

    // Logged in user ki id
    const userId = req.user.userId;

    // Request body se data lena
    const { fullName, email, phone, address } = req.body;

    // User update
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        email,
        phone,
        address,
      },
      { new: true }
    );

    // Agar user nahi mila
    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Success response
    res.status(200).json({
      message: "User updated successfully!",
      user: updatedUser,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
});

// UPDATE USER
// router.patch("/update-user", check_auth_user, async (req, res) => {
//   try {

//     // Login user id
//     const userId = req.user.userId;

//     // Body data
//     const {
//       fullName,
//       email,
//       phone,
//       address
//     } = req.body;

//     // User find karo
//     const existUser = await User.findById(userId);

//     // Agar user nahi mila
//     if (!existUser) {
//       return res.status(404).json({
//         message: "User not found"
//       });
//     }

//     // Fields update
//     existUser.fullName = fullName || existUser.fullName;
//     existUser.email = email || existUser.email;
//     existUser.phone = phone || existUser.phone;
//     existUser.address = address || existUser.address;

//     // Save updated data
//     await existUser.save();

//     // Response
//     res.status(200).json({
//       message: "User updated successfully!",
//       user: existUser
//     });

//   } catch (error) {

//     console.log(error);

//     res.status(500).json({
//       message: "Internal server error"
//     });

//   }
// });

// DELETE USER
router.delete("/delete-user", check_auth_user, async (req, res) => {
  try {

    // Login user id
    const userId = req.user.userId;

    // User find karo
    const existUser = await User.findById(userId);

    // Agar user nahi mila
    if (!existUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // User delete
    await existUser.deleteOne();

    // Response
    res.status(200).json({
      message: "User deleted successfully!"
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Internal server error"
    });

  }
});


// UPDATE USER USING PUT
router.put("/update-user", check_auth_user, async (req, res) => {
  try {

    // Login user id
    const userId = req.user.userId;

    // Body data
    const {
      fullName,
      email,
      phone,
      address
    } = req.body;

    // User find karo
    const existUser = await User.findById(userId);

    // Agar user nahi mila
    if (!existUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Sab fields update karo
    existUser.fullName = fullName;
    existUser.email = email;
    existUser.phone = phone;
    existUser.address = address;

    // Save updated user
    await existUser.save();

    // Response
    res.status(200).json({
      message: "User updated successfully!",
      user: existUser
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      message: "Internal server error"
    });

  }
});
module.exports = router;
