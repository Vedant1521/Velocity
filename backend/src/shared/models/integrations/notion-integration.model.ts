import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../../config/db";

// The NotionIntegration model stores workspace-specific metadata 
// for the Notion integration, connected 1:1 to the parent Integration table.
class NotionIntegration extends Model<
  InferAttributes<NotionIntegration>,
  InferCreationAttributes<NotionIntegration>
> {
  declare integration_id: string; // Foreign key & Primary key linking to integrations(id)
  declare workspace_id: string; // Notion workspace identifier
  declare workspace_name: string | null; // Friendly name of the connected workspace
  declare bot_id: string; // Internal Notion bot identifier for authorization
}

NotionIntegration.init(
  {
    integration_id: {
      type: DataTypes.UUID,
      allowNull: false,
      primaryKey: true, // Used as the primary key since it's a strict 1:1 link
    },
    workspace_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    workspace_name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    bot_id: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "notionIntegration",
    tableName: "notion_integrations",
    timestamps: false, // Turn off timestamps since these static details change rarely
    underscored: true,
    indexes: [
      {
        fields: ["integration_id"],
      },
    ],
  }
);

export { NotionIntegration };
