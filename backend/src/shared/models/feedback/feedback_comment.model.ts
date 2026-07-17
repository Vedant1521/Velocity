import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../../config/db";

// The FeedbackComment model stores comments written by users on feedback posts,
// enabling discussion threads on requested features/bugs.
class FeedbackComment extends Model<
  InferAttributes<FeedbackComment>,
  InferCreationAttributes<FeedbackComment>
> {
  declare id: CreationOptional<string>; // Primary ID UUID
  declare postId: string; // Foreign key referencing feedback_posts(id)
  declare userId: string; // Foreign key referencing users(id) (the comment author)
  declare body: string; // The rich text comment content
  declare created_at: CreationOptional<Date>;
  declare updated_at: CreationOptional<Date>;
  declare deleted_at: CreationOptional<Date | null>; // Enabled for soft deletes
}

FeedbackComment.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "feedback_posts", key: "id" },
      onDelete: "CASCADE", // Automatically delete comments if parent feedback post is deleted
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE", // Automatically delete comments if user account is deleted
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    modelName: "feedback_comment",
    tableName: "feedback_comments",
    timestamps: true,
    underscored: true,
    paranoid: true, // Enables soft deletes

    createdAt: "created_at",
    updatedAt: "updated_at",
    deletedAt: "deleted_at",

    // Indices to speed up queries when loading comments for a specific post
    indexes: [{ fields: ["post_id"] }, { fields: ["user_id"] }],
  }
);

export { FeedbackComment };
