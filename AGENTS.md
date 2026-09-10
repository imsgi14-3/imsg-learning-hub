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

## Module independence rule
All modules must be independent and flexible. A bug or rewrite in one module must NOT affect other modules. Follow these rules:

1. **Each module is self-contained.** UI module, Auth module, Data module, Quiz module, QuestionLoader — each handles its own logic. Do not let one module's internals leak into another.

2. **Backend (Firestore) must never block frontend.** All Firestore calls must have try-catch and fallback to local data. If Firestore fails, the app must still work locally.

3. **UI module safety:** When adding/removing functions from the UI module's return object, always ensure the function exists. The module now filters undefined exports automatically, but developers should still verify.

4. **Error isolation:** Use try-catch around each rendering section (e.g., analytics sub-sections). One failing chart must not kill the entire dashboard.

5. **Data merging, not replacing:** When loading from Firestore, merge with local data. Never wipe local data when Firestore returns empty or fails.

6. **No silent failures on save:** If a save operation fails, inform the user. Never silently lose data.

## Current application flow
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

## Timer
Current normal quiz duration: **60 seconds**.
Warning state begins at **10 seconds**.

The timer must:
- reset for every attempt
- not create duplicate intervals
- stop when the quiz finishes
- reset correctly on Try Again

## Result
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

# Current milestone: Step 10

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

If Step 10A–10C are already implemented, do not redo them. Move to structured attempt/result data and answer review.

## Recommended next steps
1. Verify current Step 10 implementation.
2. Build a structured attempt/result object.
3. Build answer review:
   - student's answer
   - correct answer
   - correct/incorrect
   - explanation
4. Add question metadata.
5. Add topic-level performance.
6. Add persistence.
7. Design database.
8. Introduce authentication/backend.
9. Build teacher dashboard.
10. Build question-bank management.
11. Build Excel import and validation.
12. Add assignments/homework.
13. Add parent access.
14. Add principal/school-wide analytics.

# Question model

Future questions should conceptually support:
```javascript
{
    id: "CS9-NET-001",
    subject: "Computer Science",
    grade: 9,
    chapter: "Networking",
    topic: "Network Topologies",
    type: "mcq",
    text: "Which topology uses a central device?",
    media: null,
    options: ["Bus", "Star", "Ring", "Mesh"],
    answer: "B",
    explanation: "A star topology connects devices through a central device.",
    difficulty: "easy"
}
```

## Stable question IDs
Use stable IDs such as:
```text
CS9-NET-001
PHY9-MEA-001
BIO9-CELL-001
MATH9-GEO-001
```
Never use array position as permanent question identity.

## Question types
Current:
```text
mcq
```
Future possibilities:
```text
true_false
image_choice
diagram
matching
short_answer
```
Do not implement all future types unless needed.

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

# Excel question import
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

# Performance data

A future attempt should record:
```text
student
quiz
question ID
selected answer
correct answer
correct/incorrect
time used
subject
grade
chapter
topic
attempt timestamp
```

The system must eventually answer:
- Which topics is this student weak in?
- Which topics is the class weak in?
- Which questions are unusually difficult?
- Which questions may be poorly designed?

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

# Teacher analytics
Eventually show:
- class average
- student performance
- participation
- strongest topics
- weakest topics
- question accuracy
- progress over time

The goal is actionable teaching insight, not merely a score.

# Security
When backend/authentication is introduced:
- Never trust browser-submitted scores.
- Validate data server-side.
- Enforce authorization server-side.
- Keep student data isolated.
- Secure teacher/class/parent/admin access.
- Hash passwords using established framework mechanisms.
- Validate uploaded Excel/media.
- Protect secrets.
- Use ORM/parameterized queries.
- Use CSRF protection where appropriate.

# Testing
For every meaningful change:
1. Run/build the app.
2. Check browser console.
3. Test the affected UI flow.
4. Confirm existing features still work.

Quiz regression checklist:
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

# First action for a coding agent
Inspect the repository before writing code:
- directory structure
- HTML
- CSS
- JavaScript
- package/config files
- existing documentation

Run the current application and verify its existing behavior.

Then continue from the current milestone rather than rebuilding the project.

# Product vision
This is not intended to remain a simple MCQ webpage.

It is the first version of:

**A School Learning + Assessment + Analytics Platform**

Build the MVP simply, but keep the foundations extensible.
