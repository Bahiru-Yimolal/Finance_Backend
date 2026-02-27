const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { errorMiddleware } = require("./middlewares/errorMiddleware");
const { swaggerUi, swaggerSpec } = require("./config/swagger");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes           
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/admin", adminRoutes);

// Error Handling
app.use(errorMiddleware);

module.exports = app;
