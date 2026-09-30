// ========================================
// RESET & SEED PROPERTY DATA
// ========================================
// Deletes ALL old properties, enquiries,
// notifications and favorites, then inserts
// fresh, realistic property listings.
//
// Run:  node seed-reset.js
// ========================================

const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, ".env"),
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const Property = require("./models/Property");
const User = require("./models/User");
const Enquiry = require("./models/Enquiry");
const EnquiryMessage = require("./models/EnquiryMessage");
const Notification = require("./models/Notification");

// ========================================
// IMAGE HELPERS (verified working URLs)
// ========================================

const img = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

const IMAGES = {
  villaPool: img("1613490493576-7fde63acd811"),
  whiteHouse: img("1600596542815-ffad4c1539a9"),
  livingRoom: img("1600607687939-ce8a6c25118c"),
  classicHouse: img("1568605114967-8130f3a36994"),
  brickHouse: img("1570129477492-45c003edd2be"),
  cozyInterior: img("1502672260266-1c1ef2d93688"),
  modernFlat: img("1560185007-cde436f6a4d0"),
  bedroom: img("1600566753086-00f18fb6b3ea"),
  kitchen: img("1484154218962-a197022b5858"),
  apartmentInterior: img("1493809842364-78817add7ffb"),
  smallFlat: img("1560448204-e02f11c3d0e2"),
  sofaLiving: img("1522708323590-d24dbb6b0267"),
  suburbanHome: img("1512917774080-9991f1c4c750"),
  greenHouse: img("1580587771525-78b9dba3b914"),
  modernHouse: img("1600585154340-be6161a56a0c"),
  luxuryHouse: img("1564013799919-ab600027ffc6"),
  warmInterior: img("1554995207-c18c203602cb"),
  lampInterior: img("1600210492486-724fe5c67fb0"),
  patioHouse: img("1600047509807-ba8f99d2cdde"),
  cabinHome: img("1449844908441-8829872d2607"),
  whiteVilla: img("1583608205776-bfd35f0d9f83"),
  apartmentTower: img("1605276374104-dee2a0ed3cd6"),
};

// ========================================
// FRESH PROPERTY DATA
// ========================================

const daysAgo = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

const properties = [
  {
    title: "4 BHK Luxury Villa with Private Pool",
    description:
      "Premium villa in Baner featuring a private swimming pool, landscaped garden, modular kitchen, home theatre and 4 covered parking slots. Gated community with 24x7 security, clubhouse and gym. Prime location with easy access to Mumbai-Pune Expressway and top international schools.",
    price: 67500000,
    area: 4200,
    bedrooms: 5,
    bathrooms: 4,
    yearBuilt: 2021,
    location: "Baner, Pune, Maharashtra",
    propertyType: "Villa",
    listingType: "Sale",
    furnished: "Furnished",
    status: "Available",
    images: [IMAGES.villaPool, IMAGES.livingRoom, IMAGES.whiteHouse],
    createdAt: daysAgo(2),
  },
  {
    title: "Modern 3 BHK Independent House",
    description:
      "Well-designed 3 BHK independent house in a quiet lane of Hinjawadi Phase 1, walking distance from IT Park. Vitrified flooring, modular kitchen, solar water heater, rainwater harvesting and a private terrace. Ideal for IT professionals and families.",
    price: 18500000,
    area: 1850,
    bedrooms: 3,
    bathrooms: 3,
    yearBuilt: 2019,
    location: "Hinjawadi Phase 1, Pune, Maharashtra",
    propertyType: "House",
    listingType: "Sale",
    furnished: "Semi-Furnished",
    status: "Available",
    images: [IMAGES.classicHouse, IMAGES.brickHouse, IMAGES.cozyInterior],
    createdAt: daysAgo(4),
  },
  {
    title: "2 BHK Semi-Furnished Flat near Metro",
    description:
      "Bright 2 BHK flat in Andheri West, 5 minutes from the metro station and Versova beach. Includes wardrobes, split ACs, chimney and a modular kitchen. Society has power backup, clubhouse, gym and reserved parking.",
    price: 48000,
    area: 950,
    bedrooms: 2,
    bathrooms: 2,
    yearBuilt: 2017,
    location: "Andheri West, Mumbai, Maharashtra",
    propertyType: "Flat",
    listingType: "Rent",
    furnished: "Semi-Furnished",
    status: "Available",
    images: [IMAGES.apartmentInterior, IMAGES.smallFlat, IMAGES.sofaLiving],
    createdAt: daysAgo(6),
  },
  {
    title: "3 BHK Ready-to-Move Apartment",
    description:
      "Spacious 3 BHK apartment in a reputed gated community in Whitefield with garden view. Possession ready, no waiting period. Clubhouse, swimming pool, kids play area and 24x7 security. Close to ITPL, international schools and hospitals.",
    price: 14200000,
    area: 1480,
    bedrooms: 3,
    bathrooms: 2,
    yearBuilt: 2022,
    location: "Whitefield, Bangalore, Karnataka",
    propertyType: "Flat",
    listingType: "Sale",
    furnished: "Unfurnished",
    status: "Available",
    images: [IMAGES.modernFlat, IMAGES.bedroom, IMAGES.kitchen],
    createdAt: daysAgo(8),
  },
  {
    title: "CMDA Approved Residential Plot",
    description:
      "Clear-title residential plot on a 30ft road in Shadnagar growth corridor. Approved layout with electricity, water connections and avenue plantation. Excellent investment opportunity near the upcoming regional ring road.",
    price: 3200000,
    area: 2400,
    bedrooms: 0,
    bathrooms: 0,
    location: "Shadnagar, Hyderabad, Telangana",
    propertyType: "Plot",
    listingType: "Sale",
    furnished: "Unfurnished",
    status: "Available",
    images: [IMAGES.greenHouse, IMAGES.patioHouse],
    createdAt: daysAgo(10),
  },
  {
    title: "4 BHK Furnished Villa for Rent with Garden",
    description:
      "Fully furnished 4 BHK villa for rent in Koregaon Park with a private garden, patio and servant quarter. Imported furniture, designer lighting, ACs in all rooms and standby generator. Pet friendly, ideal for expat families.",
    price: 125000,
    area: 3200,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2016,
    location: "Koregaon Park, Pune, Maharashtra",
    propertyType: "House",
    listingType: "Rent",
    furnished: "Furnished",
    status: "Available",
    images: [IMAGES.suburbanHome, IMAGES.warmInterior, IMAGES.lampInterior],
    createdAt: daysAgo(11),
  },
  {
    title: "1 BHK Compact Apartment for Students",
    description:
      "Affordable 1 BHK apartment near Viman Nagar college hub, ideal for students and working singles. Includes bed, study table, wardrobe and WiFi readiness. Walkable to Phoenix Marketcity and public transport.",
    price: 4250000,
    area: 545,
    bedrooms: 1,
    bathrooms: 1,
    yearBuilt: 2015,
    location: "Viman Nagar, Pune, Maharashtra",
    propertyType: "Flat",
    listingType: "Sale",
    furnished: "Furnished",
    status: "Available",
    images: [IMAGES.smallFlat, IMAGES.apartmentInterior],
    createdAt: daysAgo(13),
  },
  {
    title: "5 BHK Premium Sea-View Bungalow",
    description:
      "Iconic 5 BHK bungalow on Carmichael Road with sea views, Italian marble flooring, private lift, imported modular kitchen and a 6-car driveway. Heritage neighbourhood, minutes from Nariman Point and top schools.",
    price: 185000000,
    area: 6500,
    bedrooms: 5,
    bathrooms: 5,
    yearBuilt: 2012,
    location: "Carmichael Road, Mumbai, Maharashtra",
    propertyType: "House",
    listingType: "Sale",
    furnished: "Semi-Furnished",
    status: "Available",
    images: [IMAGES.luxuryHouse, IMAGES.modernHouse, IMAGES.whiteVilla],
    createdAt: daysAgo(15),
  },
  {
    title: "3 BHK Fully Furnished Flat in Powai",
    description:
      "Move-in ready 3 BHK furnished flat overlooking the lake in Powai. Smart TV, washer, sofa set, beds and fully equipped kitchen. Society with gym, pool, jogging track and 3-tier security. IT corridor connectivity via LBS Marg.",
    price: 85000,
    area: 1350,
    bedrooms: 3,
    bathrooms: 3,
    yearBuilt: 2020,
    location: "Powai, Mumbai, Maharashtra",
    propertyType: "Flat",
    listingType: "Rent",
    furnished: "Furnished",
    status: "Available",
    images: [IMAGES.sofaLiving, IMAGES.kitchen, IMAGES.bedroom],
    createdAt: daysAgo(17),
  },
  {
    title: "Weekend Villa in the Hills of Lonavala",
    description:
      "Charming 4 BHK weekend villa in Lonavala with valley view, bonfire deck, jacuzzi and open kitchen. Perfect holiday home on the Mumbai-Pune route. Gated project with pool and 24x7 maintenance support.",
    price: 49500000,
    area: 3000,
    bedrooms: 4,
    bathrooms: 3,
    yearBuilt: 2018,
    location: "Lonavala, Pune District, Maharashtra",
    propertyType: "Villa",
    listingType: "Sale",
    furnished: "Semi-Furnished",
    status: "Available",
    images: [IMAGES.cabinHome, IMAGES.whiteVilla, IMAGES.patioHouse],
    createdAt: daysAgo(19),
  },
  {
    title: "2 BHK Independent House on Rent",
    description:
      "Simple 2 BHK independent house available for long-term rent near Sangola bus stand. Spacious rooms, own borewell water, two-wheeler parking and peaceful surroundings. Suitable for small families.",
    price: 18000,
    area: 1100,
    bedrooms: 2,
    bathrooms: 1,
    yearBuilt: 2014,
    location: "Sangola, Solapur, Maharashtra",
    propertyType: "House",
    listingType: "Rent",
    furnished: "Unfurnished",
    status: "Available",
    images: [IMAGES.brickHouse, IMAGES.classicHouse],
    createdAt: daysAgo(22),
  },
  {
    title: "New Launch 2 BHK Apartment in Baner",
    description:
      "Bookings open for a new-launch 2 BHK apartment in Baner with balcony, vitrified tiles and modular kitchen provisioning. Flexible payment plan, bank approvals in place and possession within 18 months.",
    price: 9800000,
    area: 1100,
    bedrooms: 2,
    bathrooms: 2,
    yearBuilt: 2024,
    location: "Baner, Pune, Maharashtra",
    propertyType: "Flat",
    listingType: "Sale",
    furnished: "Unfurnished",
    status: "Available",
    images: [IMAGES.apartmentTower, IMAGES.modernFlat],
    createdAt: daysAgo(25),
  },
  {
    title: "2 BHK Resale Flat near Magarpatta",
    description:
      "Well-maintained 2 BHK resale flat opposite Magarpatta City. East-facing, good ventilation, society with garden and play area. Ready for registration.",
    price: 7800000,
    area: 820,
    bedrooms: 2,
    bathrooms: 2,
    yearBuilt: 2013,
    location: "Hadapsar, Pune, Maharashtra",
    propertyType: "Flat",
    listingType: "Sale",
    furnished: "Unfurnished",
    status: "Sold",
    images: [IMAGES.modernFlat, IMAGES.cozyInterior],
    createdAt: daysAgo(28),
  },
];

// ========================================
// MAIN
// ========================================

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing from backend/.env");
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });

  console.log("MongoDB connected");

  // ----------------------------------------
  // 1. WIPE OLD DATA
  // ----------------------------------------

  const deletedProperties = await Property.deleteMany({});
  const deletedEnquiries = await Enquiry.deleteMany({});
  const deletedMessages = await EnquiryMessage.deleteMany({});
  const deletedNotifications = await Notification.deleteMany({});

  const clearedFavorites = await User.updateMany(
    {},
    { $set: { favorites: [] } }
  );

  console.log("----------------------------------------");
  console.log("OLD DATA DELETED");
  console.log(`  properties:    ${deletedProperties.deletedCount}`);
  console.log(`  enquiries:     ${deletedEnquiries.deletedCount}`);
  console.log(`  messages:      ${deletedMessages.deletedCount}`);
  console.log(`  notifications: ${deletedNotifications.deletedCount}`);
  console.log(`  user favorites cleared: ${clearedFavorites.modifiedCount}`);
  console.log("----------------------------------------");

  // ----------------------------------------
  // 2. PICK OWNER (so logged-in user can edit)
  // ----------------------------------------

  let owner = await User.findOne({
    name: { $regex: "tushar", $options: "i" },
  });

  if (!owner) {
    owner = await User.findOne().sort({ createdAt: -1 });
  }

  if (!owner) {
    const hashedPassword = await bcrypt.hash("seed-owner-123", 10);

    owner = await User.create({
      name: "GharBazaar Realty",
      email: "realtor@gharbazaar.in",
      password: hashedPassword,
      phone: "9876543210",
      role: "User",
    });

    console.log(
      "No existing user found - created fallback owner: realtor@gharbazaar.in (password: seed-owner-123)"
    );
  }

  console.log(`Owner for seeded listings: ${owner.name} (${owner.email})`);

  // ----------------------------------------
  // 3. INSERT FRESH PROPERTIES
  // ----------------------------------------

  const docs = properties.map((property) => ({
    ...property,
    owner: owner._id,
  }));

  const inserted = await Property.insertMany(docs, { ordered: false });

  console.log("----------------------------------------");
  console.log(`SEEDED ${inserted.length} fresh properties`);
  console.log("----------------------------------------");

  inserted.forEach((property, index) => {
    console.log(
      `  ${index + 1}. [${property.listingType}] ${property.propertyType} - ${property.title} - ${property.location}`
    );
  });

  await mongoose.disconnect();

  console.log("----------------------------------------");
  console.log("DONE - database reset complete");
};

run().catch((error) => {
  console.error("SEED FAILED:", error.message);
  process.exit(1);
});

