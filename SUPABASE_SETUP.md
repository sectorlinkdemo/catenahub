# Supabase Backend Setup Guide

This document provides step-by-step instructions for setting up the Supabase backend for Catena Hub.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Choose your organization
4. Enter project details:
   - **Name**: `catenahub` (or your preferred name)
   - **Database Password**: Generate a strong password (save it securely)
   - **Region**: Choose closest to your users
5. Click "Create new project" and wait for provisioning (~2 minutes)

## 2. Get Your API Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
3. Add these to your `.env` file:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

## 3. Create Database Tables

Go to **SQL Editor** in your Supabase dashboard and run the following SQL:

### Companies Table

```sql
-- Create companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic info
  name TEXT NOT NULL,
  logo TEXT,
  size TEXT,
  sector TEXT,
  
  -- Details
  services_offered TEXT,
  operations_overview TEXT,
  desired_connections TEXT,
  benefits TEXT,
  description TEXT,
  
  -- Contact
  email TEXT,
  website TEXT,
  
  -- Metadata
  active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" 
  ON companies FOR SELECT 
  USING (active = true);

CREATE POLICY "Allow authenticated insert" 
  ON companies FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow users to update their own company" 
  ON companies FOR UPDATE 
  USING (auth.uid()::text = id::text);

-- Indexes
CREATE INDEX idx_companies_sector ON companies(sector);
CREATE INDEX idx_companies_active ON companies(active);
```

### People/Contacts Table

```sql
-- Create people table
CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Personal info
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  
  -- Company relationship
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Professional details
  sector TEXT,
  offers TEXT,
  needs TEXT,
  
  -- Metadata
  active BOOLEAN DEFAULT true
);

-- Enable Row Level Security
ALTER TABLE people ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Allow public read access" 
  ON people FOR SELECT 
  USING (active = true);

CREATE POLICY "Allow authenticated insert" 
  ON people FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_people_company ON people(company_id);
CREATE INDEX idx_people_sector ON people(sector);
```

### Messages/Chat Table

```sql
-- Create messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Participants
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  
  -- Content
  content TEXT NOT NULL,
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their messages" 
  ON messages FOR SELECT 
  USING (
    auth.uid()::text = sender_id::text 
    OR auth.uid()::text = recipient_id::text
  );

CREATE POLICY "Users can send messages" 
  ON messages FOR INSERT 
  WITH CHECK (auth.uid()::text = sender_id::text);

CREATE POLICY "Users can update their received messages" 
  ON messages FOR UPDATE 
  USING (auth.uid()::text = recipient_id::text);

-- Indexes
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

### Connections/Matches Table (Optional)

```sql
-- Create connections table for tracking matches
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Companies involved
  company_a_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  company_b_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Match details
  match_score DECIMAL(3,2), -- 0.00 to 1.00
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected
  
  -- Notes
  notes TEXT,
  
  CONSTRAINT different_companies CHECK (company_a_id != company_b_id)
);

-- Enable Row Level Security
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their connections" 
  ON connections FOR SELECT 
  USING (
    auth.uid()::text = company_a_id::text 
    OR auth.uid()::text = company_b_id::text
  );

-- Indexes
CREATE INDEX idx_connections_company_a ON connections(company_a_id);
CREATE INDEX idx_connections_company_b ON connections(company_b_id);
CREATE INDEX idx_connections_status ON connections(status);
```

## 4. Set Up Storage (Optional)

For company logos and file uploads:

1. Go to **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. Name it `company-assets`
4. Set it to **Public** if you want logos to be publicly accessible
5. Click "Create bucket"

### Storage Policies

```sql
-- Allow public read access to company assets
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'company-assets');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'company-assets' 
    AND auth.role() = 'authenticated'
  );
```

## 5. Enable Authentication (Optional)

1. Go to **Authentication** > **Providers**
2. Enable desired providers:
   - **Email** (for email/password auth)
   - **Google**, **GitHub**, etc. (for OAuth)
3. Configure redirect URLs in provider settings
4. For local development, add: `http://localhost:5173`

## 6. Seed Sample Data (Optional)

```sql
-- Insert sample companies
INSERT INTO companies (name, size, sector, services_offered, needs, description, active)
VALUES 
  ('Teachify', '11–50', 'Education', 'Corporate English training, language courses', 'Partnerships with tech providers', 'We provide English language training for businesses across Europe with custom programmes for employees.', true),
  ('LinguaPro', '1–10', 'Education', 'Corporate language courses', 'Cloud hosting solutions', 'Professional language training services.', true),
  ('CloudNet', '51–200', 'Tech', 'Cloud infrastructure', 'Language training for staff', 'Enterprise cloud solutions provider.', true),
  ('AlphaTech', '11–50', 'Tech', 'AI language tools', 'Partnerships with HR providers', 'AI-powered language learning platform.', true);

-- Insert sample people (replace company_id with actual UUIDs from companies table)
INSERT INTO people (name, email, company_id, sector, offers, needs, active)
SELECT 
  'Alice Johnson',
  'alice.johnson@linguapro.com',
  id,
  'Education',
  'Corporate language courses',
  'Cloud hosting solutions',
  true
FROM companies WHERE name = 'LinguaPro';
```

## 7. Test the Connection

In your React app, test the Supabase connection:

```typescript
import { supabase } from './lib/supabase';

// Test query
const { data, error } = await supabase
  .from('companies')
  .select('*')
  .limit(5);

console.log('Companies:', data);
```

## 8. Enable Realtime (Optional)

For live chat and notifications:

1. Go to **Database** > **Replication**
2. Enable replication for tables you want to subscribe to (e.g., `messages`)
3. In your React app:

```typescript
const channel = supabase
  .channel('messages')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();
```

## 9. Security Checklist

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Appropriate policies for read/write access
- ✅ Environment variables not committed to git
- ✅ Use `anon` key for client-side (never use `service_role` key in frontend)
- ✅ Validate and sanitize user inputs
- ✅ Set up email confirmations for auth (if using email auth)

## Troubleshooting

### "relation does not exist" error
- Make sure you ran all SQL migrations
- Check table names are correct (case-sensitive)

### "permission denied" error
- Verify RLS policies are set correctly
- Check if user is authenticated when required

### Connection issues
- Verify `.env` file has correct credentials
- Ensure Supabase project is active (not paused)
- Check network/firewall settings

## Next Steps

1. Replace mock data in `DashboardPage.tsx` with real Supabase queries
2. Implement authentication flows
3. Add real-time subscriptions for chat
4. Build matching algorithm (Edge Function or stored procedure)
5. Deploy to production and update environment variables
