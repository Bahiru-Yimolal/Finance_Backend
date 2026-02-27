const { Client } = require("pg");

const createDatabaseIfNotExists = async () => {
    const dbName = process.env.DB_NAME;
    const dbConfig = {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
        database: "postgres", // Connect to the default 'postgres' database to create the new one
    };

    const client = new Client(dbConfig);

    try {
        await client.connect();

        // Check if the database exists
        const res = await client.query(
            `SELECT 1 FROM pg_database WHERE datname = $1`,
            [dbName]
        );

        if (res.rowCount === 0) {
            console.log(`Database '${dbName}' not found. Creating...`);
            // Note: CREATE DATABASE cannot be executed within a transaction block for many PostgreSQL versions
            await client.query(`CREATE DATABASE "${dbName}"`);
            console.log(`Database '${dbName}' created successfully.`);
        } else {
            console.log(`Database '${dbName}' already exists.`);
        }
    } catch (error) {
        console.error(`Error checking or creating database '${dbName}':`, error);
    } finally {
        await client.end();
    }
};

module.exports = createDatabaseIfNotExists;
