# ⚡ Velocity

An ultra-fast, minimalist, AI-powered, keyboard-first email client engineered for maximum productivity.

---

## ✨ Features

- **⚡ Keyboard-First Architecture**: Fast, shortcut-driven navigation designed for power users.
- **📬 Asynchronous Mailbox Ingestion**: Background synchronization engine powered by Redis and BullMQ.
- **🔒 Enterprise Security**: AES-256-CBC token encryption, JWT authentication, and OAuth 2.0 integration for Google & Outlook.
- **🧠 AI-Powered Intelligence**: Smart email search, thread summarization, and automated workflows.
- **🎨 M3 & Design Engineering**: Crafted with Material Design 3 tokens and Emil Kowalski design engineering principles for responsive interactions.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS / Vanilla CSS
- **Backend**: Express.js, TypeScript, PostgreSQL (Sequelize ORM), Redis, BullMQ
- **Integrations**: Google OAuth 2.0, Outlook OAuth 2.0, Elasticsearch, OpenAI / Gemini

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- PostgreSQL
- Redis

### Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Vedant1521/Velocity.git
   cd Velocity
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp ../.env.example .env
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   pnpm install
   pnpm dev
   ```

---

## 📜 License

MIT License.
