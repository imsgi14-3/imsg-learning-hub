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
    â†“
Engineering rules, architecture, safety, module boundaries

PROJECT_ROADMAP.md
    â†“
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
     â†“
Assessment
     â†“
Student Attempt
     â†“
Reliable Assessment Data
     â†“
Analytics Engine
     â†“
Educational Insight
     â†“
Teacher Action
     â†“
Student Improvement
     â†“
New Assessment
     â†“
New Data
```

The system should progressively improve this loop.

---

# 4. Core Architecture

The application must maintain clear separation between:

```text
UI
 â†“
Feature Modules
 â†“
Data/Application Layer
 â†“
Persistence
 â†“
Backend
```

Analytics remains a separate concern:

```text
Raw Assessment Data
        â†“
   analytics.js
        â†“
Analytics Results
        â†“
Teacher / Student / Admin UI
```

## Frontendâ€“Backend Independence

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
| Phase 1   | Assessment Data Integrity                    | âœ… Complete |
| Phase 2   | Analytics Engine                             | âœ… Complete |
| Phase 2V  | Analytics Validation & Testing               | âœ… Complete |
| Phase 3.1 | Teacher Analytics Data Flow                  | âœ… Complete |
| Phase 3.2 | Teacher Analytics Overview                   | ðŸ”µ Current  |
| Phase 3.3 | Class Performance Analytics                  | â³          |
| Phase 3.4 | Topic & Question Analytics                   | â³          |
| Phase 3.5 | Student Performance Analytics                | â³          |
| Phase 3.6 | Teacher Action / Insight Panel               | â³          |
| Phase 4   | Teacher Insights & Recommendations           | â³          |
| Phase 5   | Advanced Learning & Question Analytics       | â³          |
| Phase 6   | Performance, Security & Production Hardening | â³          |
| Phase 7   | Final QA, Deployment & Release               | â³          |

---

# PHASE 1 â€” ASSESSMENT DATA INTEGRITY

## Status

âœ… COMPLETE

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

# PHASE 2 â€” ANALYTICS ENGINE

## Status

âœ… COMPLETE

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
80â€“100 = Strong
60â€“79  = Developing
0â€“59   = Needs Support
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

# PHASE 2V â€” ANALYTICS VALIDATION & TESTING

## Status

âœ… COMPLETE

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

# PHASE 3 â€” TEACHER ANALYTICS MVP

## Goal

Turn the analytics engine into a useful teacher-facing analytics system.

The goal is NOT merely to display charts.

The goal is:

> Help teachers understand what is happening in their class and identify what they should do next.

## Architecture

```text
Teacher UI
    â†“
Teacher Analytics Data Flow
    â†“
Data Layer
    â†“
Assessment Attempts
    â†“
analytics.js
    â†“
Analytics Results
    â†“
Teacher UI
```

The UI must consume analytics results.

The UI must NOT recreate analytics calculations.

---

# PHASE 3.1 â€” TEACHER ANALYTICS DATA FLOW

## Status

âœ… COMPLETE

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
    â†“
Teacher Analytics Service/Data Flow
    â†“
data.js
    â†“
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

# PHASE 3.2 â€” TEACHER ANALYTICS OVERVIEW

## Status

ðŸ”µ CURRENT

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

# PHASE 3.3 â€” CLASS PERFORMANCE ANALYTICS

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

# PHASE 3.4 â€” TOPIC & QUESTION ANALYTICS

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

# PHASE 3.5 â€” STUDENT PERFORMANCE ANALYTICS

## Goal

Allow teachers to drill into an individual student.

## Student profile

```text
Student
 â”œâ”€â”€ Overall Performance
 â”œâ”€â”€ Average Score
 â”œâ”€â”€ Accuracy
 â”œâ”€â”€ Assessment History
 â”œâ”€â”€ Recent Trend
 â”œâ”€â”€ Topic Mastery
 â”œâ”€â”€ Strengths
 â”œâ”€â”€ Weaknesses
 â””â”€â”€ At-Risk Indicators
```

## Teacher objective

The teacher should be able to answer:

* Is this student improving?
* What topics are weak?
* What topics are strong?
* Is the student consistently struggling?
* Which intervention might help?

---

# PHASE 3.6 â€” TEACHER ACTION / INSIGHT PANEL

## Goal

Move from displaying information to helping teachers interpret it.

The system should progressively transform:

```text
Data
 â†“
Evidence
 â†“
Interpretation
 â†“
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

# PHASE 4 â€” TEACHER INSIGHTS & RECOMMENDATIONS

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

# PHASE 5 â€” ADVANCED LEARNING & QUESTION ANALYTICS

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

# PHASE 6 â€” PERFORMANCE, SECURITY & PRODUCTION HARDENING

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

# PHASE 7 â€” FINAL QA, DEPLOYMENT & RELEASE

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
   â†“
Analytics Engine
   â†“
Teacher Dashboard
```

produces consistent results at every layer.

## Deployment

Establish:

```text
Development
    â†“
Testing
    â†“
Staging
    â†“
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
        âœ…
        â†“
Phase 2
Analytics Engine
        âœ…
        â†“
Phase 2V
Analytics Validation
        âœ…
        â†“
Phase 3.1
Teacher Analytics Data Flow
        âœ…
        â†“
Phase 3.2
Teacher Analytics Overview
        ðŸ”µ CURRENT
        â†“
Phase 3.3
Class Performance Analytics
        â³
        â†“
Phase 3.4
Topic & Question Analytics
        â³
        â†“
Phase 3.5
Student Performance Analytics
        â³
        â†“
Phase 3.6
Teacher Action / Insight Panel
        â³
        â†“
Phase 4
Teacher Insights & Recommendations
        â³
        â†“
Phase 5
Advanced Analytics
        â³
        â†“
Phase 6
Hardening
        â³
        â†“
Phase 7
Final QA & Release
        â³
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
    â†“
Data Layer
    â†“
Assessment Attempts
    â†“
analytics.js
    â†“
Analytics Results
    â†“
Teacher UI
```

After Phase 3.1 is completed and tested, proceed to Phase 3.2.

---

# 10. Long-Term Product Principle

The Learning Hub should not become a collection of disconnected dashboards.

Every major feature should contribute to the educational loop:

```text
Assess
 â†“
Measure
 â†“
Understand
 â†“
Act
 â†“
Improve
 â†“
Assess Again
```

The ultimate purpose of analytics is not to produce more charts.

The purpose is to help teachers make better educational decisions and help students improve.
