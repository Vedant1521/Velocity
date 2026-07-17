import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/db";

// 1. Defining standard enum for allowed signup methods
export enum SignupMethod {
  GOOGLE = "google",
  MICROSOFT = "microsoft",
  EMAIL = "email",
} 

// 2. Main TypeScript class representing our User table structure
class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  // "declare" informs TS compiler that these properties exist on the model
  // but their getter/setter execution is handled dynamically by Sequelize.
  declare id: CreationOptional<string>; // CreationOptional means generated automatically
  declare fullName: string;
  declare email: string;
  declare password: string | null; // Nullable to accommodate passwordless OAuth signups
  declare avatar: string;
  declare signupMethod: SignupMethod;
  declare googleId: string | null;
  declare microsoftId: string | null;
  declare refreshToken: CreationOptional<string | null>; // Session refresh token

  // Audit Timestamps
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date | null>; // Managed for soft deletes
}

// 3. Initializing the model mappings in database schema
User.init(
  {
    id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4, // Auto-generates a unique random string ID
    },
    fullName: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true, // Prevents duplicate email accounts in database
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    avatar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    signupMethod: {
      type: DataTypes.ENUM(
        SignupMethod.EMAIL,
        SignupMethod.GOOGLE,
        SignupMethod.MICROSOFT
      ),
      allowNull: false,
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    googleId: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    microsoftId: {
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
    sequelize, // Pass connection instance
    modelName: "user",
    tableName: "users",

    timestamps: true, // Auto-manages created_at and updated_at
    underscored: true, // Translates JS camelCase to Postgres snake_case (e.g. signupMethod -> signup_method)

    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",

    paranoid: true, // Enables soft deletes

    indexes: [
      {
        fields: ["id"], // Speeds up search scans by primary key ID
      },
    ],
  }
);

export { User };
