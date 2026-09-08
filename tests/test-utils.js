var TestRunner = (function() {
    var results = [];
    var currentSuite = "";
    var passed = 0;
    var failed = 0;
    var total = 0;

    function suite(name) {
        currentSuite = name;
        results.push({ type: "suite", name: name });
    }

    function assert(condition, testName) {
        total++;
        if (condition) {
            passed++;
            results.push({ type: "pass", suite: currentSuite, test: testName });
        } else {
            failed++;
            results.push({ type: "fail", suite: currentSuite, test: testName });
        }
    }

    function assertEqual(actual, expected, testName) {
        if (actual === expected) {
            assert(true, testName);
        } else {
            assert(false, testName + " (expected: " + expected + ", got: " + actual + ")");
        }
    }

    function assertNotEqual(actual, expected, testName) {
        if (actual !== expected) {
            assert(true, testName);
        } else {
            assert(false, testName + " (expected not: " + expected + ")");
        }
    }

    function assertTrue(val, testName) { assert(val === true || val === 1 || val === "true", testName); }
    function assertFalse(val, testName) { assert(val === false || val === 0 || val === "false" || !val, testName); }
    function assertNull(val, testName) { assert(val === null || val === undefined, testName); }
    function assertNotNull(val, testName) { assert(val !== null && val !== undefined, testName); }
    function assertContains(arr, item, testName) {
        var found = false;
        for (var i = 0; i < arr.length; i++) {
            if (JSON.stringify(arr[i]) === JSON.stringify(item)) { found = true; break; }
        }
        assert(found, testName);
    }
    function assertGreaterThan(a, b, testName) { assert(a > b, testName + " (" + a + " > " + b + ")"); }
    function assertLessThan(a, b, testName) { assert(a < b, testName + " (" + a + " < " + b + ")"); }
    function assertInRange(val, min, max, testName) { assert(val >= min && val <= max, testName + " (" + val + " in [" + min + "," + max + "])"); }
    function assertType(val, type, testName) { assert(typeof val === type, testName + " (expected " + type + ", got " + typeof val + ")"); }
    function assertArrayLength(arr, len, testName) { assert(arr.length === len, testName + " (expected length " + len + ", got " + arr.length + ")"); }
    function assertIdExists(arr, id, testName) {
        var found = false;
        for (var i = 0; i < arr.length; i++) { if (arr[i].id === id) { found = true; break; } }
        assert(found, testName);
    }

    function run(testFn) {
        results = [];
        passed = 0;
        failed = 0;
        total = 0;
        testFn();
        return { passed: passed, failed: failed, total: total, results: results };
    }

    function render(containerId) {
        var c = document.getElementById(containerId);
        if (!c) return;
        var html = '<div class="test-summary"><h2>Test Results</h2>' +
            '<p class="' + (failed === 0 ? 'test-pass' : 'test-fail') + '">' +
            passed + '/' + total + ' passed' + (failed > 0 ? ' (' + failed + ' failed)' : '') + '</p></div>';
        for (var i = 0; i < results.length; i++) {
            var r = results[i];
            if (r.type === "suite") {
                html += '<div class="test-suite"><h3>' + r.name + '</h3></div>';
            } else if (r.type === "pass") {
                html += '<div class="test-pass">&#10003; ' + r.test + '</div>';
            } else {
                html += '<div class="test-fail">&#10007; ' + r.test + '</div>';
            }
        }
        c.innerHTML = html;
    }

    return {
        suite: suite,
        assert: assert,
        assertEqual: assertEqual,
        assertNotEqual: assertNotEqual,
        assertTrue: assertTrue,
        assertFalse: assertFalse,
        assertNull: assertNull,
        assertNotNull: assertNotNull,
        assertContains: assertContains,
        assertGreaterThan: assertGreaterThan,
        assertLessThan: assertLessThan,
        assertInRange: assertInRange,
        assertType: assertType,
        assertArrayLength: assertArrayLength,
        assertIdExists: assertIdExists,
        run: run,
        render: render
    };
})();
