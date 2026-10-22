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

    var meta = { title: "Grade IX Computer Science <A & B> Section A", className: "9", time: 80, marks: 30, date: "1/1/2026" };
    var html = UI.oeBuildPaperHTML(meta, [straightQ, scenQ1, scenQ2, mediaQ]);

    TestRunner.assertType(html, "string", "builder returns a string");
    TestRunner.assert(html.indexOf("IMSG I-14/3 ISLAMABAD") !== -1, "school name in header");
    TestRunner.assert(html.indexOf("Grade IX Computer Science &lt;A &amp; B&gt; Section A") !== -1, "title HTML-escaped");
    TestRunner.assert(html.indexOf("Class: 9") !== -1, "class label rendered");
    TestRunner.assert(html.indexOf("Time: 80 Minutes") !== -1, "time rendered");
    TestRunner.assert(html.indexOf("Total Marks: 30") !== -1, "marks rendered");
    TestRunner.assert(html.indexOf("(7.5 marks each)") !== -1, "per-question marks computed (30/4)");
    TestRunner.assert(html.indexOf("What is 2 + 2?") !== -1, "straight question rendered");
    TestRunner.assert(html.indexOf('<th class="pt-s">S #</th>') !== -1 && html.indexOf("<th>(A)</th>") !== -1 && html.indexOf("<th>(D)</th>") !== -1, "table header columns rendered");
    TestRunner.assert(html.indexOf('<td class="pq-c">3</td>') !== -1 && html.indexOf('<td class="pq-c">4</td>') !== -1, "options rendered in A-D cells");
    TestRunner.assert(html.indexOf("SCENARIO#1 (FOR QUESTIONS 2&ndash;3)") !== -1, "scenario label row spans the scenario group");
    TestRunner.assert(html.indexOf("STIMULUS/SITUATION/SCENARIO BASED MCQs") !== -1, "scenario divider row rendered");
    TestRunner.assert(html.indexOf("STIMULUS/SITUATION/SCENARIO BASED MCQs") === html.lastIndexOf("STIMULUS/SITUATION/SCENARIO BASED MCQs"), "divider rendered only once");
    TestRunner.assert(html.indexOf("Candidate Sign.") !== -1 && html.indexOf("Invigilator Sign.") !== -1, "signature fields rendered");
    TestRunner.assert(html.indexOf("Candidate Sign.") < html.indexOf('<table class="paper-table">'), "signature fields appear before MCQ table");
    TestRunner.assert(html.indexOf("Read the passage &amp; answer.") !== -1, "stimulus text escaped");
    TestRunner.assert(html.indexOf("Read the passage &amp; answer.") === html.lastIndexOf("Read the passage &amp; answer."), "stimulus shown once per group");
    TestRunner.assert(html.indexOf("Which option fits &lt;b&gt;best&lt;/b&gt;?") !== -1, "question text escaped");
    TestRunner.assert(html.indexOf('src="media/star01.png"') !== -1, "media image rendered");
    TestRunner.assert(html.indexOf("Answer Key") === -1, "answer key never part of question paper");
    TestRunner.assert(html.indexOf(">1.<") !== -1 && html.indexOf(">4.<") !== -1, "questions numbered 1..n");

    TestRunner.assertType(UI.oeBuildKeyHTML, "function", "oeBuildKeyHTML exposed on UI");
    var keyHtml = UI.oeBuildKeyHTML(meta, [straightQ, scenQ1, scenQ2, mediaQ]);
    TestRunner.assert(keyHtml.indexOf("Answer Key &mdash; Grade IX Computer Science &lt;A &amp; B&gt; Section A") !== -1, "standalone key page titled with paper title");
    TestRunner.assert(keyHtml.indexOf("IMSG I-14/3 ISLAMABAD") !== -1, "key page carries school header");
    TestRunner.assert(keyHtml.indexOf("1. B") !== -1 && keyHtml.indexOf("4. D") !== -1, "answer key letters match question order");

    var noKey = UI.oeBuildPaperHTML({ title: "T", className: "9", time: 60, marks: 10 }, [straightQ]);
    TestRunner.assert(noKey.indexOf("Answer Key") === -1, "paper print omits answer key entirely");
    TestRunner.assert(noKey.indexOf("(10 marks each)") !== -1, "single question shows 10 marks each");

    var empty = UI.oeBuildPaperHTML(meta, []);
    TestRunner.assertType(empty, "string", "empty question list still builds");
    TestRunner.assert(empty.indexOf("Section A &mdash; 0 Multiple Choice Questions") !== -1, "empty paper reports 0 questions");
    var emptyKey = UI.oeBuildKeyHTML(meta, []);
    TestRunner.assertType(emptyKey, "string", "empty key page still builds");
    TestRunner.assert(emptyKey.indexOf("Answer Key") !== -1, "key page can be built with 0 questions");

    var missingFields = UI.oeBuildPaperHTML({}, [{}]);
    TestRunner.assert(missingFields.indexOf("paper-title\">Section A") !== -1, "missing meta falls back to defaults");
    var missingKey = UI.oeBuildKeyHTML({}, [{}]);
    TestRunner.assert(missingKey.indexOf("1. ?") !== -1, "missing answer shows ? in key");

    // ---- Version support -------------------------------------------------
    TestRunner.suite("Offline Exam - Versions");

    var vmeta = { title: "Midterm", className: "9", time: 80, marks: 30, version: "B", date: "1/1/2026" };
    var vhtml = UI.oeBuildPaperHTML(vmeta, [straightQ]);
    TestRunner.assert(vhtml.indexOf("MCQs PAPER VERSION: B") !== -1, "paper header shows version letter");
    var vkey = UI.oeBuildKeyHTML(vmeta, [straightQ]);
    TestRunner.assert(vkey.indexOf("(Version B)") !== -1, "key page shows version letter");
    var noVhtml = UI.oeBuildPaperHTML({ title: "T", className: "9", time: 60, marks: 10 }, [straightQ]);
    TestRunner.assert(noVhtml.indexOf("PAPER VERSION") === -1, "no version line when version absent");

    // shuffleOptions: keeps option set, remaps answer to same text, no mutation
    var sq = { id: "VO1", question: "Q?", options: ["w1", "w2", "w3", "w4"], answer: "C" };
    var shufOk = true, anyMoved = false, origOk = true;
    for (var vi = 0; vi < 40; vi++) {
        var sq2 = ExamEngine.shuffleOptions(sq);
        if (sq2 === sq) shufOk = false;
        if (sq.options.join(",") !== "w1,w2,w3,w4") origOk = false;
        if (sq2.options.slice().sort().join("|") !== sq.options.slice().sort().join("|")) shufOk = false;
        var sIdx = sq2.answer.charCodeAt(0) - 65;
        if (sq2.options[sIdx] !== "w3") shufOk = false;
        if (sq2.options.join(",") !== sq.options.join(",")) anyMoved = true;
    }
    TestRunner.assert(shufOk, "shuffleOptions preserves option set and answer text");
    TestRunner.assert(origOk, "shuffleOptions does not mutate the original");
    TestRunner.assert(anyMoved, "shuffleOptions actually reorders (statistical)");
    var solo = ExamEngine.shuffleOptions({ id: "SO", options: ["only"], answer: "A" });
    TestRunner.assertEqual(solo.answer, "A", "single-option question keeps its answer");
    var noOpts = ExamEngine.shuffleOptions({ id: "NO" });
    TestRunner.assert(noOpts && !noOpts.options, "missing options tolerated");

    // shuffleStraightSegment: scenario suffix keeps order, straights preserved
    function vq(id) { return { id: id, question: id, options: ["a", "b", "c", "d"], answer: "A", chapter: 1, difficulty: "easy", cognitive_level: "k", mode: "straight" }; }
    function vg(id, gid, order) { return { id: id, question: id, options: ["a", "b", "c", "d"], answer: "A", chapter: 1, difficulty: "medium", cognitive_level: "u", mode: "scenario", scenario_id: gid, question_order: order, stimulus: "Read." }; }
    var seg = ExamEngine.shuffleStraightSegment([vq("s1"), vq("s2"), vq("s3"), vg("g1", "G1", 1), vg("g2", "G1", 2)]);
    TestRunner.assertEqual(seg.length, 5, "segment keeps every question");
    TestRunner.assertEqual(seg[3].id, "g1", "scenario group stays after straights");
    TestRunner.assertEqual(seg[4].id, "g2", "scenario internal order preserved");
    TestRunner.assertEqual([seg[0].id, seg[1].id, seg[2].id].sort().join(","), "s1,s2,s3", "straight set preserved");

    // generateVersions: exact blueprint, scenarios last, WHOLE groups, varied orders
    var vpool = [];
    vpool.push(makeQ("VS1", "easy", "k", "straight", "VT"));
    vpool.push(makeQ("VS2", "easy", "k", "straight", "VT"));
    vpool.push(makeQ("VS3", "hard", "k", "straight", "VT"));
    vpool.push(makeQ("VS4", "easy", "u", "straight", "VT"));
    vpool.push(makeQ("VS5", "easy", "u", "straight", "VT"));
    vpool.push(makeQ("VS6", "medium", "u", "straight", "VT"));
    vpool.push(makeQ("VS7", "medium", "u", "straight", "VT"));
    vpool.push(makeQ("VS8", "easy", "a", "straight", "VT"));
    for (var g = 1; g <= 6; g++) {
        var comps = [["k", "easy"], ["u", "medium"], ["u", "medium"], ["a", "hard"]];
        for (var o = 1; o <= 4; o++) {
            vpool.push({
                id: "VG" + g + "-" + o, question: "VG" + g + "-" + o,
                options: ["a", "b", "c", "d"], answer: "A", chapter: 1,
                difficulty: comps[o - 1][1], cognitive_level: comps[o - 1][0],
                mode: "scenario", scenario_id: "SYN-G" + g,
                question_order: o, stimulus: "Stimulus " + g
            });
        }
    }
    var vbp = {
        total: 16,
        chapters: [{ chapter: 1, pct: 100 }],
        cognitive: { k: 30, u: 50, a: 20 },
        difficulty: { easy: 40, medium: 40, hard: 20 },
        format: { straight: 50, scenario: 50 }
    };
    var versions = ExamEngine.generateVersions(vbp, vpool, 3, 250);
    TestRunner.assertNotNull(versions, "3 versions generated from synthetic pool");
    if (versions) {
        TestRunner.assertEqual(versions.length, 3, "3 versions returned");
        TestRunner.assertEqual(versions[0].label + versions[1].label + versions[2].label, "ABC", "labels are A, B, C");
        var tgt = ExamEngine.targetCounts(vbp);
        var seqs = [];
        for (var v = 0; v < versions.length; v++) {
            var qsV = versions[v].questions;
            TestRunner.assertEqual(qsV.length, 16, "version " + versions[v].label + " has exact total");
            var cogV = { k: 0, u: 0, a: 0 }, diffV = { easy: 0, medium: 0, hard: 0 }, fmtV = { straight: 0, scenario: 0 };
            var scenIds = {}, suffixOk = true, ansOk = true;
            for (var qi = 0; qi < qsV.length; qi++) {
                cogV[ExamEngine.normCognitive(qsV[qi])]++;
                diffV[ExamEngine.normDifficulty(qsV[qi].difficulty)]++;
                var f = ExamEngine.normFormat(qsV[qi]);
                fmtV[f]++;
                if (f === "scenario") {
                    if (qi < 8) suffixOk = false;
                    scenIds[qsV[qi].scenario_id] = (scenIds[qsV[qi].scenario_id] || 0) + 1;
                }
                var ai = qsV[qi].answer.charCodeAt(0) - 65;
                if (qsV[qi].options[ai] !== "a") ansOk = false;
            }
            TestRunner.assert(suffixOk, "version " + versions[v].label + ": scenarios only in the last positions");
            TestRunner.assert(ansOk, "version " + versions[v].label + ": answers align with option text after shuffle");
            TestRunner.assertEqual(cogV.k, tgt.cognitive[0], "v" + versions[v].label + " cognitive k exact");
            TestRunner.assertEqual(cogV.u, tgt.cognitive[1], "v" + versions[v].label + " cognitive u exact");
            TestRunner.assertEqual(cogV.a, tgt.cognitive[2], "v" + versions[v].label + " cognitive a exact");
            TestRunner.assertEqual(diffV.easy, tgt.difficulty[0], "v" + versions[v].label + " easy exact");
            TestRunner.assertEqual(diffV.medium, tgt.difficulty[1], "v" + versions[v].label + " medium exact");
            TestRunner.assertEqual(diffV.hard, tgt.difficulty[2], "v" + versions[v].label + " hard exact");
            TestRunner.assertEqual(fmtV.straight, tgt.format[0], "v" + versions[v].label + " straight count exact");
            TestRunner.assertEqual(fmtV.scenario, tgt.format[1], "v" + versions[v].label + " scenario count exact");
            var gKeys = Object.keys(scenIds);
            TestRunner.assertEqual(gKeys.length, 2, "v" + versions[v].label + ": exactly 2 scenario groups");
            var wholeOk = true;
            for (var gk = 0; gk < gKeys.length; gk++) if (scenIds[gKeys[gk]] !== 4) wholeOk = false;
            TestRunner.assert(wholeOk, "v" + versions[v].label + ": every scenario group complete (4 of 4)");
            seqs.push(qsV.map(function(x) { return x.id; }).join(","));
        }
        TestRunner.assert(!(seqs[0] === seqs[1] && seqs[1] === seqs[2]), "versions differ across runs (statistical)");
    }

    // ---- OMR sheet -------------------------------------------------------
    TestRunner.suite("OMR Sheet");

    var ometa = { title: "Midterm", className: "9", time: 80, marks: 30, version: "B", date: "1/1/2026", versionLabels: ["A", "B", "C"] };
    var oQs = [
        straightQ,
        { id: "OG1", question: "S1", options: ["a", "b", "c", "d"], answer: "A" },
        { id: "OG2", question: "S2", options: ["a", "b", "c", "d"], answer: "C" }
    ];
    var omr = UI.oeBuildOMRHTML(ometa, oQs);
    TestRunner.assertEqual((omr.match(/class="omr-corner/g) || []).length, 4, "4 alignment corner squares");
    TestRunner.assert(omr.indexOf('class="omr-rollcls">9<') !== -1, "class printed fixed with no options");
    TestRunner.assertEqual((omr.match(/class="omr-sect"/g) || []).length, 1, "one section group (A, B, C)");
    TestRunner.assertEqual((omr.match(/class="omr-rolltable"/g) || []).length, 1, "roll digits in one two-column table");
    TestRunner.assertEqual((omr.match(/<tr>/g) || []).length, 11, "roll table has 1 header row + 10 digit rows (0-9 top to bottom)");
    TestRunner.assertEqual((omr.match(/<td>/g) || []).length, 20, "two roll digit columns");
    TestRunner.assertEqual((omr.match(/<th colspan="2">ROLL NUMBER<\/th>/g) || []).length, 1, "FBISE-style ROLL NUMBER header spans the digit columns");
    TestRunner.assert(omr.indexOf('class="omr-rollrow"') < omr.indexOf('class="omr-verrow"'), "roll box sits above the version row (high on the page)");
    TestRunner.assert(omr.indexOf('</table>') < omr.indexOf('class="omr-verrow"') && omr.indexOf('class="omr-verrow"') < omr.indexOf('</div><div class="omr-timerow"'), "version box sits beside the roll table (inside the roll row)");
    TestRunner.assert(omr.indexOf("Question Booklet No.") === -1, "booklet number line removed");
    TestRunner.assert(omr.indexOf("MCQs PAPER VERSION") !== -1, "version label row present");
    TestRunner.assertEqual((omr.match(/class="omr-b("| )/g) || []).length, 39, "1 legend + 3 version + 3 section + 20 digits + 12 question bubbles");
    TestRunner.assertEqual((omr.match(/omr-fill/g) || []).length, 1, "only the legend example is pre-shaded");
    TestRunner.assert(omr.indexOf('omr-b omr-fill">B') === -1, "version bubbles are never pre-filled");
    TestRunner.assertEqual((omr.match(/class="omr-qn"/g) || []).length, 3, "one number label per question");
    TestRunner.assertEqual((omr.match(/class="omr-cell"/g) || []).length, 3, "one grid cell per question");
    TestRunner.assert(omr.indexOf("IMSG I-14/3") !== -1, "school header present");
    TestRunner.assert(omr.indexOf("FOLLOW THE CORRECT SEQUENCE") !== -1, "sequence banner present");
    TestRunner.assert(omr.indexOf("CUTTING LINE") === -1, "no cutting line printed");

    var omrEmpty = UI.oeBuildOMRHTML({}, []);
    TestRunner.assertEqual((omrEmpty.match(/class="omr-b("| )/g) || []).length, 25, "empty sheet keeps legend + 1 version + roll bubbles, no question bubbles");
    TestRunner.assert(omrEmpty.indexOf('class="omr-rollcls">9<') !== -1, "missing meta falls back to class 9");
    TestRunner.assertEqual((omrEmpty.match(/class="omr-cell"/g) || []).length, 0, "no grid cells when no questions");
}
