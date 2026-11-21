# SkillLoop AI

**An adaptive practice, feedback and mastery loop for working learners with irregular schedules.**

Build for Campus 2026 · Track: EdTech · Challenge HS-0571 (Hard) · Team DEV SEC

</div>

---

## The Problem

> *An Adult-Learning Provider: learners have resources but no reliable way to practise.*

Working learners have courses, PDFs and videos, but their shifts and family duties change every week. Today they have no dependable way to **practise**, get **timely feedback** and **track mastery**. When they miss a few days, most tools punish them with broken streaks and growing backlogs, and there is no clear way back.

The hackathon challenge asks for:

- An adaptive learning loop with meaningful feedback and progress evidence
- A clear recovery path when things go wrong
- Support for multiple languages and accessible content formats
- Measurable learning progress on a realistic cohort
- Educator control over content and assessment

## Our Solution

SkillLoop AI turns existing learning material into a continuous loop that adapts to the learner's time, language and level.

```
   ┌──────────┐     ┌───────────┐     ┌──────────┐     ┌────────────────┐
   │ Practise │ ──▶ │ Feedback  │ ──▶ │ Mastery  │ ──▶ │ Adapt/Recover  │
   └──────────┘     └───────────┘     └──────────┘     └────────────────┘
         ▲                                                      │
         └──────────────────────────────────────────────────────┘
```

1. **Practise:** short AI-generated exercises built from educator-approved content, sized to the time the learner has (5, 10 or 20 minutes).
2. **Feedback:** instant, specific hints and explanations in the learner's chosen language.
3. **Mastery:** a per-skill mastery score updates after every attempt, so progress is visible.
4. **Adapt / Recover:** the next task targets weak skills, and after a gap a short "welcome back" plan helps the learner catch up without losing progress.

## Key Features

| Area | What it does |
|---|---|
| Adaptive practice | Picks the next exercise from the learner's weakest skills and available time |
| Meaningful feedback | AI explanations that say what went wrong and what to do next |
| Progress evidence | Per-skill mastery, practice consistency and time-to-mastery |
| Recovery path | Missed days never reset mastery; refresher sessions and lighter plans for busy weeks |
| Multi-language | Interface and feedback in multiple languages, including English and Urdu |
| Accessible formats | Text, audio and bite-size cards; adjustable text size; high contrast; keyboard-friendly |
| Educator control | Review and approve content and AI-generated questions; set assessment rules; cohort dashboard |

## Measuring Learning Progress

We evaluate the loop on a realistic cohort of working learners using:

- **Mastery gain:** pre-test vs current score per skill
- **Practice consistency:** sessions per week, including busy weeks
- **Recovery rate:** share of lapsed learners who return and resume
- **Time to mastery:** minutes of practice needed per skill

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite (TypeScript) |
| Backend | Node.js server in TypeScript (`server.ts`) |
| AI | Google Gemini API |
| Database / ORM | Drizzle ORM |
| Platform services | Firebase |

## Project Structure

```
SkillLoop-AI/
├── src/                          # Frontend application
├── server/                       # Backend modules
├── server.ts                     # Server entry point
├── drizzle/                      # Database schema and migrations
├── index.html                    # Vite entry
├── .env.example                  # Environment variable template
├── firebase-applet-config.json   # Firebase configuration
└── package.json
```

## Getting Started

**Prerequisites:** Node.js 18 or newer, and a [Gemini API key](https://aistudio.google.com/app/apikey).

```bash
# 1. Clone the repository
git clone https://github.com/fadii1/SkillLoop-AI.git
cd SkillLoop-AI

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local
# then set GEMINI_API_KEY in .env.local

# 4. Run the app
npm run dev
```

## How It Meets the Challenge

| Requirement | How SkillLoop AI addresses it |
|---|---|
| Adaptive learning loop | Practise → Feedback → Mastery → Adapt, driven by per-skill mastery |
| Meaningful feedback | Instant AI explanations in the learner's language |
| Progress evidence | Mastery scores, consistency and time-to-mastery per learner and cohort |
| Recovery path | Progress is kept after gaps; refresher and lighter plans |
| Multiple languages | Learner-selected language for interface and feedback |
| Accessible formats | Text, audio, cards, adjustable size, high contrast |
| Educator control | Content approval, assessment rules, cohort dashboard |

## Roadmap

- More languages and community-contributed translations
- Offline-friendly practice for low-connectivity learners
- Reminders that adapt to each learner's real schedule
- Richer educator analytics and exportable progress reports

## Team DEV SEC

- Zainab Bibi
- Dur e Shehwar
- Syed Sabeeh Shah
- Fahad Ali

Built for **Build for Campus 2026**.


## Project Screenshots

### Screenshot 1
![Screenshot 1](<Screenshot 2026-11-21 190715.png>)

### Screenshot 2
![Screenshot 2](<Screenshot 2026-11-21 190905.png>)

### Screenshot 3
![Screenshot 3](<Screenshot 2026-11-21 191115.png>)

### Screenshot 4
![Screenshot 4](<Screenshot 2026-11-21 191216.png>)

### Screenshot 5
![Screenshot 5](<Screenshot 2026-11-21 191306.png>)

### Screenshot 6
![Screenshot 6](<Screenshot 2026-11-21 191338.png>)

### Screenshot 7
![Screenshot 7](<Screenshot 2026-11-21 191442.png>)

### Screenshot 8
![Screenshot 8](<Screenshot 2026-11-21 191541.png>)

### Screenshot 9
![Screenshot 9](<Screenshot 2026-11-21 191620.png>)

### Screenshot 10
![Screenshot 10](<Screenshot 2026-11-21 191707.png>)

### Screenshot 11
![Screenshot 11](<Screenshot 2026-11-21 191751.png>)


