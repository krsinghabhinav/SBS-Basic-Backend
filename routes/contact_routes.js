// Express module ko import kar rahe hain
const express = require("express");

// Router instance bana rahe hain taaki is file me route define kar sakein
const router = express.Router();

// Mongoose model import kar rahe hain jisme contact data save hoga
const User = require("../models/user_modeld");
const Contact = require("../models/contacts_model");
const check_auth_user = require("../middlewares/check_auth_user");

const cloudinary = require("cloudinary").v2;
const fs = require("fs");

require("dotenv").config();
// ==============================
// CLOUDINARY CONFIG
// ==============================
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});


// ==============================
// POST Route: /add-contact
// Purpose: Naya contact add karna




// =====================================
// POST ROUTE -> ADD CONTACT
// =====================================
router.post("/add-contact", check_auth_user, async (req, res) => {

  try {

    // =========================
    // REQUEST BODY
    // =========================
    const {
      fullName,
      email,
      phone,
      address,
      gender
    } = req.body;

    // =========================
    // CHECK USER EXIST
    // =========================
    const existUser = await User.findById(req.user.userId);

    if (!existUser) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    // =========================
    // VALIDATION
    // =========================
    if (!fullName || !email || !phone) {
      return res.status(400).json({
        status: false,
        message: "Full name, email and phone are required",
      });
    }

    // =========================
    // EMAIL CHECK
    // =========================
    const emailExists = await Contact.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        status: false,
        message: "Email already exists",
      });
    }

    // =========================
    // IMAGE UPLOAD
    // =========================
    let imageUrl = "";
    let imageId = "";

    if (req.files && req.files.image) {

      const file = req.files.image;

      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(
        file.tempFilePath,
        {
          folder: "contactImages",
        }
      );

      // Delete temp file
      fs.unlinkSync(file.tempFilePath);

      imageUrl = result.secure_url;
      imageId = result.public_id;
    }

    // =========================
    // CREATE CONTACT
    // =========================
    const newContact = new Contact({
      fullName,
      email,
      phone,
      address,
      gender,
      image: imageUrl,
      imageId: imageId,

      // Login user id
      userId: req.user.userId,
    });

    // Save data
    const savedContact = await newContact.save();

    // =========================
    // SUCCESS RESPONSE
    // =========================
    res.status(201).json({
      status: true,
      message: "Contact added successfully",
      contact: savedContact,
    });

  } catch (err) {

    console.log("Error:", err);

    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: err.message,
    });

  }

});

// router.post("/add-contact", check_auth_user, async (req, res) => {
//   try {

//     // Request body data
//     const { fullName, email, phone, address, gender } = req.body;

//     // =========================
//     // CHECK LOGIN USER EXIST
//     // =========================
//     const existUser = await User.findById(req.user.userId);

//     if (!existUser) {
//       return res.status(404).json({
//         status: false,
//         message: "User not found",
//       });
//     }

//     // =========================
//     // VALIDATION
//     // =========================
//     if (!fullName || !email || !phone) {
//       return res.status(400).json({
//         status: false,
//         message: "Full name, email and phone are required",
//       });
//     }

//     // =========================
//     // EMAIL ALREADY EXIST CHECK
//     // =========================
//     const emailExists = await Contact.findOne({ email });

//     if (emailExists) {
//       return res.status(400).json({
//         status: false,
//         message: "Email already exists",
//       });
//     }
//     /* ================= LOGO UPLOAD ================= */

//     let imageUrl = "";
//     let imageId = "";
//     if (req.files && req.files.image) {

//       const file = req.files.image;

//       const result = await cloudinary.uploader.upload(
//         file.tempFilePath,
//         {
//           folder: "contactImages",
//         }
//       );

//       // temp file delete
//       fs.unlinkSync(file.tempFilePath);

//       imageUrl = result.secure_url;
//       imageId = result.public_id.split("/").pop(); // Extract just the public_id without folder path
//     }
//     // =========================
//     // CREATE NEW CONTACT
//     // =========================
//     const newContact = new Contact({
//       fullName,
//       email,
//       phone,
//       address,
//       gender,
//       image: imageUrl,
//       imageId: imageId,

//       // kis user ne add kiya
//       userId: req.user.userId,
//     });

//     // Save in DB
//     const result = await newContact.save();

//     // =========================
//     // SUCCESS RESPONSE
//     // =========================
//     res.status(201).json({
//       status: true,
//       message: "Contact added successfully",
//       addContact: result,
//     });

//   } catch (err) {

//     console.error("Error saving contact:", err);

//     res.status(500).json({
//       status: false,
//       message: "Internal server error",
//       error: err.message,
//     });
//   }
// });;

// ======================================
// GET Route: /get-contacts
// Purpose: Saare contacts fetch karna
// ======================================
// router.get("/get-contacts", check_auth_user, async (req, res) => {
//   try {
//     const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
//     const limit = parseInt(req.query.limit) || 10; // Default to 10 contacts per page if not provided
//     const skip = (page - 1) * limit;

//     // Contact collection se data fetch kar rahe hain
//     // Sirf _id, fullName, email fields ko 3 kar rahe hain
//     const contactsData = await Contact.find({ userId: req.user.userId });
//     // .lean() use karne se plain JS object milta hai instead of Mongoose document

//     // Agar koi contact nahi mila to 404 error return karo
//     if (!contactsData || contactsData.length === 0) {
//       return res.status(404).json({ message: "No contacts found" });
//     }

//     // Agar data mil gaya to success response bhejna
//     res.status(200).json({
//       message: "Contacts retrieved successfully!",
//       contacts: contactsData,
//       pagination: {
//         currentPage: page,
//         totalPages: Math.ceil(contactsData.length / limit),
//       },
//     });
//   } catch (error) {
//     // Error handling
//     console.error("Error retrieving contacts:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });



// GET ALL CONTACTS WITH PAGINATION
router.get("/get-contacts", check_auth_user, async (req, res) => {

  try {

    // =========================
    // PAGINATION
    // =========================
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 2;

    const skip = (page - 1) * limit;

    // =========================
    // TOTAL CONTACT COUNT
    // =========================
    const totalContacts = await Contact.countDocuments({
      userId: req.user.userId
    });

    // =========================
    // GET CONTACTS
    // =========================
    const contactsData = await Contact.find({
      userId: req.user.userId
    })
      .populate("userId", "fullName email") // User details bhi populate kar rahe hain
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // =========================
    // CHECK CONTACTS
    // =========================
    if (!contactsData || contactsData.length === 0) {
      return res.status(404).json({
        message: "No contacts found"
      });
    }



    // =========================
    // RESPONSE
    // =========================
    res.status(200).json({
      message: "Contacts retrieved successfully!",

      totalContacts: totalContacts,

      contacts: contactsData,

      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalContacts / limit),
        totalData: totalContacts,
        limit: limit,
      },

    });

  } catch (error) {

    console.error("Error retrieving contacts:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});


//get contact details without pagination
router.get("/get-contacts-without-pagination", check_auth_user, async (req, res) => {

  try {



    // =========================
    // TOTAL CONTACT COUNT
    // =========================
    const totalContacts = await Contact.countDocuments({
      userId: req.user.userId
    });

    // =========================
    // GET CONTACTS
    // =========================
    const contactsData = await Contact.find({
      userId: req.user.userId
    })
      .populate("userId", "fullName email"); // User 

    // =========================
    // CHECK CONTACTS
    // =========================
    if (!contactsData ||contactsData.length === 0) {
      return res.status(404).json({
        message: "No contacts found"
      });
    }



    // =========================
    // RESPONSE
    // =========================
    res.status(200).json({
      message: "Contacts retrieved successfully!",

      totalContacts: totalContacts,

      contacts: contactsData,



    });

  } catch (error) {

    console.error("Error retrieving contacts:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});




router.get("/get-contacts-details/:id", check_auth_user, async (req, res) => {
  try {
    const contactId = req.params.id;
    const contact = await Contact.findById(contactId);


    if (contact.userId.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Forbidden: You do not have access to this contact" });
    }




    if (!contact) {
      return res.status(404).json({ message: "Contact not found" });
    }
    res.status(200).json({
      message: "Contact retrieved successfully!",
      contact: contact,
    });
  } catch (error) {
    console.error("Error retrieving contact:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//update contact by id
// why use patch vs put




// PUT: Jab aapko pura resource replace karna ho, yaani ki saare fields ko update karna ho. Agar kuch fields missing hain to wo null ya default values se replace ho jayengi.
// PATCH: Jab aapko resource ke sirf kuch specific fields ko update karna ho. Isme jo fields aap provide nahi karte wo unchanged rahengi.

// router.put("/update-contact/:id", async (req, res) => {
//   try {
//     const contactId = req.params.id;

//     const { fullName, email, phone, address, gender } = req.body;
//     if (Contact.userId.toString() !== req.user.userId) {
//       return res.status(403).json({ message: "Forbidden: You do not have access to this contact" });
//     }
//     const updatedContact = await Contact.findByIdAndUpdate(
//       contactId,
//       { fullName, email, phone, address, gender },
//       { new: true } // Updated document return karne ke liye
//     );
//     if (!updatedContact) {
//       return res.status(404).json({ message: "Contact not found" });
//     }
//     res.status(200).json({
//       message: "Contact updated successfully!",
//       contact: updatedContact,
//     });
//   } catch (error) {
//     console.error("Error updating contact:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

router.put("/update-contact/:id", check_auth_user, async (req, res) => {

  try {

    // Contact id
    const contactId = req.params.id;

    // Find contact
    const contact = await Contact.findById(contactId);

    // Check contact exist
    if (!contact) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }

    // =========================
    // CHECK CONTACT OWNER
    // =========================
    if (contact.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Forbidden: You do not have access to this contact"
      });
    }

    // =========================
    // BODY DATA
    // =========================
    const {
      fullName,
      email,
      phone,
      address,
      gender
    } = req.body;

    // =========================
    // UPDATE CONTACT
    // =========================
    contact.fullName = fullName;
    contact.email = email;
    contact.phone = phone;
    contact.address = address;
    contact.gender = gender;

    // Save updated contact
    await contact.save();

    // =========================
    // RESPONSE
    // =========================
    res.status(200).json({
      message: "Contact updated successfully!",
      contact: contact,
    });

  } catch (error) {

    console.error("Error updating contact:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});
router.patch("/update-contact-by-patch/:id", check_auth_user, async (req, res) => {

  try {

    const contactId = req.params.id;

    // Find contact first
    const contact = await Contact.findById(contactId);

    // Check contact exist
    if (!contact) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }

    // =========================
    // BODY DATA
    // =========================
    const {
      fullName,
      email,
      phone,
      address,
      gender
    } = req.body;

    // =========================
    // UPDATE FIELDS
    // =========================
    contact.fullName = fullName || contact.fullName;
    contact.email = email || contact.email;
    contact.phone = phone || contact.phone;
    contact.address = address || contact.address;
    contact.gender = gender || contact.gender;

    // =========================
    // IMAGE UPDATE
    // =========================
    if (req.files && req.files.image) {

      // Delete old image
      if (contact.imageId) {
        await cloudinary.uploader.destroy(contact.imageId);
      }

      // New image file
      const file = req.files.image;

      // Upload new image
      const result = await cloudinary.uploader.upload(
        file.tempFilePath,
        {
          folder: "contactImages"
        }
      );

      // Delete temp file
      fs.unlinkSync(file.tempFilePath);

      // Save image data
      contact.image = result.secure_url;
      contact.imageId = result.public_id;
    }

    // Save updated contact
    await contact.save();

    // Response
    res.status(200).json({
      message: "Contact updated successfully!",
      contact: contact,
    });

  } catch (error) {

    console.error("Error updating contact:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});
//update contact by id using patch
// router.patch("/update-contact-by-patch/:id", check_auth_user, async (req, res) => {
//   try {
//     const contactId = req.params.id;
//     const body = req.body;
//     const updatedContact = await Contact.findByIdAndUpdate(
//       contactId,
//       body,
//       { new: true } // Updated document return karne ke liye
//     );
//     if (!updatedContact) {
//       return res.status(404).json({ message: "Contact not found" });
//     }
//     res.status(200).json({
//       message: "Contact updated successfully!",
//       contact: updatedContact,
//     });
//   } catch (error) {
//     console.error("Error updating contact:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// Delete contact by id
// router.delete("/delete-contact/:id", check_auth_user, async (req, res) => {
//   try {
//     const contactId = req.params.id;
//     const deletedContact = await Contact.findByIdAndDelete(contactId);
//     if (!deletedContact) {
//       return res.status(404).json({ message: "Contact not found" });
//     }
//     res.status(200).json({
//       message: "Contact deleted successfully!",
//       contact: deletedContact,
//     });
//   } catch (error) {
//     console.error("Error deleting contact:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
// DELETE CONTACT BY ID
router.delete("/delete-contact/:id", check_auth_user, async (req, res) => {

  try {

    // Contact id
    const contactId = req.params.id;

    // Find contact
    const contact = await Contact.findById(contactId);

    // Check contact exist
    if (!contact) {
      return res.status(404).json({
        message: "Contact not found"
      });
    }

    // =========================
    // CHECK CONTACT OWNER
    // =========================
    if (contact.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "Forbidden: You do not have access to this contact"
      });
    }

    // =========================
    // DELETE IMAGE FROM CLOUDINARY
    // =========================
    if (contact.imageId) {

      await cloudinary.uploader.destroy(contact.imageId);

    }

    // =========================
    // DELETE CONTACT
    // =========================
    await contact.deleteOne();

    // =========================
    // RESPONSE
    // =========================
    res.status(200).json({
      message: "Contact deleted successfully!",
      contact: contact,
    });

  } catch (error) {

    console.error("Error deleting contact:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});
// filter contacts by email
router.get("/filter-contacts", check_auth_user, async (req, res) => {
  try {
    const emailQuery = req.query.email;
    if (!emailQuery) {
      return res
        .status(400)
        .json({ message: "Email query parameter is required" });
    }

    // es code ko smjhao ki huaa kya yaha ?
    // Yaha par hum email query parameter ko use karke contacts ko filter kar rahe hain.
    // Hum Contact model ka use karke MongoDB me search kar rahe hain jahan email field emailQuery se match karti ho.
    // $regex operator ka use karke hum partial match kar rahe hain, aur $options: "i" se case-insensitive search kar rahe hain.
    // Sirf _id, fullName, email fields ko select kar rahe hain taaki unnecessary data na aaye.
    // Agar koi contact nahi milta to 404 error bhej rahe hain.
    // Agar contacts mil jate hain to unhe response me bhej rahe hain.
    const filteredContacts = await Contact.find({
      email: { $regex: emailQuery, $options: "i" },
    }); // Case-insensitive search

    // esko postman me test karne ke liye
    // http://localhost:8000/api/contacts/filter-contacts?email=gmail

    if (filteredContacts.length === 0) {
      return res
        .status(404)
        .json({ message: "No contacts found matching the email criteria" });
    }
    res.status(200).json({
      message: "Filtered contacts retrieved successfully!",
      contacts: filteredContacts,
    });
  } catch (error) {
    console.error("Error filtering contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// filter contacts by phone number
router.get("/filter-contacts-by-email/:email", check_auth_user, async (req, res) => {
  try {
    // kaise nikalenge email param ko
    // http://localhost:8000/api/contacts/filter-contacts-by-email/gmail
    // req.params.email se hum email param ko access kar sakte hain
    // req.params ek object hota hai jisme saare route parameters hote hain
    // Yaha par hum :email ko access kar rahe hain jo ki URL me diya gaya hai
    // with example do lines of postman url
    // http://localhost:8000/api/contacts/filter-contacts-by-email/abhinav@gmail.com
    // req.params.email se hum "

    const emailParam = req.params.email;
    if (!emailParam) {
      return res.status(400).json({ message: "Email parameter is required" });
    }
    const filteredContacts = await Contact.find({
      email: { $regex: emailParam, $options: "i" },
    }); // Case-insensitive search

    // const filteredContacts = await Contact.find({
    //   email: emailParam,
    // }); // Case-insensitive search

    // esko postman me test karne ke liye
    // http://localhost:8000/api/contacts/filter-contacts-by-email/gmail

    if (filteredContacts.length === 0) {
      return res
        .status(404)
        .json({ message: "No contacts found matching the email criteria" });
    }
    res.status(200).json({
      message: "Filtered contacts retrieved successfully!",
      contacts: filteredContacts,
    });
  } catch (error) {
    console.error("Error filtering contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// all the data ko delete karne ke liye
// router.delete("/delete-all-contacts", async (req, res) => {
//   try {
//     const result = await Contact.deleteMany({});
//     res.status(200).json({
//       message: "All contacts deleted successfully!",
//       deletedCount: result.deletedCount,
//     });
//   } catch (error) {
//     console.error("Error deleting all contacts:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });
// DELETE ALL CONTACTS
router.delete("/delete-all-contacts", check_auth_user, async (req, res) => {

  try {

    // =========================
    // FIND USER CONTACTS
    // =========================
    const contacts = await Contact.find({
      userId: req.user.userId
    });

    // =========================
    // DELETE ALL IMAGES
    // =========================
    for (const contact of contacts) {

      if (contact.imageId) {

        await cloudinary.uploader.destroy(contact.imageId);

      }

    }

    // =========================
    // DELETE ALL CONTACTS
    // =========================
    const result = await Contact.deleteMany({
      userId: req.user.userId
    });

    // =========================
    // RESPONSE
    // =========================
    res.status(200).json({
      message: "All contacts deleted successfully!",
      deletedCount: result.deletedCount,
    });

  } catch (error) {

    console.error("Error deleting all contacts:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});


// /// delete conact by id using delete method
// router.delete("/delete-contact-by-id/:id", check_auth_user, async (req, res) => {
//   try {
//     const contactId = req.params.id;
//     const result = await Contact.deleteOne({ _id: contactId });
//     if (result.deletedCount === 0) {
//       return res.status(404).json({ message: "Contact not found" });
//     }
//     res.status(200).json({ message: "Contact deleted successfully!" });
//   } catch (error) {
//     console.error("Error deleting contact:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// DELETE CONTACT BY ID
// router.delete("/delete-contact-by-id/:id", check_auth_user, async (req, res) => {

//   try {

//     // Contact id
//     const contactId = req.params.id;

//     // Find contact
//     const contact = await Contact.findById(contactId);

//     // Check contact exist
//     if (!contact) {
//       return res.status(404).json({
//         message: "Contact not found"
//       });
//     }

//     // =========================
//     // CHECK CONTACT OWNER
//     // =========================
//     if (contact.userId.toString() !== req.user.userId) {
//       return res.status(403).json({
//         message: "Forbidden: You do not have access to this contact"
//       });
//     }

//     // =========================
//     // DELETE IMAGE
//     // =========================
//     if (contact.imageId) {

//       await cloudinary.uploader.destroy(contact.imageId);

//     }

//     // =========================
//     // DELETE CONTACT
//     // =========================
//     await Contact.deleteOne({
//       _id: contactId
//     });

//     // =========================
//     // RESPONSE
//     // =========================
//     res.status(200).json({
//       message: "Contact deleted successfully!"
//     });

//   } catch (error) {

//     console.error("Error deleting contact:", error);

//     res.status(500).json({
//       message: "Internal server error"
//     });

//   }

// });

// get total count of contacts
router.get("/contacts-count", check_auth_user, async (req, res) => {
  try {
    const count = await Contact.countDocuments({ userId: req.user.userId });
    // 404 error kab bhejna chahiye
    if (count === 0) {
      return res.status(404).json({ message: "No contacts found" });
    }
    // Agar contacts milte hain to unhe response me bhej rahe hain.

    res.status(200).json({
      message: "Total contacts count retrieved successfully!",
      count: count,
    });
  } catch (error) {
    console.error("Error getting contacts count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ GET route: Filter contacts by gender
router.get("/contacts-by-gender/:gender", check_auth_user, async (req, res) => {
  try {
    const genderParam = req.params.gender;

    // Check if gender param is provided
    if (!genderParam) {
      return res.status(400).json({ message: "Gender parameter is required" });
    }

    // ✅ Find contacts where gender matches exactly (case-insensitive by lowercasing both sides)
    const filteredContacts = await Contact.find({
      gender: genderParam.toLowerCase(),
      userId: req.user.userId, // Ensure we only fetch contacts for the logged-in user
    });

    // Check if any contacts were found
    if (filteredContacts.length === 0) {
      return res
        .status(404)
        .json({ message: "No contacts found matching the gender criteria" });
    }

    // Return success response
    res.status(200).json({
      message: "Filtered contacts retrieved successfully!",
      contacts: filteredContacts,
    });
  } catch (error) {
    // Handle server error
    console.error("Error filtering contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// search gender by query /contacts-by-gender?gender=male ✅

router.get("/contacts-by-gender", check_auth_user, async (req, res) => {
  try {
    const genderParam = req.query.gender;

    // Check if gender is provided
    if (!genderParam) {
      return res.status(400).json({
        message: "Gender query parameter is required",
      });
    }

    // Case-insensitive search
    const filteredContacts = await Contact.find({
      gender: { $regex: `^${genderParam}$`, $options: "i" },
      userId: req.user.userId, // Ensure we only fetch contacts for the logged-in user
    });

    if (filteredContacts.length === 0) {
      return res.status(404).json({
        message: "No contacts found matching the gender criteria",
      });
    }

    res.status(200).json({
      message: "Filtered contacts retrieved successfully!",
      contacts: filteredContacts,
    });
  } catch (error) {
    console.error("Error filtering contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});



// delete by all gender which will match 
router.delete("/delete-contacts-by-gender/:gender", check_auth_user, async (req, res) => {
  try {
    const genderParam = req.params.gender;

    // Check if gender param is provided
    if (!genderParam) {
      return res.status(400).json({ message: "Gender parameter is required" });
    }

    // Delete contacts where gender matches exactly (case-insensitive by lowercasing both sides)
    const result = await Contact.deleteMany({
      gender: genderParam.toLowerCase(),
      userId: req.user.userId, // Ensure we only delete contacts for the logged-in user
    });

    // Check if any contacts were deleted
    if (result.deletedCount === 0) {
      return res
        .status(404)
        .json({ message: "No contacts found matching the gender criteria" });
    }

    // Return success response
    res.status(200).json({
      message: "Contacts deleted successfully!",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    // Handle server error
    console.error("Error deleting contacts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// TOTAL CONTACT COUNT
router.get("/totalCount", check_auth_user, async (req, res) => {

  try {

    // Count contacts of logged in user
    const totalContact = await Contact.countDocuments({
      userId: req.user.userId
    });

    // Response
    res.status(200).json({
      message: "Total contacts retrieved successfully!",
      total: totalContact,
      userId: req.user.userId
    });

  } catch (error) {

    console.error("Error retrieving contacts:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }

});

// Router ko export kar rahe hain taaki isse app.js ya server.js me use kiya ja sake
module.exports = router;
