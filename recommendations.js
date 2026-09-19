var Recommendations = (function() {

    function safeArray(data) {
        if (!data || !Array.isArray(data)) return [];
        return data;
    }

    function safeNum(val, fallback) {
        if (typeof val === "number" && !isNaN(val) && isFinite(val)) return val;
        return fallback !== undefined ? fallback : 0;
    }

    function safeStr(val, fallback) {
        if (typeof val === "string" && val.trim()) return val.trim();
        return fallback || "";
    }

    function getTopicRecommendations(topicMastery) {
        var recs = [];
        topicMastery = safeArray(topicMastery);
        var weakTopics = [];
        var strongTopics = [];
        for (var i = 0; i < topicMastery.length; i++) {
            var t = topicMastery[i];
            if (t.masteryLevel === "Needs Support") weakTopics.push(t);
            else if (t.masteryLevel === "Strong") strongTopics.push(t);
        }
        if (weakTopics.length > 0) {
            var names = [];
            var evidenceLines = [];
            for (var i = 0; i < weakTopics.length; i++) {
                names.push(weakTopics[i].topic);
                evidenceLines.push(weakTopics[i].topic + ": " + weakTopics[i].accuracy + "% accuracy (" + weakTopics[i].totalQuestions + " questions)");
            }
            var title = weakTopics.length === 1
                ? "Topic Intervention Needed"
                : "Topic Intervention Needed (" + weakTopics.length + " topics)";
            var message = weakTopics.length === 1
                ? weakTopics[0].topic + " needs attention — " + weakTopics[0].accuracy + "% accuracy (" + weakTopics[0].totalQuestions + " questions)."
                : weakTopics.length + " topics need attention: " + names.join(", ") + ".";
            recs.push({
                type: "topic_intervention",
                priority: 2,
                title: title,
                message: message,
                evidence: evidenceLines,
                action: weakTopics.length === 1
                    ? "Review " + weakTopics[0].topic + " and provide additional practice."
                    : "Review weak topics and provide targeted practice.",
                actionLabel: "View Topics",
                actionTarget: "topics",
                confidence: weakTopics.length >= 3 ? "strong" : "limited",
                data: { affectedTopics: names }
            });
        }
        if (strongTopics.length > 0) {
            var names = [];
            var evidenceLines = [];
            for (var i = 0; i < strongTopics.length; i++) {
                names.push(strongTopics[i].topic);
                evidenceLines.push(strongTopics[i].topic + ": " + strongTopics[i].accuracy + "% accuracy (" + strongTopics[i].totalQuestions + " questions)");
            }
            var title = strongTopics.length === 1
                ? "Class Strength"
                : "Class Strength (" + strongTopics.length + " topics)";
            var message = strongTopics.length === 1
                ? strongTopics[0].topic + " is a strength — " + strongTopics[0].accuracy + "% accuracy."
                : strongTopics.length + " topics are performing well: " + names.join(", ") + ".";
            recs.push({
                type: "positive_strength",
                priority: 6,
                title: title,
                message: message,
                evidence: evidenceLines,
                action: "Continue reinforcing these topics during revision.",
                actionLabel: "View Topics",
                actionTarget: "topics",
                confidence: "strong",
                data: { affectedTopics: names }
            });
        }
        return recs;
    }

    function getStudentRecommendations(atRiskStudents) {
        var recs = [];
        atRiskStudents = safeArray(atRiskStudents);
        if (atRiskStudents.length === 0) return recs;
        var highRisk = [];
        var mediumRisk = [];
        for (var i = 0; i < atRiskStudents.length; i++) {
            if (atRiskStudents[i].riskLevel === "high") highRisk.push(atRiskStudents[i]);
            else if (atRiskStudents[i].riskLevel === "medium") mediumRisk.push(atRiskStudents[i]);
        }
        var total = highRisk.length + mediumRisk.length;
        if (total === 0) return recs;
        var evidenceLines = [];
        var affectedStudentIds = [];
        for (var i = 0; i < atRiskStudents.length; i++) {
            var s = atRiskStudents[i];
            var reasons = s.reasons ? s.reasons.join("; ") : "Needs attention";
            evidenceLines.push(s.studentId + " (" + s.riskLevel + " risk): " + reasons);
            affectedStudentIds.push(s.studentId);
        }
        var title = "Students Needing Support";
        var message = total + " student" + (total !== 1 ? "s need" : " needs") + " attention";
        if (highRisk.length > 0) {
            message += " — " + highRisk.length + " at high risk";
        }
        message += ".";
        recs.push({
            type: "student_support",
            priority: 1,
            title: title,
            message: message,
            evidence: evidenceLines,
            action: "Review these students individually and provide targeted support.",
            actionLabel: "View Students",
            actionTarget: "students",
            confidence: total >= 3 ? "strong" : "limited",
            data: { affectedStudentIds: affectedStudentIds }
        });
        return recs;
    }

    function getQuestionRecommendations(questionStatistics) {
        var recs = [];
        questionStatistics = safeArray(questionStatistics);
        if (questionStatistics.length === 0) return recs;
        var difficultQuestions = [];
        for (var i = 0; i < questionStatistics.length; i++) {
            var q = questionStatistics[i];
            if (q.attempts >= 3 && q.accuracy < 40) {
                difficultQuestions.push(q);
            }
        }
        if (difficultQuestions.length === 0) return recs;
        var evidenceLines = [];
        var affectedQuestionIds = [];
        for (var i = 0; i < difficultQuestions.length; i++) {
            var q = difficultQuestions[i];
            var parts = [q.questionId];
            if (q.topic) parts.push("Topic: " + q.topic);
            if (q.difficulty) parts.push("Difficulty: " + q.difficulty);
            parts.push("Accuracy: " + q.accuracy + "% (" + q.attempts + " attempts)");
            evidenceLines.push(parts.join(" — "));
            affectedQuestionIds.push(q.questionId);
        }
        var title = "Question Review Recommended";
        var message = difficultQuestions.length + " question" + (difficultQuestions.length !== 1 ? "s have" : " has") + " low accuracy and may need review.";
        recs.push({
            type: "question_review",
            priority: 3,
            title: title,
            message: message,
            evidence: evidenceLines,
            action: "Review these questions for clarity, wording, or answer correctness.",
            actionLabel: "View Questions",
            actionTarget: "questions",
            confidence: difficultQuestions.length >= 3 ? "strong" : "limited",
            data: { affectedQuestionIds: affectedQuestionIds }
        });
        return recs;
    }

    function getDifficultyRecommendations(difficultyPerformance) {
        var recs = [];
        difficultyPerformance = safeArray(difficultyPerformance);
        if (difficultyPerformance.length < 2) return recs;
        var lowDifficulties = [];
        for (var i = 0; i < difficultyPerformance.length; i++) {
            var d = difficultyPerformance[i];
            if (d.attempts >= 5 && d.accuracy < 50) {
                lowDifficulties.push(d);
            }
        }
        if (lowDifficulties.length === 0) return recs;
        var evidenceLines = [];
        for (var i = 0; i < lowDifficulties.length; i++) {
            var d = lowDifficulties[i];
            evidenceLines.push(d.difficulty + " difficulty: " + d.accuracy + "% accuracy (" + d.attempts + " attempts)");
        }
        var names = [];
        for (var i = 0; i < lowDifficulties.length; i++) names.push(lowDifficulties[i].difficulty);
        recs.push({
            type: "difficulty_review",
            priority: 4,
            title: "Difficulty Level Concern",
            message: "Students are struggling with " + names.join(" and ") + " level questions (below 50% accuracy).",
            evidence: evidenceLines,
            action: "Consider providing additional guided practice at this difficulty level.",
            actionLabel: "View Performance",
            actionTarget: "performance",
            confidence: "limited"
        });
        return recs;
    }

    function getBloomRecommendations(bloomPerformance) {
        var recs = [];
        bloomPerformance = safeArray(bloomPerformance);
        if (bloomPerformance.length < 2) return recs;
        var highOrderLevels = ["analysis", "synthesis", "evaluation", "create"];
        var lowBloom = [];
        for (var i = 0; i < bloomPerformance.length; i++) {
            var b = bloomPerformance[i];
            var isHighOrder = false;
            for (var j = 0; j < highOrderLevels.length; j++) {
                if (b.bloom && b.bloom.toLowerCase().indexOf(highOrderLevels[j]) !== -1) {
                    isHighOrder = true;
                    break;
                }
            }
            if (isHighOrder && b.attempts >= 5 && b.accuracy < 50) {
                lowBloom.push(b);
            }
        }
        if (lowBloom.length === 0) return recs;
        var evidenceLines = [];
        for (var i = 0; i < lowBloom.length; i++) {
            var b = lowBloom[i];
            evidenceLines.push(b.bloom + ": " + b.accuracy + "% accuracy (" + b.attempts + " attempts)");
        }
        recs.push({
            type: "bloom_review",
            priority: 5,
            title: "Higher-Order Thinking Concern",
            message: "Performance on higher-order thinking questions is below expected levels.",
            evidence: evidenceLines,
            action: "Provide additional practice involving analytical and evaluative thinking questions.",
            actionLabel: "View Performance",
            actionTarget: "performance",
            confidence: "limited"
        });
        return recs;
    }

    function getTrendRecommendations(trendDirection, classOverview) {
        var recs = [];
        trendDirection = safeStr(trendDirection, "stable");
        classOverview = classOverview || {};
        if (trendDirection === "declining") {
            var evidenceLines = ["Class performance trend is declining across recent assessments."];
            var avgPct = safeNum(classOverview.averagePercentage, 0);
            if (avgPct > 0) {
                evidenceLines.push("Current average: " + avgPct + "%");
            }
            recs.push({
                type: "declining_performance",
                priority: 3,
                title: "Declining Performance",
                message: "Class performance is declining across recent assessments.",
                evidence: evidenceLines,
                action: "Review recent assessment results and consider re-teaching difficult concepts.",
                actionLabel: "View Performance",
                actionTarget: "performance",
                confidence: "limited"
            });
        } else if (trendDirection === "improving") {
            var evidenceLines = ["Class performance trend is improving across recent assessments."];
            var avgPct = safeNum(classOverview.averagePercentage, 0);
            if (avgPct > 0) {
                evidenceLines.push("Current average: " + avgPct + "%");
            }
            recs.push({
                type: "improving_performance",
                priority: 6,
                title: "Improving Performance",
                message: "Class performance is improving across recent assessments.",
                evidence: evidenceLines,
                action: "Continue the current instructional approach and monitor upcoming assessments.",
                actionLabel: "View Performance",
                actionTarget: "performance",
                confidence: "limited"
            });
        }
        return recs;
    }

    function deduplicateRecommendations(recs) {
        var merged = [];
        var topicRecIndex = -1;
        var questionRecIndex = -1;
        for (var i = 0; i < recs.length; i++) {
            var r = recs[i];
            if (r.type === "topic_intervention") {
                if (topicRecIndex === -1) {
                    topicRecIndex = merged.length;
                    merged.push(r);
                } else {
                    var existing = merged[topicRecIndex];
                    existing.evidence = existing.evidence.concat(r.evidence);
                    existing.message = existing.evidence.length + " topics need attention. See evidence for details.";
                    existing.title = "Topic Intervention Needed (" + existing.evidence.length + " topics)";
                }
            } else if (r.type === "question_review") {
                if (questionRecIndex === -1) {
                    questionRecIndex = merged.length;
                    merged.push(r);
                } else {
                    var existing = merged[questionRecIndex];
                    existing.evidence = existing.evidence.concat(r.evidence);
                    existing.message = existing.evidence.length + " questions may need review. See evidence for details.";
                    existing.title = "Question Review Recommended (" + existing.evidence.length + " questions)";
                }
            } else {
                merged.push(r);
            }
        }
        return merged;
    }

    function sortAndLimit(recs, limit) {
        recs.sort(function(a, b) {
            if (a.priority !== b.priority) return a.priority - b.priority;
            return 0;
        });
        if (limit && recs.length > limit) {
            recs = recs.slice(0, limit);
        }
        return recs;
    }

    function generate(analyticsResults) {
        analyticsResults = analyticsResults || {};
        var topicMastery = safeArray(analyticsResults.topicMastery);
        var atRiskStudents = safeArray(analyticsResults.atRiskStudents);
        var questionStatistics = safeArray(analyticsResults.questionStatistics);
        var difficultyPerformance = safeArray(analyticsResults.difficultyPerformance);
        var bloomPerformance = safeArray(analyticsResults.bloomPerformance);
        var trendDirection = safeStr(analyticsResults.trendDirection, "stable");
        var classOverview = analyticsResults.classOverview || {};

        var allRecs = [];
        allRecs = allRecs.concat(getStudentRecommendations(atRiskStudents));
        allRecs = allRecs.concat(getTopicRecommendations(topicMastery));
        allRecs = allRecs.concat(getQuestionRecommendations(questionStatistics));
        allRecs = allRecs.concat(getDifficultyRecommendations(difficultyPerformance));
        allRecs = allRecs.concat(getBloomRecommendations(bloomPerformance));
        allRecs = allRecs.concat(getTrendRecommendations(trendDirection, classOverview));

        allRecs = deduplicateRecommendations(allRecs);
        allRecs = sortAndLimit(allRecs, 5);

        return allRecs;
    }

    function hasSufficientData(analyticsResults) {
        analyticsResults = analyticsResults || {};
        var totalAttempts = safeNum(analyticsResults.totalAttempts, 0);
        var topicMastery = safeArray(analyticsResults.topicMastery);
        var overview = analyticsResults.classOverview || {};
        var attempts = safeNum(overview.totalAttempts, totalAttempts);
        if (attempts === 0 && topicMastery.length === 0) return false;
        return true;
    }

    function getEmptyRecommendations() {
        return [];
    }

    // ============================================================
    // Phase 5.4 — Actionable Teacher Insights (Impact-Based)
    // ============================================================

    function computeDataConfidence(totalAttempts, uniqueStudents) {
        if (totalAttempts >= 20 && uniqueStudents >= 8) return "high";
        if (totalAttempts >= 10 && uniqueStudents >= 4) return "medium";
        if (totalAttempts >= 3 && uniqueStudents >= 2) return "low";
        return "insufficient";
    }

    function computeImpactScore(affectedCount, totalCount, accuracyGap, confidence) {
        var studentImpact = totalCount > 0 ? affectedCount / totalCount : 0;
        var confMultiplier = { high: 1.0, medium: 0.8, low: 0.5, insufficient: 0.0 };
        var multiplier = confMultiplier[confidence] || 0;
        return Number((studentImpact * accuracyGap * multiplier * 100).toFixed(1));
    }

    function impactToPriority(score) {
        if (score >= 70) return "critical";
        if (score >= 40) return "high";
        if (score >= 15) return "medium";
        return "low";
    }

    function getTopicStudentMap(attempts) {
        var map = {};
        for (var i = 0; i < attempts.length; i++) {
            var a = attempts[i];
            if (!a || !a.studentId) continue;
            var questions = safeArray(a.questions);
            for (var j = 0; j < questions.length; j++) {
                var q = questions[j];
                if (!q) continue;
                var topic = safeStr(q.topic, "General");
                if (!map[topic]) map[topic] = {};
                if (!map[topic][a.studentId]) map[topic][a.studentId] = { correct: 0, total: 0 };
                map[topic][a.studentId].total++;
                if (q.correct) map[topic][a.studentId].correct++;
            }
        }
        return map;
    }

    function getTopicQuestionMap(attempts) {
        var map = {};
        for (var i = 0; i < attempts.length; i++) {
            var questions = safeArray(attempts[i].questions);
            for (var j = 0; j < questions.length; j++) {
                var q = questions[j];
                if (!q || !q.questionId) continue;
                var topic = safeStr(q.topic, "General");
                if (!map[topic]) map[topic] = {};
                if (!map[topic][q.questionId]) map[topic][q.questionId] = { correct: 0, total: 0 };
                map[topic][q.questionId].total++;
                if (q.correct) map[topic][q.questionId].correct++;
            }
        }
        return map;
    }

    function generateActionableInsights(analyticsResults) {
        analyticsResults = analyticsResults || {};
        var topicMastery = safeArray(analyticsResults.topicMastery);
        var atRiskStudents = safeArray(analyticsResults.atRiskStudents);
        var questionStatistics = safeArray(analyticsResults.questionStatistics);
        var difficultyPerformance = safeArray(analyticsResults.difficultyPerformance);
        var bloomPerformance = safeArray(analyticsResults.bloomPerformance);
        var trendDirection = safeStr(analyticsResults.trendDirection, "stable");
        var classOverview = analyticsResults.classOverview || {};
        var advancedQuestion = safeArray(analyticsResults.advancedQuestionAnalytics);
        var advancedStudent = analyticsResults.advancedStudentAnalytics || null;
        var advancedClass = analyticsResults.advancedClassAnalytics || null;
        var attempts = safeArray(analyticsResults.attempts);

        var totalAttempts = safeNum(classOverview.totalAttempts, attempts.length);
        var uniqueStudents = safeNum(classOverview.uniqueStudents, 0);
        var totalStudents = safeNum(analyticsResults.totalStudents, uniqueStudents);
        if (totalStudents < uniqueStudents) totalStudents = uniqueStudents;
        var confidence = computeDataConfidence(totalAttempts, uniqueStudents);

        var insights = [];

        // --- 1. Topic-Student Cross-Level Insights ---
        var topicStudentMap = getTopicStudentMap(attempts);
        var topicQuestionMap = getTopicQuestionMap(attempts);
        for (var i = 0; i < topicMastery.length; i++) {
            var t = topicMastery[i];
            if (t.masteryLevel !== "Needs Support") continue;
            var topicName = t.topic;
            var topicAccuracy = t.accuracy;
            var accuracyGap = Math.max(0, 60 - topicAccuracy);
            if (accuracyGap <= 0) continue;

            // Find affected students for this topic
            var topicStudents = topicStudentMap[topicName] || {};
            var affectedStudentIds = [];
            var sids = Object.keys(topicStudents);
            for (var j = 0; j < sids.length; j++) {
                var sd = topicStudents[sids[j]];
                var sAcc = sd.total > 0 ? (sd.correct / sd.total) * 100 : 0;
                if (sAcc < 60) affectedStudentIds.push(sids[j]);
            }

            // Find difficult questions for this topic
            var topicQuestions = topicQuestionMap[topicName] || {};
            var affectedQuestionIds = [];
            var qids = Object.keys(topicQuestions);
            for (var j = 0; j < qids.length; j++) {
                var qd = topicQuestions[qids[j]];
                var qAcc = qd.total > 0 ? (qd.correct / qd.total) * 100 : 0;
                if (qAcc < 40 && qd.total >= 2) affectedQuestionIds.push(qids[j]);
            }

            var impactScore = computeImpactScore(affectedStudentIds.length, totalStudents, accuracyGap, confidence);
            var priority = impactToPriority(impactScore);

            var explanation = topicName + " has " + topicAccuracy + "% class accuracy";
            explanation += " (" + t.totalQuestions + " questions from " + sids.length + " students).";
            explanation += " " + affectedStudentIds.length + " student" + (affectedStudentIds.length !== 1 ? "s" : "") + " performing below 60% on this topic.";
            if (affectedQuestionIds.length > 0) {
                explanation += " " + affectedQuestionIds.length + " question" + (affectedQuestionIds.length !== 1 ? "s" : "") + " with below 40% accuracy.";
            }

            insights.push({
                type: "topic_student_support",
                priority: priority,
                title: topicName + " — " + affectedStudentIds.length + " student" + (affectedStudentIds.length !== 1 ? "s" : "") + " affected",
                explanation: explanation,
                evidence: [
                    topicName + ": " + topicAccuracy + "% class accuracy (" + t.totalQuestions + " questions)",
                    affectedStudentIds.length + " student" + (affectedStudentIds.length !== 1 ? "s" : "") + " below 60% on this topic",
                    affectedQuestionIds.length + " question" + (affectedQuestionIds.length !== 1 ? "s" : "") + " below 40% accuracy"
                ],
                action: "Provide targeted practice on " + topicName + ". Review " + affectedQuestionIds.length + " difficult question" + (affectedQuestionIds.length !== 1 ? "s" : "") + ".",
                actionLabel: "View Topics",
                actionTarget: "topics",
                dataSufficiency: confidence,
                data: {
                    affectedStudentIds: affectedStudentIds,
                    affectedTopics: [topicName],
                    affectedQuestionIds: affectedQuestionIds,
                    topicAccuracy: topicAccuracy,
                    accuracyGap: accuracyGap,
                    studentsAffected: affectedStudentIds.length,
                    totalStudents: totalStudents,
                    priorityCalculation: {
                        affectedStudents: affectedStudentIds.length,
                        totalStudents: totalStudents,
                        accuracyGap: accuracyGap,
                        confidence: confidence,
                        impactScore: impactScore
                    }
                }
            });
        }

        // --- 2. High-Risk Student Insights (cross-level) ---
        var highRisk = [];
        var mediumRisk = [];
        for (var i = 0; i < atRiskStudents.length; i++) {
            if (atRiskStudents[i].riskLevel === "high") highRisk.push(atRiskStudents[i]);
            else if (atRiskStudents[i].riskLevel === "medium") mediumRisk.push(atRiskStudents[i]);
        }
        if (highRisk.length > 0) {
            var affectedIds = [];
            var evidenceLines = [];
            for (var i = 0; i < highRisk.length; i++) {
                affectedIds.push(highRisk[i].studentId);
                evidenceLines.push(highRisk[i].studentId + ": " + (highRisk[i].reasons ? highRisk[i].reasons.join("; ") : "High risk"));
            }
            var impactScore = computeImpactScore(highRisk.length, totalStudents, 50, confidence);
            var priority = impactToPriority(impactScore);

            insights.push({
                type: "student_risk_alert",
                priority: priority,
                title: highRisk.length + " student" + (highRisk.length !== 1 ? "s" : "") + " at high risk",
                explanation: highRisk.length + " student" + (highRisk.length !== 1 ? "s" : "") + " performing critically below class average. Immediate attention recommended.",
                evidence: evidenceLines,
                action: "Review individual student performance and provide targeted intervention.",
                actionLabel: "View Students",
                actionTarget: "students",
                dataSufficiency: confidence,
                data: {
                    affectedStudentIds: affectedIds,
                    riskLevel: "high",
                    priorityCalculation: {
                        affectedStudents: highRisk.length,
                        totalStudents: totalStudents,
                        accuracyGap: 50,
                        confidence: confidence,
                        impactScore: impactScore
                    }
                }
            });
        }

        // --- 3. Difficult Question Insights (cross-level with topic + students) ---
        var difficultQuestions = [];
        for (var i = 0; i < questionStatistics.length; i++) {
            var q = questionStatistics[i];
            if (q.attempts >= 3 && q.accuracy < 40) difficultQuestions.push(q);
        }
        if (difficultQuestions.length > 0) {
            var affectedQIds = [];
            var affectedTopics = {};
            var evidenceLines = [];
            for (var i = 0; i < difficultQuestions.length; i++) {
                var q = difficultQuestions[i];
                affectedQIds.push(q.questionId);
                if (q.topic) affectedTopics[q.topic] = true;
                evidenceLines.push(q.questionId + " (" + (q.topic || "General") + "): " + q.accuracy + "% accuracy, " + q.attempts + " attempts");
            }
            var topicNames = Object.keys(affectedTopics);
            var accuracyGap = 40;
            if (difficultQuestions.length > 0) {
                var avgAcc = 0;
                for (var i = 0; i < difficultQuestions.length; i++) avgAcc += difficultQuestions[i].accuracy;
                avgAcc = avgAcc / difficultQuestions.length;
                accuracyGap = Math.max(0, 40 - avgAcc);
            }
            var impactScore = computeImpactScore(difficultQuestions.length, Math.max(questionStatistics.length, 1), accuracyGap, confidence);
            var priority = impactToPriority(impactScore);

            insights.push({
                type: "question_review_needed",
                priority: priority,
                title: difficultQuestions.length + " question" + (difficultQuestions.length !== 1 ? "s" : "") + " need review",
                explanation: difficultQuestions.length + " question" + (difficultQuestions.length !== 1 ? "s" : "") + " with below 40% accuracy across " + topicNames.length + " topic" + (topicNames.length !== 1 ? "s" : "") + ". May indicate clarity or content issues.",
                evidence: evidenceLines,
                action: "Review these questions for clarity, wording, or answer correctness.",
                actionLabel: "View Questions",
                actionTarget: "questions",
                dataSufficiency: confidence,
                data: {
                    affectedQuestionIds: affectedQIds,
                    affectedTopics: topicNames,
                    priorityCalculation: {
                        affectedStudents: difficultQuestions.length,
                        totalStudents: Math.max(questionStatistics.length, 1),
                        accuracyGap: accuracyGap,
                        confidence: confidence,
                        impactScore: impactScore
                    }
                }
            });
        }

        // --- 4. Declining Trend with Evidence ---
        if (trendDirection === "declining") {
            var impactScore = computeImpactScore(uniqueStudents, totalStudents, 30, confidence);
            var priority = impactToPriority(impactScore);

            insights.push({
                type: "declining_trend_alert",
                priority: priority,
                title: "Class performance declining",
                explanation: "Performance trend is declining across recent assessments. Current average: " + safeNum(classOverview.averagePercentage, 0) + "%.",
                evidence: [
                    "Trend direction: declining",
                    "Current average: " + safeNum(classOverview.averagePercentage, 0) + "%",
                    "Based on " + totalAttempts + " attempts from " + uniqueStudents + " students"
                ],
                action: "Review recent assessment results and consider re-teaching difficult concepts.",
                actionLabel: "View Performance",
                actionTarget: "performance",
                dataSufficiency: confidence,
                data: {
                    priorityCalculation: {
                        affectedStudents: uniqueStudents,
                        totalStudents: totalStudents,
                        accuracyGap: 30,
                        confidence: confidence,
                        impactScore: impactScore
                    }
                }
            });
        }

        // --- 5. Difficulty Level Concerns ---
        var lowDifficulties = [];
        for (var i = 0; i < difficultyPerformance.length; i++) {
            var d = difficultyPerformance[i];
            if (d.attempts >= 5 && d.accuracy < 50) lowDifficulties.push(d);
        }
        if (lowDifficulties.length > 0) {
            var names = [];
            var evidenceLines = [];
            var totalGap = 0;
            for (var i = 0; i < lowDifficulties.length; i++) {
                names.push(lowDifficulties[i].difficulty);
                evidenceLines.push(lowDifficulties[i].difficulty + ": " + lowDifficulties[i].accuracy + "% accuracy (" + lowDifficulties[i].attempts + " attempts)");
                totalGap += Math.max(0, 50 - lowDifficulties[i].accuracy);
            }
            var avgGap = totalGap / lowDifficulties.length;
            var impactScore = computeImpactScore(uniqueStudents, totalStudents, avgGap, confidence);
            var priority = impactToPriority(impactScore);

            insights.push({
                type: "difficulty_concern",
                priority: priority,
                title: names.join(" + ") + " level concerns",
                explanation: "Class struggling with " + names.join(" and ") + " level questions (below 50% accuracy).",
                evidence: evidenceLines,
                action: "Provide additional guided practice at " + names.join(" and ") + " difficulty level.",
                actionLabel: "View Performance",
                actionTarget: "performance",
                dataSufficiency: confidence,
                data: {
                    priorityCalculation: {
                        affectedStudents: uniqueStudents,
                        totalStudents: totalStudents,
                        accuracyGap: avgGap,
                        confidence: confidence,
                        impactScore: impactScore
                    }
                }
            });
        }

        // --- 6. Bloom Level Concerns ---
        var highOrderLevels = ["analysis", "synthesis", "evaluation", "create"];
        var lowBloom = [];
        for (var i = 0; i < bloomPerformance.length; i++) {
            var b = bloomPerformance[i];
            var isHighOrder = false;
            for (var j = 0; j < highOrderLevels.length; j++) {
                if (b.bloom && b.bloom.toLowerCase().indexOf(highOrderLevels[j]) !== -1) {
                    isHighOrder = true;
                    break;
                }
            }
            if (isHighOrder && b.attempts >= 5 && b.accuracy < 50) lowBloom.push(b);
        }
        if (lowBloom.length > 0) {
            var names = [];
            var evidenceLines = [];
            var totalGap = 0;
            for (var i = 0; i < lowBloom.length; i++) {
                names.push(lowBloom[i].bloom);
                evidenceLines.push(lowBloom[i].bloom + ": " + lowBloom[i].accuracy + "% accuracy (" + lowBloom[i].attempts + " attempts)");
                totalGap += Math.max(0, 50 - lowBloom[i].accuracy);
            }
            var avgGap = totalGap / lowBloom.length;
            var impactScore = computeImpactScore(uniqueStudents, totalStudents, avgGap, confidence);
            var priority = impactToPriority(impactScore);

            insights.push({
                type: "bloom_concern",
                priority: priority,
                title: "Higher-order thinking concern",
                explanation: "Performance on " + names.join(", ") + " level questions is below 50%. Students may need support with analytical thinking.",
                evidence: evidenceLines,
                action: "Provide practice involving analytical and evaluative thinking questions.",
                actionLabel: "View Performance",
                actionTarget: "performance",
                dataSufficiency: confidence,
                data: {
                    priorityCalculation: {
                        affectedStudents: uniqueStudents,
                        totalStudents: totalStudents,
                        accuracyGap: avgGap,
                        confidence: confidence,
                        impactScore: impactScore
                    }
                }
            });
        }

        // --- 7. Practice vs Assessment Gap (from advanced class analytics) ---
        if (advancedClass && advancedClass.practiceAssessment) {
            var pa = advancedClass.practiceAssessment;
            if (pa.pattern === "better_in_practice" || pa.pattern === "better_in_assessment") {
                var gapSize = Math.abs(pa.difference);
                if (gapSize > 10) {
                    var impactScore = computeImpactScore(pa.assessmentStudents || uniqueStudents, totalStudents, gapSize, confidence);
                    var priority = impactToPriority(impactScore);
                    var desc = pa.pattern === "better_in_practice"
                        ? "Students perform " + Number(gapSize).toFixed(0) + "% better in practice than assessments. May indicate test anxiety or assessment format issues."
                        : "Students perform " + Number(gapSize).toFixed(0) + "% better in assessments than practice. Practice materials may need review.";

                    insights.push({
                        type: "practice_assessment_gap",
                        priority: priority,
                        title: "Practice vs Assessment gap",
                        explanation: desc,
                        evidence: [
                            "Practice average: " + pa.practiceAvg + "% (" + pa.practiceAttempts + " attempts)",
                            "Assessment average: " + pa.assessmentAvg + "% (" + pa.assessmentAttempts + " attempts)",
                            "Difference: " + pa.difference + "%"
                        ],
                        action: pa.pattern === "better_in_practice"
                            ? "Review assessment format and consider reducing time pressure."
                            : "Review practice materials for alignment with assessment expectations.",
                        actionLabel: "View Performance",
                        actionTarget: "performance",
                        dataSufficiency: confidence,
                        data: {
                            priorityCalculation: {
                                affectedStudents: pa.assessmentStudents || uniqueStudents,
                                totalStudents: totalStudents,
                                accuracyGap: gapSize,
                                confidence: confidence,
                                impactScore: impactScore
                            }
                        }
                    });
                }
            }
        }

        // Sort by impact score (highest first)
        insights.sort(function(a, b) {
            var scoreA = (a.data && a.data.priorityCalculation) ? a.data.priorityCalculation.impactScore : 0;
            var scoreB = (b.data && b.data.priorityCalculation) ? b.data.priorityCalculation.impactScore : 0;
            return scoreB - scoreA;
        });

        // Limit to top 5
        if (insights.length > 5) insights = insights.slice(0, 5);

        return insights;
    }

    return {
        generate: generate,
        generateActionableInsights: generateActionableInsights,
        hasSufficientData: hasSufficientData,
        getEmptyRecommendations: getEmptyRecommendations,
        getTopicRecommendations: getTopicRecommendations,
        getStudentRecommendations: getStudentRecommendations,
        getQuestionRecommendations: getQuestionRecommendations,
        getDifficultyRecommendations: getDifficultyRecommendations,
        getBloomRecommendations: getBloomRecommendations,
        getTrendRecommendations: getTrendRecommendations,
        deduplicateRecommendations: deduplicateRecommendations,
        sortAndLimit: sortAndLimit
    };
})();
