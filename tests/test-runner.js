// test-runner.js - Main test runner script

// Run tests when button is clicked
document.getElementById('run-tests').addEventListener('click', async () => {
    const button = document.getElementById('run-tests');
    button.disabled = true;
    button.textContent = 'Running Tests...';

    document.getElementById('test-results').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <p>Running tests...</p>
        </div>
    `;

    try {
        // Small delay to ensure UI updates
        await new Promise(resolve => setTimeout(resolve, 100));

        // Run all tests
        const results = await runAllTests();

        // Display results
        displayResults(results);

        // Update button
        button.disabled = false;
        button.textContent = 'Run All Tests Again';

        // Log summary to console
        console.log('Test Results:', results);
        console.log(`Total: ${results.totalTests}, Passed: ${results.passedTests}, Failed: ${results.failedTests}`);

    } catch (error) {
        console.error('Test runner error:', error);
        document.getElementById('test-results').innerHTML = `
            <div class="error-details">
                Test runner encountered an error: ${error.message}
            </div>
        `;
        button.disabled = false;
        button.textContent = 'Run All Tests Again';
    }
});

// Auto-run tests on page load (optional - commented out by default)
// window.addEventListener('load', () => {
//     document.getElementById('run-tests').click();
// });
