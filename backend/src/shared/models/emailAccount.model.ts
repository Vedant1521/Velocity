import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";

// The EmailAccount model stores the metadata of external mail accounts linked by users.
class EmailAccount extends Model<
  InferAttributes<EmailAccount>,
  InferCreationAttributes<EmailAccount>
> {
  declare id: CreationOptional<string>; // Primary ID
  declare user_id: string; // Foreign key referencing users(id)
  declare provider: string; // e.g. "google", "microsoft", "imap"
  declare email: string; // The email address of the linked account
  declare name: string | null; // Display name of this mailbox
  declare password: string | null; // Optional SMTP/IMAP encrypted password
  declare host: string | null; // Optional SMTP/IMAP server host
  declare refresh_token: string | null; // OAuth refresh token to renew fetch sessions
  declare subscription_id: string | null; // Push webhook subscription ID (Gmail watch/Outlook sync)
  declare subscription_expiration: Date | null; // Webhook expiry date
  declare avatar_url: string | null; // Avatar icon of the linked account

  // Auditing timestamps
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date | null>;
}

EmailAccount.init(
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
      references: {
        model: "users", // Reference table
        key: "id", // Target column
      },
      onDelete: "CASCADE", // If user is deleted, automatically remove all their linked email accounts
      onUpdate: "CASCADE",
    },
    provider: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    host: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    refresh_token: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subscription_id: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    subscription_expiration: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    avatar_url: {
      type: DataTypes.TEXT,
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
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "email_account",
    tableName: "email_accounts",
    paranoid: true, // Soft delete enabled
    timestamps: true,
    underscored: true,

    indexes: [
      {
        fields: ["id"],
      },
      // Compound index: User cannot link the exact same email address multiple times
      {
        unique: true,
        fields: ["user_id", "email"],
        name: "email_accounts_user_id_email_unique",
      },
    ],
  }
);

export { EmailAccount };
