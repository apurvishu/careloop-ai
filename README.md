# CareLoop AI
### Intelligent Elderly Care & Safety Ecosystem

> **"CareLoop AI doesn't just remind elderly people to take medicine. It connects patients, caregivers, and families so important healthcare routines are less likely to be overlooked."**

---

## 1. Project Overview

**CareLoop AI** is a smart, interconnected healthcare coordination ecosystem engineered for elderly individuals, primary caregivers (family members, nurses), and authorized family circles. It bridges the critical gap between passive medicine alarms and proactive family safety by introducing a **backend-driven multi-tier escalation engine**, **Google Gemini AI care synthesis**, and an **elderly-first voice and accessibility interface**.

---

## 2. System Architecture

```
[ Elderly Patient / Voice Interface ]
                 │
                 ▼
[ CareLoop Web Application (Next.js 14 App Router) ]
    ├── Client State: AuthContext & AccessibilityContext
    ├── Interactive Dashboard & Timeline
    ├── Adherence Analytics (Recharts Engine)
    ├── Emergency Care Card (Click-to-Call + Print)
                 │
                 ▼
[ Stateless Cloud Backend (Google Cloud Run) ]
    ├── /api/cron/reminder-worker  ◄── Authenticated via OIDC / CRON_SECRET from Google Cloud Scheduler
    ├── /api/ai/summary            ◄── Google Gemini API (Structured JSON Prompting)
    ├── /api/medications/*         ◄── Dose Confirmation, Snooze, Skip, Unable Handlers
    ├── /api/alerts/*              ◄── Caregiver Acknowledgment Protocol
    ├── /api/family/*              ◄── Expiring Single-Use Invitation Tokens
    └── /api/health                ◄── Cloud Run Liveness & Readiness Probes
                 │
                 ▼
[ Data Layer: Firebase Firestore & Firestore Security Rules ]
    ├── users, patients, patientMemberships (Strict RBAC & IDOR Protection)
    ├── medications, scheduledDoses, caregiverAlerts, activityLogs
    └── emergencyProfiles, appointments, aiCareSummaries
```

---

## 3. Key Features

### A. Smart Medication Escalation Engine
- **Deterministic Multi-Stage Escalation:**
  - `9:00 AM`: Medication reminder generated; senior receives visual and voice reminder.
  - `9:15 AM`: If unconfirmed, **Tier 1 Caregiver Alert** dispatched to primary caregiver.
  - `9:30 AM`: If caregiver alert remains unacknowledged, automatically escalated to **Tier 2 Family Contact**.
- **Fail-Safe Business Rules:**
  - If the patient confirms taking medicine, the escalation chain **stops immediately** and all open alerts resolve.
  - Caregiver acknowledgment **does NOT** mark medicine as taken (preserves clinical integrity).
  - Snoozing shifts the grace period window safely.
  - Reporting inability to take triggers an immediate high-priority caregiver alert.
  - Idempotent event keys prevent duplicate reminders and duplicate alerts across concurrent executions.

### B. Gemini AI Care Insights
- Server-side synthesis using Google Gemini API (`gemini-1.5-flash`).
- Summarizes 6 clinical-safe dimensions:
  1. Overall care activity
  2. Medication adherence rate
  3. Missed or unconfirmed doses review
  4. Upcoming doctor visits
  5. Recent regimen changes
  6. Suggested administrative follow-ups for family caregivers.
- **Strict Clinical Guardrails:** Zero diagnosis, zero dosage recommendations, zero medical alterations, with deterministic fallback engine if API key is absent.

### C. Elderly Voice & Accessibility Mode (WCAG 2.2 AA)
- Integrated Web Speech API (`SpeechRecognition` + `SpeechSynthesis`) with high-contrast, large-button design.
- Voice commands:
  - *"What medicine should I take now?"*
  - *"When is my next appointment?"*
  - *"Show my medication history."*
  - *"Remind me in 15 minutes."*
  - *"I need caregiver assistance."*
- Multi-lingual architecture ready for English (`en-US`), Hindi (`hi-IN`), and Kannada (`kn-IN`).

### D. Adherence Analytics Dashboard
- Adherence Formula: `(Confirmed Taken Doses / Eligible Scheduled Doses) × 100`.
- Daily, weekly, and monthly tracking with interactive Recharts (Line, Bar, Pie charts).
- Pending future doses remain visible without penalizing the patient's adherence score.

### E. Prominent Emergency Care Card
- One-click access to patient identification, blood group, allergies (e.g. Penicillin, Sulfa), and critical conditions.
- Click-to-call emergency contacts (`tel:`).
- Print-friendly layout for paramedics or physical refrigerator placement.

---

## 4. Technology Stack

- **Framework:** Next.js 14 (App Router, standalone container output)
- **Language:** TypeScript 5 (Strict Mode, 100% typed)
- **UI & Styling:** React 18, Tailwind CSS, Lucide Icons
- **Data Visualizations:** Recharts 2
- **Validation:** Zod schemas for all APIs and inputs
- **Backend Services:** Node.js, Firebase Admin SDK, Firebase Firestore
- **AI Engine:** Google Gemini API (`@google/generative-ai`)
- **Automated Testing:** Vitest (Unit & Integration), Playwright (E2E)
- **Containerization & Cloud:** Docker (multi-stage non-root container), Google Cloud Run, Google Cloud Scheduler

---

## 5. Folder Structure

```
careloop_ai/
├── src/
│   ├── app/
│   │   ├── layout.tsx                # Root layout with Auth & Accessibility Providers
│   │   ├── page.tsx                  # 1. Landing Page
│   │   ├── login/page.tsx            # 2. Login Page
│   │   ├── register/page.tsx         # 3. Registration Page
│   │   ├── forgot-password/page.tsx  # 4. Forgot Password Page
│   │   ├── onboarding/
│   │   │   ├── patient/page.tsx      # 5. Patient Onboarding Page
│   │   │   └── caregiver/page.tsx    # 6. Caregiver Onboarding Page
│   │   ├── dashboard/page.tsx        # 7. Main Dashboard & Live Timeline
│   │   ├── medications/
│   │   │   ├── page.tsx              # 8. Medication Management Page
│   │   │   └── history/page.tsx      # 9. Medication History Page
│   │   ├── appointments/page.tsx     # 10. Appointment Manager Page
│   │   ├── family/page.tsx           # 11. Family & Escalation Management Page
│   │   ├── analytics/page.tsx        # 12. Adherence Analytics Page
│   │   ├── ai-insights/page.tsx      # 13. AI Care Insights Page
│   │   ├── emergency/page.tsx        # 14. Emergency Care Card Page
│   │   ├── notifications/page.tsx    # 15. Notification Center Page
│   │   ├── accessibility/page.tsx    # 16. Accessibility Settings Page
│   │   ├── settings/page.tsx         # 17. Profile & Settings Page
│   │   └── api/
│   │       ├── health/route.ts       # Health probe endpoint
│   │       ├── cron/reminder-worker/ # Background reminder & escalation worker
│   │       └── ai/summary/route.ts   # Gemini AI summary endpoint
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx            # Header with role switcher & accessibility quick-toggles
│   │   │   ├── Sidebar.tsx           # Ecosystem navigation
│   │   │   ├── LiveCareStatus.tsx    # Live Care Status, Adherence Ring, Quick Actions
│   │   │   ├── ActiveAlertPanel.tsx  # Unresolved alerts & Escalation timeline
│   │   │   ├── DemoController.tsx    # Interactive hackathon demo evaluation bar
│   │   │   └── VoiceFloatingWidget.tsx # Elderly voice assistant floating widget
│   ├── context/
│   │   ├── AuthContext.tsx           # RBAC user & active patient context
│   │   └── AccessibilityContext.tsx  # Font scaling, high contrast, speech settings
│   ├── lib/
│   │   ├── adherence/calculator.ts   # Mathematical adherence formula implementation
│   │   ├── db/
│   │   │   ├── mock-store.ts         # High-fidelity stateful store & seed database
│   │   │   └── service.ts            # Centralized database CRUD & audit logging
│   │   ├── escalation/engine.ts      # Core Smart Medication Escalation Engine
│   │   ├── firebase/
│   │   │   ├── config.ts             # Client Firebase initialization
│   │   │   └── admin.ts              # Firebase Admin SDK initialization
│   │   ├── gemini/client.ts          # Gemini AI client with strict clinical safety
│   │   ├── speech/voice-service.ts   # Web Speech API speech recognition & synthesis
│   │   ├── constants.ts              # System constants, colors, default intervals
│   │   └── validation.ts             # Zod input validation schemas
│   └── types/index.ts                # TypeScript strict interface definitions
├── scripts/
│   └── seed.ts                       # Database seeding script
├── firestore.rules                   # Restrictive RBAC security rules
├── firestore.indexes.json            # Firestore collection query indexes
├── Dockerfile                        # Multi-stage production container
├── cloudbuild.yaml                   # Google Cloud Build deployment configuration
└── vitest.config.ts                  # Vitest test runner configuration
```

---

## 6. Installation & Local Development

### Prerequisites
- Node.js 18+ (tested on Node 20 / 24)
- npm or pnpm

### Step 1: Clone and Install
```bash
git clone https://github.com/your-org/careloop_ai.git
cd careloop_ai
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(CareLoop runs out of the box in Demo Mode even without live cloud keys!)*

### Step 3: Run Database Seed Script
```bash
npm run seed
```

### Step 4: Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Automated Testing

Run the full unit and integration test suite:
```bash
npm test
```

Run tests with test coverage:
```bash
npx vitest run --coverage
```

Run Playwright End-to-End tests:
```bash
npx playwright test
```

---

## 8. Running the Medication Reminder Worker

### Triggering via Local API Call:
```bash
curl -X POST http://localhost:3000/api/cron/reminder-worker \
  -H "Authorization: Bearer careloop-hackathon-demo-cron-secret-key-12345"
```

### Triggering via Dashboard UI:
Judges can click the **"Run Escalation Engine"** button directly on the **Hackathon Evaluation Bar** at the top of the dashboard to trigger the worker interactively.

---

## 9. Google Cloud Run & Cloud Scheduler Deployment

### Step 1: Build & Deploy Container to Cloud Run
```bash
# Build with Google Cloud Build
gcloud builds submit --config=cloudbuild.yaml

# Or build and deploy directly:
gcloud run deploy careloop-ai \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,CRON_SECRET=your-secure-secret-token
```

### Step 2: Configure Google Cloud Scheduler
Create a recurring 5-minute job to trigger the reminder worker:
```bash
gcloud scheduler jobs create http careloop-escalation-worker \
  --schedule="*/5 * * * *" \
  --uri="https://careloop-ai-<your-run-id>.a.run.app/api/cron/reminder-worker" \
  --http-method=POST \
  --headers="Authorization=Bearer your-secure-secret-token" \
  --time-zone="Asia/Kolkata" \
  --description="CareLoop AI 5-minute medication reminder and escalation cron"
```

---

## 10. Step-by-Step Demonstration Workflow (For Judges)

1. **Sign In:** Go to `/login` and select **David Vance (Primary Caregiver)** or **Eleanor Vance (Patient)**.
2. **View Live Care Status:** Notice the **Live Care Status**, **7-Day Adherence Score**, and **Today's Medication Timeline**.
3. **Simulate Missed Dose:** On the evaluation bar, click **"1. Simulate Missed Dose"** (rewinds dose time past 15-minute grace period).
4. **Run Escalation Engine:** Click **"2. Run Escalation Engine"**.
5. **Observe Tier 1 Alert:** Notice the high-priority **Active Alert Panel** appear with red badge and audio notification.
6. **Simulate Family Escalation:** Click **"3. Escalate to Family"**. Notice alert escalate to Sarah Vance (Daughter) in the escalation timeline.
7. **Acknowledge Alert:** Click **"Acknowledge Alert"**. Notice that the alert acknowledges, stopping family escalation, but **does NOT** mark medicine as taken!
8. **Record Patient Confirmation:** Click **"Mark Taken"** on the medication card. The dose confirms, the alert resolves automatically, and adherence score updates in real-time.
9. **AI Care Insights:** Navigate to `/ai-insights` and observe the structured 6-point clinical summary generated by Google Gemini.
10. **Voice Assistant:** Click the microphone floating button in the bottom-right and speak: *"What medicine should I take now?"*
11. **Emergency Card:** Navigate to `/emergency` to view the paramedic-ready emergency care card with click-to-call contacts.

---

## 11. Security & Clinical Guardrails

- **Strict RBAC & Membership Checks:** Every patient record is verified against `patientMemberships` to prevent Insecure Direct Object References (IDOR).
- **Zod Validation:** Every input field is validated before reaching business services.
- **Single-Use Invitation Tokens:** Family invitations are single-use tokens with 48-hour expirations.
- **Deterministic AI Safety:** Gemini API prompts are strictly constrained to administrative reviews. Diagnostic advice and dosage changes are programmatically prohibited.
