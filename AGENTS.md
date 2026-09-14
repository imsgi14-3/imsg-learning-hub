# IMSG I-14/3 Learning Hub — AI Coding Agent Instructions

## Mission
Build and maintain the **IMSG I-14/3 Learning Hub**, a real school learning and assessment platform. The current MVP is student MCQ practice, but the architecture must grow into a multi-subject, multi-grade, role-based platform with teacher tools, homework, parent access, principal analytics, question banks, Excel imports, media/non-verbal questions, and performance analytics.

## School identity
- School: **IMSG I-14/3 Islamabad**
- Platform: **IMSG I-14/3 LEARNING HUB**
- Tagline: **Learn • Practice • Improve**
- The header already exists separately. **Do not duplicate it on Home.**

## Current technology
The project began with:
- HTML
- CSS
- JavaScript
- VS Code

Continue with the existing stack unless the repository already contains a deliberate backend/framework. Do not migrate technologies merely for convenience.

## Development philosophy
The owner is a Computer Science teacher learning development through this project.
- Work incrementally.
- Preserve working functionality.
- Explain important changes clearly.
- Prefer simple, readable code.
- Avoid unnecessary rewrites.
- Inspect the actual repository before changing code.
- The actual source code is authoritative if these notes differ from it.
- Prefer small, reversible changes over large refactors.
- Do not introduce a new library, framework, service, or architectural pattern unless it solves a demonstrated problem.

# Core Architecture Principles

## 1. Frontend–Backend Independence

The frontend and backend must remain **loosely coupled and independently operable**.

Backend availability must never unnecessarily freeze, crash, or disable unrelated frontend functionality.

All backend operations must:
- be asynchronous;
- have explicit error handling;
- have reasonable timeout/fallback behavior where appropriate;
- expose failures to the application in a controlled way;
- avoid blocking unrelated UI operations.

If the backend is unavailable, the frontend should remain usable through local state, cached data, or fallback mechanisms **wherever the feature permits**.

This does **not** mean that every frontend operation must work without the backend. Operations that genuinely require authoritative server data may wait for that data. The rule is that backend dependency must be **intentional, isolated, and graceful**, not accidental or global.

### Required behavior

Bad:
```text
Firestore fails
    ↓
global error
    ↓
application freezes
    ↓
quiz/dashboard becomes unusable
```

Good:
```text
Firestore fails
    ↓
data/service layer handles failure
    ↓
local/cache fallback where possible
    ↓
affected feature reports controlled error/offline state
    ↓
unrelated frontend features continue working
```

### No direct backend coupling from UI

The UI must not directly depend on Firestore APIs.

Bad:
```javascript
// ui.js
firebase.firestore().collection("attempts")...
```

Preferred:
```javascript
// ui.js
const attempts = await Data.getAttempts();
```

The data/service layer decides whether the data comes from:
- Firestore
- local storage/cache
- another backend
- test fixtures

The UI should not need to know.

---

## 2. Separation of Responsibilities

Learning Hub must maintain clear boundaries between:

```text
UI / Presentation
        ↓
Application Features
        ↓
Data / Service Layer
        ↓
Persistence / Backend
```

### `ui.js`
Responsible for:
- rendering UI;
- DOM interaction;
- navigation;
- displaying data;
- displaying loading/error/empty/offline states.

`ui.js` must NOT become the main location for:
- database queries;
- Firestore implementation;
- analytics calculations;
- complex business rules.

### `quiz.js`
Responsible for:
- quiz execution;
- question progression;
- answer collection;
- timer behavior;
- quiz completion;
- producing structured attempt data.

It should not contain teacher-dashboard rendering logic or database implementation details.

### `analytics.js`
Responsible for:
- analytics calculations;
- educational metrics;
- aggregations;
- performance analysis;
- teacher insights.

It should operate on supplied data and remain independent of:
- DOM elements;
- UI rendering;
- Firestore APIs;
- localStorage implementation.

Example:
```javascript
const mastery = Analytics.getTopicMastery(attempts);
```

Analytics functions should preferably be deterministic/pure where practical:
```text
input data → calculated result
```

### `data.js`
Acts as the application's **data/service boundary**.

Responsible for:
- retrieving application data;
- coordinating backend/local sources;
- normalizing returned data;
- fallback behavior;
- hiding storage implementation details from the UI and feature modules.

Examples:
```javascript
await Data.getAttempts();
await Data.getStudents();
await Data.getAssessments();
await Data.saveAttempt(attempt);
```

### `db.js`
Responsible for:
- persistence;
- Firestore communication;
- database-specific operations;
- database error handling.

`db.js` must NOT contain:
- DOM logic;
- teacher dashboard rendering;
- educational analytics calculations.

### `questionLoader.js`
Responsible for:
- loading question-bank data;
- validating/normalizing question structures;
- exposing questions to the application.

It should not own quiz UI or teacher analytics.

---

## 3. Dependency Direction

Prefer one-way dependencies.

Recommended:

```text
ui.js
  ↓
feature modules / services
  ↓
data.js
  ↓
db.js / local storage
```

Analytics can consume data without owning persistence:

```text
ui.js
  ↓
analytics.js
  ↑
data.js → attempts
```

Avoid circular dependencies.

Especially avoid:
```text
db.js → ui.js                         ❌
analytics.js → ui.js                 ❌
analytics.js → db.js                 ❌
db.js → analytics.js                 ❌
```

Analytics must receive data rather than fetch it directly from the database.

The database must persist data rather than interpret educational meaning.

The UI must display results rather than calculate the underlying metrics.

---

## 4. Module Independence

All modules must be independent and flexible. A bug or rewrite in one module must NOT unnecessarily affect other modules.

Rules:
1. Each module should have a clear responsibility.
2. Do not let one module's internal implementation leak into another.
3. Communicate through small, documented interfaces.
4. Avoid global mutable state where practical.
5. Do not duplicate the same business rule in multiple modules.
6. Before changing a public function, inspect all callers.
7. Prefer backward-compatible changes when practical.

---

## 5. Failure Isolation

One failure must not cascade through the application.

### UI
When a dashboard contains multiple sections, isolate rendering failures:

```text
Overview
Topic Analytics
Student Analytics
Question Analytics
Insights
```

If Topic Analytics fails, Overview should still render.

### Backend
A Firestore failure should not automatically terminate:
- quiz rendering;
- navigation;
- local practice;
- question loading;
- unrelated UI features.

### Analytics
If one analytics calculation fails, other independent analytics should still be available where practical.

Do not use one giant try/catch that hides all errors. Errors should be isolated at meaningful boundaries and logged appropriately.

---

## 6. Data Integrity and Fallback

### Data merging, not replacing
When loading from Firestore, merge with local data according to the application's data policy.

Never wipe valid local data simply because:
- Firestore is unavailable;
- Firestore returns an empty result;
- a network request fails.

### Save failures
Never silently lose data.

When a save fails:
1. preserve the local copy where possible;
2. mark/surface the synchronization failure;
3. inform the user when the failure affects their action;
4. retry/sync later when the architecture supports it.

Example user state:
```text
Offline — saved locally. Will sync when connection is restored.
```

Do not claim that data was successfully saved to the backend unless the backend confirms it.

---

# Analytics Architecture

## Analytics Engine

Analytics must be implemented as a separate layer, initially in:

```text
analytics.js
```

Do NOT put all analytics calculations inside `ui.js`.

The initial architecture should be:

```text
                    UI
                  ui.js
                    │
          ┌─────────┴─────────┐
          │                   │
       quiz.js          analytics.js
          │                   ↑
          └────────┐     supplied data
                   ↓
                data.js
                   │
            ┌──────┴──────┐
            ↓             ↓
          db.js       Local Cache
            ↓
        Firestore
```

### Analytics responsibility

`analytics.js` should provide functions such as:

```javascript
getClassOverview(attempts)
getStudentPerformance(studentId, attempts)
getTopicMastery(attempts)
getQuestionStatistics(attempts)
getDifficultyPerformance(attempts)
getBloomPerformance(attempts)
getAssessmentTrend(attempts)
getAtRiskStudents(attempts)
```

Function names may evolve with the actual implementation.

### Important rule

`analytics.js` must NOT:
- query Firestore directly;
- read DOM elements;
- manipulate HTML;
- depend on `ui.js`;
- write directly to localStorage.

Instead:

```text
data.js → supplies raw/normalized data
analytics.js → calculates metrics
ui.js → displays metrics
```

---

# Analytics Data Model

A future structured attempt should record enough information to support educational analytics.

Minimum conceptual fields:

```text
attemptId
studentId
classId
assessmentId
assignmentId

subject
grade
chapter

startedAt
completedAt
timeSpent

score
total
percentage

questions:
  questionId
  selectedAnswer
  correctAnswer
  correct
  timeUsed

topicPerformance
difficultyPerformance
bloomPerformance
```

Do not add every field at once. Add fields incrementally as the related feature is implemented.

## Question metadata

Questions should support:

```text
id
subject
grade
chapter
topic
type
text
media
options
answer
explanation
difficulty
bloom
```

Stable question IDs are essential for long-term analytics.

Never use array position as permanent question identity.

---

# Current application flow

```text
HOME / DASHBOARD
        ↓
  Practice MCQs
        ↓
      QUIZ
        ↓
   Finish Quiz
        ↓
     RESULT
        ↓
    Try Again
        ↓
      QUIZ
```

When the quiz starts, the Home/Dashboard disappears. The persistent school header remains visible.

## Existing important IDs

Do not casually rename:
```text
home
quiz
result
finalScore
percentage
question
questionNumber
timer
```

Known concepts/functions:
```text
startPractice()
startTimer()
```

Known variables:
```text
currentQuestion
score
timeLeft
timer
questions
userAnswers
```

## Existing quiz UI

Quiz wrapper:
```html
<div id="quiz" class="quiz-card">
```

Result wrapper:
```html
<div id="result" class="result-card">
```

Current design direction:
- Clean, modern, school-friendly
- Responsive/mobile-friendly
- Large readable text
- Strong contrast
- Minimal clutter
- Blue answer buttons with readable text

Preserve good readability. Answer states should eventually distinguish:
- normal
- hover
- selected
- correct
- incorrect
- disabled

---

# Timer

Current normal quiz duration: **60 seconds**.
Warning state begins at **10 seconds**.

The timer must:
- reset for every attempt;
- not create duplicate intervals;
- stop when the quiz finishes;
- reset correctly on Try Again.

For analytics, capture actual per-question response time where practical.

If a question has:
```javascript
questionStartTime = Date.now();
```

then when the student answers, calculate:
```javascript
timeUsed = Date.now() - questionStartTime;
```

Do not record fake/default timing values merely to satisfy the schema.

---

# Result

Important IDs:
```text
finalScore
percentage
```

Current percentage concept:
```javascript
const percentage =
    Number(((score / questions.length) * 100).toFixed(2));
```

Do not rename `finalScore` without checking all dependent JavaScript.

---

# Current milestone

The immediate goal is to collect student answers during an attempt.

Expected state:
```javascript
let currentQuestion = 0;
let score = 0;
let timeLeft = 60;
let timer;
let userAnswers = [];
```

At the start of a new attempt:
```javascript
userAnswers = [];
```

When a student answers:
```javascript
userAnswers[currentQuestion] = selectedAnswer;
```

If this is already implemented, do not redo it. Move to structured attempt/result data and answer review.

---

# Recommended development sequence

Build incrementally:

1. Verify current quiz and answer collection.
2. Build a structured attempt/result object.
3. Build answer review:
   - student's answer
   - correct answer
   - correct/incorrect
   - explanation
4. Normalize question metadata.
5. Capture per-question timing.
6. Add topic-level performance.
7. Add reliable local persistence.
8. Add backend persistence/synchronization.
9. Introduce authentication/authorization as required.
10. Build the analytics engine.
11. Build teacher analytics dashboard.
12. Build question-bank management.
13. Build Excel import and validation.
14. Add assignments/homework.
15. Add parent access.
16. Add principal/school-wide analytics.

Do not skip foundational data integrity work merely to build dashboards faster.

---

# Teacher Analytics

The goal is **actionable teaching insight**, not merely scores.

Initial teacher analytics should eventually include:

### Class overview
- class average
- pass rate
- participation/completion
- highest/lowest performance
- improvement over time

### Student performance
- individual score
- topic performance
- assessment history
- improvement
- strengths
- learning gaps

### Topic mastery
- strongest topics
- weakest topics
- class mastery
- student mastery

### Assessment analytics
- assessment average
- score distribution
- participation
- comparison over time

### Question analytics
- question accuracy
- answer-option distribution
- observed difficulty
- response time
- potential question-quality issues

### Advanced analytics
- performance by difficulty
- performance by Bloom/cognitive level
- accuracy vs speed
- question discrimination
- at-risk indicators
- recommended interventions

Do not implement advanced analytics until the underlying response data is reliable.

---

# Question Bank Quality

The analytics system should eventually help evaluate questions based on actual usage.

Potential metrics:
- attempts
- accuracy
- average response time
- answer-option distribution
- observed difficulty
- discrimination
- usage frequency
- potential ambiguity

Do not automatically delete or alter questions based only on statistical results. Flag them for teacher/admin review.

---

# Non-verbal questions

The renderer must eventually support:
- images
- shapes
- diagrams
- graphs
- charts
- visual questions
- image-based answer options

Example:
```javascript
media: "media/vernier04.png"
```

## Media structure

Preferred future structure:
```text
question-bank/
├── questions.xlsx
└── media/
    ├── star01.png
    ├── vernier04.png
    └── ...
```

Keep large media separate from Excel/database where practical.

---

# Excel Question Import

Future bulk import should support fields such as:
```text
id
subject
grade
chapter
topic
type
text
media
optionA
optionB
optionC
optionD
answer
explanation
difficulty
bloom
```

Validate:
- duplicate IDs
- missing IDs
- missing required fields
- invalid answers
- invalid question types
- missing media
- invalid media references
- duplicate questions where detectable

Do not build the importer before the question model is stable.

---

# Future roles

```text
Student
Subject Teacher
Class Teacher
Parent
Principal/Admin
```

Future entities may include:
```text
users
students
teachers
parents
schools
classes
subjects
topics
questions
question_options
quizzes
quiz_questions
attempts
answers
assignments
assignment_questions
results
progress
```

---

# Security

When backend/authentication is introduced:
- Never trust browser-submitted scores.
- Validate authoritative results server-side.
- Enforce authorization server-side.
- Keep student data isolated.
- Secure teacher/class/parent/admin access.
- Hash passwords using established framework mechanisms.
- Validate uploaded Excel/media.
- Protect secrets.
- Use ORM/parameterized queries.
- Use CSRF protection where appropriate.
- Do not expose private student information through client-side analytics endpoints without authorization.

---

# Testing

For every meaningful change:
1. Run/build the app.
2. Check browser console.
3. Test the affected UI flow.
4. Confirm existing features still work.
5. Test failure/fallback behavior when the change touches backend or data access.
6. Test analytics against known sample data when analytics logic changes.

## Quiz regression checklist

- Home loads
- Header correct
- Practice works
- Home hides when quiz starts
- Question appears
- Options work
- Progress updates
- Timer works
- Timer warning works
- Last question becomes Finish Quiz
- Score correct
- Percentage correct
- Result appears
- Timer stops
- Try Again resets quiz and answers
- Attempt data is recorded correctly

## Analytics regression checklist

When analytics changes:
- class totals are correct;
- student totals are correct;
- topic calculations are correct;
- question counts are correct;
- incorrect/correct answers are counted correctly;
- response times are calculated correctly;
- empty datasets do not crash the UI;
- missing optional metadata does not crash analytics;
- one failed analytics section does not break unrelated sections;
- local/fallback data produces valid analytics;
- duplicate attempts are not accidentally counted twice.

---

# Data Contract and Compatibility Rules

When introducing or changing shared data structures:
1. Document the expected shape.
2. Keep old records readable where practical.
3. Provide safe defaults for missing optional fields.
4. Do not silently reinterpret existing historical data.
5. Use stable IDs.
6. Avoid changing field meaning without migration/compatibility logic.

For example, if older attempts do not contain:
```text
timeUsed
bloom
classId
```

analytics should handle those records safely rather than crash.

---

# UI Safety

When adding/removing functions from the UI module's return object, always ensure the function exists. The module now filters undefined exports automatically, but developers should still verify.

Do not allow an analytics/rendering error to prevent the rest of the dashboard from loading.

Prefer:
```text
load data
  ↓
calculate analytics
  ↓
render independent sections
```

over one monolithic dashboard function that can fail completely.

---

# Performance

Do not perform expensive analytics calculations repeatedly during every UI render.

Prefer:
```text
load attempts
    ↓
calculate metrics once
    ↓
reuse metrics for rendering
```

For larger datasets, consider:
- memoization;
- cached aggregates;
- incremental calculations;
- server-side aggregation when justified.

Do not prematurely optimize before real performance problems exist.

---

# First action for a coding agent

Inspect the repository before writing code:
- directory structure
- HTML
- CSS
- JavaScript
- package/config files
- existing documentation
- tests

Run the current application and verify its existing behavior.

Then continue from the current milestone rather than rebuilding the project.

Before modifying architecture:
1. identify the existing dependency flow;
2. identify existing data contracts;
3. identify all callers of the code being changed;
4. make the smallest safe change;
5. run relevant tests and verify the main user flow.

---

# Product vision

This is not intended to remain a simple MCQ webpage.

It is the first version of:

**A School Learning + Assessment + Analytics Platform**

Build the MVP simply, but keep the foundations extensible.

The long-term goal is:

```text
Learning
   +
Practice
   +
Assessment
   +
Performance Analytics
   +
Actionable Teaching Insights
```

The system should help teachers answer:

1. What did students learn?
2. Where are they struggling?
3. Which students need support?
4. Which questions/topics are causing difficulty?
5. What should the teacher do next?

Build toward those outcomes without sacrificing simplicity, reliability, modularity, or frontend/backend independence.
