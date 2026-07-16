import "dotenv/config";
import { Sequelize } from "sequelize";
import { logger } from "../utils/logger";
import pg from "pg";

const { PG_CONNECTION_STRING } = process.env;

if (!PG_CONNECTION_STRING) {
  throw new Error("No postgres Connection string found");
}

// 1. Raw PG Pool for custom raw SQL queries
export const pool = new pg.Pool({
  connectionString: PG_CONNECTION_STRING,
  max: 20,
  ssl: {
    rejectUnauthorized: false,
  },
});

// 2. Sequelize ORM Instance
const sequelize = new Sequelize(PG_CONNECTION_STRING, {
  dialect: "postgres",
  define: {
    freezeTableName: true, // Prevents Sequelize from auto-pluralizing table names
  },
  logging: false, // Prevents sql statements cluttering terminal output
  dialectOptions: {
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    ssl: {
      require: true,
      rejectUnauthorized: false, // Crucial for cloud databases like Neon/RDS
    },
  },
  // Connection Pool configuration
  pool: {
    max: 10,
    min: 0,
    idle: 10000,
    acquire: 60000,
  },
});

// 3. Database connection and sync utility
const connectDb = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    // { alter: true } matches database schemas to current code models automatically
    await sequelize.sync({ alter: true });
    logger.info("Db Connected Succesfully");
  } catch (error: any) {
    logger.error("Error while connecting db :" + error);
    process.exit(1);
  }
};

export { connectDb, sequelize };
