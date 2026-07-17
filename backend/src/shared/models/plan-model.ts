import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";

// The Plan model defines the subscription tiers available to users (e.g. Free, Pro)
// and their associated resource limits.
class Plan extends Model<InferAttributes<Plan>, InferCreationAttributes<Plan>> {
  declare id: CreationOptional<string>; // Primary ID UUID
  declare code: string; // Machine-readable key (e.g. "pro_monthly")
  declare name: string; // User-facing name (e.g. "Pro Plan")
  declare price: string; // Display price (e.g. "$15/month")
  declare ai_credits: number; // Max AI queries allowed per month
  declare accounts_limit: number; // Max external mailboxes allowed to link
}

Plan.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    code: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    ai_credits: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    accounts_limit: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "plan",
    tableName: "plans",
    
    // We set timestamps to false because the list of plans (Free, Starter, Pro)
    // is static reference data. It does not need automated created_at / updated_at tracking.
    timestamps: false, 
    
    underscored: true,
    indexes: [{ fields: ["id"] }],
  }
);

export { Plan };
