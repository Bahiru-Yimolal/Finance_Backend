const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/.env" });
const bcrypt = require("bcrypt");
const { User, Transaction, Category } = require("../models");
const sequelize = require("../config/database");

/**
 * Batch Seed Script
 * Creates 10 users and 10 transactions for each user.
 */
const seedData = async () => {
    try {
        console.log("Starting data seeding...");

        // 1. Get available categories
        const categories = await Category.findAll();
        if (categories.length === 0) {
            console.error("No categories found. Please seed categories first.");
            return;
        }

        const hashedPassword = await bcrypt.hash("TestPass123!", 10);
        const usersToCreate = [];

        // 2. Prepare 10 Users
        for (let i = 1; i <= 10; i++) {
            usersToCreate.push({
                username: `testuser${i}`,
                email: `user${i}@example.com`,
                password: hashedPassword,
                role: "USER",
                status: "ACTIVE",
                first_name: `Test`,
                last_name: `User ${i}`,
            });
        }

        // 3. Create Users
        const createdUsers = await User.bulkCreate(usersToCreate, { ignoreDuplicates: true });
        console.log(`Successfully seeded ${createdUsers.length} users.`);

        // Refetch users to get IDs (in case some already existed)
        const allUsers = await User.findAll({
            where: {
                username: usersToCreate.map(u => u.username)
            }
        });

        const transactionsToCreate = [];
        const types = ["income", "expense"];
        const now = new Date();

        // 4. Prepare 10 Transactions per User
        for (const user of allUsers) {
            for (let j = 1; j <= 10; j++) {
                const type = types[Math.floor(Math.random() * types.length)];
                const amount = (Math.random() * (1000 - 10) + 10).toFixed(2);
                const category = categories[Math.floor(Math.random() * categories.length)];

                // Random date within last 3 months
                const date = new Date();
                date.setDate(now.getDate() - Math.floor(Math.random() * 90));

                transactionsToCreate.push({
                    user_id: user.id,
                    amount: parseFloat(amount),
                    type: type,
                    category_id: category.id,
                    description: `${type.charAt(0).toUpperCase() + type.slice(1)} for ${category.name} - Sample ${j}`,
                    date: date.toISOString().split("T")[0],
                });
            }
        }

        // 5. Create Transactions
        await Transaction.bulkCreate(transactionsToCreate);
        console.log(`Successfully seeded ${transactionsToCreate.length} transactions.`);

        console.log("Data seeding completed successfully!");
    } catch (error) {
        console.error("Error during data seeding:", error);
    } finally {
        // We don't close the connection here if this is called within the app flow,
        // but if run as a standalone script, we should.
        if (require.main === module) {
            await sequelize.close();
            process.exit(0);
        }
    }
};

// If run directly: node src/utils/seedData.js
if (require.main === module) {
    seedData();
}

module.exports = seedData;
