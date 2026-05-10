// // const express = require("express");
// // const router = express.Router();
// // const User = require("../models/otp_model");
// // const { generateOTP } = require("../utils/otp");

// // // =====================
// // // ✅ SIGNUP
// // // =====================
// // router.post("/signup", async (req, res) => {
// //     try {
// //         const { fullName, email, phone, password, address, gender } = req.body;

// //         if (!fullName || !phone || !password) {
// //             return res.status(400).json({ message: "Required fields missing" });
// //         }

// //         let user = await User.findOne({ phone });
// //         const otp = generateOTP();

// //         // 🔴 Case 1: Verified user already exists
// //         if (user && user.isVerified) {
// //             return res.status(400).json({
// //                 message: "User already exists. Please login.",
// //             });
// //         }

// //         // 🟡 Case 2: User exists but NOT verified → resend OTP
// //         if (user && !user.isVerified) {
// //             user.otp = otp;
// //             user.otpExpiry = Date.now() + 5 * 60 * 1000;

// //             await user.save();

// //             console.log("Resent Signup OTP:", otp);

// //             return res.status(200).json({
// //                 message: "OTP resent. Please verify.",
// //                 phone,
// //                 otp, // ✅ DEV ONLY
// //             });
// //         }

// //         // 🟢 Case 3: New user
// //         user = new User({
// //             fullName,
// //             email,
// //             phone,
// //             password,
// //             address,
// //             gender,
// //             otp,
// //             otpExpiry: Date.now() + 5 * 60 * 1000,
// //             isVerified: false,
// //         });

// //         await user.save();

// //         console.log("Signup OTP:", otp);

// //         res.status(200).json({
// //             message: "OTP sent for signup",
// //             phone,
// //             otp, // ✅ DEV ONLY
// //         });

// //     } catch (err) {
// //         console.error(err);
// //         res.status(500).json({ message: "Server Error" });
// //     }
// // });
// // // =====================
// // // ✅ VERIFY OTP (Signup)
// // // =====================
// // router.post("/verify-signup-otp", async (req, res) => {
// //     try {
// //         const { phone, otp } = req.body;

// //         const user = await User.findOne({ phone });

// //         if (!user) return res.status(400).json({ message: "User not found" });

// //         if (user.otp !== otp)
// //             return res.status(400).json({ message: "Invalid OTP" });

// //         if (user.otpExpiry < Date.now())
// //             return res.status(400).json({ message: "OTP expired" });

// //         user.isVerified = true;
// //         user.otp = null;

// //         await user.save();

// //         res.json({ message: "Signup successful, please login" });
// //     } catch (err) {
// //         res.status(500).json({ message: "Server Error" });
// //     }
// // });

// // // =====================
// // // ✅ LOGIN - REQUEST OTP
// // // =====================
// // router.post("/login-request-otp", async (req, res) => {
// //     try {
// //         const { phone } = req.body;

// //         const user = await User.findOne({ phone });

// //         if (!user)
// //             return res.status(400).json({ message: "User not registered" });

// //         if (!user.isVerified)
// //             return res.status(400).json({ message: "User not verified" });

// //         const otp = generateOTP();

// //         user.otp = otp;
// //         user.otpExpiry = Date.now() + 5 * 60 * 1000;

// //         await user.save();

// //         console.log("Login OTP:", otp);

// //         res.status(200).json({ message: "OTP sent", phone, otp });
// //     } catch (err) {
// //         res.status(500).json({ message: "Server Error" });
// //     }
// // });

// // // =====================
// // // ✅ VERIFY OTP (Login)
// // // =====================
// // router.post("/login-verify-otp", async (req, res) => {
// //     try {
// //         const { phone, otp } = req.body;

// //         const user = await User.findOne({ phone });

// //         if (!user) return res.status(400).json({ message: "User not found" });

// //         if (user.otp !== otp)
// //             return res.status(400).json({ message: "Invalid OTP" });

// //         if (user.otpExpiry < Date.now())
// //             return res.status(400).json({ message: "OTP expired" });

// //         user.otp = null;

// //         await user.save();

// //         res.json({
// //             message: "Login successful",
// //             user,
// //         });
// //     } catch (err) {
// //         res.status(500).json({ message: "Server Error" });
// //     }
// // });

// // // =====================
// // // ✅ RESEND OTP
// // // =====================
// // router.post("/resend-otp", async (req, res) => {
// //     try {
// //         const { phone } = req.body;

// //         const user = await User.findOne({ phone });

// //         if (!user) return res.status(400).json({ message: "User not found" });

// //         const otp = generateOTP();

// //         user.otp = otp;
// //         user.otpExpiry = Date.now() + 5 * 60 * 1000;

// //         await user.save();

// //         console.log("Resent OTP:", otp);

// //         res.status(200).json({ message: "OTP resent successfully", otp });
// //     } catch (err) {
// //         res.status(500).json({ message: "Server Error" });
// //     }
// // });

// // module.exports = router;





// const express = require("express");
// const router = express.Router();
// const User = require("../models/otp_model");
// const { generateOTP } = require("../utils/otp");


// /*
// ====================================================
// ✅ SIGNUP API
// 👉 New user register karega + OTP generate hoga
// ====================================================
// */
// router.post("/signup", async (req, res) => {
//     try {
//         // 📥 Step 1: Request body se data lena
//         const { fullName, email, phone, password, address, gender } = req.body;

//         // ❗ Step 2: Basic validation
//         if (!fullName || !phone || !password) {
//             return res.status(400).json({
//                 message: "Required fields missing",
//             });
//         }

//         // 🔍 Step 3: Check karo user already exist karta hai ya nahi
//         let user = await User.findOne({ phone });

//         // 🔢 Step 4: OTP generate karo
//         const otp = generateOTP();

//         /*
//         🔴 CASE 1:
//         👉 Agar user exist karta hai aur already verified hai
//         👉 To signup allow nahi karna
//         */
//         if (user && user.isVerified) {
//             return res.status(400).json({
//                 message: "User already exists. Please login.",
//             });
//         }

//         /*
//         🟡 CASE 2:
//         👉 User exist karta hai but verify nahi hua
//         👉 To naya OTP bhejna hai (resend)
//         */
//         if (user && !user.isVerified) {
//             user.otp = otp;
//             user.otpExpiry = Date.now() + 5 * 60 * 1000; // ⏳ 5 min expiry

//             await user.save();

//             return res.status(200).json({
//                 message: "OTP resent. Please verify.",
//                 phone,
//                 otp, // ✅ DEV ONLY (production me hata dena)
//             });
//         }

//         /*
//         🟢 CASE 3:
//         👉 Completely new user
//         👉 DB me save karo + OTP set karo
//         */
//         user = new User({
//             fullName,
//             email,
//             phone,
//             password,
//             address,
//             gender,
//             otp,
//             otpExpiry: Date.now() + 5 * 60 * 1000,
//             isVerified: false, // 🔒 abhi verify nahi hua
//         });

//         await user.save();

//         res.status(200).json({
//             message: "OTP sent for signup",
//             phone,
//             otp, // ✅ DEV ONLY
//         });

//     } catch (err) {
//         console.error(err);
//         res.status(500).json({ message: "Server Error" });
//     }
// });


// /*
// ====================================================
// ✅ LOGIN - REQUEST OTP
// 👉 Existing verified user login karega
// ====================================================
// */
// router.post("/login-request-otp", async (req, res) => {
//     try {
//         const { phone } = req.body;

//         // 🔍 Check user exist karta hai ya nahi
//         const user = await User.findOne({ phone });

//         if (!user) {
//             return res.status(400).json({
//                 message: "User not registered",
//             });
//         }

//         // ❗ Agar user verify nahi hai to login allow nahi
//         if (!user.isVerified) {
//             return res.status(400).json({
//                 message: "User not verified",
//             });
//         }

//         // 🔢 OTP generate
//         const otp = generateOTP();

//         // 📝 DB me update
//         user.otp = otp;
//         user.otpExpiry = Date.now() + 5 * 60 * 1000;

//         await user.save();

//         res.status(200).json({
//             message: "OTP sent",
//             phone,
//             otp, // ✅ DEV ONLY
//         });

//     } catch (err) {
//         res.status(500).json({ message: "Server Error" });
//     }
// });


// /*
// ====================================================
// ✅ VERIFY OTP (COMMON)
// 👉 Signup + Login dono ke liye same API
// ====================================================
// */
// router.post("/verify-otp", async (req, res) => {
//     try {
//         const { phone, otp } = req.body;

//         // 🔍 Step 1: User find karo
//         const user = await User.findOne({ phone });

//         if (!user) {
//             return res.status(400).json({
//                 message: "User not found",
//             });
//         }

//         // ❗ Step 2: OTP match karo
//         if (user.otp !== otp) {
//             return res.status(400).json({
//                 message: "Invalid OTP",
//             });
//         }

//         // ⏳ Step 3: Expiry check
//         if (user.otpExpiry < Date.now()) {
//             return res.status(400).json({
//                 message: "OTP expired",
//             });
//         }

//         /*
//         🔥 Step 4: Flow decide karo
//         👉 Agar user verify nahi tha → Signup verification
//         👉 Agar already verified → Login success
//         */
//         if (!user.isVerified) {
//             user.isVerified = true; // ✅ Signup complete
//         }

//         // 🔒 OTP clear kar do (security)
//         user.otp = null;

//         await user.save();

//         res.status(200).json({
//             message: "OTP verified successfully",
//             user,
//         });

//     } catch (err) {
//         res.status(500).json({ message: "Server Error" });
//     }
// });


// /*
// ====================================================
// ✅ RESEND OTP
// 👉 OTP dubara bhejna
// ====================================================
// */
// router.post("/resend-otp", async (req, res) => {
//     try {
//         const { phone } = req.body;

//         const user = await User.findOne({ phone });

//         if (!user) {
//             return res.status(400).json({
//                 message: "User not found",
//             });
//         }

//         // 🔢 New OTP generate
//         const otp = generateOTP();

//         // 📝 Update DB
//         user.otp = otp;
//         user.otpExpiry = Date.now() + 5 * 60 * 1000;

//         await user.save();

//         res.status(200).json({
//             message: "OTP resent successfully",
//             phone,
//             otp, // ✅ DEV ONLY
//         });

//     } catch (err) {
//         res.status(500).json({ message: "Server Error" });
//     }
// });


// module.exports = router;



const express = require("express");
const router = express.Router();
const User = require("../models/otp_model");
const { generateOTP } = require("../utils/otp");


/*
====================================================
🔥 COMMON FUNCTION (FAST USER FIND)
👉 optimized query (index + lean + select)
====================================================
*/
const findUserByPhone = async (phone) => {
    return await User.findOne({ phone })
        .select("fullName email phone password address gender otp otpExpiry isVerified")
        .lean(); // 🚀 faster
};


/*
====================================================
✅ SIGNUP API
====================================================
*/
router.post("/signup", async (req, res) => {
    try {
        const { fullName, email, phone, password, address, gender } = req.body;

        if (!fullName || !phone || !password) {
            return res.status(400).json({ message: "Required fields missing" });
        }

        let user = await findUserByPhone(phone); // ⚡ optimized find

        const otp = generateOTP();

        // 🔴 Verified user
        if (user && user.isVerified) {
            return res.status(400).json({
                message: "User already exists. Please login.",
            });
        }

        // 🟡 Unverified user → update OTP
        if (user && !user.isVerified) {
            await User.updateOne(
                { phone },
                {
                    otp,
                    otpExpiry: Date.now() + 5 * 60 * 1000,
                }
            );

            return res.status(200).json({
                message: "OTP resent. Please verify.",
                phone,
                otp,
            });
        }

        // 🟢 New user/
        await User.create({
            fullName,
            email,
            phone,
            password,
            address,
            gender,
            otp,
            otpExpiry: Date.now() + 5 * 60 * 1000,
            isVerified: false,
        });

        res.status(200).json({
            message: "OTP sent for signup",
            phone,
            otp,
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});


/*
====================================================
✅ LOGIN REQUEST OTP
====================================================
*/
router.post("/login-request-otp", async (req, res) => {
    try {
        const { phone } = req.body;

        const user = await findUserByPhone(phone); // ⚡ fast

        if (!user) {
            return res.status(400).json({ message: "User not registered" });
        }

        if (!user.isVerified) {
            return res.status(400).json({ message: "User not verified" });
        }

        const otp = generateOTP();

        await User.updateOne(
            { phone },
            {
                otp,
                otpExpiry: Date.now() + 5 * 60 * 1000,
            }
        );

        res.status(200).json({
            message: "OTP sent",
            phone,
            otp,
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});


/*
====================================================
✅ VERIFY OTP (COMMON)
====================================================
*/
router.post("/verify-otp", async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const user = await findUserByPhone(phone); // ⚡ fast

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (user.otpExpiry < Date.now()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        // 🔥 Signup + Login same
        let updateData = { otp: null };

        if (!user.isVerified) {
            updateData.isVerified = true;
        }

        await User.updateOne({ phone }, updateData);

        res.status(200).json({
            message: "OTP verified successfully",
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});


/*
====================================================
✅ RESEND OTP
====================================================
*/
router.post("/resend-otp", async (req, res) => {
    try {
        const { phone } = req.body;

        const user = await findUserByPhone(phone); // ⚡ fast

        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        const otp = generateOTP();

        await User.updateOne(
            { phone },
            {
                otp,
                otpExpiry: Date.now() + 5 * 60 * 1000,
            }
        );

        res.status(200).json({
            message: "OTP resent successfully",
            phone,
            otp,
        });

    } catch (err) {
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;