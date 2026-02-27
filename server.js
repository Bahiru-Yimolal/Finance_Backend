const dotenv = require("dotenv");
dotenv.config({ path: "./src/config/.env" });
const app = require("./src/app");
const sequelize = require("./src/config/database");
const createDb = require("./src/utils/createDb");
const seedAdmin = require("./src/utils/seedAdmin");
const seedCategories = require("./src/utils/seedCategories");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Ensure database exists
    await createDb();

    // Sync models
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully");

    // Seed initial data
    await seedAdmin();
    await seedCategories();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error during server startup:", error);
  }
};

startServer();
