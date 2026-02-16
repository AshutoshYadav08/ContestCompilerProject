# Contest Compiler (Next.js + TypeScript + Tailwind)

A frontend-first mock implementation of a contest platform with organiser and participant views, sample auth context, and fake API routes.

## Recommended database choice

For this product, **PostgreSQL** is the best primary database because:

1. Relational integrity is strong for contest/problem/submission/leaderboard entities.
2. You can use JSONB for flexible settings/test-case metadata.
3. Strong indexing and SQL analytics are useful for standings and history pages.
4. Easy to scale reads with replicas and cache leaderboard views.

### Suggested production stack

- **DB**: PostgreSQL
- **ORM**: Prisma or Drizzle
- **Queue**: Redis/BullMQ for async Judge0 callback handling
- **Cache**: Redis for live standings and contest room state

## Proposed schema (SQL-style)

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT CHECK (role IN ('organiser', 'participant')) NOT NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  rating INT DEFAULT 1200,
  college TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE contests (
  id TEXT PRIMARY KEY,
  organiser_id TEXT NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  visibility TEXT CHECK (visibility IN ('public', 'private')) DEFAULT 'public',
  start_time TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL,
  settings JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE problems (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  statement TEXT NOT NULL,
  constraints JSONB NOT NULL,
  points INT NOT NULL,
  tags TEXT[] DEFAULT '{}'
);

CREATE TABLE contest_problems (
  contest_id TEXT REFERENCES contests(id) ON DELETE CASCADE,
  problem_id TEXT REFERENCES problems(id) ON DELETE CASCADE,
  display_order INT NOT NULL,
  PRIMARY KEY (contest_id, problem_id)
);

CREATE TABLE join_requests (
  id TEXT PRIMARY KEY,
  contest_id TEXT REFERENCES contests(id) ON DELETE CASCADE,
  participant_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) NOT NULL,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(contest_id, participant_id)
);

CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  contest_id TEXT REFERENCES contests(id) ON DELETE CASCADE,
  problem_id TEXT REFERENCES problems(id) ON DELETE CASCADE,
  participant_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  language TEXT NOT NULL,
  source_code TEXT NOT NULL,
  status TEXT NOT NULL,
  score INT DEFAULT 0,
  execution_ms INT,
  memory_kb INT,
  judge0_token TEXT,
  submitted_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submissions_contest_participant ON submissions(contest_id, participant_id);
CREATE INDEX idx_submissions_contest_problem ON submissions(contest_id, problem_id);
```


## Realtime mock behavior (no backend)

- Uses localStorage as an in-browser mock database (`lib/mockDb.ts`).
- Uses fake async API wrappers (`lib/apiClient.ts`) so replacing with real backend `fetch` later is straightforward.
- Realtime updates are simulated through polling + `mock-db-updated` window event.

## Routes implemented

- `/`
- `/login-test`
- `/createcontest`
- `/history-participation`
- `/history-contests`
- `/contest/:id`
- `/contest/:id/:problemid`

## Fake API routes

- `/api/users`
- `/api/contests`
- `/api/contest?id=<contestId>`
- `/api/sample-data`

## Sample login IDs

- Organisers: `org_1`, `org_2`
- Participants: `p_1` ... `p_6`

## Sample contest IDs

- Running: `contest_live_101`
- Upcoming: `contest_upcoming_202`
- Ended: `contest_ended_303`

## Run locally

```bash
npm install
npm run dev
```
