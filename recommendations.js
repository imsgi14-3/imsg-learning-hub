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
                confidence: weakTopics.length >= 3 ? "strong" : "limited"
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
                confidence: "strong"
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
        for (var i = 0; i < atRiskStudents.length; i++) {
            var s = atRiskStudents[i];
            var reasons = s.reasons ? s.reasons.join("; ") : "Needs attention";
            evidenceLines.push(s.studentId + " (" + s.riskLevel + " risk): " + reasons);
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
            confidence: total >= 3 ? "strong" : "limited"
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
        for (var i = 0; i < difficultQuestions.length; i++) {
            var q = difficultQuestions[i];
            var parts = [q.questionId];
            if (q.topic) parts.push("Topic: " + q.topic);
            if (q.difficulty) parts.push("Difficulty: " + q.difficulty);
            parts.push("Accuracy: " + q.accuracy + "% (" + q.attempts + " attempts)");
            evidenceLines.push(parts.join(" — "));
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
            confidence: difficultQuestions.length >= 3 ? "strong" : "limited"
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

    return {
        generate: generate,
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
