# Catena Hub

A business networking platform built with React, TypeScript, Vite, and Supabase. Catena Hub connects businesses across industries to foster cross-sector partnerships and collaboration.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: CSS Modules

## Project Structure

```
catenahub/
├── public/
│   ├── assets/           # Static images (logos, hero backgrounds)
│   └── hero-bg.jpg
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Header.tsx
│   │   ├── Header.module.css
│   │   ├── Footer.tsx
│   │   └── Footer.module.css
│   ├── layout/           # Layout wrappers
│   │   ├── MainLayout.tsx
│   │   └── MainLayout.module.css
│   ├── pages/            # Route pages
│   │   ├── HomePage.tsx
│   │   ├── JoinPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   └── *.module.css
│   ├── lib/              # Utilities and clients
│   │   └── supabase.ts   # Supabase client configuration
│   ├── data/             # Mock data and types
│   │   └── mockData.ts
│   ├── styles/           # Global styles
│   │   └── global.css
│   ├── App.tsx           # Main app with routes
│   └── main.tsx          # Entry point
├── .env.example          # Environment variable template
├── index.html            # HTML entry
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

### Installation

1. **Clone the repository** (or navigate to the project folder):

   ```bash
   cd catenahub
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Set up environment variables**:

   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` and add your Supabase credentials:

   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Run the development server**:

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`.

## Supabase Setup

### Database Schema

Create the following tables in your Supabase project:

#### `companies` table

```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  logo TEXT,
  size TEXT,
  sector TEXT,
  services_offered TEXT,
  operations_overview TEXT,
  desired_connections TEXT,
  benefits TEXT,
  description TEXT
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Allow public read access (adjust as needed)
CREATE POLICY "Allow public read access" ON companies
  FOR SELECT USING (true);

-- Allow authenticated users to insert
CREATE POLICY "Allow authenticated insert" ON companies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
```

#### `people` table (optional, for contacts)

```sql
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  company_id UUID REFERENCES companies(id),
  sector TEXT,
  offers TEXT,
  needs TEXT
);

ALTER TABLE people ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON people
  FOR SELECT USING (true);
```

#### `messages` table (optional, for chat)

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sender_id UUID,
  recipient_id UUID,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own messages" ON messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can insert messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

### Authentication (Optional)

If you want to add user authentication:

1. Enable Email/Password or OAuth providers in your Supabase dashboard under **Authentication > Providers**.
2. Use `supabase.auth.signUp()`, `supabase.auth.signIn()`, and `supabase.auth.signOut()` in your React components.

## Available Scripts

- **`npm run dev`** — Start the development server
- **`npm run build`** — Build for production
- **`npm run preview`** — Preview the production build locally
- **`npm run typecheck`** — Run TypeScript type checking

## Features

- **Landing Page**: Hero section with call-to-action and "How It Works" cards
- **Join Page**: Embedded Google Form (placeholder) for onboarding
- **Signup Page**: Form to submit company profile to Supabase
- **Dashboard**: Mock interface showing people, chat, announcements, calendar, files, and company profile

## Integration Points

### Current Implementation

- **Supabase Client**: Configured in `src/lib/supabase.ts`
- **Signup Form**: `SignupPage.tsx` inserts company data into Supabase `companies` table
- **Mock Data**: Dashboard uses local mock data from `src/data/mockData.ts`

### Next Steps for Full Backend Integration

1. **Replace mock data** with real Supabase queries:
   - Fetch companies and people from Supabase in `DashboardPage.tsx`
   - Use `supabase.from('companies').select()` and `supabase.from('people').select()`

2. **Add authentication**:
   - Implement login/signup flows
   - Protect routes with auth guards
   - Associate companies with user accounts

3. **Real-time features**:
   - Use Supabase Realtime for live chat updates
   - Subscribe to table changes for notifications

4. **File uploads**:
   - Use Supabase Storage for company logos and documents
   - Update forms to handle file uploads

5. **Matching algorithm**:
   - Implement backend logic (Edge Functions or stored procedures) to match companies by sector and needs

## Deployment

### Deploy to Vercel/Netlify

1. Build the project:

   ```bash
   npm run build
   ```

2. Deploy the `dist` folder to your hosting provider.

3. Set environment variables in your hosting dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## License

ISC

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.
