import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../../config/db";

// The SlackIntegration model stores configuration metadata for the Slack integration,
// linked 1:1 to the parent Integration table.
class SlackIntegration extends Model<
  InferAttributes<SlackIntegration>,
  InferCreationAttributes<SlackIntegration>
> {
  declare integration_id: string; // Foreign key & Primary key linking to integrations(id)
  declare team_id: string; // Slack team (workspace) identifier
  declare bot_user_id: string; // Bot user ID assigned to Velocity inside Slack
}

SlackIntegration.init(
  {
    integration_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true, // Used as the primary key since it's a strict 1:1 link
    },
    team_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    bot_user_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "slackIntegration",
    tableName: "slack_integrations",
    timestamps: false, // Turn off timestamps since these static details change rarely
    underscored: true,
    indexes: [
      {
        fields: ["integration_id"],
      },
    ],
  }
);

export { SlackIntegration };
