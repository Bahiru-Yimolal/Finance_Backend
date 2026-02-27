const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// Swagger configuration
const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Personal Finance Tracker API",
    version: "1.0.0",
    description: "API documentation for Personal Finance Tracker",
  },
  servers: [
    {
      url: "http://localhost:5000/api",
      description: "Development server",
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ["./src/docs/*.js"], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec,
};
