# IMSG I-14/3 Learning Hub

# Master Development Roadmap

## 1. Purpose

This document defines the complete development roadmap for the IMSG I-14/3 Learning Hub.

It defines:

* WHAT the project should build
* WHEN features should be built
* Dependencies between phases
* Phase completion criteria
* Current development status

`AGENTS.md` defines HOW the project must be developed.

Both documents are authoritative:

```text
AGENTS.md
    ↓
Engineering rules, architecture, safety, module boundaries

PROJECT_ROADMAP.md
    ↓
Product phases, milestones, features, completion criteria
```

Do not bypass the architecture rules in `AGENTS.md` in order to complete a roadmap item faster.

---

# 2. Product Vision

IMSG I-14/3 Learning Hub is intended to evolve from an MCQ assessment platform into a scalable school learning, assessment, and analytics platform.

The long-term platform should support:

* Students
* Teachers
* Parents
* Principals
* Administrators
* Multiple grades
* Multiple subjects
* Question banks
* Assessments
* Assignments
* Learning progress
* Teacher intervention
* Educational analytics
* School-wide analytics

---

# 3. Core Product Loop

The central educational loop is:

```text
Question Bank
     ↓
Assessment
     ↓
Student Attempt
     ↓
Reliable Assessment Data
     ↓
Analytics Engine
     ↓
Educational Insight
     ↓
Teacher Action
     ↓
Student Improvement
     ↓
New Assessment
     ↓
New Data
```

The system should progressively improve this loop.

---

# 4. Core Architecture

The application must maintain clear separation between:

```text
UI
 ↓
Feature Modules
 ↓
Data/Application Layer
 ↓
Persistence
 ↓
Backend
```

Analytics remains a separate concern:

```text
Raw Assessment Data
        ↓
   analytics.js
        ↓
Analytics Results
        ↓
Teacher / Student / Admin UI
```

## Frontend–Backend Independence

The frontend and backend must remain loosely coupled and independently operable.

Backend operations must:

* be asynchronous
* not unnecessarily freeze the frontend
* not crash unrelated frontend functionality
* fail gracefully
* use local state/cache/fallback data where appropriate

This does NOT mean that every frontend operation must work without the backend.

Operations that genuinely require authoritative server data may wait for that data.

The dependency must be:

* intentional
* isolated
* explicit
* gracefully handled

---

# 5. Development Status

| Phase     | Name                                         | Status     |
| --------- | -------------------------------------------- | ---------- |
| Phase 1   | Assessment Data Integrity                    | ✅ Complete |
| Phase 2   | Analytics Engine                             | ✅ Complete |
| Phase 2V  | Analytics Validation & Testing               | ✅ Complete |
| Phase 3.1 | Teacher Analytics Data Flow                  | ✅ Complete |
| Phase 3.2 | Teacher Analytics Overview                   | 🔵 Current  |
| Phase 3.3 | Class Performance Analytics                  | ⏳          |
| Phase 3.4 | Topic & Question Analytics                   | ⏳          |
| Phase 3.5 | Student Performance Analytics                | ⏳          |
| Phase 3.6 | Teacher Action / Insight Panel               | ⏳          |
| Phase 4   | Teacher Insights & Recommendations           | ⏳          |
| Phase 5   | Advanced Learning & Question Analytics       | ⏳          |
| Phase 6   | Performance, Security & Production Hardening | ⏳          |
| Phase 7   | Final QA, Deployment & Release               | ⏳          |

---

# PHASE 1 — ASSESSMENT DATA INTEGRITY

## Status

✅ COMPLETE

## Goal

Ensure assessment attempts contain trustworthy structured data that can support future analytics.

## Completed requirements

Every new attempt should capture, where applicable:

* attemptId
* studentId
* classId
* assessmentId / quizId
* subject
* grade
* chapter
* startedAt
* completedAt
* timeSpent
* score
* total
* percentage
* completionStatus
* question-level results

Each question result should capture:

* questionId
* selectedAnswer
* correctAnswer
* correct
* timeUsed
* topic
* difficulty
* bloom
* unanswered state where applicable

## Important requirements

* Real per-question timing
* Assessment start/end timestamps
* Explicit unanswered questions
* Stable identifiers
* Question metadata
* Backward compatibility
* Legacy attempt compatibility
* No fake timing values
* Reliable attempt data contract

---

# PHASE 2 — ANALYTICS ENGINE

## Status

✅ COMPLETE

## Goal

Create a standalone analytics engine that converts raw assessment attempts into structured educational analytics.

## Main module

```text
analytics.js
```

## Required functions

```js
getClassOverview(attempts)
getStudentPerformance(studentId, attempts)
getTopicMastery(attempts)
getQuestionStatistics(attempts)
getDifficultyPerformance(attempts)
getBloomPerformance(attempts)
getAssessmentTrend(attempts)
getAtRiskStudents(attempts)
```

## Architecture requirements

`analytics.js` must:

* receive data as input
* return structured plain JavaScript data
* remain independent of the DOM
* remain independent of UI rendering
* remain independent of Firestore
* remain independent of localStorage
* not save data
* not mutate raw attempts
* not depend on `ui.js`

## Analytics currently supported

### Class analytics

* total attempts
* unique students
* average score
* average percentage
* completion rate
* total questions
* correct answers
* incorrect answers
* accuracy

### Student analytics

* total attempts
* average percentage
* best result
* lowest result
* accuracy
* recent performance
* topic strengths
* topic weaknesses

### Topic analytics

* total questions
* correct answers
* incorrect answers
* accuracy
* mastery level

Initial mastery classification:

```text
80–100 = Strong
60–79  = Developing
0–59   = Needs Support
```

### Question analytics

* attempts
* correct
* incorrect
* accuracy
* average time
* topic
* difficulty

### Difficulty analytics

* easy
* medium
* hard

### Bloom analytics

Support the Bloom levels contained in the question bank.

### Assessment trends

Chronological assessment performance.

### At-risk indicators

Transparent rule-based indicators based on observable assessment evidence.

No machine learning or opaque predictive scoring at this stage.

---

# PHASE 2V — ANALYTICS VALIDATION & TESTING

## Status

✅ COMPLETE

## Goal

Prove that the analytics engine produces mathematically correct and stable results.

## Validation covered

* Class average
* Accuracy
* Unique students
* Student performance
* Topic mastery
* Question statistics
* Difficulty statistics
* Bloom statistics
* Assessment trends
* At-risk indicators
* Empty data
* Missing data
* Historical attempts
* Incomplete attempts

## Completion requirement

All browser and analytics tests must pass.

## Result

All browser tests passed.

Phase 2 and Phase 2V are therefore considered complete.

---

# PHASE 3 — TEACHER ANALYTICS MVP

## Goal

Turn the analytics engine into a useful teacher-facing analytics system.

The goal is NOT merely to display charts.

The goal is:

> Help teachers understand what is happening in their class and identify what they should do next.

## Architecture

```text
Teacher UI
    ↓
Teacher Analytics Data Flow
    ↓
Data Layer
    ↓
Assessment Attempts
    ↓
analytics.js
    ↓
Analytics Results
    ↓
Teacher UI
```

The UI must consume analytics results.

The UI must NOT recreate analytics calculations.

---

# PHASE 3.1 — TEACHER ANALYTICS DATA FLOW

## Status

✅ COMPLETE

## Goal

Create the clean architectural bridge between the teacher interface and `analytics.js`.

## Requirements

Establish a teacher analytics data flow that:

1. obtains the correct assessment data
2. passes data to the analytics engine
3. receives structured analytics results
4. exposes results to teacher-facing features
5. keeps persistence details out of the UI

## Responsibilities

The data flow should handle:

* retrieving attempts
* selecting relevant class/student/assessment data
* passing data into analytics functions
* returning analytics results
* loading states
* empty states
* backend failure states
* local fallback behavior
* error isolation

## Filtering foundation

Prepare the system to support filters such as:

* class
* subject
* grade
* chapter
* topic
* assessment
* date range
* student

Only implement filters that are actually needed for the current phase.

Do not build an unnecessarily complex filtering framework.

## Backend independence

Teacher analytics must not directly depend on Firestore.

Preferred direction:

```text
Teacher UI
    ↓
Teacher Analytics Service/Data Flow
    ↓
data.js
    ↓
analytics.js
```

Persistence remains behind the data layer.

## Completion criteria

Phase 3.1 is complete when:

* teacher analytics can obtain real attempt data
* the data reaches `analytics.js`
* analytics results return successfully
* UI can consume those results
* loading states work
* empty data works
* backend failure does not crash unrelated UI
* no analytics calculations are duplicated in the UI
* no direct Firestore access is added to analytics UI code

---

# PHASE 3.2 — TEACHER ANALYTICS OVERVIEW

## Status

🔵 CURRENT

## Goal

Create the first teacher-facing analytics overview.

## Metrics

Initially display:

* Total students
* Active students
* Assessments attempted
* Average score
* Average percentage
* Accuracy
* Participation
* Completion rate
* Overall trend

Where metrics are not supported by trustworthy data, do not invent them.

## UX principles

The overview should answer:

```text
How is my class doing?
Are students participating?
Where is performance weak?
Is performance improving?
```

Keep the first dashboard simple.

---

# PHASE 3.3 — CLASS PERFORMANCE ANALYTICS

## Goal

Provide deeper class-level performance information.

## Features

* Score distribution
* Class average
* Accuracy
* Participation
* Completion
* Strong-performing students
* Developing students
* Students needing support
* Performance trend
* Assessment comparison

The classification must remain transparent and based on documented thresholds.

---

# PHASE 3.4 — TOPIC & QUESTION ANALYTICS

## Goal

Help teachers identify exactly what students are struggling with.

## Topic analytics

Display:

* strongest topics
* weakest topics
* topic mastery
* topic accuracy
* topic participation
* topic trends

## Question analytics

Display:

* question accuracy
* number of attempts
* correct/incorrect distribution
* response time
* difficulty
* Bloom level

## Question quality caution

Low question accuracy does NOT automatically mean that a question is poorly written.

Potentially problematic questions should be identified using multiple indicators.

---

# PHASE 3.5 — STUDENT PERFORMANCE ANALYTICS

## Goal

Allow teachers to drill into an individual student.

## Student profile

```text
Student
 ├── Overall Performance
 ├── Average Score
 ├── Accuracy
 ├── Assessment History
 ├── Recent Trend
 ├── Topic Mastery
 ├── Strengths
 ├── Weaknesses
 └── At-Risk Indicators
```

## Teacher objective

The teacher should be able to answer:

* Is this student improving?
* What topics are weak?
* What topics are strong?
* Is the student consistently struggling?
* Which intervention might help?

---

# PHASE 3.6 — TEACHER ACTION / INSIGHT PANEL

## Goal

Move from displaying information to helping teachers interpret it.

The system should progressively transform:

```text
Data
 ↓
Evidence
 ↓
Interpretation
 ↓
Suggested Action
```

## Example

Instead of only:

```text
Data Representation
Accuracy: 48%
```

show:

```text
Topic needing attention

Data Representation
Accuracy: 48%

A large portion of the class is below the
mastery threshold.

Suggested action:
Review this topic and provide additional practice.
```

## Initial insight types

* Weakest topics
* Strongest topics
* Students needing support
* Declining performance
* Low participation
* Difficult questions
* Possible question review candidates

All recommendations should initially be transparent and rule-based.

Do not introduce AI-generated recommendations yet.

---

# PHASE 4 — TEACHER INSIGHTS & RECOMMENDATIONS

## Goal

Expand teacher decision support.

Potential features:

* Reteaching recommendations
* Intervention groups
* Revision recommendations
* Weak-topic prioritization
* Student support recommendations
* Question review recommendations
* Intervention tracking

## Principle

The system should answer:

> What should the teacher do next?

Recommendations should explain the evidence behind them.

---

# PHASE 5 — ADVANCED LEARNING & QUESTION ANALYTICS

## Goal

Use accumulated trustworthy data for deeper educational analysis.

## Learning analytics

Potential features:

* Accuracy vs speed
* Learning progression
* Repeated mistakes
* Topic mastery progression
* Student learning patterns
* Improvement velocity
* Persistent weaknesses

## Question analytics

Potential features:

* Distractor analysis
* Frequently selected wrong answers
* Question difficulty validation
* Question discrimination
* Question quality indicators
* Bloom-level performance
* Potential ambiguity indicators

## Important

Do not implement predictive analytics merely because it is technically possible.

Only introduce predictive/ML features when enough high-quality historical data exists.

---

# PHASE 6 — PERFORMANCE, SECURITY & PRODUCTION HARDENING

## Goal

Prepare the system for real school-scale usage.

## Security

Review:

* Authentication
* Authorization
* Firestore security rules
* Student data isolation
* Input validation
* Upload validation
* File security
* Secret management
* XSS protection
* CSRF protection where applicable
* Rate limiting where applicable

## Reliability

Review:

* Backend failure isolation
* Retry mechanisms
* Failed-save handling
* Local fallback
* Error reporting
* Recovery behavior
* Data consistency

## Performance

Review:

* Firestore query efficiency
* Pagination
* Lazy loading
* Caching
* Indexed queries
* Analytics calculation performance
* Unnecessary database reads
* Large class performance

## Mobile

Validate:

* responsive web experience
* Capacitor behavior
* Android performance
* offline/failure scenarios

---

# PHASE 7 — FINAL QA, DEPLOYMENT & RELEASE

## Goal

Prepare the complete platform for production release.

## QA

Test:

* Student workflows
* Teacher workflows
* Analytics workflows
* Assignment workflows
* Question-bank workflows
* Authentication
* Authorization
* Mobile
* Browser compatibility
* Error handling
* Legacy data compatibility

## Analytics QA

Verify:

```text
Raw Data
   ↓
Analytics Engine
   ↓
Teacher Dashboard
```

produces consistent results at every layer.

## Deployment

Establish:

```text
Development
    ↓
Testing
    ↓
Staging
    ↓
Production
```

## Final checks

* Production configuration
* Database rules
* Backup strategy
* Monitoring
* Error logging
* Performance
* Security
* Data migration
* Release checklist

---

# 6. Current Development Position

The current state is:

```text
Phase 1
Assessment Data Integrity
        ✅
        ↓
Phase 2
Analytics Engine
        ✅
        ↓
Phase 2V
Analytics Validation
        ✅
        ↓
Phase 3.1
Teacher Analytics Data Flow
        ✅
        ↓
Phase 3.2
Teacher Analytics Overview
        🔵 CURRENT
        ↓
Phase 3.3
Class Performance Analytics
        ⏳
        ↓
Phase 3.4
Topic & Question Analytics
        ⏳
        ↓
Phase 3.5
Student Performance Analytics
        ⏳
        ↓
Phase 3.6
Teacher Action / Insight Panel
        ⏳
        ↓
Phase 4
Teacher Insights & Recommendations
        ⏳
        ↓
Phase 5
Advanced Analytics
        ⏳
        ↓
Phase 6
Hardening
        ⏳
        ↓
Phase 7
Final QA & Release
        ⏳
```

---

# 7. Rules for OpenCode

OpenCode must:

1. Read `AGENTS.md` before implementation.
2. Read `PROJECT_ROADMAP.md` before implementation.
3. Work only on the current phase.
4. Inspect the existing repository before modifying files.
5. Preserve existing functionality.
6. Avoid unrelated refactoring.
7. Maintain frontend/backend independence.
8. Maintain module boundaries.
9. Write tests for significant logic.
10. Run existing tests after changes.
11. Never silently ignore failed persistence.
12. Never move analytics calculations into UI code.
13. Never allow analytics to directly depend on Firestore.
14. Do not implement future phases early.
15. Stop after completing the current phase.
16. Report files changed, tests run, results, issues, and recommendations.

---

# 8. Phase Completion Rule

A phase is complete only when:

* implementation is functional
* relevant tests pass
* existing functionality remains intact
* architecture rules remain intact
* no critical regression exists
* edge cases are handled
* the implementation is documented where necessary

After completion, update the status in this roadmap.

Do not automatically start the next phase.

---

# 9. Current Immediate Task

The immediate task is:

```text
PHASE 3.1
Teacher Analytics Data Flow
```

Do not build the complete teacher dashboard yet.

First establish a clean and reliable path:

```text
Teacher UI
    ↓
Data Layer
    ↓
Assessment Attempts
    ↓
analytics.js
    ↓
Analytics Results
    ↓
Teacher UI
```

After Phase 3.1 is completed and tested, proceed to Phase 3.2.

---

# 10. Long-Term Product Principle

The Learning Hub should not become a collection of disconnected dashboards.

Every major feature should contribute to the educational loop:

```text
Assess
 ↓
Measure
 ↓
Understand
 ↓
Act
 ↓
Improve
 ↓
Assess Again
```

The ultimate purpose of analytics is not to produce more charts.

The purpose is to help teachers make better educational decisions and help students improve.
