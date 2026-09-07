# IMSG I-14/3 Learning Hub — Product Specification

## Product
**IMSG I-14/3 LEARNING HUB**
**Learn • Practice • Improve**

School: IMSG I-14/3 Islamabad

## Vision
A scalable school learning, assessment, and analytics platform.

Current MVP: student MCQ practice and timed quizzes.

Future:
- multiple subjects
- multiple grades
- student accounts
- subject teachers
- class teachers
- parents
- principal/admin
- question bank
- assignments/homework
- Excel bulk import
- images/diagrams/non-verbal questions
- progress analytics
- school-wide analytics

## Current MVP flow
```text
Home → Practice MCQs → Quiz → Finish Quiz → Result → Try Again
```

Home/dashboard hides when the quiz starts. The existing school header remains visible and must not be duplicated on Home.

## UX
The interface should be:
- professional
- clean
- school-friendly
- responsive
- mobile-friendly
- accessible
- high contrast
- easy for students to understand

Answer options should be large clickable buttons. Current user preference is blue buttons with readable text.

## Current quiz state
Conceptual variables:
```javascript
let currentQuestion = 0;
let score = 0;
let timeLeft = 60;
let timer;
let userAnswers = [];
```

Important IDs:
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

Current timer: 60 seconds.
Warning: 10 seconds or less.

## Performance
Every attempt should eventually record:
```text
student
quiz
question
question ID
selected answer
correct answer
correct/incorrect
time used
subject
grade
chapter
topic
timestamp
```

## Question model
```javascript
{
    id: "CS9-NET-001",
    subject: "Computer Science",
    grade: 9,
    chapter: "Networking",
    topic: "Network Topologies",
    type: "mcq",
    text: "...",
    media: null,
    options: ["...", "...", "...", "..."],
    answer: "B",
    explanation: "...",
    difficulty: "easy"
}
```

Question IDs must be stable and unique.

Examples:
```text
CS9-NET-001
PHY9-MEA-001
BIO9-CELL-001
MATH9-GEO-001
```

## Non-verbal support
Questions may contain:
- images
- shapes
- diagrams
- charts
- graphs
- visual answer options

Preferred media structure:
```text
question-bank/
├── questions.xlsx
└── media/
```

## Excel import
Future columns:
```text
id, subject, grade, chapter, topic, type, text, media,
optionA, optionB, optionC, optionD, answer, explanation, difficulty
```

Validate duplicates, required fields, answer values, question types, and media references.

## Roles
```text
Student
Subject Teacher
Class Teacher
Parent
Principal/Admin
```

## Future modules
### Student
- practice
- tests
- results
- answer review
- progress
- assignments

### Teacher
- question bank
- quiz creation
- assignments
- class analytics
- student analytics
- topic analysis

### Class Teacher
- cross-subject class monitoring

### Parent
- child progress and assignments

### Principal/Admin
- school-wide analytics

## Future database
Potential entities:
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

## Analytics
The platform should eventually identify:
- weak topics
- strong topics
- student trends
- class averages
- participation
- question accuracy
- unusually difficult questions
- potentially ambiguous/poor questions

The key question is:

**What should the teacher do next based on the assessment data?**

## Security
When backend is introduced:
- server-side validation
- server-side authorization
- secure password hashing
- CSRF protection
- secure uploads
- student data isolation
- role-based access
- secrets outside source code
- never trust client-calculated scores

## Technology
The project began with HTML/CSS/JavaScript.

Do not migrate unnecessarily. A backend such as Laravel can be introduced later when persistence, accounts, roles, and analytics require it.

## Development order
1. Finish answer recording.
2. Structured attempts/results.
3. Answer review.
4. Question metadata.
5. Topic analytics.
6. Persistence.
7. Database.
8. Authentication/roles.
9. Teacher dashboard.
10. Question bank.
11. Excel/media import.
12. Assignments.
13. Parent portal.
14. Principal dashboard.

## Quality
Prioritize reliability and maintainability over flashy features.

Always inspect and preserve the existing working code before implementing changes.
