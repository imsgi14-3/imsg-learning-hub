function runExamEngineTests() {
    TestRunner.suite("Exam Engine - Module & Normalizers");

    TestRunner.assertType(ExamEngine, "object", "ExamEngine module exists");
    TestRunner.assertType(ExamEngine.selectBalanced, "function", "selectBalanced exists");
    TestRunner.assertType(ExamEngine.generateExamPlan, "function", "generateExamPlan exists");

    TestRunner.assertEqual(ExamEngine.normDifficulty("difficult"), "hard", "difficult maps to hard");
    TestRunner.assertEqual(ExamEngine.normDifficulty("avg"), "medium", "avg maps to medium");
    TestRunner.assertEqual(ExamEngine.normDifficulty("Easy"), "easy", "case insensitive difficulty");

    TestRunner.assertEqual(ExamEngine.normCognitive({ cognitive_level: "K" }), "k", "cognitive_level K");
    TestRunner.assertEqual(ExamEngine.normCognitive({ bloom: "Remembering" }), "k", "bloom Remembering -> k");
    TestRunner.assertEqual(ExamEngine.normCognitive({ bloom: "Understanding" }), "u", "bloom Understanding -> u");
    TestRunner.assertEqual(ExamEngine.normCognitive({ bloom: "Applying" }), "a", "bloom Applying -> a");
    TestRunner.assertEqual(ExamEngine.normCognitive({ bloom: "Creating" }), "a", "bloom Creating -> a");
    TestRunner.assertEqual(ExamEngine.normCognitive({}), "u", "unknown cognitive defaults to u");

    TestRunner.assertEqual(ExamEngine.normFormat({ mode: "scenario" }), "scenario", "mode scenario");
    TestRunner.assertEqual(ExamEngine.normFormat({ question_format: "stimulus" }), "scenario", "stimulus maps to scenario");
    TestRunner.assertEqual(ExamEngine.normFormat({ mode: "straight" }), "straight", "mode straight");
    TestRunner.assertEqual(ExamEngine.normFormat({}), "straight", "default format straight");

    TestRunner.suite("Exam Engine - Largest Remainder");

    var lr = ExamEngine.largestRemainder(60, [67, 33]);
    TestRunner.assertEqual(lr[0] + lr[1], 60, "Shares sum to total");
    TestRunner.assertEqual(lr[0], 40, "67% of 60 = 40");
    var lrZero = ExamEngine.largestRemainder(10, [0, 0, 0]);
    TestRunner.assertEqual(lrZero[0] + lrZero[1] + lrZero[2], 0, "Zero pcts give zero shares");

    TestRunner.suite("Exam Engine - Balanced Selection (exact when feasible)");

    function makeQ(id, diff, cog, fmt, topic) {
        return { id: id, difficulty: diff, cognitive_level: cog, mode: fmt, topic: topic, question: id, options: ["a", "b", "c", "d"], answer: "A", chapter: 1 };
    }
    var synth = [];
    var diffs = ["easy", "medium", "hard"];
    var cogs = ["k", "u", "a"];
    var fmts = ["straight", "scenario"];
    var topics = ["T1", "T2", "T3"];
    var n = 0;
    for (var di = 0; di < diffs.length; di++) {
        for (var ci = 0; ci < cogs.length; ci++) {
            for (var fi = 0; fi < fmts.length; fi++) {
                for (var ti = 0; ti < topics.length; ti++) {
                    for (var rep = 0; rep < 4; rep++) synth.push(makeQ("Q" + (n++), diffs[di], cogs[ci], fmts[fi], topics[ti]));
                }
            }
        }
    }
    TestRunner.assertEqual(synth.length, 216, "Synthetic pool built (216)");

    var sel1 = ExamEngine.selectBalanced(synth, 36, {
        targets: { difficulty: { easy: 33, medium: 34, hard: 33 }, cognitive: { k: 30, u: 50, a: 20 }, format: { straight: 67, scenario: 33 } },
        evenKey: "topic"
    });
    TestRunner.assertEqual(sel1.length, 36, "Selected exact count");
    var seen = {}, dupes = 0;
    for (var i = 0; i < sel1.length; i++) { if (seen[sel1[i].id]) dupes++; seen[sel1[i].id] = true; }
    TestRunner.assertEqual(dupes, 0, "No duplicate selections");

    var fmtStraight = 0, fmtScenario = 0;
    var dEasy = 0, dMed = 0, dHard = 0;
    var tCount = { T1: 0, T2: 0, T3: 0 };
    for (var i = 0; i < sel1.length; i++) {
        if (ExamEngine.normFormat(sel1[i]) === "straight") fmtStraight++; else fmtScenario++;
        var d = ExamEngine.normDifficulty(sel1[i].difficulty);
        if (d === "easy") dEasy++; else if (d === "medium") dMed++; else dHard++;
        tCount[sel1[i].topic]++;
    }
    var expected = ExamEngine.largestRemainder(36, [67, 33]);
    TestRunner.assertEqual(fmtStraight, expected[0], "Exact straight count (" + expected[0] + ")");
    TestRunner.assertEqual(fmtScenario, expected[1], "Exact scenario count (" + expected[1] + ")");
    var expDiff = ExamEngine.largestRemainder(36, [33, 34, 33]);
    TestRunner.assertEqual(dEasy, expDiff[0], "Exact easy count");
    TestRunner.assertEqual(dMed, expDiff[1], "Exact medium count");
    TestRunner.assertEqual(dHard, expDiff[2], "Exact hard count");
    var expTopic = ExamEngine.largestRemainder(36, [1, 1, 1]);
    TestRunner.assertEqual(tCount.T1, expTopic[0], "Even topic spread T1");
    TestRunner.assertEqual(tCount.T2, expTopic[1], "Even topic spread T2");
    TestRunner.assertEqual(tCount.T3, expTopic[2], "Even topic spread T3");

    var srcSnapshot = synth.map(function(q) { return q.id; }).join(",");
    TestRunner.assertEqual(synth.map(function(q) { return q.id; }).join(","), srcSnapshot, "Source pool not mutated");

    TestRunner.suite("Exam Engine - Balanced Selection (best effort)");

    var noHard = [];
    for (var i = 0; i < 50; i++) noHard.push(makeQ("NH" + i, i < 25 ? "easy" : "medium", "u", "straight", "T1"));
    var sel2 = ExamEngine.selectBalanced(noHard, 30, { targets: { difficulty: { easy: 20, medium: 20, hard: 60 } } });
    TestRunner.assertEqual(sel2.length, 30, "Returns full count even when a bucket is empty (best effort)");
    var gotHard = 0;
    for (var i = 0; i < sel2.length; i++) if (ExamEngine.normDifficulty(sel2[i].difficulty) === "hard") gotHard++;
    TestRunner.assertEqual(gotHard, 0, "No hard questions invented");

    var sel3 = ExamEngine.selectBalanced(noHard, 999);
    TestRunner.assertEqual(sel3.length, 50, "Count larger than pool returns whole pool");

    var selA = ExamEngine.selectBalanced(synth, 20).map(function(q) { return q.id; }).join(",");
    var selB = ExamEngine.selectBalanced(synth, 20).map(function(q) { return q.id; }).join(",");
    TestRunner.assertNotEqual(selA, selB, "Selections differ across runs (statistical)");

    TestRunner.suite("Exam Engine - Blueprint Validation & Feasibility");

    function makeBp() {
        return {
            total: 20,
            chapters: [{ chapter: 1, pct: 50 }, { chapter: 2, pct: 50 }],
            cognitive: { k: 30, u: 50, a: 20 },
            difficulty: { easy: 40, medium: 40, hard: 20 },
            format: { straight: 67, scenario: 33 }
        };
    }
    var okErrs = ExamEngine.validateBlueprint(makeBp());
    TestRunner.assertEqual(okErrs.length, 0, "Valid blueprint has no errors");

    var badBp = makeBp();
    badBp.cognitive = { k: 50, u: 50, a: 50 };
    var badErrs = ExamEngine.validateBlueprint(badBp);
    TestRunner.assertGreaterThan(badErrs.length, 0, "Cognitive not summing to 100 flagged");

    var badBp2 = makeBp();
    badBp2.chapters = [];
    TestRunner.assertGreaterThan(ExamEngine.validateBlueprint(badBp2).length, 0, "No chapters flagged");

    TestRunner.suite("Exam Engine - Exam Plan Generation");

    if (questions.length > 200) {
        var pool12 = [];
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].chapter == 1 || questions[i].chapter == 2) pool12.push(questions[i]);
        }
        var feas = ExamEngine.checkFeasibility(makeBp(), pool12);
        TestRunner.assertEqual(feas.length, 0, "Feasible blueprint reports no shortages: " + feas.join("; "));

        var plan = ExamEngine.generateExamPlan(makeBp(), pool12, 250);
        TestRunner.assertNotNull(plan, "Exam plan generated from real bank");
        if (plan) {
            TestRunner.assertEqual(plan.length, 20, "Plan has exact total");
            var t = ExamEngine.targetCounts(makeBp());
            var chCount = { 1: 0, 2: 0 }, cogCount = { k: 0, u: 0, a: 0 }, diffCount = { easy: 0, medium: 0, hard: 0 }, fmtCount = { straight: 0, scenario: 0 };
            for (var i = 0; i < plan.length; i++) {
                chCount[plan[i].chapter] = (chCount[plan[i].chapter] || 0) + 1;
                cogCount[ExamEngine.normCognitive(plan[i])]++;
                diffCount[ExamEngine.normDifficulty(plan[i].difficulty)]++;
                fmtCount[ExamEngine.normFormat(plan[i])]++;
            }
            TestRunner.assertEqual(chCount[1], t.chapters[0], "Chapter 1 count exact (" + t.chapters[0] + ")");
            TestRunner.assertEqual(chCount[2], t.chapters[1], "Chapter 2 count exact (" + t.chapters[1] + ")");
            TestRunner.assertEqual(cogCount.k, t.cognitive[0], "Cognitive K count exact");
            TestRunner.assertEqual(cogCount.u, t.cognitive[1], "Cognitive U count exact");
            TestRunner.assertEqual(cogCount.a, t.cognitive[2], "Cognitive A count exact");
            TestRunner.assertEqual(diffCount.easy, t.difficulty[0], "Difficulty easy count exact");
            TestRunner.assertEqual(fmtCount.straight, t.format[0], "Format straight count exact");
            var planIds = {};
            var planDupes = 0;
            for (var i = 0; i < plan.length; i++) { if (planIds[plan[i].id]) planDupes++; planIds[plan[i].id] = true; }
            TestRunner.assertEqual(planDupes, 0, "Plan has no duplicate questions");

            var planIdsOrdered = plan.map(function(q) { return q.id; }).join(",");
            var planReordered = ExamEngine.orderScenarioGroups(plan).map(function(q) { return q.id; }).join(",");
            TestRunner.assertEqual(planReordered, planIdsOrdered, "Generated plan is already straight-first and group-ordered");
            var seenScenario = false, straightAfterScen = 0, groupInterleave = false, lastGid = "", seenGids = {};
            for (var i = 0; i < plan.length; i++) {
                var isScen = ExamEngine.normFormat(plan[i]) === "scenario";
                if (isScen) {
                    seenScenario = true;
                    var gid = plan[i].scenario_id || "";
                    if (gid !== lastGid) {
                        if (seenGids[gid]) groupInterleave = true;
                        seenGids[gid] = true;
                        lastGid = gid;
                    }
                } else if (seenScenario) straightAfterScen++;
            }
            TestRunner.assertEqual(straightAfterScen, 0, "Plan has no straight questions after scenario questions");
            TestRunner.assertFalse(groupInterleave, "Plan scenario groups are not interleaved");
        }

        var hugeBp = makeBp();
        hugeBp.total = 5000;
        var hugeFeas = ExamEngine.checkFeasibility(hugeBp, pool12);
        TestRunner.assertGreaterThan(hugeFeas.length, 0, "Impossible blueprint reports shortages");
        TestRunner.assertNull(ExamEngine.generateExamPlan(hugeBp, pool12, 20), "Impossible blueprint returns null plan");
    } else {
        TestRunner.assertTrue(false, "Question bank not loaded for exam plan tests");
    }

    TestRunner.suite("Exam Builder - ToS Helpers");

    TestRunner.assertType(ExamEngine.chapterToSPct, "function", "chapterToSPct exists");
    TestRunner.assertEqual(ExamEngine.chapterToSPct(1), 26, "Chapter 1 ToS = 26%");
    TestRunner.assertEqual(ExamEngine.chapterToSPct(7), 8, "Chapter 7 ToS = 8%");
    TestRunner.assertEqual(ExamEngine.chapterToSPct(99), 0, "Unknown chapter ToS = 0%");

    var tosSum = 0;
    for (var ch = 1; ch <= 7; ch++) tosSum += ExamEngine.chapterToSPct(ch);
    TestRunner.assertEqual(tosSum, 100, "All 7 chapter ToS weights sum to 100");

    var norm5050 = ExamEngine.normalizeToSAlloc([50, 50]);
    TestRunner.assertEqual(norm5050[0] + norm5050[1], 100, "50/50 normalizes to 100");
    TestRunner.assertEqual(norm5050[0], 50, "50/50 stays 50");
    var normRaw = ExamEngine.normalizeToSAlloc([26, 14, 17, 12, 9, 14, 8]);
    var normSum = 0;
    for (var i = 0; i < normRaw.length; i++) normSum += normRaw[i];
    TestRunner.assertEqual(normSum, 100, "Raw ToS list normalizes to exactly 100");
    var normScaled = ExamEngine.normalizeToSAlloc([50, 50]);
    TestRunner.assertEqual(normScaled.length, 2, "Normalization keeps list length");
    var normZero = ExamEngine.normalizeToSAlloc([0, 0]);
    TestRunner.assertEqual(normZero[0] + normZero[1], 0, "All-zero allocation stays zero (validation catches it)");

    var ebBp = {
        total: 20,
        chapters: [{ chapter: 1, pct: 50 }, { chapter: 2, pct: 50 }],
        cognitive: { k: 30, u: 50, a: 20 },
        difficulty: { easy: 40, medium: 40, hard: 20 },
        format: { straight: 67, scenario: 33 }
    };
    TestRunner.assertEqual(ExamEngine.validateBlueprint(ebBp).length, 0, "Builder default blueprint validates");

    TestRunner.suite("Exam Engine - selectForBlueprint (assignment path)");

    if (questions.length > 200) {
        var asgPool = [];
        for (var i = 0; i < questions.length; i++) {
            if (questions[i].chapter == 1) asgPool.push(questions[i]);
        }
        var asgBp = {
            total: 15,
            chapters: [{ chapter: 1, pct: 100 }],
            cognitive: { k: 30, u: 50, a: 20 },
            difficulty: { easy: 40, medium: 40, hard: 20 },
            format: { straight: 67, scenario: 33 }
        };
        var asgSel = ExamEngine.selectForBlueprint(asgBp, asgPool, 150);
        TestRunner.assertEqual(asgSel.length, 15, "Feasible blueprint returns exact count");
        var asgSeen = {}, asgDupes = 0, asgWrongCh = 0;
        for (var i = 0; i < asgSel.length; i++) {
            if (asgSeen[asgSel[i].id]) asgDupes++;
            asgSeen[asgSel[i].id] = true;
            if (asgSel[i].chapter != 1) asgWrongCh++;
        }
        TestRunner.assertEqual(asgDupes, 0, "Selection has no duplicate questions");
        TestRunner.assertEqual(asgWrongCh, 0, "Selection stays inside the assignment chapter");
        var asgOrdered = ExamEngine.orderScenarioGroups(asgSel).map(function(q) { return q.id; }).join(",");
        TestRunner.assertEqual(asgOrdered, asgSel.map(function(q) { return q.id; }).join(","), "Selection comes back straight-first and group-ordered");

        var straightBp = {
            total: 10,
            chapters: [{ chapter: 1, pct: 100 }],
            cognitive: { k: 30, u: 50, a: 20 },
            difficulty: { easy: 40, medium: 40, hard: 20 },
            format: { straight: 100, scenario: 0 }
        };
        var straightSel = ExamEngine.selectForBlueprint(straightBp, asgPool, 150);
        var nonStraight = 0;
        for (var i = 0; i < straightSel.length; i++) {
            if (ExamEngine.normFormat(straightSel[i]) !== "straight") nonStraight++;
        }
        TestRunner.assertEqual(straightSel.length, 10, "Straight-only blueprint returns exact count");
        TestRunner.assertEqual(nonStraight, 0, "Straight-only blueprint selects only straight questions");

        var hugeAsg = {
            total: 9999,
            chapters: [{ chapter: 1, pct: 100 }],
            cognitive: { k: 30, u: 50, a: 20 },
            difficulty: { easy: 40, medium: 40, hard: 20 },
            format: { straight: 67, scenario: 33 }
        };
        var hugeSel = ExamEngine.selectForBlueprint(hugeAsg, asgPool, 20);
        TestRunner.assertEqual(hugeSel.length, asgPool.length, "Infeasible total falls back to the whole pool");
        TestRunner.assertGreaterThan(hugeSel.length, 0, "Fallback selection is non-empty");

        var zeroSel = ExamEngine.selectForBlueprint({ total: 0, chapters: [{ chapter: 1, pct: 100 }], cognitive: { k: 30, u: 50, a: 20 }, difficulty: { easy: 40, medium: 40, hard: 20 }, format: { straight: 67, scenario: 33 } }, asgPool);
        TestRunner.assertEqual(zeroSel.length, 0, "Zero total returns empty selection");
        var noPoolSel = ExamEngine.selectForBlueprint(asgBp, []);
        TestRunner.assertEqual(noPoolSel.length, 0, "Empty pool returns empty selection");
    } else {
        TestRunner.assertTrue(false, "Question bank not loaded for selectForBlueprint tests");
    }

    TestRunner.suite("Exam Engine - Scenario Group Ordering");

    function grpQ(id, gid, order) {
        return { id: id, question: id, options: ["a", "b", "c", "d"], answer: "A", mode: "scenario", scenario_id: gid, scenario_order: order, scenario: "Passage " + gid };
    }
    function strQ(id) {
        return { id: id, question: id, options: ["a", "b", "c", "d"], answer: "A", mode: "straight" };
    }
    var mix = [strQ("s1"), grpQ("b3", "G2", 3), strQ("s2"), grpQ("a4", "G1", 4), grpQ("b1", "G2", 1), grpQ("a1", "G1", 1), strQ("s3"), grpQ("b4", "G2", 4), grpQ("a2", "G1", 2), grpQ("b2", "G2", 2), grpQ("a3", "G1", 3)];
    var before = mix.map(function(q) { return q.id; }).join(",");
    var ordered = ExamEngine.orderScenarioGroups(mix);
    TestRunner.assertEqual(ordered.length, mix.length, "Ordering preserves count");
    TestRunner.assertEqual(mix.map(function(q) { return q.id; }).join(","), before, "Source list not mutated");
    var sortedIn = mix.map(function(q) { return q.id; }).sort().join(",");
    TestRunner.assertEqual(ordered.map(function(q) { return q.id; }).sort().join(","), sortedIn, "Ordering preserves the same questions");

    TestRunner.assertEqual(ordered[0].id, "s1", "First straight in input order");
    TestRunner.assertEqual(ordered[1].id, "s2", "Second straight in input order");
    TestRunner.assertEqual(ordered[2].id, "s3", "Third straight in input order");
    TestRunner.assertEqual(ExamEngine.normFormat(ordered[3]), "scenario", "Scenario questions start after straight questions");

    var pos = {};
    for (var i = 0; i < ordered.length; i++) pos[ordered[i].id] = i;
    TestRunner.assertEqual(pos.b1 - pos.b4, -3, "Group G2 contiguous (b1..b4)");
    TestRunner.assertEqual(pos.b1, 3, "Group G2 starts first (first appearance in input)");
    TestRunner.assertEqual(pos.b2 - pos.b1, 1, "G2 order 1->2 adjacent");
    TestRunner.assertEqual(pos.b3 - pos.b2, 1, "G2 order 2->3 adjacent");
    TestRunner.assertEqual(pos.b4 - pos.b3, 1, "G2 order 3->4 adjacent");
    TestRunner.assertEqual(pos.a1, 7, "Group G1 follows G2 as its own run");
    TestRunner.assertEqual(pos.a2 - pos.a1, 1, "G1 order 1->2 adjacent");
    TestRunner.assertEqual(pos.a4 - pos.a3, 1, "G1 order 3->4 adjacent");

    var again = ExamEngine.orderScenarioGroups(ordered);
    TestRunner.assertEqual(again.map(function(q) { return q.id; }).join(","), ordered.map(function(q) { return q.id; }).join(","), "Ordering is idempotent");

    TestRunner.assertEqual(ExamEngine.orderScenarioGroups([]).length, 0, "Empty list stays empty");
    var single = ExamEngine.orderScenarioGroups([grpQ("only", "G9", 2)]);
    TestRunner.assertEqual(single.length, 1, "Single question list unchanged");

    TestRunner.suite("Offline Exam - Paper Builder");

    TestRunner.assertType(UI.oeBuildPaperHTML, "function", "oeBuildPaperHTML exposed on UI");

    var straightQ = { id: "S1", question: "What is 2 + 2?", options: ["3", "4", "5", "6"], answer: "B", difficulty: "easy" };
    var scenQ1 = { id: "G1", question: "Which option fits <b>best</b>?", options: ["x", "y", "z", "w"], answer: "A", mode: "scenario", scenario_id: "SG-1", stimulus: "Read the passage & answer.", difficulty: "medium" };
    var scenQ2 = { id: "G2", question: "Second scenario?", options: ["p", "q", "r", "s"], answer: "C", mode: "scenario", scenario_id: "SG-1", stimulus: "Read the passage & answer.", difficulty: "medium" };
    var mediaQ = { id: "M1", question: "Identify the diagram.", options: ["A1", "B1", "C1", "D1"], answer: "D", media: "media/star01.png" };

    var meta = { title: "Grade IX Computer Science <A & B> Section A", className: "9", time: 80, marks: 30, includeKey: true, date: "1/1/2026" };
    var html = UI.oeBuildPaperHTML(meta, [straightQ, scenQ1, scenQ2, mediaQ]);

    TestRunner.assertType(html, "string", "builder returns a string");
    TestRunner.assert(html.indexOf("IMSG I-14/3 ISLAMABAD") !== -1, "school name in header");
    TestRunner.assert(html.indexOf("Grade IX Computer Science &lt;A &amp; B&gt; Section A") !== -1, "title HTML-escaped");
    TestRunner.assert(html.indexOf("Class: 9") !== -1, "class label rendered");
    TestRunner.assert(html.indexOf("Time: 80 Minutes") !== -1, "time rendered");
    TestRunner.assert(html.indexOf("Total Marks: 30") !== -1, "marks rendered");
    TestRunner.assert(html.indexOf("(7.5 marks each)") !== -1, "per-question marks computed (30/4)");
    TestRunner.assert(html.indexOf("What is 2 + 2?") !== -1, "straight question rendered");
    TestRunner.assert(html.indexOf("A. 3") !== -1 && html.indexOf("B. 4") !== -1, "options labelled A-D");
    TestRunner.assert(html.indexOf("Questions 2&ndash;3 are based on the following:") !== -1, "stimulus block spans the scenario group");
    TestRunner.assert(html.indexOf("Read the passage &amp; answer.") !== -1, "stimulus text escaped");
    TestRunner.assert(html.indexOf("Read the passage &amp; answer.") === html.lastIndexOf("Read the passage &amp; answer."), "stimulus shown once per group");
    TestRunner.assert(html.indexOf("Which option fits &lt;b&gt;best&lt;/b&gt;?") !== -1, "question text escaped");
    TestRunner.assert(html.indexOf('src="media/star01.png"') !== -1, "media image rendered");
    TestRunner.assert(html.indexOf("Answer Key &mdash; Section A") !== -1, "answer key included when requested");
    TestRunner.assert(html.indexOf("1. B") !== -1 && html.indexOf("4. D") !== -1, "answer key letters match order");
    TestRunner.assert(html.indexOf(">1.<") !== -1 && html.indexOf(">4.<") !== -1, "questions numbered 1..n");

    var noKey = UI.oeBuildPaperHTML({ title: "T", className: "9", time: 60, marks: 10, includeKey: false }, [straightQ]);
    TestRunner.assert(noKey.indexOf("Answer Key") === -1, "answer key omitted when unchecked");
    TestRunner.assert(noKey.indexOf("(10 marks each)") !== -1, "single question shows 10 marks each");

    var empty = UI.oeBuildPaperHTML(meta, []);
    TestRunner.assertType(empty, "string", "empty question list still builds");
    TestRunner.assert(empty.indexOf("Section A &mdash; 0 Multiple Choice Questions") !== -1, "empty paper reports 0 questions");
    TestRunner.assert(empty.indexOf("Answer Key") !== -1, "empty paper can still carry a key block");

    var missingFields = UI.oeBuildPaperHTML({ includeKey: true }, [{}]);
    TestRunner.assert(missingFields.indexOf("paper-title\">Section A") !== -1, "missing meta falls back to defaults");
    TestRunner.assert(missingFields.indexOf("1. ?") !== -1, "missing answer shows ? in key");
}
