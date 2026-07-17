import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../../config/db";

// Enums defining type of feedback
export enum PostType {
  FEATURE_REQUEST = "feature_request",
  BUG_REPORT = "bug_report",
  IMPROVEMENT = "improvement",
  QUESTION = "question",
}

// Enums defining lifecycle status of feedback posts
export enum PostStatus {
  OPEN = "open",
  UNDER_REVIEW = "under_review",
  CLOSED = "closed",
}

// Main FeedbackPost Model
class FeedbackPost extends Model<
  InferAttributes<FeedbackPost>,
  InferCreationAttributes<FeedbackPost>
> {
  declare id: CreationOptional<string>; // Primary ID UUID
  declare userId: string; // Foreign key referencing users(id)
  declare type: PostType; // Post category (e.g. Bug report)
  declare status: CreationOptional<PostStatus>; // Current status (e.g. Under review)
  declare title: string; // Short summary
  declare description: string; // Detailed description of request
  declare attachments: CreationOptional<string[]>; // Image attachments (stored in Cloudinary)
  declare upvoteCount: CreationOptional<number>; // Total votes count
  declare commentCount: CreationOptional<number>; // Total comments counter

  // Audit Timestamps
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date | null>; // Enabled for soft deletes
}

FeedbackPost.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE", // Delete all posts if user account is deleted
    },
    type: {
      type: DataTypes.ENUM(...Object.values(PostType)),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(...Object.values(PostStatus)),
      allowNull: false,
      defaultValue: PostStatus.OPEN,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.TEXT), // Native PostgreSQL array of image URL strings
      allowNull: false,
      defaultValue: [],
    },
    upvoteCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    commentCount: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "feedback_post",
    tableName: "feedback_posts",
    timestamps: true,
    underscored: true,
    paranoid: true, // Enables soft deletes

    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",

    // Indices to speed up queries when sorting by date, voting rank, status or type
    indexes: [
      { fields: ["user_id"] },
      { fields: ["type"] },
      { fields: ["status"] },
      { fields: ["created_at"] },
    ],
  }
);

export { FeedbackPost };
