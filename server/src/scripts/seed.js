require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Membership = require("../models/Membership");

const memberships = [
  {
    name: "Basic",
    duration: 1,
    durationType: "months",
    cost: 999,
    benefits: [
      "Access to gym equipment",
      "Locker facility",
      "Basic fitness assessment"
    ],
    status: "active",
    color: "#6B7280"
  },
  {
    name: "Standard",
    duration: 3,
    durationType: "months",
    cost: 2499,
    benefits: [
      "Access to gym equipment",
      "Locker facility",
      "Fitness assessment",
      "1 Personal training session/month",
      "Access to group classes"
    ],
    status: "active",
    color: "#3B82F6"
  },
  {
    name: "Premium",
    duration: 6,
    durationType: "months",
    cost: 4499,
    benefits: [
      "Access to gym equipment",
      "Locker facility",
      "Monthly fitness assessment",
      "2 Personal training sessions/month",
      "Access to all group classes",
      "Diet consultation",
      "Sauna & Steam access"
    ],
    status: "active",
    color: "#8B5CF6"
  },
  {
    name: "Elite",
    duration: 12,
    durationType: "months",
    cost: 7999,
    benefits: [
      "24/7 Gym access",
      "Premium locker facility",
      "Weekly fitness assessment",
      "4 Personal training sessions/month",
      "Access to all group classes",
      "Personalized diet plan",
      "AI-generated workout plans",
      "Sauna & Steam access",
      "Guest passes (2/month)",
      "Priority booking"
    ],
    status: "active",
    color: "#F59E0B"
  },
  {
    name: "Student",
    duration: 1,
    durationType: "months",
    cost: 699,
    benefits: [
      "Access to gym equipment",
      "Locker facility",
      "Valid student ID required"
    ],
    status: "active",
    color: "#10B981"
  }
];

const adminUser = {
  email: "admin@cobios.com",
  password: "admin123",
  name: "Admin User",
  role: "admin",
  phone: "1234567890",
  isActive: true
};

const sampleTrainer = {
  email: "trainer@cobios.com",
  password: "trainer123",
  name: "John Trainer",
  role: "trainer",
  phone: "9876543210",
  specialization: "Weight Training & Cardio",
  experience: 5,
  certifications: ["ACE Certified", "NASM-CPT"],
  isActive: true
};

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await Membership.deleteMany({});
    // await User.deleteMany({});
    // console.log("🗑️  Cleared existing data");

    // Seed Memberships
    const existingMemberships = await Membership.countDocuments();
    if (existingMemberships === 0) {
      const createdMemberships = await Membership.insertMany(memberships);
      console.log(`✅ Created ${createdMemberships.length} membership plans:`);
      createdMemberships.forEach(m => {
        console.log(`   - ${m.name}: ${m._id}`);
      });
    } else {
      console.log("ℹ️  Memberships already exist, skipping...");
      const existingPlans = await Membership.find();
      console.log("   Existing membership IDs:");
      existingPlans.forEach(m => {
        console.log(`   - ${m.name}: ${m._id}`);
      });
    }

    // Seed Admin User
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (!existingAdmin) {
      const admin = await User.create(adminUser);
      console.log(`✅ Created admin user:`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: admin123`);
      console.log(`   ID: ${admin._id}`);
    } else {
      console.log(`ℹ️  Admin user already exists: ${existingAdmin._id}`);
    }

    // Seed Sample Trainer
    const existingTrainer = await User.findOne({ email: sampleTrainer.email });
    if (!existingTrainer) {
      const trainer = await User.create(sampleTrainer);
      console.log(`✅ Created sample trainer:`);
      console.log(`   Email: ${trainer.email}`);
      console.log(`   Password: trainer123`);
      console.log(`   ID: ${trainer._id}`);
    } else {
      console.log(`ℹ️  Trainer already exists: ${existingTrainer._id}`);
    }

    console.log("\n🎉 Seed completed successfully!");
    console.log("\n📋 Summary:");
    console.log("   Admin login: admin@cobios.com / admin123");
    console.log("   Trainer login: trainer@cobios.com / trainer123");

  } catch (error) {
    console.error("❌ Seed error:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Database connection closed");
    process.exit(0);
  }
};

seedDatabase();

