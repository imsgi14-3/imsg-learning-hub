var OMR = (function() {

    function toGray(img) {
        var w = img.width, h = img.height, n = w * h;
        var g = new Uint8Array(n);
        for (var i = 0; i < n; i++) {
            var o = i * 4;
            g[i] = (img.data[o] * 299 + img.data[o + 1] * 587 + img.data[o + 2] * 114) / 1000 | 0;
        }
        return { data: g, width: w, height: h };
    }

    function otsu(g) {
        var hist = new Array(256), i;
        for (i = 0; i < 256; i++) hist[i] = 0;
        for (i = 0; i < g.length; i++) hist[g[i]]++;
        var total = g.length, sum = 0;
        for (i = 0; i < 256; i++) sum += i * hist[i];
        var sumB = 0, wB = 0, best = 0, threshold = 127;
        for (i = 0; i < 256; i++) {
            wB += hist[i];
            if (wB === 0) continue;
            var wF = total - wB;
            if (wF === 0) break;
            sumB += i * hist[i];
            var mB = sumB / wB, mF = (sum - sumB) / wF;
            var between = wB * wF * (mB - mF) * (mB - mF);
            if (between > best) { best = between; threshold = i; }
        }
        return threshold;
    }

    function components(g, w, h, threshold) {
        var labels = new Int32Array(w * h);
        var comps = [];
        var stack = new Int32Array(w * h);
        var id = 0;
        for (var start = 0; start < w * h; start++) {
            if (labels[start] !== 0 || g[start] > threshold) continue;
            id++;
            var sp = 0;
            stack[sp++] = start;
            labels[start] = id;
            var area = 0, sx = 0, sy = 0, x0 = w, y0 = h, x1 = 0, y1 = 0;
            while (sp > 0) {
                var p = stack[--sp];
                var x = p % w, y = (p / w) | 0;
                area++; sx += x; sy += y;
                if (x < x0) x0 = x;
                if (x > x1) x1 = x;
                if (y < y0) y0 = y;
                if (y > y1) y1 = y;
                if (x > 0 && !labels[p - 1] && g[p - 1] <= threshold) { labels[p - 1] = id; stack[sp++] = p - 1; }
                if (x < w - 1 && !labels[p + 1] && g[p + 1] <= threshold) { labels[p + 1] = id; stack[sp++] = p + 1; }
                if (y > 0 && !labels[p - w] && g[p - w] <= threshold) { labels[p - w] = id; stack[sp++] = p - w; }
                if (y < h - 1 && !labels[p + w] && g[p + w] <= threshold) { labels[p + w] = id; stack[sp++] = p + w; }
            }
            comps.push({ cx: sx / area, cy: sy / area, x0: x0, y0: y0, x1: x1, y1: y1, area: area });
        }
        return comps;
    }

    function findCornerSquares(gimg) {
        var W = gimg.width, H = gimg.height;
        var cutoff = Math.min(otsu(gimg.data), 96);
        var comps = components(gimg.data, W, H, cutoff);
        var cand = [], maxArea = 0, i, c;
        for (i = 0; i < comps.length; i++) {
            c = comps[i];
            var bw = c.x1 - c.x0 + 1, bh = c.y1 - c.y0 + 1;
            if (c.area < 30 || c.area > W * H / 40) continue;
            var fill = c.area / (bw * bh);
            var asp = bw / bh;
            if (fill < 0.72 || asp < 0.55 || asp > 1.8) continue;
            cand.push(c);
            if (c.area > maxArea) maxArea = c.area;
        }
        if (maxArea === 0) return null;
        var minArea = maxArea * 0.25;
        var quads = [null, null, null, null];
        for (i = 0; i < cand.length; i++) {
            c = cand[i];
            if (c.area < minArea) continue;
            var qi = (c.cx < W / 2 ? 0 : 1) + (c.cy < H / 2 ? 0 : 2);
            if (!quads[qi] || c.area > quads[qi].area) quads[qi] = c;
        }
        if (!quads[0] || !quads[1] || !quads[2] || !quads[3]) return null;
        return [quads[0], quads[1], quads[3], quads[2]];
    }

    function gaussSolve(A, b) {
        var n = b.length, i, j, k;
        for (i = 0; i < n; i++) {
            var max = i;
            for (j = i + 1; j < n; j++) if (Math.abs(A[j][i]) > Math.abs(A[max][i])) max = j;
            if (Math.abs(A[max][i]) < 1e-10) return null;
            if (max !== i) {
                var t = A[i]; A[i] = A[max]; A[max] = t;
                var tb = b[i]; b[i] = b[max]; b[max] = tb;
            }
            for (j = i + 1; j < n; j++) {
                var f = A[j][i] / A[i][i];
                if (f === 0) continue;
                for (k = i; k < n; k++) A[j][k] -= f * A[i][k];
                b[j] -= f * b[i];
            }
        }
        var x = new Array(n);
        for (i = n - 1; i >= 0; i--) {
            var s = b[i];
            for (j = i + 1; j < n; j++) s -= A[i][j] * x[j];
            x[i] = s / A[i][i];
        }
        return x;
    }

    function homography(from, to) {
        var A = [], b = [], i;
        for (i = 0; i < 4; i++) {
            var x = from[i].x, y = from[i].y, u = to[i].x, v = to[i].y;
            A.push([x, y, 1, 0, 0, 0, -u * x, -u * y]);
            b.push(u);
            A.push([0, 0, 0, x, y, 1, -v * x, -v * y]);
            b.push(v);
        }
        return gaussSolve(A, b);
    }

    function bilinear(gimg, x, y) {
        if (x < 0) x = 0;
        if (y < 0) y = 0;
        if (x > gimg.width - 1) x = gimg.width - 1;
        if (y > gimg.height - 1) y = gimg.height - 1;
        var x0 = x | 0, y0 = y | 0;
        var x1 = Math.min(x0 + 1, gimg.width - 1), y1 = Math.min(y0 + 1, gimg.height - 1);
        var fx = x - x0, fy = y - y0;
        var g = gimg.data;
        var p00 = g[y0 * gimg.width + x0], p10 = g[y0 * gimg.width + x1];
        var p01 = g[y1 * gimg.width + x0], p11 = g[y1 * gimg.width + x1];
        return ((p00 * (1 - fx) + p10 * fx) * (1 - fy) + (p01 * (1 - fx) + p11 * fx) * fy) | 0;
    }

    function rectify(gimg, corners, outW, outH, m) {
        var from = [{ x: m, y: m }, { x: outW - m, y: m }, { x: outW - m, y: outH - m }, { x: m, y: outH - m }];
        var to = [], ci;
        for (ci = 0; ci < corners.length; ci++) to.push({ x: corners[ci].cx, y: corners[ci].cy });
        var H = homography(from, to);
        if (!H) return null;
        var out = new Uint8Array(outW * outH);
        for (var y = 0; y < outH; y++) {
            for (var x = 0; x < outW; x++) {
                var d = H[6] * x + H[7] * y + 1;
                if (d === 0) { out[y * outW + x] = 255; continue; }
                var sx = (H[0] * x + H[1] * y + H[2]) / d;
                var sy = (H[3] * x + H[4] * y + H[5]) / d;
                out[y * outW + x] = bilinear(gimg, sx, sy);
            }
        }
        return { data: out, width: outW, height: outH };
    }

    function cluster1d(values, gap) {
        if (values.length === 0) return [];
        var sorted = values.slice().sort(function(a, b) { return a - b; });
        var out = [], cur = [sorted[0]], i;
        for (i = 1; i < sorted.length; i++) {
            if (sorted[i] - sorted[i - 1] <= gap) cur.push(sorted[i]);
            else { out.push(cur); cur = [sorted[i]]; }
        }
        out.push(cur);
        var clusters = [];
        for (i = 0; i < out.length; i++) {
            var sum = 0;
            for (var j = 0; j < out[i].length; j++) sum += out[i][j];
            clusters.push({ center: sum / out[i].length, items: out[i] });
        }
        return clusters;
    }

    function mergeCells(comps, maxDist) {
        var sorted = comps.slice().sort(function(a, b) { return a.cx - b.cx; });
        var used = [], cells = [], i, j;
        for (i = 0; i < sorted.length; i++) {
            if (used[i]) continue;
            used[i] = true;
            var acc = [sorted[i]];
            for (j = i + 1; j < sorted.length; j++) {
                if (used[j]) continue;
                if (Math.abs(sorted[j].cx - acc[acc.length - 1].cx) > maxDist) continue;
                var near = false;
                for (var k = 0; k < acc.length; k++) {
                    var dy = sorted[j].cy - acc[k].cy, ddx = sorted[j].cx - acc[k].cx;
                    if (ddx * ddx + dy * dy <= maxDist * maxDist) { near = true; break; }
                }
                if (near) { used[j] = true; acc.push(sorted[j]); }
            }
            var area = 0, sx = 0, sy = 0, x0 = acc[0].x0, y0 = acc[0].y0, x1 = acc[0].x1, y1 = acc[0].y1;
            for (k = 0; k < acc.length; k++) {
                area += acc[k].area; sx += acc[k].cx * acc[k].area; sy += acc[k].cy * acc[k].area;
                if (acc[k].x0 < x0) x0 = acc[k].x0;
                if (acc[k].y0 < y0) y0 = acc[k].y0;
                if (acc[k].x1 > x1) x1 = acc[k].x1;
                if (acc[k].y1 > y1) y1 = acc[k].y1;
            }
            cells.push({ cx: area ? sx / area : acc[0].cx, cy: area ? sy / area : acc[0].cy,
                         x0: x0, y0: y0, x1: x1, y1: y1, area: area });
        }
        return cells;
    }

    function sampleRatio(gimg, cx, cy, r, threshold) {
        var x0 = Math.max(0, Math.floor(cx - r)), x1 = Math.min(gimg.width - 1, Math.ceil(cx + r));
        var y0 = Math.max(0, Math.floor(cy - r)), y1 = Math.min(gimg.height - 1, Math.ceil(cy + r));
        var dark = 0, total = 0, rr = r * r;
        for (var y = y0; y <= y1; y++) {
            for (var x = x0; x <= x1; x++) {
                var dx = x - cx, dy = y - cy;
                if (dx * dx + dy * dy > rr) continue;
                total++;
                if (gimg.data[y * gimg.width + x] <= threshold) dark++;
            }
        }
        return total ? dark / total : 0;
    }

    function bandsOf(cells, yGap) {
        var sorted = cells.slice().sort(function(a, b) { return a.cy - b.cy; });
        var bands = [], cur = [], i;
        for (i = 0; i < sorted.length; i++) {
            if (cur.length === 0 || sorted[i].cy - cur[cur.length - 1].cy <= yGap) cur.push(sorted[i]);
            else { bands.push(cur); cur = [sorted[i]]; }
        }
        if (cur.length) bands.push(cur);
        var out = [];
        for (i = 0; i < bands.length; i++) {
            var sum = 0;
            for (var j = 0; j < bands[i].length; j++) sum += bands[i][j].cy;
            out.push({ cy: sum / bands[i].length, cells: bands[i] });
        }
        return out;
    }

    function groupByX(cells, gap) {
        var sorted = cells.slice().sort(function(a, b) { return a.cx - b.cx; });
        var groups = [], cur = [];
        for (var i = 0; i < sorted.length; i++) {
            if (cur.length === 0 || sorted[i].cx - cur[cur.length - 1].cx <= gap) cur.push(sorted[i]);
            else { groups.push(cur); cur = [sorted[i]]; }
        }
        if (cur.length) groups.push(cur);
        return groups;
    }

    // Shared with the sheet builder (ui.js): column-major blocks, up to
    // 5 columns x 8 rows, second block for 41-60 questions.
    function gridLayout(qCount) {
        var N = qCount | 0;
        var blocks = [];
        if (N <= 0) return { blocks: blocks };
        if (N <= 40) {
            var cols = Math.min(5, Math.max(1, Math.ceil(N / 8)));
            blocks.push({ start: 0, count: N, cols: cols, rows: Math.ceil(N / cols) });
        } else {
            var rest = N - 40;
            var cols2 = Math.min(5, Math.max(1, rest));
            blocks.push({ start: 0, count: 40, cols: 5, rows: 8 });
            blocks.push({ start: 40, count: rest, cols: cols2, rows: Math.ceil(rest / cols2) });
        }
        return { blocks: blocks };
    }

    function read(img, opts) {
        opts = opts || {};
        var qCount = opts.qCount | 0;
        var labels = opts.labels && opts.labels.length ? opts.labels : ["A"];
        var letters = opts.optionLetters || "ABCD";
        var outW = 1240, outH = 1754, m = 48;
        var warnings = [], result;
        if (!img || !img.data || qCount <= 0) {
            return { ok: false, warnings: ["no-input"], answers: [], roll: [], versionIndex: -1, ratios: [] };
        }
        var g0 = toGray(img);
        var corners = findCornerSquares(g0);
        var rect = null;
        if (corners) rect = rectify(g0, corners, outW, outH, m);
        else warnings.push("corners-not-found");
        if (!rect) rect = g0;

        var t = otsu(rect.data);
        var cutoff = Math.min(t, 100);
        var comps = components(rect.data, rect.width, rect.height, cutoff);
        var mark = [], i, c;
        for (i = 0; i < comps.length; i++) {
            c = comps[i];
            var bw = c.x1 - c.x0 + 1, bh = c.y1 - c.y0 + 1;
            if (bw < 16 || bw > 60 || bh < 16 || bh > 60) continue;
            if (c.area < 12) continue;
            mark.push(c);
        }
        var cells = mergeCells(mark, 14);
        // Header/question split. The header holds the school/title rows,
        // the legend (top-right), the ROLL NUMBER box with the version
        // box beside it (digits end ~0.35H, version ~0.23H) and the
        // Time/Marks/instruction/banner rows (through ~0.47H); the answer
        // grid starts ~0.49H. The cut sits between them so roll/version
        // bubbles are never treated as question cells; banner/word boxes
        // straddling the cut are already dropped by the 60px size filter.
        var gridCut = rect.height * 0.45;
        var headerCells = [], qCells = [];
        for (i = 0; i < cells.length; i++) {
            if (cells[i].cy < gridCut) headerCells.push(cells[i]);
            else qCells.push(cells[i]);
        }

        // Question groups: band cells by row (rectification has already
        // removed tilt), then x-group each row. Number labels and
        // banner/instruction glyphs are dropped by the >=20px size filter.
        var rowBands = bandsOf(qCells, 30);
        var groups = [], gi, k;
        for (i = 0; i < rowBands.length; i++) {
            var xGroups = groupByX(rowBands[i].cells, 60);
            for (var xi = 0; xi < xGroups.length; xi++) {
                var gc = [];
                for (gi = 0; gi < xGroups[xi].length; gi++) {
                    var cc = xGroups[xi][gi];
                    var cbw = cc.x1 - cc.x0 + 1, cbh = cc.y1 - cc.y0 + 1;
                    if (cbw >= 20 && cbh >= 20) gc.push(cc);
                }
                if (gc.length === 4) {
                    var gsumx = 0, gsumy = 0;
                    for (k = 0; k < 4; k++) { gsumx += gc[k].cx; gsumy += gc[k].cy; }
                    groups.push({ cells: gc, cx: gsumx / 4, cy: gsumy / 4 });
                }
            }
        }

        // Map groups to gridLayout blocks: cluster groups into columns by x,
        // split each column into block segments on a big cy gap, then read
        // column-major. This is rotation-robust (a column shares one x, so
        // tilt shifts its cy uniformly).
        var layout = gridLayout(qCount);
        var cellsQ = [], mismatch = false, covered = 0;
        for (i = 0; i < qCount; i++) cellsQ.push(null);
        if (groups.length) {
            var gxs = [];
            for (i = 0; i < groups.length; i++) gxs.push(groups[i].cx);
            var colC = cluster1d(gxs, 150);
            var columns = [];
            for (i = 0; i < colC.length; i++) columns.push(null);
            for (i = 0; i < groups.length; i++) {
                var bestCol = 0, bestDx = 1e9;
                for (var ci = 0; ci < colC.length; ci++) {
                    var dxg = Math.abs(groups[i].cx - colC[ci].center);
                    if (dxg < bestDx) { bestDx = dxg; bestCol = ci; }
                }
                if (!columns[bestCol]) columns[bestCol] = [];
                columns[bestCol].push(groups[i]);
            }
            var block0Cols = layout.blocks[0] ? layout.blocks[0].cols : 0;
            if (columns.length !== block0Cols) mismatch = true;
            for (var bi = 0; bi < layout.blocks.length; bi++) {
                var blk = layout.blocks[bi];
                for (var bj = 0; bj < blk.cols; bj++) {
                    var col = columns[bj];
                    var seg = null;
                    if (col) {
                        col.sort(function(a, b) { return a.cy - b.cy; });
                        var segs = [], curSeg = [];
                        for (k = 0; k < col.length; k++) {
                            if (curSeg.length === 0 || col[k].cy - curSeg[curSeg.length - 1].cy <= 68) curSeg.push(col[k]);
                            else { segs.push(curSeg); curSeg = [col[k]]; }
                        }
                        if (curSeg.length) segs.push(curSeg);
                        seg = segs[bi];
                    }
                    var expLen = blk.count - bj * blk.rows;
                    if (expLen > blk.rows) expLen = blk.rows;
                    if (!seg) { if (expLen > 0) mismatch = true; continue; }
                    if (seg.length !== expLen) mismatch = true;
                    for (k = 0; k < seg.length; k++) {
                        var qi = blk.start + bj * blk.rows + k;
                        if (qi >= qCount) continue;
                        var gr4 = [];
                        for (var qj = 0; qj < 4; qj++) gr4.push(sampleRatio(rect, seg[k].cells[qj].cx, seg[k].cells[qj].cy, 11, cutoff));
                        cellsQ[qi] = gr4;
                        covered++;
                    }
                }
            }
            if (mismatch) warnings.push("row-count-mismatch");
            if (covered < qCount) warnings.push("order-assumed");
        } else {
            warnings.push("grid-not-found");
        }

        // Version row: only bubble-sized header cells (>=20px both sides,
        // so instruction/banner/roll-label text and word clusters never
        // qualify) in the band window 0.17H-0.30H. The legend, section
        // bubbles and title sit above the window, the Time/Marks row
        // below it; only the ROLL NUMBER digit rows share the window and
        // they form 2-cell bands, so the band whose cell count is
        // closest to the number of version labels is the version box
        // (which sits to the right of the roll table).
        var versionCells = [];
        if (headerCells.length) {
            var vCand = [];
            for (i = 0; i < headerCells.length; i++) {
                var hc = headerCells[i];
                var hw = hc.x1 - hc.x0 + 1, hh = hc.y1 - hc.y0 + 1;
                if (hw >= 20 && hh >= 20 && hc.cy >= rect.height * 0.17 && hc.cy <= rect.height * 0.30) vCand.push(hc);
            }
            var hBands = bandsOf(vCand, 13);
            var bestBand = null, bestDiff = 1e9, bestX = -1;
            for (i = 0; i < hBands.length; i++) {
                var hDiff = Math.abs(hBands[i].cells.length - labels.length);
                var hX = 0, hj;
                for (hj = 0; hj < hBands[i].cells.length; hj++) hX += hBands[i].cells[hj].cx;
                hX = hX / hBands[i].cells.length;
                // Closest count wins; on a count tie the RIGHTMOST band
                // wins - the version box sits right of the roll table
                // while digit-row bands (2 cells) sit inside it, so a
                // 2-label version still beats a digit row.
                if (hDiff < bestDiff || (hDiff === bestDiff && hX > bestX)) {
                    bestDiff = hDiff; bestX = hX; bestBand = hBands[i];
                }
            }
            if (bestBand) versionCells = bestBand.cells.slice().sort(function(a, b) { return a.cx - b.cx; });
        }

        var allRatios = [];
        for (i = 0; i < cellsQ.length; i++) {
            if (!cellsQ[i]) continue;
            for (var ri = 0; ri < cellsQ[i].length; ri++) allRatios.push(cellsQ[i][ri]);
        }
        var vRatios = [];
        for (i = 0; i < versionCells.length; i++) vRatios.push(sampleRatio(rect, versionCells[i].cx, versionCells[i].cy, 11, cutoff));
        for (i = 0; i < vRatios.length; i++) allRatios.push(vRatios[i]);
        var ratioThreshold = 0.35;
        if (allRatios.length >= 6) {
            var scaled = new Uint8Array(allRatios.length);
            for (i = 0; i < allRatios.length; i++) scaled[i] = Math.min(255, allRatios[i] * 255);
            var thr = otsu(scaled) / 255;
            ratioThreshold = Math.max(thr, 0.35);
        }

        var answers = [], ratiosOut = [];
        if (groups.length) {
            for (i = 0; i < qCount; i++) {
                var gr = cellsQ[i];
                if (!gr) { answers.push(null); ratiosOut.push([0, 0, 0, 0]); continue; }
                var maxR = -1, maxI = -1, shaded = 0;
                for (var qj = 0; qj < 4; qj++) {
                    if (gr[qj] > maxR) { maxR = gr[qj]; maxI = qj; }
                    if (gr[qj] >= ratioThreshold) shaded++;
                }
                var letter = (shaded >= 1 && maxI >= 0 && maxR >= ratioThreshold) ? letters.charAt(maxI) : null;
                answers.push(letter);
                ratiosOut.push(gr);
            }
        }

        var versionIndex = -1;
        if (versionCells.length && vRatios.length) {
            var vs = -1, vr = -1;
            for (i = 0; i < vRatios.length; i++) if (vRatios[i] >= ratioThreshold && vRatios[i] > vr) { vr = vRatios[i]; vs = i; }
            if (vs >= 0) versionIndex = vs;
            else if (labels.length === 1) versionIndex = 0;
        } else if (labels.length === 1) versionIndex = 0;

        var gridOk = groups.length > 0 && answers.length === qCount;
        var confident = gridOk && !warnings.length;
        result = {
            ok: gridOk,
            rectified: !!corners,
            answers: answers,
            ratios: ratiosOut,
            roll: [],
            rollString: "",
            versionIndex: versionIndex,
            version: versionIndex >= 0 && versionIndex < labels.length ? labels[versionIndex] : "",
            threshold: ratioThreshold,
            warnings: warnings,
            confidence: confident ? "high" : "low"
        };
        return result;
    }

    return {
        toGray: toGray,
        otsu: otsu,
        components: components,
        findCornerSquares: findCornerSquares,
        gaussSolve: gaussSolve,
        homography: homography,
        rectify: rectify,
        cluster1d: cluster1d,
        sampleRatio: sampleRatio,
        gridLayout: gridLayout,
        read: read
    };
})();
