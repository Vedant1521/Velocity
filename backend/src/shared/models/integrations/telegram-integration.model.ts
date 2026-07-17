import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../../config/db";

// The TelegramIntegration model stores metadata for Telegram account connections,
// linked 1:1 to the parent Integration table.
class TelegramIntegration extends Model<
  InferAttributes<TelegramIntegration>,
  InferCreationAttributes<TelegramIntegration>
> {
  declare integration_id: string; // Foreign key & Primary key linking to integrations(id)
  declare user_id: string; // References users(id) for query shorthand
  declare chat_id: string; // Telegram unique chat ID (stored as string/BIGINT)
  declare username: string | null; // User's Telegram @username handle
  declare first_name: string | null; // User's Telegram first name
  declare last_name: string | null; // User's Telegram last name
  declare photo_url: string | null; // User's Telegram avatar picture
}

TelegramIntegration.init(
  {
    integration_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true, // Used as the primary key since it's a strict 1:1 link
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onDelete: "CASCADE", // Delete telegram configs if parent user deletes profile
    },
    chat_id: {
      type: DataTypes.BIGINT, // Telegram IDs exceed regular integer bounds, requiring 64-bit BIGINT
      allowNull: false,
    },
    username: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    first_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    photo_url: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "telegramIntegration",
    tableName: "telegram_integrations",
    timestamps: false,
    underscored: true,
    indexes: [
      { fields: ["chat_id"], unique: true }, // Ensure a Telegram chat cannot be linked twice
      { fields: ["user_id"] },
    ],
  }
);

export { TelegramIntegration };
