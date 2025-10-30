// test-utils.js - Simple test framework utilities

/**
 * Test suite registry
 */
const testSuites = [];
let currentSuite = null;

/**
 * Define a test suite
 * @param {string} name - Suite name
 * @param {Function} fn - Suite definition function
 */
function describe(name, fn) {
    const suite = {
        name,
        tests: [],
        beforeEachFn: null,
        afterEachFn: null
    };

    testSuites.push(suite);
    currentSuite = suite;

    fn();

    currentSuite = null;
}

/**
 * Define a test case
 * @param {string} name - Test name
 * @param {Function} fn - Test function
 */
function it(name, fn) {
    if (!currentSuite) {
        throw new Error('it() must be called within describe()');
    }

    currentSuite.tests.push({
        name,
        fn,
        passed: null,
        error: null,
        duration: 0
    });
}

/**
 * Define beforeEach hook
 * @param {Function} fn - Hook function
 */
function beforeEach(fn) {
    if (!currentSuite) {
        throw new Error('beforeEach() must be called within describe()');
    }
    currentSuite.beforeEachFn = fn;
}

/**
 * Define afterEach hook
 * @param {Function} fn - Hook function
 */
function afterEach(fn) {
    if (!currentSuite) {
        throw new Error('afterEach() must be called within describe()');
    }
    currentSuite.afterEachFn = fn;
}

/**
 * Assertion utilities
 */
const expect = (actual) => {
    return {
        toBe(expected) {
            if (actual !== expected) {
                throw new Error(`Expected ${JSON.stringify(actual)} to be ${JSON.stringify(expected)}`);
            }
        },

        toEqual(expected) {
            const actualStr = JSON.stringify(actual);
            const expectedStr = JSON.stringify(expected);
            if (actualStr !== expectedStr) {
                throw new Error(`Expected ${actualStr} to equal ${expectedStr}`);
            }
        },

        toBeGreaterThan(expected) {
            if (actual <= expected) {
                throw new Error(`Expected ${actual} to be greater than ${expected}`);
            }
        },

        toBeLessThan(expected) {
            if (actual >= expected) {
                throw new Error(`Expected ${actual} to be less than ${expected}`);
            }
        },

        toContain(expected) {
            if (Array.isArray(actual)) {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected array to contain ${JSON.stringify(expected)}`);
                }
            } else if (typeof actual === 'string') {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected string to contain "${expected}"`);
                }
            } else {
                throw new Error('toContain() only works with arrays and strings');
            }
        },

        toHaveLength(expected) {
            if (actual.length !== expected) {
                throw new Error(`Expected length ${expected}, got ${actual.length}`);
            }
        },

        toBeTruthy() {
            if (!actual) {
                throw new Error(`Expected ${JSON.stringify(actual)} to be truthy`);
            }
        },

        toBeFalsy() {
            if (actual) {
                throw new Error(`Expected ${JSON.stringify(actual)} to be falsy`);
            }
        },

        toBeNull() {
            if (actual !== null) {
                throw new Error(`Expected ${JSON.stringify(actual)} to be null`);
            }
        },

        toBeUndefined() {
            if (actual !== undefined) {
                throw new Error(`Expected ${JSON.stringify(actual)} to be undefined`);
            }
        },

        toBeInstanceOf(expectedClass) {
            if (!(actual instanceof expectedClass)) {
                throw new Error(`Expected ${actual} to be instance of ${expectedClass.name}`);
            }
        },

        toMatch(pattern) {
            if (typeof actual !== 'string') {
                throw new Error('toMatch() only works with strings');
            }
            if (!pattern.test(actual)) {
                throw new Error(`Expected "${actual}" to match ${pattern}`);
            }
        },

        toThrow() {
            if (typeof actual !== 'function') {
                throw new Error('toThrow() requires a function');
            }

            try {
                actual();
                throw new Error('Expected function to throw an error');
            } catch (error) {
                // Success - function threw
            }
        }
    };
};

/**
 * Run all test suites
 * @returns {Promise<Object>} Test results
 */
async function runAllTests() {
    const results = {
        suites: [],
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        duration: 0
    };

    const startTime = performance.now();

    for (const suite of testSuites) {
        const suiteResult = {
            name: suite.name,
            tests: [],
            passed: 0,
            failed: 0
        };

        for (const test of suite.tests) {
            // Run beforeEach hook
            if (suite.beforeEachFn) {
                try {
                    suite.beforeEachFn();
                } catch (error) {
                    console.error('beforeEach error:', error);
                }
            }

            // Run test
            const testStart = performance.now();
            try {
                await test.fn();
                test.passed = true;
                test.error = null;
                suiteResult.passed++;
                results.passedTests++;
            } catch (error) {
                test.passed = false;
                test.error = error;
                suiteResult.failed++;
                results.failedTests++;
            }
            test.duration = performance.now() - testStart;

            // Run afterEach hook
            if (suite.afterEachFn) {
                try {
                    suite.afterEachFn();
                } catch (error) {
                    console.error('afterEach error:', error);
                }
            }

            suiteResult.tests.push(test);
            results.totalTests++;
        }

        results.suites.push(suiteResult);
    }

    results.duration = performance.now() - startTime;

    return results;
}

/**
 * Display test results in the UI
 * @param {Object} results - Test results
 */
function displayResults(results) {
    // Update summary
    document.getElementById('total-count').textContent = results.totalTests;
    document.getElementById('passed-count').textContent = results.passedTests;
    document.getElementById('failed-count').textContent = results.failedTests;
    document.getElementById('total-duration').textContent = `${Math.round(results.duration)}ms`;

    // Build results HTML
    const resultsContainer = document.getElementById('test-results');
    let html = '';

    for (const suite of results.suites) {
        html += `
            <div class="test-suite">
                <div class="suite-name">${suite.name} (${suite.passed}/${suite.tests.length} passed)</div>
        `;

        for (const test of suite.tests) {
            const statusClass = test.passed ? 'passed' : 'failed';
            const icon = test.passed ? '✓' : '✗';

            html += `
                <div class="test-case ${statusClass}">
                    <span class="test-icon">${icon}</span>
                    <span class="test-name">${test.name}</span>
                    <span class="test-duration">${Math.round(test.duration)}ms</span>
                </div>
            `;

            if (!test.passed && test.error) {
                html += `
                    <div class="error-details">${test.error.message}\n${test.error.stack || ''}</div>
                `;
            }
        }

        html += `</div>`;
    }

    resultsContainer.innerHTML = html;
}
