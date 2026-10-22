function runOMRTests() {

    function makeBuf(W, H, gray) {
        var data = new Uint8ClampedArray(W * H * 4);
        for (var i = 0; i < W * H; i++) {
            data[i * 4] = gray;
            data[i * 4 + 1] = gray;
            data[i * 4 + 2] = gray;
            data[i * 4 + 3] = 255;
        }
        return { data: data, width: W, height: H };
    }

    function setPx(buf, x, y, v) {
        x = x | 0; y = y | 0;
        if (x < 0 || y < 0 || x >= buf.width || y >= buf.height) return;
        var o = (y * buf.width + x) * 4;
        buf.data[o] = v;
        buf.data[o + 1] = v;
        buf.data[o + 2] = v;
    }

    function fillRect(buf, x0, y0, w, h, v) {
        for (var y = y0; y < y0 + h; y++)
            for (var x = x0; x < x0 + w; x++) setPx(buf, x, y, v);
    }

    function hollowRect(buf, x0, y0, w, h, v, t) {
        fillRect(buf, x0, y0, w, t, v);
        fillRect(buf, x0, y0 + h - t, w, t, v);
        fillRect(buf, x0, y0 + t, t, h - 2 * t, v);
        fillRect(buf, x0 + w - t, y0 + t, t, h - 2 * t, v);
    }

    function ring(buf, cx, cy, r, thick, v) {
        for (var y = cy - r - 1; y <= cy + r + 1; y++)
            for (var x = cx - r - 1; x <= cx + r + 1; x++) {
                var dx = x - cx, dy = y - cy, d = Math.sqrt(dx * dx + dy * dy);
                if (d <= r && d >= r - thick) setPx(buf, x, y, v);
            }
    }

    function disc(buf, cx, cy, r, v) {
        for (var y = cy - r - 1; y <= cy + r + 1; y++)
            for (var x = cx - r - 1; x <= cx + r + 1; x++) {
                var dx = x - cx, dy = y - cy;
                if (dx * dx + dy * dy <= r * r) setPx(buf, x, y, v);
            }
    }

    function buildSheet(opts) {
        opts = opts || {};
        var W = 1240, H = 1754;
        var buf = makeBuf(W, H, 245);
        var anchors = [[48, 48], [1192, 48], [1192, 1706], [48, 1706]];
        for (var a = 0; a < anchors.length; a++) fillRect(buf, anchors[a][0] - 33, anchors[a][1] - 33, 66, 66, 10);

        var i;
        // Header noise the scanner must ignore: big title glyphs (near
        // the top), the Roll No. section bubbles (left of the digit
        // table, shaded on purpose to prove they are never read as the
        // version) and the two-column 0-9 roll table (its digit rows
        // reach ~0.30H, the top edge of the 0.17H-0.30H version window;
        // they only form 2-cell bands, so count matching keeps them
        // from winning). Instruction/banner glyphs (y860/y890) fall
        // below the 0.45H grid cut but stay under the 16px mark filter.
        for (i = 0; i < 12; i++) fillRect(buf, 320 + i * 26, 78, 20, 24, 70);

        var labels = opts.labels || ["A", "B", "C"];
        // Version box centered beside the digit table (~0.22H), clear of
        // the digit rows (19px away) and to their right for tie-breaks.
        for (i = 0; i < labels.length; i++) {
            var vx = 560 + i * 43;
            if (i === opts.versionIdx) disc(buf, vx, 389, 13, 25);
            else ring(buf, vx, 389, 13, 3, 40);
        }
        disc(buf, 200, 150, 13, 25);
        ring(buf, 236, 150, 13, 3, 40);
        ring(buf, 272, 150, 13, 3, 40);
        for (i = 0; i < 10; i++) {
            ring(buf, 340, 180 + i * 38, 13, 3, 40);
            ring(buf, 376, 180 + i * 38, 13, 3, 40);
        }
        for (i = 0; i < 18; i++) fillRect(buf, 300 + i * 30, 860, 14, 14, 70);
        for (i = 0; i < 24; i++) fillRect(buf, 260 + i * 30, 890, 14, 14, 70);

        var N = opts.qCount | 0;
        var layout = OMR.gridLayout(N);
        var ans = opts.answers || [];
        for (var bi = 0; bi < layout.blocks.length; bi++) {
            var blk = layout.blocks[bi];
            var y0 = 920 + (bi > 0 ? 384 + 197 : 0);
            for (var j = 0; j < blk.cols; j++) {
                var colX = 85 + j * 220;
                for (var r = 0; r < blk.rows; r++) {
                    var qi = blk.start + j * blk.rows + r;
                    if (qi >= N) break;
                    var ry = y0 + r * 48;
                    fillRect(buf, colX + 8, ry - 9, 18, 18, 70);
                    var letter = ans[qi] || "";
                    for (var b = 0; b < 4; b++) {
                        if (letter !== "" && "ABCD".charAt(b) === letter) disc(buf, colX + 50 + b * 39, ry, 13, 25);
                        else ring(buf, colX + 50 + b * 39, ry, 13, 3, 40);
                    }
                }
            }
        }
        return { data: buf.data, width: W, height: H };
    }

    function rotate(buf, deg) {
        var rad = deg * Math.PI / 180;
        var cos = Math.cos(rad), sin = Math.sin(rad);
        var W = buf.width, H = buf.height;
        var pts = [[0, 0], [W, 0], [W, H], [0, H]];
        var minx = 1e9, miny = 1e9, maxx = -1e9, maxy = -1e9;
        for (var p = 0; p < 4; p++) {
            var rx = pts[p][0] * cos - pts[p][1] * sin;
            var ry = pts[p][0] * sin + pts[p][1] * cos;
            if (rx < minx) minx = rx;
            if (rx > maxx) maxx = rx;
            if (ry < miny) miny = ry;
            if (ry > maxy) maxy = ry;
        }
        var W2 = Math.ceil(maxx - minx), H2 = Math.ceil(maxy - miny);
        var out = makeBuf(W2, H2, 245);
        var cxS = W / 2, cyS = H / 2, cxO = W2 / 2, cyO = H2 / 2;
        for (var y2 = 0; y2 < H2; y2++) {
            for (var x2 = 0; x2 < W2; x2++) {
                var dx = x2 - cxO, dy = y2 - cyO;
                var sx = (dx * cos + dy * sin) + cxS;
                var sy = (-dx * sin + dy * cos) + cyS;
                sx = Math.round(sx); sy = Math.round(sy);
                if (sx >= 0 && sy >= 0 && sx < W && sy < H) {
                    var gray = buf.data[(sy * W + sx) * 4];
                    var o = (y2 * W2 + x2) * 4;
                    out.data[o] = gray;
                    out.data[o + 1] = gray;
                    out.data[o + 2] = gray;
                }
            }
        }
        return out;
    }

    TestRunner.suite("OMR Scanner - primitives");

    var hist = new Uint8Array(1000);
    for (var hi = 0; hi < 400; hi++) hist[hi] = 50;
    for (hi = 400; hi < 1000; hi++) hist[hi] = 220;
    var th = OMR.otsu(hist);
    TestRunner.assert(th >= 50 && th < 220, "otsu splits bimodal data (got " + th + ")");

    var truth = ["A", "C", "B", "D", "A", "B", "C", "D", "A", "B"];
    var sheet = buildSheet({ qCount: 10, answers: truth, roll: "9B01", versionIdx: 1, labels: ["A", "B", "C"] });
    var gray = OMR.toGray(sheet);
    TestRunner.assertEqual(gray.width, 1240, "toGray keeps width");

    var corners = OMR.findCornerSquares(gray);
    TestRunner.assertNotNull(corners, "4 corner squares detected");
    if (corners) {
        TestRunner.assertEqual(corners.length, 4, "exactly 4 corners");
        TestRunner.assert(Math.abs(corners[0].cx - 48) < 10 && Math.abs(corners[0].cy - 48) < 10, "TL corner near anchor");
        TestRunner.assert(corners[1].cx > 1100 && corners[1].cy < 100, "TR corner near anchor");
        TestRunner.assert(corners[2].cx > 1100 && corners[2].cy > 1600, "BR corner near anchor");
        TestRunner.assert(corners[3].cx < 100 && corners[3].cy > 1600, "BL corner near anchor");
    }

    var rect = corners ? OMR.rectify(gray, corners, 1240, 1754, 48) : null;
    TestRunner.assertNotNull(rect, "rectify produces output");
    if (rect) {
        TestRunner.assertEqual(rect.width, 1240, "rectified width");
        TestRunner.assert(rect.data[48 * 1240 + 48] < 120, "corner anchor maps to dark pixel");
        TestRunner.assert(rect.data[877 * 1240 + 620] > 200, "sheet center stays white");
    }

    TestRunner.suite("OMR Scanner - full read");

    var res = OMR.read(sheet, { qCount: 10, labels: ["A", "B", "C"] });
    TestRunner.assertEqual(res.ok, true, "aligned sheet reads ok");
    TestRunner.assertEqual(res.answers.join(""), "ACBDABCDAB", "all 10 answers detected in order");
    TestRunner.assertEqual(res.rectified, true, "sheet was rectified via corners");
    TestRunner.assertEqual(res.rollString, "", "roll is handwritten — scanner returns no auto-read roll");
    TestRunner.assertEqual(res.versionIndex, 1, "shaded version bubble detected (B)");
    TestRunner.assertEqual(res.version, "B", "version letter resolved via labels");
    TestRunner.assertEqual(res.confidence, "high", "no warnings -> high confidence");
    TestRunner.assertEqual(res.warnings.length, 0, "no warnings on clean aligned sheet");
    TestRunner.assert(res.threshold > 0.3 && res.threshold < 0.9, "adaptive threshold sane (got " + res.threshold + ")");
    TestRunner.assertEqual(res.ratios.length, 10, "one ratio row per question");

    var resRot = OMR.read(rotate(sheet, 4), { qCount: 10, labels: ["A", "B", "C"] });
    TestRunner.assertEqual(resRot.ok, true, "rotated sheet reads ok");
    TestRunner.assertEqual(resRot.answers.join(""), "ACBDABCDAB", "answers survive 4 degree rotation");
    TestRunner.assertEqual(resRot.rollString, "", "no roll read on rotated sheet either");
    TestRunner.assertEqual(resRot.versionIndex, 1, "version survives rotation");

    var resBlank = OMR.read(makeBuf(800, 1000, 240), { qCount: 10 });
    TestRunner.assertEqual(resBlank.ok, false, "blank image not ok");
    TestRunner.assertEqual(resBlank.answers.length, 0, "blank image yields no answers");
    TestRunner.assert(resBlank.warnings.join(",").indexOf("grid-not-found") !== -1, "blank image warns grid-not-found");

    var resNoQ = OMR.read(sheet, { qCount: 0 });
    TestRunner.assertEqual(resNoQ.ok, false, "qCount 0 rejected safely");

    var truth5 = ["B", "A", "D", "C", "B"];
    var sheet5 = buildSheet({ qCount: 5, answers: truth5, roll: "1A07", versionIdx: 2, labels: ["A", "B", "C"] });
    var res5 = OMR.read(sheet5, { qCount: 5, labels: ["A", "B", "C"] });
    TestRunner.assertEqual(res5.ok, true, "odd count sheet reads ok");
    TestRunner.assertEqual(res5.answers.join(""), "BADCB", "5 answers in order (single column)");
    TestRunner.assertEqual(res5.rollString, "", "no roll read on odd sheet");

    var labels5 = ["A", "B", "C", "D", "E"];
    var sheetV = buildSheet({ qCount: 8, answers: ["A", "B", "C", "D", "A", "B", "C", "D"], versionIdx: 3, labels: labels5 });
    var resV = OMR.read(sheetV, { qCount: 8, labels: labels5 });
    TestRunner.assertEqual(resV.ok, true, "5-version sheet reads ok");
    TestRunner.assertEqual(resV.versionIndex, 3, "version D detected among 5 labels");

    TestRunner.suite("OMR Scanner - grid layout");
    var lay10 = OMR.gridLayout(10);
    TestRunner.assertEqual(lay10.blocks.length, 1, "10 questions -> single block");
    TestRunner.assertEqual(lay10.blocks[0].cols, 2, "10 questions -> 2 columns");
    TestRunner.assertEqual(lay10.blocks[0].rows, 5, "10 questions -> 5 rows");
    var lay30 = OMR.gridLayout(30);
    TestRunner.assertEqual(lay30.blocks[0].cols, 4, "30 questions -> 4 columns");
    TestRunner.assertEqual(lay30.blocks[0].rows, 8, "30 questions -> 8 rows");
    var lay40 = OMR.gridLayout(40);
    TestRunner.assertEqual(lay40.blocks[0].cols, 5, "40 questions -> 5 columns");
    TestRunner.assertEqual(lay40.blocks[0].rows, 8, "40 questions -> 8 rows");
    var lay60 = OMR.gridLayout(60);
    TestRunner.assertEqual(lay60.blocks.length, 2, "60 questions -> two blocks");
    TestRunner.assertEqual(lay60.blocks[1].start, 40, "second block starts at question 41");
    TestRunner.assertEqual(lay60.blocks[1].cols, 5, "second block columns");
    TestRunner.assertEqual(lay60.blocks[1].rows, 4, "second block has 4 rows");
    TestRunner.assertEqual(OMR.gridLayout(0).blocks.length, 0, "0 questions -> no blocks");

    var truth30 = [];
    for (i = 0; i < 30; i++) truth30.push("ABCD".charAt((i * 5) % 4));
    var sheet30 = buildSheet({ qCount: 30, answers: truth30, versionIdx: 0, labels: ["A", "B"] });
    var res30 = OMR.read(sheet30, { qCount: 30, labels: ["A", "B"] });
    TestRunner.assertEqual(res30.ok, true, "30-question sheet reads ok");
    TestRunner.assertEqual(res30.answers.join(""), truth30.join(""), "30 answers mapped column-major");
    TestRunner.assertEqual(res30.warnings.length, 0, "partial last column (6 rows) produces no warning");

    var truth60 = [];
    for (i = 0; i < 60; i++) truth60.push("ABCD".charAt((i * 7) % 4));
    var sheet60 = buildSheet({ qCount: 60, answers: truth60, versionIdx: 1, labels: ["A", "B"] });
    var res60 = OMR.read(sheet60, { qCount: 60, labels: ["A", "B"] });
    TestRunner.assertEqual(res60.ok, true, "60-question two-block sheet reads ok");
    TestRunner.assertEqual(res60.answers.join(""), truth60.join(""), "60 answers across both blocks");
    TestRunner.assertEqual(res60.warnings.length, 0, "two-block sheet produces no warnings");

    TestRunner.suite("OMR Scanner - grading");
    var gqs = [
        { id: "q1", answer: "B", options: ["x", "y", "z", "w"], topic: "T1", difficulty: "easy" },
        { id: "q2", answer: "D", options: ["x", "y", "z", "w"], topic: "T2", difficulty: "hard" },
        { id: "q3", answer: "y", options: ["x", "y", "z", "w"], topic: "T1", difficulty: "medium" }
    ];
    var g1 = ExamEngine.gradeDetected(gqs, ["B", "A", "B"]);
    TestRunner.assertEqual(g1.score, 2, "two correct of three");
    TestRunner.assertEqual(g1.total, 3, "total matches questions");
    TestRunner.assertEqual(g1.percentage, 66.67, "percentage computed");
    TestRunner.assertEqual(g1.questions[0].correct, true, "B marked correct");
    TestRunner.assertEqual(g1.questions[1].correct, false, "A wrong for D");
    TestRunner.assertEqual(g1.questions[2].correct, true, "answer-as-text mapped to letter B");
    TestRunner.assertEqual(g1.questions[2].correctAnswer, "B", "normAnswerLetter maps option text");
    TestRunner.assertEqual(g1.questions[1].difficulty, "hard", "difficulty carried into attempt record");

    var g2 = ExamEngine.gradeDetected(gqs, [null, "D", "B"]);
    TestRunner.assertEqual(g2.score, 2, "blank answer not correct");
    TestRunner.assertEqual(g2.questions[0].selectedAnswer, null, "null preserved as no answer");

    var g3 = ExamEngine.gradeDetected(null, null);
    TestRunner.assertEqual(g3.total, 0, "empty input safe");
    TestRunner.assertEqual(g3.score, 0, "empty input scores 0");

    TestRunner.assertEqual(ExamEngine.normAnswerLetter({ answer: "c" }), "C", "lowercase answer normalized");
}
