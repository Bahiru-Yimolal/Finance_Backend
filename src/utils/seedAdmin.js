const bcrypt = require("bcrypt");
const { User } = require("../models");

const seedAdmin = async () => {
    try {
        const adminUsername = "admin";
        const adminEmail = "admin@example.com";
        const adminPassword = "StrongPass123!";

        // Check if admin already exists
        const existingAdmin = await User.findOne({
            where: { role: "ADMIN" },
        });

        if (existingAdmin) {
            console.log("Admin user already exists. Skipping seeding.");
            return;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create admin user
        await User.create({
            username: adminUsername,
            email: adminEmail,
            password: hashedPassword,
            role: "ADMIN",
            status: "ACTIVE",
        });

        console.log("Admin user seeded successfully!");
    } catch (error) {
        console.error("Error seeding admin user:", error);
    }
};

module.exports = seedAdmin;
