// app.js - Main application logic

// Global state
const state = {
    allEmojis: [],
    filteredEmojis: [],
    currentPage: 1,
    pageSize: 256,
    searchQuery: '',
    sortColumn: null,
    sortDirection: 'asc'
};

// Local emoji file paths
const EMOJI_FILES = {
    test: 'emoji-test.txt',
    sequences: 'emoji-sequences.txt',
    zwj: 'emoji-zwj-sequences.txt'
};

/**
 * Toggle sort direction for the current column
 * @returns {string} New sort direction
 */
function toggleSortDirection() {
    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
    return state.sortDirection;
}

/**
 * Update sort state for a specific column
 * @param {string} column - Column name to sort by
 */
function updateSortState(column) {
    if (state.sortColumn === column) {
        toggleSortDirection();
    } else {
        state.sortColumn = column;
        state.sortDirection = 'asc';
    }
}

/**
 * Sort emojis by code point (alphanumeric comparison)
 * @param {Array} emojis - Array of emoji objects
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
function sortByCodePoint(emojis, direction) {
    return [...emojis].sort((a, b) => {
        const comparison = a.codePoint.localeCompare(b.codePoint, undefined, { numeric: true });
        return direction === 'asc' ? comparison : -comparison;
    });
}

/**
 * Sort emojis by code point count (numeric comparison)
 * @param {Array} emojis - Array of emoji objects
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
function sortByCount(emojis, direction) {
    return [...emojis].sort((a, b) => {
        const comparison = a.codePointCount - b.codePointCount;
        return direction === 'asc' ? comparison : -comparison;
    });
}

/**
 * Sort emojis by UTF-8 literal (string comparison)
 * @param {Array} emojis - Array of emoji objects
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
function sortByUtf8(emojis, direction) {
    return [...emojis].sort((a, b) => {
        const comparison = a.utf8.localeCompare(b.utf8);
        return direction === 'asc' ? comparison : -comparison;
    });
}

/**
 * Sort emojis by byte size (numeric comparison)
 * @param {Array} emojis - Array of emoji objects
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
function sortByBytes(emojis, direction) {
    return [...emojis].sort((a, b) => {
        const comparison = a.byteSize - b.byteSize;
        return direction === 'asc' ? comparison : -comparison;
    });
}

/**
 * Sort emojis by name (alphabetical comparison, case-insensitive)
 * @param {Array} emojis - Array of emoji objects
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
function sortByName(emojis, direction) {
    return [...emojis].sort((a, b) => {
        const comparison = a.name.toLowerCase().localeCompare(b.name.toLowerCase());
        return direction === 'asc' ? comparison : -comparison;
    });
}

/**
 * Generic sort dispatcher function
 * @param {Array} emojis - Array of emoji objects
 * @param {string} column - Column to sort by
 * @param {string} direction - 'asc' or 'desc'
 * @returns {Array} Sorted array
 */
function sortEmojis(emojis, column, direction) {
    switch (column) {
        case 'codePoint':
            return sortByCodePoint(emojis, direction);
        case 'count':
            return sortByCount(emojis, direction);
        case 'utf8':
            return sortByUtf8(emojis, direction);
        case 'bytes':
            return sortByBytes(emojis, direction);
        case 'name':
            return sortByName(emojis, direction);
        default:
            return emojis;
    }
}

/**
 * Fetch all Unicode emoji files in parallel
 * @returns {Promise<Object>} Object containing file contents
 */
async function fetchEmojiFiles() {
    console.log('Fetching emoji files...');

    try {
        const [testFile, sequencesFile, zwjFile] = await Promise.all([
            fetch(EMOJI_FILES.test).then(r => r.text()),
            fetch(EMOJI_FILES.sequences).then(r => r.text()),
            fetch(EMOJI_FILES.zwj).then(r => r.text())
        ]);

        return {
            test: testFile,
            sequences: sequencesFile,
            zwj: zwjFile
        };
    } catch (error) {
        console.error('Error fetching emoji files:', error);
        throw error;
    }
}

/**
 * Initialize the application
 */
async function initApp() {
    showLoading();

    try {
        // Fetch all files
        const files = await fetchEmojiFiles();

        // Parse all files
        console.log('Parsing emoji files...');
        const testEmojis = parseEmojiTest(files.test);
        const sequencesEmojis = parseEmojiSequences(files.sequences);
        const zwjEmojis = parseEmojiZWJ(files.zwj);

        // Combine and deduplicate
        const allEmojis = [...testEmojis, ...sequencesEmojis, ...zwjEmojis];

        // Deduplicate by code point
        const uniqueEmojis = [];
        const seenCodePoints = new Set();

        for (const emoji of allEmojis) {
            if (!seenCodePoints.has(emoji.codePoint)) {
                seenCodePoints.add(emoji.codePoint);
                uniqueEmojis.push(emoji);
            }
        }

        // Store in state
        state.allEmojis = uniqueEmojis;
        state.filteredEmojis = uniqueEmojis;

        console.log(`Total unique emojis: ${uniqueEmojis.length}`);

        // Hide loading, show controls and table
        hideLoading();
        showControls();

        // Initialize UI
        updatePagination();
        renderTable();

        // Set up event listeners
        setupEventListeners();

    } catch (error) {
        console.error('Failed to initialize app:', error);
        showError(error);
    }
}

/**
 * Show loading state
 */
function showLoading() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('search-controls').classList.add('hidden');
    document.getElementById('pagination-controls-top').classList.add('hidden');
    document.getElementById('table-container').classList.add('hidden');
    document.getElementById('pagination-controls-bottom').classList.add('hidden');
}

/**
 * Hide loading state
 */
function hideLoading() {
    document.getElementById('loading-state').classList.add('hidden');
}

/**
 * Show error state
 * @param {Error} error - The error object
 */
function showError(error) {
    hideLoading();

    const errorState = document.getElementById('error-state');
    const errorMessage = document.querySelector('.error-message');

    let message = 'Failed to load emoji data. ';

    if (error.message && error.message.includes('CORS')) {
        message += 'This might be due to CORS restrictions. Please ensure you\'re running the app over HTTPS or use a CORS proxy.';
    } else if (!navigator.onLine) {
        message += 'Please check your internet connection.';
    } else {
        message += error.message || 'Please try again.';
    }

    errorMessage.textContent = message;
    errorState.classList.remove('hidden');
}

/**
 * Show controls and table
 */
function showControls() {
    document.getElementById('search-controls').classList.remove('hidden');
    document.getElementById('pagination-controls-top').classList.remove('hidden');
    document.getElementById('table-container').classList.remove('hidden');
    document.getElementById('pagination-controls-bottom').classList.remove('hidden');
}

/**
 * Get total number of pages
 * @returns {number} Total pages
 */
function getTotalPages() {
    return Math.ceil(state.filteredEmojis.length / state.pageSize);
}

/**
 * Update pagination controls
 */
function updatePagination() {
    const totalPages = getTotalPages();
    const startItem = state.filteredEmojis.length > 0
        ? (state.currentPage - 1) * state.pageSize + 1
        : 0;
    const endItem = Math.min(state.currentPage * state.pageSize, state.filteredEmojis.length);
    const totalItems = state.filteredEmojis.length;

    // Update page info (top and bottom)
    document.getElementById('page-info').textContent = `Page ${state.currentPage} of ${totalPages || 1}`;
    document.getElementById('page-info-bottom').textContent = `Page ${state.currentPage} of ${totalPages || 1}`;

    // Update item range
    document.getElementById('item-range').textContent =
        `Showing ${startItem}-${endItem} of ${totalItems}`;

    // Update button states (top)
    document.getElementById('first-page').disabled = state.currentPage === 1;
    document.getElementById('prev-page').disabled = state.currentPage === 1;
    document.getElementById('next-page').disabled = state.currentPage >= totalPages;
    document.getElementById('last-page').disabled = state.currentPage >= totalPages;

    // Update button states (bottom)
    document.getElementById('first-page-bottom').disabled = state.currentPage === 1;
    document.getElementById('prev-page-bottom').disabled = state.currentPage === 1;
    document.getElementById('next-page-bottom').disabled = state.currentPage >= totalPages;
    document.getElementById('last-page-bottom').disabled = state.currentPage >= totalPages;
}

/**
 * Render the table with current page data
 */
function renderTable() {
    const tbody = document.getElementById('emoji-table-body');

    // Handle empty state
    if (state.filteredEmojis.length === 0) {
        tbody.innerHTML = `
            <tr class="empty-state">
                <td colspan="6">No emojis found${state.searchQuery ? ` matching "${state.searchQuery}"` : ''}</td>
            </tr>
        `;
        return;
    }

    // Calculate page bounds
    const startIdx = (state.currentPage - 1) * state.pageSize;
    const endIdx = Math.min(startIdx + state.pageSize, state.filteredEmojis.length);
    const pageEmojis = state.filteredEmojis.slice(startIdx, endIdx);

    // Create rows using DocumentFragment for performance
    const fragment = document.createDocumentFragment();

    for (const emoji of pageEmojis) {
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td class="code-point">${emoji.codePoint}</td>
            <td class="count">${emoji.codePointCount}</td>
            <td class="character" data-emoji="${emoji.character}" tabindex="0" role="button" aria-label="Click to copy ${emoji.name}">${emoji.character}</td>
            <td class="utf8">${emoji.utf8}</td>
            <td class="byte-size">${emoji.byteSize}</td>
            <td class="name">${emoji.name}</td>
        `;

        fragment.appendChild(tr);
    }

    // Clear and insert
    tbody.innerHTML = '';
    tbody.appendChild(fragment);
}

/**
 * Scroll to top of page
 */
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Navigate to specific page
 * @param {number} page - Page number
 */
function goToPage(page) {
    const totalPages = getTotalPages();
    state.currentPage = Math.max(1, Math.min(page, totalPages));
    renderTable();
    updatePagination();
    scrollToTop();
}

/**
 * Perform search on emoji data
 * @param {string} query - Search query
 */
function performSearch(query) {
    if (!query.trim()) {
        state.filteredEmojis = state.allEmojis;
    } else {
        const lowerQuery = query.toLowerCase();
        state.filteredEmojis = state.allEmojis.filter(emoji =>
            emoji.character.includes(query) ||
            emoji.name.toLowerCase().includes(lowerQuery)
        );
    }

    // Apply current sorting to filtered results
    applySorting();

    state.currentPage = 1; // Reset to first page
    updatePagination();
    updateResultCount();
    renderTable();
}

/**
 * Update search result count
 */
function updateResultCount() {
    const resultCount = document.getElementById('result-count');
    if (state.searchQuery) {
        resultCount.textContent = `Found ${state.filteredEmojis.length} emoji${state.filteredEmojis.length !== 1 ? 's' : ''}`;
    } else {
        resultCount.textContent = '';
    }
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @param {HTMLElement} element - Element that triggered the copy
 */
async function copyToClipboard(text, element) {
    try {
        // Try modern Clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
        }

        // Show visual feedback
        showCopyFeedback(element);

        console.log('Copied to clipboard:', text);
    } catch (error) {
        console.error('Failed to copy to clipboard:', error);
        alert('Failed to copy emoji. Please try selecting and copying manually.');
    }
}

/**
 * Show visual feedback for copy action
 * @param {HTMLElement} element - Element to show feedback on
 */
function showCopyFeedback(element) {
    const row = element.closest('tr');
    if (!row) return;

    // Add copied class
    row.classList.add('copied');
    element.classList.add('copy-indicator');

    // Remove after 1.5 seconds
    setTimeout(() => {
        row.classList.remove('copied');
        element.classList.remove('copy-indicator');
    }, 1500);
}

/**
 * Handle sorting when a column header is clicked
 * @param {string} column - Column to sort by
 */
function handleSort(column) {
    updateSortState(column);
    applySorting();
    updateSortIndicators();
    state.currentPage = 1; // Reset to first page
    updatePagination();
    renderTable();
}

/**
 * Apply sorting to the filtered emojis
 */
function applySorting() {
    if (state.sortColumn) {
        state.filteredEmojis = sortEmojis(state.filteredEmojis, state.sortColumn, state.sortDirection);
    }
}

/**
 * Update visual sort indicators in table headers
 */
function updateSortIndicators() {
    // Remove all existing sort classes and reset ARIA attributes
    document.querySelectorAll('th.sortable').forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
        header.setAttribute('aria-sort', 'none');
    });

    // Add appropriate class and ARIA attribute to current sort column
    if (state.sortColumn) {
        const activeHeader = document.querySelector(`th[data-column="${state.sortColumn}"]`);
        if (activeHeader) {
            const sortClass = state.sortDirection === 'asc' ? 'sort-asc' : 'sort-desc';
            activeHeader.classList.add(sortClass);
            activeHeader.setAttribute('aria-sort', state.sortDirection === 'asc' ? 'ascending' : 'descending');
        }
    }
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // Search input
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        performSearch(state.searchQuery);
    });

    // Search input - Escape key to clear
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            e.target.value = '';
            state.searchQuery = '';
            performSearch('');
        }
    });

    // Page size selector
    document.getElementById('page-size-select').addEventListener('change', (e) => {
        state.pageSize = parseInt(e.target.value);
        state.currentPage = 1;
        updatePagination();
        renderTable();
    });

    // Pagination buttons (top)
    document.getElementById('first-page').addEventListener('click', () => goToPage(1));
    document.getElementById('prev-page').addEventListener('click', () => goToPage(state.currentPage - 1));
    document.getElementById('next-page').addEventListener('click', () => goToPage(state.currentPage + 1));
    document.getElementById('last-page').addEventListener('click', () => goToPage(getTotalPages()));

    // Pagination buttons (bottom)
    document.getElementById('first-page-bottom').addEventListener('click', () => goToPage(1));
    document.getElementById('prev-page-bottom').addEventListener('click', () => goToPage(state.currentPage - 1));
    document.getElementById('next-page-bottom').addEventListener('click', () => goToPage(state.currentPage + 1));
    document.getElementById('last-page-bottom').addEventListener('click', () => goToPage(getTotalPages()));

    // Clipboard copy (using event delegation on table body)
    document.getElementById('emoji-table-body').addEventListener('click', (e) => {
        if (e.target.classList.contains('character')) {
            const emoji = e.target.dataset.emoji;
            copyToClipboard(emoji, e.target);
        }
    });

    // Keyboard support for emoji cells
    document.getElementById('emoji-table-body').addEventListener('keydown', (e) => {
        if (e.target.classList.contains('character') && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            const emoji = e.target.dataset.emoji;
            copyToClipboard(emoji, e.target);
        }
    });

    // Retry button
    document.getElementById('retry-btn').addEventListener('click', () => {
        initApp();
    });

    // Sortable column headers
    document.querySelectorAll('th.sortable').forEach(header => {
        // Click event
        header.addEventListener('click', () => {
            handleSort(header.dataset.column);
        });

        // Keyboard support
        header.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleSort(header.dataset.column);
            }
        });
    });
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}
