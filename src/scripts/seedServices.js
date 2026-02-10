import mongoose from "mongoose";
import dotenv from "dotenv";
import Service from "../modules/services/service.model.js";

dotenv.config();

const services = [
  // 1️⃣ Maintenance & Repair
  {
    name: "Electrical Works",
    category: "Maintenance & Repair",
    icon: "⚡",
    isFeatured: true,
  },
  {
    name: "Plumbing Services",
    category: "Maintenance & Repair",
    icon: "🔧",
    isFeatured: true,
  },
  {
    name: "AC Services",
    category: "Maintenance & Repair",
    icon: "❄️",
    isFeatured: true,
  },
  { name: "Water Heater Repair", category: "Maintenance & Repair", icon: "🔥" },
  {
    name: "Washing Machine Repair",
    category: "Maintenance & Repair",
    icon: "🧺",
  },
  { name: "Refrigerator Repair", category: "Maintenance & Repair", icon: "🧊" },
  {
    name: "TV Installation & Mounting",
    category: "Maintenance & Repair",
    icon: "📺",
  },

  // 2️⃣ Cleaning Services
  {
    name: "General Home Cleaning",
    category: "Cleaning",
    icon: "🧹",
    isFeatured: true,
  },
  { name: "Deep Cleaning", category: "Cleaning", icon: "🧼" },
  { name: "Sofa & Carpet Cleaning", category: "Cleaning", icon: "🛋️" },
  { name: "Mattress & Curtain Cleaning", category: "Cleaning", icon: "🛏️" },
  { name: "Move In / Move Out Cleaning", category: "Cleaning", icon: "📦" },
  { name: "Post Construction Cleaning", category: "Cleaning", icon: "🏗️" },

  // 3️⃣ Handyman / Odd Jobs
  { name: "Drilling & Wall Hanging", category: "Handyman", icon: "🪛" },
  { name: "Curtain & Blind Fixing", category: "Handyman", icon: "🪟" },
  { name: "Door Lock Repair", category: "Handyman", icon: "🔐" },
  { name: "Minor Carpentry", category: "Handyman", icon: "🪚" },
  { name: "Furniture Assembly", category: "Handyman", icon: "🛠️" },

  // 4️⃣ Pest Control
  { name: "Cockroach Control", category: "Pest Control", icon: "🪳" },
  { name: "Bed Bug Treatment", category: "Pest Control", icon: "🛌" },
  { name: "Termite Control", category: "Pest Control", icon: "🐜" },
  { name: "Rodent Control", category: "Pest Control", icon: "🐀" },

  // 5️⃣ Renovation & Interior
  { name: "Gypsum & False Ceiling", category: "Renovation", icon: "🏠" },
  { name: "Wallpaper Fixing", category: "Renovation", icon: "🧱" },
  { name: "Bathroom Renovation", category: "Renovation", icon: "🚿" },
  { name: "Tile Fixing", category: "Renovation", icon: "🧩" },

  // 6️⃣ Outdoor & Utility
  { name: "Water Tank Cleaning", category: "Outdoor & Utility", icon: "🚰" },
  { name: "Garden Maintenance", category: "Outdoor & Utility", icon: "🌿" },
  { name: "Swimming Pool Cleaning", category: "Outdoor & Utility", icon: "🏊" },
  { name: "Waste Removal", category: "Outdoor & Utility", icon: "🗑️" },

  // 7️⃣ Safety & Smart Home
  {
    name: "CCTV Installation",
    category: "Safety & Smart Home",
    icon: "📹",
    isFeatured: true,
  },
  { name: "Smart Door Lock", category: "Safety & Smart Home", icon: "🔒" },
  {
    name: "Fire Extinguisher Setup",
    category: "Safety & Smart Home",
    icon: "🧯",
  },
  {
    name: "Smoke Detector Installation",
    category: "Safety & Smart Home",
    icon: "🚨",
  },

  // 8️⃣ Moving & Support
  { name: "Home Shifting", category: "Moving & Support", icon: "🚚" },
  { name: "Furniture Dismantling", category: "Moving & Support", icon: "📦" },
  { name: "Appliance Relocation", category: "Moving & Support", icon: "🔄" },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  await Service.deleteMany({});
  await Service.insertMany(services);
  process.exit();
}

seed();
