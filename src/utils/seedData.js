require("dotenv").config({ path: "./src/config/.env" });

const bcrypt = require("bcrypt");
const { Sequelize } = require("sequelize");

// Import models
const UserModel = require("../models/user");
const TransactionModel = require("../models/transaction");
const CategoryModel = require("../models/category");

/*
--------------------------------------------------
Database Connection (Standalone)
--------------------------------------------------
*/
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: "postgres",
        logging: false,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    }
);

// Initialize models
const User = UserModel(sequelize);
const Transaction = TransactionModel(sequelize);
const Category = CategoryModel(sequelize);

/*
--------------------------------------------------
Seed Script
--------------------------------------------------
*/
const seedData = async () => {
    try {
        console.log("Starting data seeding...");

        await sequelize.authenticate();
        console.log("Database connected.");

        const categories = await Category.findAll();

        if (!categories || categories.length === 0) {
            console.error("No categories found. Seed categories first.");
            return;
        }

        const hashedPassword = await bcrypt.hash("TestPass123!", 10);

        /*
        ---------------------------
        Create Users
        ---------------------------
        */
        const usersToCreate = [];

        for (let i = 1; i <= 10; i++) {
            usersToCreate.push({
                username: `testuser${i}`,
                email: `user${i}@example.com`,
                password: hashedPassword,
                role: "USER",
                status: "ACTIVE",
                first_name: "Test",
                last_name: `User ${i}`
            });
        }

        const createdUsers = await User.bulkCreate(usersToCreate, {
            ignoreDuplicates: true
        });

        console.log(`Users seeded: ${createdUsers.length}`);

        const allUsers = await User.findAll({
            where: {
                username: usersToCreate.map(u => u.username)
            }
        });

        /*
        ---------------------------
        Create Transactions
        ---------------------------
        */

        const transactionsToCreate = [];
        const types = ["income", "expense"];
        const now = new Date();

        for (const user of allUsers) {
            for (let j = 1; j <= 10; j++) {
                const type = types[Math.floor(Math.random() * types.length)];
                const amount = (Math.random() * 990 + 10).toFixed(2);
                const category = categories[Math.floor(Math.random() * categories.length)];

                const date = new Date();
                date.setDate(now.getDate() - Math.floor(Math.random() * 90));

                transactionsToCreate.push({
                    user_id: user.id,
                    amount: parseFloat(amount),
                    type,
                    category_id: category.id,
                    description: `${type} sample ${j}`,
                    date: date.toISOString().split("T")[0]
                });
            }
        }

        await Transaction.bulkCreate(transactionsToCreate);

        console.log(`Transactions seeded: ${transactionsToCreate.length}`);
        console.log("Seeding completed successfully.");

    } catch (error) {
        console.error("Seeding error:", error);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
};

/*
--------------------------------------------------
Auto Run When Executed Directly
--------------------------------------------------
*/
if (require.main === module) {
    seedData();
}

module.exports = seedData;