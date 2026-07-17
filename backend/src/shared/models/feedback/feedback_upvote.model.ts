import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../../config/db";

// The FeedbackUpvote model tracks upvotes cast by users on feedback posts,
// enforcing a one-upvote-per-user-per-post rule.
class FeedbackUpvote extends Model<
  InferAttributes<FeedbackUpvote>,
  InferCreationAttributes<FeedbackUpvote>
> {
  declare id: CreationOptional<string>; // Primary ID UUID
  declare postId: string; // Foreign key referencing feedback_posts(id)
  declare userId: string; // Foreign key referencing users(id)
  declare created_at: CreationOptional<Date>; // Date when the user voted
}

FeedbackUpvote.init(
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
      onDelete: "CASCADE", // Delete upvote record if parent post is deleted
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE", // Delete upvote record if user deletes account
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: "feedback_upvote",
    tableName: "feedback_upvotes",
    timestamps: false, // Disables updated_at/deleted_at since upvotes are static once cast
    underscored: true,
    indexes: [
      // Compound unique index: Enforces that a user can only upvote a post once
      {
        unique: true,
        fields: ["post_id", "user_id"],
      },
    ],
  }
);

export { FeedbackUpvote };
