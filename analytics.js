var Analytics = (function() {

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

    function getClassOverview(attempts) {
        attempts = safeArray(attempts);
        var totalAttempts = attempts.length;
        if (totalAttempts === 0) {
            return {
                totalAttempts: 0,
                uniqueStudents: 0,
                averageScore: 0,
                averagePercentage: 0,
                completionRate: 0,
                totalQuestions: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                accuracy: 0
            };
        }
        var studentMap = {};
        var totalScore = 0;
        var totalPercentage = 0;
        var totalQuestions = 0;
        var correctAnswers = 0;
        var completed = 0;
        for (var i = 0; i < attempts.length; i++) {
            var a = attempts[i];
            if (a && a.studentId) studentMap[a.studentId] = true;
            totalScore += safeNum(a.score);
            totalPercentage += safeNum(a.percentage);
            var questions = safeArray(a.questions);
            totalQuestions += questions.length;
            for (var j = 0; j < questions.length; j++) {
                if (questions[j] && questions[j].correct) correctAnswers++;
            }
            if (a && a.completedAt) completed++;
        }
        var uniqueStudents = Object.keys(studentMap).length;
        return {
            totalAttempts: totalAttempts,
            uniqueStudents: uniqueStudents,
            averageScore: totalAttempts > 0 ? Number((totalScore / totalAttempts).toFixed(2)) : 0,
            averagePercentage: totalAttempts > 0 ? Number((totalPercentage / totalAttempts).toFixed(2)) : 0,
            completionRate: totalAttempts > 0 ? Number(((completed / totalAttempts) * 100).toFixed(2)) : 0,
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
            incorrectAnswers: totalQuestions - correctAnswers,
            accuracy: totalQuestions > 0 ? Number(((correctAnswers / totalQuestions) * 100).toFixed(2)) : 0
        };
    }

    function getStudentPerformance(studentId, attempts) {
        attempts = safeArray(attempts);
        if (!studentId) {
            return {
                studentId: null,
                totalAttempts: 0,
                averageScore: 0,
                averagePercentage: 0,
                bestPercentage: 0,
                lowestPercentage: 100,
                totalQuestions: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                accuracy: 0,
                recentPerformance: [],
                topicStrengths: [],
                topicWeaknesses: []
            };
        }
        var studentAttempts = [];
        for (var i = 0; i < attempts.length; i++) {
            if (attempts[i] && attempts[i].studentId === studentId) {
                studentAttempts.push(attempts[i]);
            }
        }
        var totalAttempts = studentAttempts.length;
        if (totalAttempts === 0) {
            return {
                studentId: studentId,
                totalAttempts: 0,
                averageScore: 0,
                averagePercentage: 0,
                bestPercentage: 0,
                lowestPercentage: 100,
                totalQuestions: 0,
                correctAnswers: 0,
                incorrectAnswers: 0,
                accuracy: 0,
                recentPerformance: [],
                topicStrengths: [],
                topicWeaknesses: []
            };
        }
        var totalScore = 0;
        var totalPercentage = 0;
        var bestPercentage = 0;
        var lowestPercentage = 100;
        var totalQuestions = 0;
        var correctAnswers = 0;
        var topicData = {};
        var recentPerformance = [];
        for (var i = 0; i < studentAttempts.length; i++) {
            var a = studentAttempts[i];
            var pct = safeNum(a.percentage);
            totalScore += safeNum(a.score);
            totalPercentage += pct;
            if (pct > bestPercentage) bestPercentage = pct;
            if (pct < lowestPercentage) lowestPercentage = pct;
            var questions = safeArray(a.questions);
            totalQuestions += questions.length;
            for (var j = 0; j < questions.length; j++) {
                var q = questions[j];
                if (q && q.correct) correctAnswers++;
                if (q) {
                    var topic = safeStr(q.topic, "General");
                    if (!topicData[topic]) topicData[topic] = { correct: 0, total: 0 };
                    topicData[topic].total++;
                    if (q.correct) topicData[topic].correct++;
                }
            }
            recentPerformance.push({
                attemptId: a.attemptId || "",
                timestamp: a.timestamp || a.completedAt || "",
                percentage: pct,
                score: safeNum(a.score),
                total: questions.length
            });
        }
        var topicStrengths = [];
        var topicWeaknesses = [];
        var topicKeys = Object.keys(topicData);
        for (var i = 0; i < topicKeys.length; i++) {
            var topic = topicKeys[i];
            var td = topicData[topic];
            var accuracy = td.total > 0 ? Number(((td.correct / td.total) * 100).toFixed(2)) : 0;
            var entry = { topic: topic, accuracy: accuracy, correct: td.correct, total: td.total };
            if (accuracy >= 70) topicStrengths.push(entry);
            else topicWeaknesses.push(entry);
        }
        topicStrengths.sort(function(a, b) { return b.accuracy - a.accuracy; });
        topicWeaknesses.sort(function(a, b) { return a.accuracy - b.accuracy; });
        return {
            studentId: studentId,
            totalAttempts: totalAttempts,
            averageScore: totalAttempts > 0 ? Number((totalScore / totalAttempts).toFixed(2)) : 0,
            averagePercentage: totalAttempts > 0 ? Number((totalPercentage / totalAttempts).toFixed(2)) : 0,
            bestPercentage: bestPercentage,
            lowestPercentage: lowestPercentage,
            totalQuestions: totalQuestions,
            correctAnswers: correctAnswers,
            incorrectAnswers: totalQuestions - correctAnswers,
            accuracy: totalQuestions > 0 ? Number(((correctAnswers / totalQuestions) * 100).toFixed(2)) : 0,
            recentPerformance: recentPerformance,
            topicStrengths: topicStrengths,
            topicWeaknesses: topicWeaknesses
        };
    }

    function getTopicMastery(attempts) {
        attempts = safeArray(attempts);
        var topicData = {};
        for (var i = 0; i < attempts.length; i++) {
            var questions = safeArray(attempts[i].questions);
            for (var j = 0; j < questions.length; j++) {
                var q = questions[j];
                if (!q) continue;
                var topic = safeStr(q.topic, "General");
                if (!topicData[topic]) topicData[topic] = { correct: 0, total: 0 };
                topicData[topic].total++;
                if (q.correct) topicData[topic].correct++;
            }
        }
        var results = [];
        var keys = Object.keys(topicData);
        for (var i = 0; i < keys.length; i++) {
            var topic = keys[i];
            var td = topicData[topic];
            var accuracy = td.total > 0 ? Number(((td.correct / td.total) * 100).toFixed(2)) : 0;
            var masteryLevel = "Needs Support";
            if (accuracy >= 80) masteryLevel = "Strong";
            else if (accuracy >= 60) masteryLevel = "Developing";
            results.push({
                topic: topic,
                totalQuestions: td.total,
                correctAnswers: td.correct,
                incorrectAnswers: td.total - td.correct,
                accuracy: accuracy,
                masteryLevel: masteryLevel
            });
        }
        results.sort(function(a, b) { return b.accuracy - a.accuracy; });
        return results;
    }

    function getQuestionStatistics(attempts) {
        attempts = safeArray(attempts);
        var questionData = {};
        for (var i = 0; i < attempts.length; i++) {
            var questions = safeArray(attempts[i].questions);
            for (var j = 0; j < questions.length; j++) {
                var q = questions[j];
                if (!q || !q.questionId) continue;
                var qid = q.questionId;
                if (!questionData[qid]) {
                    questionData[qid] = {
                        questionId: qid,
                        attempts: 0,
                        correct: 0,
                        incorrect: 0,
                        totalTime: 0,
                        difficulty: q.difficulty || null,
                        topic: q.topic || null,
                        bloom: q.bloom || null
                    };
                }
                questionData[qid].attempts++;
                if (q.correct) questionData[qid].correct++;
                else questionData[qid].incorrect++;
                questionData[qid].totalTime += safeNum(q.timeUsed);
            }
        }
        var results = [];
        var keys = Object.keys(questionData);
        for (var i = 0; i < keys.length; i++) {
            var qd = questionData[keys[i]];
            results.push({
                questionId: qd.questionId,
                attempts: qd.attempts,
                correct: qd.correct,
                incorrect: qd.incorrect,
                accuracy: qd.attempts > 0 ? Number(((qd.correct / qd.attempts) * 100).toFixed(2)) : 0,
                averageTimeUsed: qd.attempts > 0 ? Number((qd.totalTime / qd.attempts).toFixed(2)) : 0,
                difficulty: qd.difficulty,
                topic: qd.topic,
                bloom: qd.bloom
            });
        }
        results.sort(function(a, b) { return a.accuracy - b.accuracy; });
        return results;
    }

    function getDifficultyPerformance(attempts) {
        attempts = safeArray(attempts);
        var diffData = {};
        for (var i = 0; i < attempts.length; i++) {
            var questions = safeArray(attempts[i].questions);
            for (var j = 0; j < questions.length; j++) {
                var q = questions[j];
                if (!q) continue;
                var diff = safeStr(q.difficulty, "unspecified");
                if (!diffData[diff]) diffData[diff] = { attempts: 0, correct: 0, incorrect: 0 };
                diffData[diff].attempts++;
                if (q.correct) diffData[diff].correct++;
                else diffData[diff].incorrect++;
            }
        }
        var results = [];
        var keys = Object.keys(diffData);
        for (var i = 0; i < keys.length; i++) {
            var diff = keys[i];
            var dd = diffData[diff];
            results.push({
                difficulty: diff,
                attempts: dd.attempts,
                correct: dd.correct,
                incorrect: dd.incorrect,
                accuracy: dd.attempts > 0 ? Number(((dd.correct / dd.attempts) * 100).toFixed(2)) : 0
            });
        }
        results.sort(function(a, b) { return a.accuracy - b.accuracy; });
        return results;
    }

    function getBloomPerformance(attempts) {
        attempts = safeArray(attempts);
        var bloomData = {};
        for (var i = 0; i < attempts.length; i++) {
            var questions = safeArray(attempts[i].questions);
            for (var j = 0; j < questions.length; j++) {
                var q = questions[j];
                if (!q) continue;
                var bloom = safeStr(q.bloom, "unspecified");
                if (!bloomData[bloom]) bloomData[bloom] = { attempts: 0, correct: 0, incorrect: 0 };
                bloomData[bloom].attempts++;
                if (q.correct) bloomData[bloom].correct++;
                else bloomData[bloom].incorrect++;
            }
        }
        var results = [];
        var keys = Object.keys(bloomData);
        for (var i = 0; i < keys.length; i++) {
            var bloom = keys[i];
            var bd = bloomData[bloom];
            results.push({
                bloom: bloom,
                attempts: bd.attempts,
                correct: bd.correct,
                incorrect: bd.incorrect,
                accuracy: bd.attempts > 0 ? Number(((bd.correct / bd.attempts) * 100).toFixed(2)) : 0
            });
        }
        results.sort(function(a, b) { return a.accuracy - b.accuracy; });
        return results;
    }

    function getAssessmentTrend(attempts) {
        attempts = safeArray(attempts);
        var trend = [];
        for (var i = 0; i < attempts.length; i++) {
            var a = attempts[i];
            if (!a) continue;
            var ts = a.timestamp || a.completedAt || "";
            var questions = safeArray(a.questions);
            trend.push({
                attemptId: a.attemptId || "",
                timestamp: ts,
                percentage: safeNum(a.percentage),
                score: safeNum(a.score),
                total: questions.length || safeNum(a.total)
            });
        }
        trend.sort(function(a, b) {
            if (!a.timestamp || !b.timestamp) return 0;
            return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
        });
        return trend;
    }

    function getAtRiskStudents(attempts) {
        attempts = safeArray(attempts);
        var studentData = {};
        for (var i = 0; i < attempts.length; i++) {
            var a = attempts[i];
            if (!a || !a.studentId) continue;
            var sid = a.studentId;
            if (!studentData[sid]) {
                studentData[sid] = {
                    studentId: sid,
                    attempts: [],
                    totalAttempts: 0,
                    recentAttempts: [],
                    topicFails: {}
                };
            }
            var sd = studentData[sid];
            var pct = safeNum(a.percentage);
            sd.attempts.push(pct);
            sd.totalAttempts++;
            if (a.completedAt || a.timestamp) {
                sd.recentAttempts.push({
                    percentage: pct,
                    timestamp: a.timestamp || a.completedAt
                });
            }
            var questions = safeArray(a.questions);
            for (var j = 0; j < questions.length; j++) {
                var q = questions[j];
                if (!q) continue;
                var topic = safeStr(q.topic, "General");
                if (!sd.topicFails[topic]) sd.topicFails[topic] = { correct: 0, total: 0 };
                sd.topicFails[topic].total++;
                if (q.correct) sd.topicFails[topic].correct++;
            }
        }
        var results = [];
        var sids = Object.keys(studentData);
        for (var i = 0; i < sids.length; i++) {
            var sd = studentData[sids[i]];
            var reasons = [];
            var riskLevel = "low";
            if (sd.totalAttempts < 2) {
                continue;
            }
            var avg = 0;
            for (var j = 0; j < sd.attempts.length; j++) avg += sd.attempts[j];
            avg = sd.totalAttempts > 0 ? avg / sd.totalAttempts : 0;
            if (avg < 50) {
                reasons.push("Consistently low average performance (" + Number(avg).toFixed(1) + "%)");
                riskLevel = "high";
            } else if (avg < 65) {
                reasons.push("Below average performance (" + Number(avg).toFixed(1) + "%)");
                if (riskLevel !== "high") riskLevel = "medium";
            }
            sd.recentAttempts.sort(function(a, b) {
                if (!a.timestamp || !b.timestamp) return 0;
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            });
            var recent = sd.recentAttempts.slice(0, 3);
            if (recent.length >= 2) {
                var recentAvg = 0;
                for (var j = 0; j < recent.length; j++) recentAvg += recent[j].percentage;
                recentAvg = recent.length > 0 ? recentAvg / recent.length : 0;
                if (recentAvg < 45) {
                    reasons.push("Low recent performance (" + Number(recentAvg).toFixed(1) + "%)");
                    riskLevel = "high";
                }
            }
            if (recent.length >= 3) {
                var declining = true;
                for (var j = 1; j < recent.length; j++) {
                    if (recent[j].percentage >= recent[j - 1].percentage) { declining = false; break; }
                }
                if (declining) {
                    reasons.push("Declining performance trend");
                    if (riskLevel !== "high") riskLevel = "medium";
                }
            }
            var weakTopics = [];
            var topicKeys = Object.keys(sd.topicFails);
            for (var j = 0; j < topicKeys.length; j++) {
                var topic = topicKeys[j];
                var td = sd.topicFails[topic];
                var accuracy = td.total > 0 ? Number(((td.correct / td.total) * 100).toFixed(2)) : 0;
                if (accuracy < 40 && td.total >= 2) {
                    weakTopics.push(topic);
                }
            }
            if (weakTopics.length > 0) {
                reasons.push("Needs support in: " + weakTopics.join(", "));
                if (riskLevel !== "high") riskLevel = "medium";
            }
            if (reasons.length > 0) {
                results.push({
                    studentId: sd.studentId,
                    riskLevel: riskLevel,
                    reasons: reasons
                });
            }
        }
        results.sort(function(a, b) {
            var order = { high: 0, medium: 1, low: 2 };
            return (order[a.riskLevel] || 2) - (order[b.riskLevel] || 2);
        });
        return results;
    }

    function getTeacherOverview(attempts, totalStudents) {
        attempts = safeArray(attempts);
        totalStudents = safeNum(totalStudents, 0);

        var overview = getClassOverview(attempts);
        var trend = getAssessmentTrend(attempts);

        // Calculate active students (students with attempts in last 30 days)
        var activeStudentMap = {};
        var thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        for (var i = 0; i < attempts.length; i++) {
            var a = attempts[i];
            if (!a || !a.studentId) continue;
            var ts = a.timestamp || a.completedAt || "";
            if (ts) {
                var d = new Date(ts);
                if (!isNaN(d.getTime()) && d >= thirtyDaysAgo) {
                    activeStudentMap[a.studentId] = true;
                }
            }
        }
        var activeStudents = Object.keys(activeStudentMap).length;

        // Participation rate
        var participationRate = totalStudents > 0
            ? Number(((activeStudents / totalStudents) * 100).toFixed(2))
            : 0;

        // Overall trend direction
        var trendDirection = "stable";
        if (trend.length >= 3) {
            var recentCount = Math.min(5, Math.floor(trend.length / 2));
            var olderCount = recentCount;
            var recentSum = 0;
            var olderSum = 0;
            for (var i = 0; i < recentCount; i++) {
                recentSum += safeNum(trend[trend.length - 1 - i].percentage);
            }
            for (var i = 0; i < olderCount; i++) {
                olderSum += safeNum(trend[olderCount - 1 - i].percentage);
            }
            var recentAvg = recentCount > 0 ? recentSum / recentCount : 0;
            var olderAvg = olderCount > 0 ? olderSum / olderCount : 0;
            var diff = recentAvg - olderAvg;
            if (diff > 3) trendDirection = "improving";
            else if (diff < -3) trendDirection = "declining";
        } else if (trend.length >= 2) {
            var first = safeNum(trend[0].percentage);
            var last = safeNum(trend[trend.length - 1].percentage);
            var diff = last - first;
            if (diff > 5) trendDirection = "improving";
            else if (diff < -5) trendDirection = "declining";
        }

        return {
            totalAttempts: overview.totalAttempts,
            uniqueStudents: overview.uniqueStudents,
            averageScore: overview.averageScore,
            averagePercentage: overview.averagePercentage,
            completionRate: overview.completionRate,
            totalQuestions: overview.totalQuestions,
            correctAnswers: overview.correctAnswers,
            incorrectAnswers: overview.incorrectAnswers,
            accuracy: overview.accuracy,
            totalStudents: totalStudents,
            activeStudents: activeStudents,
            participationRate: participationRate,
            trendDirection: trendDirection,
            trendDataPoints: trend.length
        };
    }

    return {
        getClassOverview: getClassOverview,
        getStudentPerformance: getStudentPerformance,
        getTopicMastery: getTopicMastery,
        getQuestionStatistics: getQuestionStatistics,
        getDifficultyPerformance: getDifficultyPerformance,
        getBloomPerformance: getBloomPerformance,
        getAssessmentTrend: getAssessmentTrend,
        getAtRiskStudents: getAtRiskStudents,
        getTeacherOverview: getTeacherOverview
    };
})();
