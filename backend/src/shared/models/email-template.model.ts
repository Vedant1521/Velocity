import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
  ForeignKey,
} from "sequelize";
import { sequelize } from "../config/db";
import { User } from "./user-model";

// 1. Defining the structure of template replacement variables
export interface TemplateVariable {
  name: string; // The placeholder key (e.g. "firstName")
  description: string; // What this variable represents
  default?: string; // Fallback value if no replacement is provided
}

// 2. Main EmailTemplate Class definition
class EmailTemplate extends Model<
  InferAttributes<EmailTemplate>,
  InferCreationAttributes<EmailTemplate>
> {
  declare id: CreationOptional<number>; // Auto-incrementing integer key
  declare userId: ForeignKey<string>; // Links to our users(id) foreign key
  declare name: string; // Template title (e.g. "Investor Pitch")
  declare subject: string; // Email Subject containing variables
  declare body: CreationOptional<string | null>; // Template markup content
  declare variables: CreationOptional<TemplateVariable[]>; // List of variables inside JSONB column
  declare category: CreationOptional<string | null>; // Category tags (e.g. "sales")
  declare tags: CreationOptional<string[]>; // Array of tags
  declare version: CreationOptional<number>; // Version increment tracker
  declare usageCount: CreationOptional<number>; // Total times template has been sent
  declare lastUsedAt: CreationOptional<Date | null>; // Last time user loaded this template
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

// 3. Schema initializations
EmailTemplate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true, // DB auto-increments from 1, 2, 3...
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
      onDelete: "CASCADE", // Delete all user's templates if user deletes account
      field: "user_id", // Manually maps database column user_id to JS property userId
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    subject: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "body",
    },
    variables: {
      type: DataTypes.JSONB, // PostgreSQL binary JSON storage
      allowNull: false,
      defaultValue: [],
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.TEXT), // PostgreSQL specific string array type
      allowNull: false,
      defaultValue: [],
    },
    version: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    usageCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      field: "usage_count", // Manually maps usage_count in DB to usageCount in code
    },
    lastUsedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_used_at",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "created_at",
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "updated_at",
    },
  },
  {
    sequelize,
    tableName: "email_templates",
    timestamps: true,
    underscored: false, // We manually override field mappings using the "field" attribute above
    createdAt: "createdAt",
    updatedAt: "updatedAt",
    indexes: [
      // Compound index: A single user cannot have two templates named the exact same thing
      {
        unique: true,
        fields: ["user_id", "name"],
        name: "unique_user_template_name",
      },
      // Search index on template names
      {
        fields: ["name"],
        name: "idx_template_name",
      },
    ],
  }
);

export { EmailTemplate };
