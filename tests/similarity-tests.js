function runSimilarityTests() {
    // Always start from a clean module so other suites are unaffected.
    Similarity.reset();

    TestRunner.suite("Similarity - Module");

    TestRunner.assertType(Similarity, "object", "Similarity module exists");
    TestRunner.assertType(Similarity.loadPairs, "function", "loadPairs exists");
    TestRunner.assertType(Similarity.createSession, "function", "createSession exists");
    TestRunner.assertType(Similarity.filterUnits, "function", "filterUnits exists");
    TestRunner.assertType(Similarity.findDuplicates, "function", "findDuplicates exists");
    TestRunner.assertType(Similarity.clusterOf, "function", "clusterOf exists");
    TestRunner.assertEqual(Similarity.DEFAULT_THRESHOLD, 0.95, "Default threshold is 0.95");

    TestRunner.assertFalse(Similarity.isReady(), "Not ready before data is loaded");
    TestRunner.assertNull(Similarity.clusterOf("ANY-ID"), "clusterOf is null without data");
    TestRunner.assertArrayLength(Similarity.findDuplicates([{ id: "X" }, { id: "Y" }]), 0, "findDuplicates empty without data");

    var noData = [{ id: "X" }, { id: "Y" }];
    var untouched = Similarity.filterUnits(noData);
    TestRunner.assertEqual(untouched.length, 2, "filterUnits is a no-op without data");
    TestRunner.assertTrue(untouched === noData, "filterUnits returns the same list without data");

    TestRunner.suite("Similarity - Clusters");

    // A~B, B~C chain merges into one cluster; D~E sits below the threshold.
    Similarity.loadPairs([
        { a: "A", b: "B", s: 0.96 },
        { a: "B", b: "C", s: 0.97 },
        { a: "D", b: "E", s: 0.94 },
        { a: "A", b: "A", s: 0.99 }
    ]);
    TestRunner.assertTrue(Similarity.isReady(), "Ready after loadPairs");
    TestRunner.assertEqual(Similarity.getThreshold(), 0.95, "Threshold stays at default");
    TestRunner.assertEqual(Similarity.clusterOf("A"), Similarity.clusterOf("C"), "Transitive chain shares one cluster");
    TestRunner.assertNotEqual(Similarity.clusterOf("A"), Similarity.clusterOf("D"), "Below-threshold pair is a different cluster");
    TestRunner.assertNull(Similarity.clusterOf("D"), "Below-threshold ids are not clustered at all");
    TestRunner.assertNull(Similarity.clusterOf("UNKNOWN"), "Unknown id has no cluster");
    TestRunner.assertArrayLength(Similarity.similarTo("A"), 2, "similarTo returns the cluster members");
    TestRunner.assertEqual(Similarity.stats().activePairs, 3, "Three pairs are active at >= 0.95");
    TestRunner.assertEqual(Similarity.stats().clusterCount, 1, "One active cluster");
    TestRunner.assertEqual(Similarity.stats().questionsCovered, 3, "Three questions covered");

    Similarity.loadPairs([{ a: "D", b: "E", s: 0.94 }], 0.9);
    TestRunner.assertEqual(Similarity.getThreshold(), 0.9, "Explicit threshold is honoured");
    TestRunner.assertEqual(Similarity.clusterOf("D"), Similarity.clusterOf("E"), "Lower threshold clusters the pair");

    TestRunner.suite("Similarity - Units");

    function uq(id, scenarioId) {
        return scenarioId ? { id: id, scenario_id: scenarioId } : { id: id };
    }
    TestRunner.assertEqual(Similarity.unitKey(uq("Q1")), "q:Q1", "Straight question is its own unit");
    TestRunner.assertEqual(Similarity.unitKey(uq("Q2", "SG1")), "sg:SG1", "Scenario question keys by set");

    var units = Similarity.groupUnits([uq("Q1", "SG1"), uq("Q2", "SG1"), uq("Q3"), uq("Q4", "SG1")]);
    TestRunner.assertArrayLength(units, 2, "One unit per scenario set plus the straight question");
    TestRunner.assertArrayLength(units[0], 3, "Scenario set members (Q1, Q2, Q4) stay together");
    TestRunner.assertEqual(units[1][0].id, "Q3", "Straight question is its own unit");

    TestRunner.suite("Similarity - Session");

    // Current data: only D~E is clustered (threshold 0.9 from above).
    var session = Similarity.createSession();
    TestRunner.assertTrue(session.canTake([uq("D")]), "Free cluster can be taken");
    session.take([uq("D")]);
    TestRunner.assertFalse(session.canTake([uq("D")]), "Taken cluster is blocked");
    TestRunner.assertFalse(session.canTake([uq("E")]), "Similar question is blocked");
    TestRunner.assertTrue(session.canTake([uq("Q3")]), "Unrelated question is still free");
    TestRunner.assertEqual(session.claimedCount(), 1, "One cluster claimed");

    TestRunner.suite("Similarity - filterUnits");

    Similarity.loadPairs([
        { a: "A1", b: "A2", s: 0.98 },
        { a: "B1", b: "B2", s: 0.96 },
        { a: "C1", b: "C1x", s: 0.99 }
    ]);
    var filtered = Similarity.filterUnits([uq("A1"), uq("A2"), uq("B1"), uq("B2"), uq("Z")]);
    TestRunner.assertArrayLength(filtered, 3, "Keeps one question per similar set");
    TestRunner.assertEqual(filtered[0].id, "A1", "Keeps the first of the first set");
    TestRunner.assertEqual(filtered[1].id, "B1", "Keeps the first of the second set");
    TestRunner.assertEqual(filtered[2].id, "Z", "Keeps unrelated questions");

    // A scenario set counts as ONE choice: all members stay or the set goes.
    Similarity.loadPairs([{ a: "G1", b: "X9", s: 0.99 }]);
    var setFirst = Similarity.filterUnits([uq("G1", "SG1"), uq("G2", "SG1"), uq("G3", "SG1"), uq("G4", "SG1"), uq("X9")]);
    TestRunner.assertArrayLength(setFirst, 4, "Scenario set kept whole when it wins");
    var keptIds = {};
    for (var kf = 0; kf < setFirst.length; kf++) keptIds[setFirst[kf].id] = true;
    TestRunner.assertTrue(keptIds["G1"] && keptIds["G2"] && keptIds["G3"] && keptIds["G4"],
        "Every set member survives when the set wins");
    TestRunner.assertFalse(keptIds["X9"], "Conflicting straight question dropped when the set wins");

    var straightFirst = Similarity.filterUnits([uq("X9"), uq("G1", "SG1"), uq("G2", "SG1")]);
    TestRunner.assertArrayLength(straightFirst, 1, "Conflicting scenario set is dropped whole when it loses");
    TestRunner.assertEqual(straightFirst[0].id, "X9", "Winner kept in order");

    TestRunner.suite("Similarity - findDuplicates");

    Similarity.loadPairs([
        { a: "D1", b: "D2", s: 0.99 },
        { a: "D2", b: "D3", s: 0.96 },
        { a: "Z1", b: "Z2", s: 0.97 }
    ]);
    var hits = Similarity.findDuplicates([uq("D1"), uq("D2"), uq("D3"), uq("OK")]);
    TestRunner.assertArrayLength(hits, 2, "Finds the pairs present in the list");
    TestRunner.assertEqual(hits[0].a + "-" + hits[0].b, "D1-D2", "Strongest pair first");
    TestRunner.assertArrayLength(Similarity.findDuplicates([uq("D1"), uq("OK")]), 0, "No pairs when only one side is present");

    TestRunner.suite("Similarity - Selection integration");

    function makeSelQ(id, diff, cog, scenarioId, order) {
        var q = {
            id: id, chapter: 1, difficulty: diff, cognitive_level: cog,
            mode: scenarioId ? "scenario" : "straight",
            topic: "T", question: id, options: ["a", "b", "c", "d"], answer: "A"
        };
        if (scenarioId) { q.scenario_id = scenarioId; q.question_order = order; q.stimulus = "case " + scenarioId; }
        return q;
    }

    // Straight pool: S1~S2 similar, S5 blocked by a scenario member. C* are
    // clean fillers so the blueprint is always satisfiable without relaxing.
    var selPairs = [
        { a: "S1", b: "S2", s: 0.97 },
        { a: "M1", b: "S5", s: 0.98 },
        { a: "M1", b: "M2", s: 0.99 },
        { a: "N1", b: "N2", s: 0.96 }
    ];
    var straight = [
        makeSelQ("S1", "easy", "k"), makeSelQ("S2", "easy", "u"),
        makeSelQ("S3", "medium", "k"), makeSelQ("S4", "medium", "u"),
        makeSelQ("S5", "easy", "k"), makeSelQ("S6", "medium", "u"),
        makeSelQ("C1", "easy", "k"), makeSelQ("C2", "easy", "u"),
        makeSelQ("C3", "medium", "k"), makeSelQ("C4", "medium", "u"),
        makeSelQ("C5", "medium", "k"), makeSelQ("C6", "medium", "u")
    ];
    var group1 = [
        makeSelQ("M1", "easy", "k", "G1", 1), makeSelQ("M2", "easy", "u", "G1", 2),
        makeSelQ("M3", "medium", "k", "G1", 3), makeSelQ("M4", "medium", "u", "G1", 4)
    ];
    var group2 = [
        makeSelQ("N1", "easy", "k", "G2", 1), makeSelQ("N2", "easy", "u", "G2", 2),
        makeSelQ("N3", "medium", "k", "G2", 3), makeSelQ("N4", "medium", "u", "G2", 4)
    ];
    var selPool = straight.concat(group1, group2);
    Similarity.loadPairs(selPairs);

    var bp = {
        total: 8,
        chapters: [{ chapter: 1, pct: 100 }],
        cognitive: { k: 50, u: 50, a: 0 },
        difficulty: { easy: 50, medium: 50, hard: 0 },
        format: { straight: 50, scenario: 50 }
    };
    var plan = ExamEngine.generateExamPlan(bp, selPool, 250);
    TestRunner.assertNotNull(plan, "Blueprint plan generated with similarity data");
    if (plan) {
        TestRunner.assertEqual(plan.length, 8, "Plan still fills the full blueprint");
        var ids = {};
        for (var pi = 0; pi < plan.length; pi++) ids[plan[pi].id] = true;
        TestRunner.assertFalse(ids["S1"] && ids["S2"], "Similar straight pair never both selected");
        TestRunner.assertFalse(ids["S5"] && ids["M1"], "Scenario member blocks the similar straight question");
        var scenCount = 0;
        for (var si = 0; si < plan.length; si++) if (ExamEngine.normFormat(plan[si]) === "scenario") scenCount++;
        TestRunner.assertEqual(scenCount, 4, "Scenario quota still filled");
        if (scenCount === 4) {
            var g1 = 0, g2 = 0;
            for (var gi = 0; gi < plan.length; gi++) {
                if (plan[gi].scenario_id === "G1") g1++;
                if (plan[gi].scenario_id === "G2") g2++;
            }
            TestRunner.assertTrue(g1 === 0 || g1 === 4, "Scenario set G1 appears whole or not at all");
            TestRunner.assertTrue(g2 === 0 || g2 === 4, "Scenario set G2 appears whole or not at all");
            TestRunner.assertTrue(g1 === 4 || g2 === 4, "Exactly one whole scenario set fills the quota");
        }
        for (var pairI = 0; pairI < selPairs.length; pairI++) {
            var pp = selPairs[pairI];
            if (!(ids[pp.a] && ids[pp.b])) continue;
            // Intra-set pairs (both ids of one scenario stimulus set) are one
            // selection unit and may legitimately appear together.
            var qa = null, qb = null;
            for (var fq = 0; fq < plan.length; fq++) {
                if (plan[fq].id === pp.a) qa = plan[fq];
                if (plan[fq].id === pp.b) qb = plan[fq];
            }
            var sameSet = qa && qb && qa.scenario_id && qa.scenario_id === qb.scenario_id;
            TestRunner.assertFalse(!sameSet,
                "No similar pair in plan: " + pp.a + " / " + pp.b);
        }
    }

    var selCount = 0;
    for (var sc = 0; sc < 10; sc++) {
        var one = ExamEngine.selectBalanced(straight, 5);
        var seenS = {};
        var badSel = 0;
        for (var oi = 0; oi < one.length; oi++) {
            if (seenS[one[oi].id]) badSel++;
            seenS[one[oi].id] = true;
        }
        if (seenS["S1"] && seenS["S2"]) badSel++;
        if (badSel === 0) selCount++;
    }
    TestRunner.assertEqual(selCount, 10, "selectBalanced never picks both of a similar pair (10 runs)");

    // Relaxation: only two straight questions exist and they are similar, so
    // makePlan can only fill the blueprint by allowing the pair (and warns).
    Similarity.loadPairs([{ a: "R1", b: "R2", s: 0.99 }]);
    var tinyPool = [makeSelQ("R1", "easy", "k"), makeSelQ("R2", "medium", "u")];
    var tinyBp = {
        total: 2,
        chapters: [{ chapter: 1, pct: 100 }],
        cognitive: { k: 50, u: 50, a: 0 },
        difficulty: { easy: 50, medium: 50, hard: 0 },
        format: { straight: 100, scenario: 0 }
    };
    var relaxedPlan = ExamEngine.generateExamPlan(tinyBp, tinyPool, 50);
    TestRunner.assertNotNull(relaxedPlan, "Generation still succeeds when dedup would starve the blueprint");
    if (relaxedPlan) TestRunner.assertEqual(relaxedPlan.length, 2, "Relaxed plan keeps the requested total");

    // Practice-style selection instead dedupes the pool up front: from a pool
    // of only duplicates the result is smaller, never a duplicate pair.
    var relaxedBalanced = ExamEngine.selectBalanced(tinyPool, 2);
    TestRunner.assertArrayLength(relaxedBalanced, 1, "selectBalanced shrinks an all-duplicate pool instead of pairing them");

    // Without data everything behaves exactly as before this feature existed.
    Similarity.reset();
    var plain = ExamEngine.selectBalanced(straight, 6);
    TestRunner.assertEqual(plain.length, 6, "No data: full count still selected");
    TestRunner.assertFalse(Similarity.isReady(), "Module is clean again after reset");
    Similarity.reset();
}
