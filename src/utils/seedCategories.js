const { Category } = require("../models");

const defaultCategories = [
    "Food & Dining",
    "Rent & Utilities",
    "Transportation",
    "Healthcare",
    "Entertainment",
    "Salary",
    "Gifts",
    "Insurance",
    "Investment",
    "Other",
];

const seedCategories = async () => {
    try {
        for (const categoryName of defaultCategories) {
            // Check if category already exists as a global category (user_id is null)
            const existingCategory = await Category.findOne({
                where: {
                    name: categoryName,
                    user_id: null,
                },
            });

            if (!existingCategory) {
                await Category.create({
                    name: categoryName,
                    user_id: null, // Global category
                });
                console.log(`Category seeded: ${categoryName}`);
            }
        }
        console.log("Category seeding check completed.");
    } catch (error) {
        console.error("Error seeding categories:", error);
    }
};

module.exports = seedCategories;
