SportAnytime 🏃‍♂️

> The sports slot-filling app built for NUS students.
> Find a game, fill your team, track your progress.


---

## 🔗 App Prototype : 
https://sport-anytime-ms-2.vercel.app/

---

## GitHub Repository link: 
https://github.com/krish-412/SportAnytimeMS2.git

---

## 📌 The Problem

At NUS, students regularly book sports facilities expecting a full group — then
someone drops out last minute. A 5v5 football game becomes impossible with 9
players. Currently, the only solution is frantically texting WhatsApp groups
hoping someone is free.

There is also no widely used platform in Singapore that connects athletes across
multiple sports based on skill level, availability, and location — all in one
place. Existing solutions like Decathlon Activity Finder are designed for
structured, pre-planned classes. There is nothing built for the spontaneous,
recreational athlete.

**SportAnytime fixes this.**

---

## 💡 The Solution

SportAnytime connects two groups of NUS students:

- **Hosts** — students who have a booked venue but need more players
- **Players** — students who want to play but don't have a group

Hosts post their activity with details like sport, venue, time, skill level
required, and fee. Players browse, filter by preferences, pay, and show up.
The app handles everything in between.

---

## ✨ Features

### 🔐 Authentication & Profiles
- NUS-exclusive registration restricted to @u.nus.edu email addresses
- Profile setup with display name, photo, preferred sports, and self-rated
  skill level per sport (Beginner / Intermediate / Advanced / Professional)
- Persistent login sessions across devices

### 🏠 Home
- At-a-glance view of hosting options and upcoming open activities
- Sport quick-select cards that pre-fill the host form
- Live slot availability on every activity card

### ➕ Host an Activity
- Two-step hosting form: activity details then review and post
- NUS venue suggestions pre-loaded (UTown Sports Hall, MPSH 1–6, The Deck,
  University Cultural Centre)
- Auto-creates a group chat for the activity on posting
- Success screen showing how many players are still needed

### 🔍 Explore & Join
- Horizontal date-based activity browser
- Multi-filter search by sport, difficulty, time range, and slots needed
- Activity detail page showing sport, venue, time, price, difficulty, and
  current player count
- Player roster preview before committing to join
- In-app payment flow (Apple Pay, PayLah!, Credit/Debit Card)
- Booking confirmation with "You're In 🎉" screen

### ⏳ Waitlist System
- Fully booked activities allow players to join a waitlist
- Waitlist position shown in real time (e.g. "You are #2 on the waitlist")
- First person on waitlist is automatically notified when a slot opens
- 30-minute claim window before notification passes to the next person

### 📅 Events Calendar
- Custom calendar with colour-coded active days:
  - Blue = hosting an activity that day
  - Green = playing as a participant that day
  - Split blue/green = both roles on the same day
  - Muted and smaller = no activity
- Upcoming and Past tabs with full activity details
- One-tap access to group chat from each event card

### ⭐ Post-Game Rating & AI Skill Calibration
- After each activity, participants can anonymously rate teammates (1–10)
- Rated players disappear from the list in real time — no double rating
- "Rate Your Team" button dims and changes to "Rated" once all are rated
- AI calibration engine tracks peer rating patterns over time:
  - After every 5 peer ratings, average is calculated per player
  - If deviation from self-rated level exceeds 2 points across 3 of 4
    calculation cycles, player is prompted to update their skill level
  - After 3 dismissals, skill level is auto-adjusted with a notification
- Public profiles show both Self-rated and Community-rated skill scores

### ⚡ Rep Score
- Every user has a public Rep Score out of 100 (e.g. ⚡ 94 Rep)
- Calculated from three factors:
  - Reliability (40%) — attendance vs cancellation history
  - Sportsmanship (40%) — average peer rating received
  - Activity Count (20%) — total games played
- Colour coded: green (80+), amber (50–79), red (below 50)
- Visible on profiles, player rosters, and activity cards

### 💬 Group Chat
- Auto-created for every activity when it is posted
- Accessible to confirmed participants only (host + paid players)
- WhatsApp-style chat UI with timestamps and avatars
- Host identified with 👑 badge
- Chat archived automatically after activity end time

### 🌐 Social Feed
- Live activity feed showing milestones across the community:
  - Joining or hosting activities
  - Completing games
  - Earning badges or skill upgrades
- Like button on every feed item
- Follow system (Strava-style) — Following tab shows only people you follow
- For You tab shows all community activity

### 👤 Public Profiles
- Profile photo, display name, NUS student tag
- Follower and Following counts
- Games played, Rep Score, sport skill badges
- Reliable Host badge ✓ (unlocked after 5+ successful hosted activities)
- Personal activity feed

### ⚙️ Settings
- Edit profile details, photo, sports, and skill levels
- Dark / Light mode toggle
- Notification preferences
- Payment methods management
- Followed users management

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Tailwind CSS |
| Backend & Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Deployment | Vercel |
| Version Control | GitHub |
| Payment (planned) | Stripe / PayLah! API |
| Push Notifications (planned) | Firebase Cloud Messaging |

---

## 🏗️ System Architecture

┌─────────────────────────────────────────────┐
│                   CLIENT                     │
│                 Tailwind CSS (PWA)           │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Home   │  │ Explore  │  │  Events  │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Host   │  │  Social  │  │ Settings │  │
│  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────┬───────────────────────────┘
                  │ HTTPS / REST
┌─────────────────▼───────────────────────────┐
│              SUPABASE BACKEND                │
│                                             │
│  ┌─────────────┐      ┌──────────────────┐  │
│  │  Auth Layer │      │   PostgreSQL DB   │  │
│  │ @u.nus.edu  │      │                  │  │
│  │  only       │      │ • SocialFeedPosts│  │
│  └─────────────┘      │ • Login details  │  │
│                       │ • bookings       │  │
│  ┌─────────────┐      │ • Host activity  │  │
│  │  Row Level  │      │                  │  │
│  │  Security   │      │                  │  │
│  │  (RLS)      │      │                  │  │
│  └─────────────┘      │                  │  │
│                       └──────────────────┘  │
└─────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│            EXTERNAL SERVICES                 │
│                                             │
│  Vercel (Hosting)  │  GitHub (Version Ctrl) │
│  Stripe (Payments) │  Firebase (Notifs)     │
└─────────────────────────────────────────────┘

---

## 📐 Design Decisions

### Why skill-based matching?
Self-reported skill levels on other platforms are unreliable and ruin game
quality. SportAnytime uses anonymous peer ratings after each game and an AI
calibration engine to auto-correct skill levels over time — ensuring fair,
enjoyable matches for everyone.

### Why NUS-only for v1?
The chicken-and-egg problem of marketplace apps is best solved by starting
with a dense, captive audience. NUS has thousands of student athletes, its
own facilities, and a strong sports culture — the ideal environment to
validate the product before expanding Singapore-wide.

### Why a Rep Score?
Trust is the biggest barrier to showing up and playing with strangers. A
transparent, multi-factor reputation score reduces anxiety for solo players
joining existing groups and incentivises reliable, respectful behaviour.

### Why an automatic waitlist?
Manual waitlist management creates friction and missed opportunities. An
automated queue with timed claim windows ensures slots never go unfilled
while being fair to everyone in line.

---

## 🗺️ Development Plan

### Phase 1 — Prototype ✅ Complete
Full UI prototype across all pages and user flows. Supabase authentication
integrated and functional. GitHub repository established. App deployed at
live URL.

### Phase 2 — MVP Backend (In Progress)
- Complete Supabase schema for all data entities
- Real-time activity listings and slot management
- Payment integration via Stripe sandbox
- Push notification infrastructure via Firebase

### Phase 3 — Closed Beta (NUS)
- Invite-only beta with 50 NUS student testers
- PayLah! API integration for local payments
- Performance testing, bug fixing, and UX iteration
- Feedback collection and feature refinement

### Phase 4 — NUS Full Launch
- React Native migration for native iOS and Android apps
- App Store and Google Play submission
- NUS OSA partnership for official venue data integration
- Marketing via NUS sports CCAs and hall committees

### Phase 5 — Singapore Expansion
- Open registration beyond NUS email restriction
- ActiveSG venue API integration
- Expanded sport categories and filters
- Platform fee monetisation model

---

## 💻 Software Engineering Practices

- Mobile-first responsive design with 390px baseline
- Row-level security (RLS) on all Supabase tables
- Environment variables for all sensitive credentials via .env
- Git version control with structured, descriptive commits
- Consistent design system: colour tokens, typography scale, spacing system

---

## 👥 Team

Krishna | Co-founder
Mattias | Co-founder
