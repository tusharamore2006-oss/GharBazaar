const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// ========================================
// REGISTER
// ========================================

const registerUser = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      phone,
      role,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message:
          "Name, email and password are required",
      });
    }

    const existingUser =
      await User.findOne({
        email: email.toLowerCase(),
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "User already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        password,
        10
      );

    // ========================================
    // ADMIN ROLE CANNOT BE SELF-ASSIGNED
    // ========================================
    // Admin accounts are created only through
    // the seed-admin.js script.

    const allowedRoles = [
      "User",
      "Buyer",
      "Seller",
    ];

    const safeRole =
      allowedRoles.includes(role)
        ? role
        : "User";

    const user =
      await User.create({
        name,
        email:
          email.toLowerCase(),
        password:
          hashedPassword,
        phone:
          phone || "",
        role: safeRole,
      });

    res.status(201).json({
      message:
        "User registered successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });

  } catch (error) {
    console.log(
      "REGISTER ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// LOGIN
// ========================================

const loginUser = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user =
      await User.findOne({
        email:
          email.toLowerCase(),
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    // ========================================
    // ADMINS MUST USE THE ADMIN LOGIN PAGE
    // ========================================

    if (user.role === "Admin") {
      return res.status(403).json({
        message:
          "Admin accounts must sign in from the Admin Login page.",
      });
    }

    if (user.role === "Seller") {
      return res.status(403).json({
        message:
          "Broker/Seller accounts must sign in from the Broker Login page.",
      });
    }

    const token =
      jwt.sign(
        {
          id:
            user._id.toString(),

          role:
            user.role,
        },

        process.env.JWT_SECRET,

        {
          expiresIn:
            "7d",
        }
      );

    res.json({
      message:
        "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone:
          user.phone || "",
        role: user.role,
      },
    });

  } catch (error) {
    console.log(
      "LOGIN ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// BROKER / SELLER LOGIN
// ========================================

const loginBroker = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.role !== "Seller") {
      return res.status(403).json({
        message: "Broker Login is for Broker/Seller accounts. Use Customer or Admin Login instead.",
      });
    }

    const token = jwt.sign(
      { id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Broker login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("BROKER LOGIN ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
};


// ========================================
// GET MY PROFILE
// ========================================

const getProfile = async (req, res) => {
  try {
    const user =
      await User.findById(
        req.user.id
      ).select("-password");

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone:
          user.phone || "",
        role: user.role,
      },
    });

  } catch (error) {
    console.log(
      "GET PROFILE ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// UPDATE PROFILE
// ========================================

const updateProfile = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message:
          "Name and email are required",
      });
    }

    const normalizedEmail =
      email.toLowerCase().trim();

    // Check if email already belongs
    // to another user

    const existingUser =
      await User.findOne({
        email:
          normalizedEmail,
        _id: {
          $ne: req.user.id,
        },
      });

    if (existingUser) {
      return res.status(400).json({
        message:
          "This email is already registered",
      });
    }

    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    user.name =
      name.trim();

    user.email =
      normalizedEmail;

    user.phone =
      phone || "";

    await user.save();

    console.log(
      "PROFILE UPDATED:"
    );

    console.log(
      user.email
    );

    res.json({
      message:
        "Profile updated successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone:
          user.phone || "",
        role: user.role,
      },
    });

  } catch (error) {
    console.log(
      "UPDATE PROFILE ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// CHANGE PASSWORD
// ========================================

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        message:
          "Current password and new password are required",
      });
    }

    if (
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message:
          "New password must be at least 6 characters",
      });
    }

    const user =
      await User.findById(
        req.user.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!passwordMatch) {
      return res.status(400).json({
        message:
          "Current password is incorrect",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
        newPassword,
        10
      );

    user.password =
      hashedPassword;

    await user.save();

    console.log(
      "PASSWORD CHANGED FOR:"
    );

    console.log(
      user.email
    );

    res.json({
      message:
        "Password changed successfully",
    });

  } catch (error) {
    console.log(
      "CHANGE PASSWORD ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// ADMIN LOGIN
// ========================================
// Separate login for Admin accounts only.
// Customer accounts are rejected here and
// Admin accounts are rejected on /login.

const loginAdmin = async (req, res) => {
  try {
    const {
      email,
      password,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message:
          "Email and password are required",
      });
    }

    const user =
      await User.findOne({
        email:
          email.toLowerCase(),
      });

    if (!user) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    const passwordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!passwordMatch) {
      return res.status(401).json({
        message:
          "Invalid email or password",
      });
    }

    // ========================================
    // ONLY ADMIN ACCOUNTS ALLOWED
    // ========================================

    if (user.role !== "Admin") {
      return res.status(403).json({
        message:
          "Access denied. Admin accounts only. Please use the customer login.",
      });
    }

    const token =
      jwt.sign(
        {
          id:
            user._id.toString(),

          role:
            user.role,
        },

        process.env.JWT_SECRET,

        {
          expiresIn:
            "7d",
        }
      );

    res.json({
      message:
        "Admin login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone:
          user.phone || "",
        role: user.role,
      },
    });

  } catch (error) {
    console.log(
      "ADMIN LOGIN ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// ADMIN REGISTRATION
// ========================================

const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "Admin",
    });

    return res.status(201).json({
      message: "Admin account created. You can now sign in.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("ADMIN REGISTRATION ERROR:", error);
    return res.status(500).json({ message: "Unable to register admin account" });
  }
};


module.exports = {
  registerUser,
  registerAdmin,
  loginUser,
  loginBroker,
  loginAdmin,
  getProfile,
  updateProfile,
  changePassword,
};