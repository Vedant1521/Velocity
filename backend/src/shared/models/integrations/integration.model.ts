import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  NonAttribute,
} from "sequelize";
import { sequelize } from "../../config/db";
import { TelegramIntegration } from "./telegram-integration.model";
import { SlackIntegration } from "./slack-integration.model";
import { NotionIntegration } from "./notion-integration.model";

// 1. Defining standard integration providers
export enum IntegrationProvider {
  TELEGRAM = "telegram",
  SLACK = "slack",
  NOTION = "notion",
  GOOGLE = "google",
}

// 2. Defining connection statuses
export enum IntegrationStatus {
  PENDING = "pending", // Waiting for user OAuth consent
  ACTIVE = "active", // Successfully linked and operational
  REVOKED = "revoked", // Connection disconnected by user
}

// 3. Main Integration Class representing general user integrations
class Integration extends Model<
  InferAttributes<Integration>,
  InferCreationAttributes<Integration>
> {
  declare id: CreationOptional<string>; // Primary ID UUID
  declare user_id: string; // Foreign key back to users(id)
  declare provider: IntegrationProvider; // The service type (e.g. Telegram)
  declare status: CreationOptional<IntegrationStatus>; // The current connection status

  // OAuth Credentials (to securely interact with external APIs)
  declare access_token: string | null;
  declare refresh_token: string | null;
  declare expires_at: Date | null;

  // Auditing timestamps
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;

  // Virtual relation typings (Sequelize relations that don't map to columns directly)
  declare telegram?: NonAttribute<TelegramIntegration>;
  declare slack?: NonAttribute<SlackIntegration>;
  declare notion?: NonAttribute<NotionIntegration>;
}

Integration.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    provider: {
      type: DataTypes.ENUM(
        IntegrationProvider.TELEGRAM,
        IntegrationProvider.SLACK,
        IntegrationProvider.NOTION,
        IntegrationProvider.GOOGLE
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        IntegrationStatus.PENDING,
        IntegrationStatus.ACTIVE,
        IntegrationStatus.REVOKED
      ),
      allowNull: false,
      defaultValue: IntegrationStatus.PENDING,
    },
    access_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "integration",
    tableName: "integrations",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    indexes: [
      {
        fields: ["id"],
      },
    ],
  }
);

export { Integration };
