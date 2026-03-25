<a href="https://expense.fyi">
<p align="center"><img alt="Expense Mate logo" width="100" height="100" src="./public/icons/logo.svg"></p>
<h1 align="center">Expense Mate</h1>
</a>

<p align="center">
  Expense Mate is an open-source expense tracker application to effortlessly track and manage your expenses. 
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> �
  <a href="#tech-stack"><strong>Tech Stack</strong></a> �
  <a href="#prerequisites"><strong>Prerequisites</strong></a> �
  <a href="#local-setup"><strong>Local Setup & Installation</strong></a> �
  <a href="#ai-insights-gemini-optional"><strong>AI Insights</strong></a>
</p>
<br/>

## Introduction

Expense Mate is an open-source application to effortlessly track and manage your incomes, expenses, and investments. It includes powerful AI-driven financial insights using the Budget IQ feature.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **UI & Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
- **Charts & Data Viz:** [Tremor](https://tremor.so/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Database Engine:** [PostgreSQL](https://www.postgresql.org/)
- **AI Integrations:** Google Gemini

## Prerequisites

Before starting, make sure you have the following installed on your machine:
1. **Node.js** (v18 or higher recommended)
2. **PostgreSQL** (pg) installed and running locally, or a hosted database like Supabase / Vercel Postgres.

## Local Setup & Installation

Follow these steps to get the app running locally on your machine:

**1. Clone the repository and install dependencies:**
```bash
npm install
```

**2. Configure Environment Variables:**
Create your local environment files:
```bash
cp .env.example .env
```
Inside your `.env` file, update the `DATABASE_URL` with your running PostgreSQL connection string:
```env
DATABASE_URL="postgresql://<USER>:<PASSWORD>@localhost:5432/<DB_NAME>"
```

**3. Setup Database Schema and Seed Data:**
Run Prisma to create the database tables and seed it with demo records.
```bash
# Push the schema structure to postgres
npx prisma db push

# Generate Prisma Client
npx prisma generate

# Run the seed file to populate demo data
node prisma/seed.js
```
*(Note: If you have a `dbpush` script configured in package.json, you can also run `npm run dbpush`)*

**4. Start the Application:**
Start the Next.js development server:
```bash
npm run dev
```

The application will now be running on [http://localhost:3000](http://localhost:3000).

**Demo Account (Auto-Seeded):**
You can log in to view the pre-populated dashboard:
- **Email:** `demo@expense.local`
- **Password:** `demo1234`

## Routes

| Path      | Description                |
| --------- | -------------------------- |
| `/`         | Landing Page               |
| `/signup`   | Create a new account       |
| `/signin`   | Access existing account    |
| `/dashboard`| Main application dashboard |

## AI Insights (Gemini Optional)

You can view personalized AI financial planning using the **Expense Mate Budget IQ** feature. 
Add your valid Gemini API key in the `.env` file:

```env
GEMINI_API_KEY="your_api_key_here"
GEMINI_MODEL="gemini-2.5-flash"
```

## License

Expense Mate is open-source under the GNU Affero General Public License Version 3 (AGPLv3) or any later version.
