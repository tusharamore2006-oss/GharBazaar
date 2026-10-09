// ========================================
// CREATE / UPDATE ADMIN ACCOUNT
// ========================================
// Creates the Admin account used by the
// separate Admin Login page.
//
// Registration can no longer create Admin
// accounts, so this script is the only way.
//
// Run:  node seed-admin.js
//   or: npm run admin
//
// Optional overrides (via .env):
//   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD
// ========================================

const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("./models/User");

const ADMIN_NAME =
  process.env.ADMIN_NAME ||
  "GharBazaar Admin";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL ||
  "admin@gharbazaar.com"
).toLowerCase();

const ADMIN_PASSWORD =
  process.env.ADMIN_PASSWORD ||
  "Admin@123";

const run = async () => {
  try {

    await mongoose.connect(
      process.env.MONGO_URI,
      {
        serverSelectionTimeoutMS: 10000,
      }
    );

    console.log(
      "MongoDB Connected Successfully"
    );

    const hashedPassword =
      await bcrypt.hash(
        ADMIN_PASSWORD,
        10
      );

    const existingUser =
      await User.findOne({
        email: ADMIN_EMAIL,
      });

    if (existingUser) {
      existingUser.name =
        ADMIN_NAME;

      existingUser.password =
        hashedPassword;

      existingUser.role =
        "Admin";

      await existingUser.save();

      console.log(
        `Admin updated: ${ADMIN_EMAIL}`
      );

    } else {
      await User.create({
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        password:
          hashedPassword,
        phone: "",
        role: "Admin",
      });

      console.log(
        `Admin created: ${ADMIN_EMAIL}`
      );
    }

    console.log(
      "Use these credentials on the Admin Login page (/admin/login):"
    );

    console.log(
      `  Email:    ${ADMIN_EMAIL}`
    );

    console.log(
      `  Password: ${ADMIN_PASSWORD}`
    );

    await mongoose.disconnect();

    process.exit(0);

  } catch (error) {
    console.log(
      "SEED ADMIN ERROR:"
    );

    console.log(
      error.message
    );

    process.exit(1);
  }
};

run();