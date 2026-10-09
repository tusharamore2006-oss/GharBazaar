const User = require("../models/User");
const Property = require("../models/Property");
const Enquiry = require("../models/Enquiry");


// ========================================
// DASHBOARD STATS
// ========================================

const getStats = async (req, res) => {
  try {

    const [
      totalUsers,
      totalProperties,
      totalEnquiries,
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Enquiry.countDocuments(),
    ]);

    res.json({
      totalUsers,
      totalProperties,
      totalEnquiries,
    });

  } catch (error) {
    console.log(
      "ADMIN STATS ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// LIST ALL USERS
// ========================================

const getUsers = async (req, res) => {
  try {

    const users =
      await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

    res.json({
      users,
    });

  } catch (error) {
    console.log(
      "ADMIN USERS ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// DELETE A USER
// ========================================

const deleteUser = async (req, res) => {
  try {

    const user =
      await User.findById(
        req.params.id
      );

    if (!user) {
      return res.status(404).json({
        message:
          "User not found",
      });
    }

    // Admin cannot delete their own account

    if (
      user._id.toString() ===
      req.user.id
    ) {
      return res.status(400).json({
        message:
          "You cannot delete your own account",
      });
    }

    // Admin accounts are managed through
    // the seed script only

    if (user.role === "Admin") {
      return res.status(400).json({
        message:
          "Admin accounts cannot be deleted here",
      });
    }

    await user.deleteOne();

    console.log(
      "ADMIN DELETED USER:"
    );

    console.log(
      user.email
    );

    res.json({
      message:
        "User deleted successfully",
    });

  } catch (error) {
    console.log(
      "ADMIN DELETE USER ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// LIST ALL PROPERTIES
// ========================================

const getProperties = async (req, res) => {
  try {

    const properties =
      await Property.find()
        .populate(
          "owner",
          "name email"
        )
        .sort({ createdAt: -1 });

    res.json({
      properties,
    });

  } catch (error) {
    console.log(
      "ADMIN PROPERTIES ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


// ========================================
// UPDATE A PROPERTY
// ========================================

const updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return res.status(404).json({
        message: "Property not found",
      });
    }

    const editableFields = [
      "title",
      "description",
      "price",
      "area",
      "bedrooms",
      "bathrooms",
      "yearBuilt",
      "location",
      "propertyType",
      "listingType",
      "furnished",
      "status",
    ];

    for (const field of editableFields) {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        property[field] = req.body[field];
      }
    }

    await property.save();
    await property.populate("owner", "name email");

    return res.json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("ADMIN UPDATE PROPERTY ERROR:", error);
    return res.status(400).json({
      message: error.message,
    });
  }
};


// ========================================
// DELETE A PROPERTY
// ========================================

const deleteProperty = async (req, res) => {
  try {

    const property =
      await Property.findById(
        req.params.id
      );

    if (!property) {
      return res.status(404).json({
        message:
          "Property not found",
      });
    }

    await property.deleteOne();

    // Remove this property from
    // every user's favorites list

    await User.updateMany(
      { favorites: property._id },
      {
        $pull: {
          favorites: property._id,
        },
      }
    );

    console.log(
      "ADMIN DELETED PROPERTY:"
    );

    console.log(
      property.title
    );

    res.json({
      message:
        "Property deleted successfully",
    });

  } catch (error) {
    console.log(
      "ADMIN DELETE PROPERTY ERROR:"
    );

    console.log(error);

    res.status(500).json({
      message:
        error.message,
    });
  }
};


module.exports = {
  getStats,
  getUsers,
  deleteUser,
  getProperties,
  updateProperty,
  deleteProperty,
};