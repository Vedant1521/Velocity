import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";

// The Subscription model links a user to a specific subscription plan tier 
// and tracks billing statuses, lifecycle events (cancellation), and limits.
class Subscription extends Model<
  InferAttributes<Subscription>,
  InferCreationAttributes<Subscription>
> {
  declare id: CreationOptional<string>; // Primary ID UUID
  declare user_id: string; // Foreign key referencing users(id)
  declare plan_id: string; // Foreign key referencing plans(id)
  declare status: string; // Subscription status (e.g. "active", "past_due", "canceled")
  declare started_at: Date; // Timestamp when billing period started
  declare ends_at: Date | null; // Timestamp when active access ends
  declare canceled_at: Date | null; // Timestamp when user canceled (optional)
  declare created_at: CreationOptional<Date>; // Audit date
}

Subscription.init(
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
      // RESTRICT prevents deleting a user profile if they have active subscription records
      // (ensuring audit and financial data integrity).
      onDelete: "RESTRICT", 
      onUpdate: "CASCADE",
    },
    plan_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "plans",
        key: "id",
      },
      // RESTRICT prevents a subscription plan from being deleted in settings
      // if there are active users subscribed to it.
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    },
    status: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    canceled_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "subscription",
    tableName: "subscriptions",
    timestamps: false, // We define created_at manually and do not need updated_at
    underscored: true,
    indexes: [{ fields: ["id"] }],
  }
);

export { Subscription };
