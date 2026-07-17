import { User } from "./user-model";
import { Subscription } from "./subscription-model";
import { Plan } from "./plan-model";
import { EmailAccount } from "./emailAccount.model";
import { EmailTemplate } from "./email-template.model";
import { Integration } from "./integrations/integration.model";
import { TelegramIntegration } from "./integrations/telegram-integration.model";
import { SlackIntegration } from "./integrations/slack-integration.model";
import { NotionIntegration } from "./integrations/notion-integration.model";
import { FeedbackPost } from "./feedback/feedback_post.model";
import { FeedbackComment } from "./feedback/feedback_comment.model";

// ==========================================
// 1. USER & SUBSCRIPTION RELATIONSHIPS (1:N)
// ==========================================
User.hasMany(Subscription, {
  foreignKey: "user_id",
  as: "subscriptions", // Nickname for user.getSubscriptions()
});
Subscription.belongsTo(User, {
  foreignKey: "user_id",
  as: "user", // Nickname for subscription.getUser()
});

// ==========================================
// 2. PLAN & SUBSCRIPTION RELATIONSHIPS (1:N)
// ==========================================
Plan.hasMany(Subscription, {
  foreignKey: "plan_id",
  as: "subscriptions",
});
Subscription.belongsTo(Plan, {
  foreignKey: "plan_id",
  as: "plan",
});

// ==========================================
// 3. USER & EMAIL ACCOUNT RELATIONSHIPS (1:N)
// ==========================================
User.hasMany(EmailAccount, {
  foreignKey: "user_id",
  as: "emailAccounts",
});
EmailAccount.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// ==========================================
// 4. USER & EMAIL TEMPLATE RELATIONSHIPS (1:N)
// ==========================================
User.hasMany(EmailTemplate, {
  foreignKey: "user_id",
  as: "emailTemplates",
});
EmailTemplate.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// ==========================================
// 5. USER & THIRD-PARTY INTEGRATIONS (1:N)
// ==========================================
User.hasMany(Integration, {
  foreignKey: "user_id",
  as: "integrations",
});
Integration.belongsTo(User, {
  foreignKey: "user_id",
  as: "user",
});

// ==========================================
// 6. INTEGRATION SUB-TYPES (1:1 Relationships)
// ==========================================
// Telegram Integration Config
Integration.hasOne(TelegramIntegration, {
  foreignKey: "integration_id",
  as: "telegram",
});
TelegramIntegration.belongsTo(Integration, {
  foreignKey: "integration_id",
});

// Slack Integration Config
Integration.hasOne(SlackIntegration, {
  foreignKey: "integration_id",
  as: "slack",
});
SlackIntegration.belongsTo(Integration, {
  foreignKey: "integration_id",
});

// Notion Integration Config
Integration.hasOne(NotionIntegration, {
  foreignKey: "integration_id",
  as: "notion",
});
NotionIntegration.belongsTo(Integration, {
  foreignKey: "integration_id",
});

// ==========================================
// 7. FEEDBACK & FORUM RELATIONSHIPS
// ==========================================
// Post Author
FeedbackPost.belongsTo(User, { as: "author", foreignKey: "userId" });
User.hasMany(FeedbackPost, { as: "posts", foreignKey: "userId" });

// Comment Author
FeedbackComment.belongsTo(User, { as: "author", foreignKey: "userId" });
User.hasMany(FeedbackComment, { as: "comments", foreignKey: "userId" });

// Post comments chain
FeedbackPost.hasMany(FeedbackComment, { as: "comments", foreignKey: "postId" });
FeedbackComment.belongsTo(FeedbackPost, { as: "post", foreignKey: "postId" });
