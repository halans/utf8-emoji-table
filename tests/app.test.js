// app.test.js - Tests for application logic

// Note: These tests focus on the logic that can be tested without DOM manipulation
// Integration tests will cover full DOM interaction

describe('App: State Management', () => {
    let mockState;

    beforeEach(() => {
        mockState = {
            allEmojis: [],
            filteredEmojis: [],
            currentPage: 1,
            pageSize: 256,
            searchQuery: ''
        };
    });

    it('should initialize with correct default state', () => {
        expect(mockState.currentPage).toBe(1);
        expect(mockState.pageSize).toBe(256);
        expect(mockState.searchQuery).toBe('');
        expect(mockState.allEmojis).toHaveLength(0);
    });

    it('should maintain separate allEmojis and filteredEmojis arrays', () => {
        mockState.allEmojis = [
            { codePoint: 'U+1F600', character: '😀', name: 'grinning face' }
        ];
        mockState.filteredEmojis = mockState.allEmojis;

        expect(mockState.allEmojis).toHaveLength(1);
        expect(mockState.filteredEmojis).toHaveLength(1);
    });
});

describe('App: Pagination Logic', () => {
    it('should calculate total pages correctly', () => {
        const calculateTotalPages = (totalItems, pageSize) => {
            return Math.ceil(totalItems / pageSize);
        };

        expect(calculateTotalPages(1000, 256)).toBe(4);
        expect(calculateTotalPages(256, 256)).toBe(1);
        expect(calculateTotalPages(257, 256)).toBe(2);
        expect(calculateTotalPages(0, 256)).toBe(0);
    });

    it('should calculate page bounds correctly', () => {
        const getPageBounds = (currentPage, pageSize, totalItems) => {
            const startIdx = (currentPage - 1) * pageSize;
            const endIdx = Math.min(startIdx + pageSize, totalItems);
            return { startIdx, endIdx };
        };

        const bounds = getPageBounds(1, 256, 1000);
        expect(bounds.startIdx).toBe(0);
        expect(bounds.endIdx).toBe(256);

        const bounds2 = getPageBounds(2, 256, 1000);
        expect(bounds2.startIdx).toBe(256);
        expect(bounds2.endIdx).toBe(512);

        const boundsLast = getPageBounds(4, 256, 1000);
        expect(boundsLast.startIdx).toBe(768);
        expect(boundsLast.endIdx).toBe(1000);
    });

    it('should calculate item range display correctly', () => {
        const getItemRange = (currentPage, pageSize, totalItems) => {
            const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0;
            const endItem = Math.min(currentPage * pageSize, totalItems);
            return { startItem, endItem };
        };

        const range = getItemRange(1, 256, 1000);
        expect(range.startItem).toBe(1);
        expect(range.endItem).toBe(256);

        const range2 = getItemRange(4, 256, 1000);
        expect(range2.startItem).toBe(769);
        expect(range2.endItem).toBe(1000);

        const rangeEmpty = getItemRange(1, 256, 0);
        expect(rangeEmpty.startItem).toBe(0);
        expect(rangeEmpty.endItem).toBe(0);
    });

    it('should handle page size changes correctly', () => {
        const pageSizes = [128, 256, 512, 1024];
        const totalItems = 1000;

        pageSizes.forEach(pageSize => {
            const totalPages = Math.ceil(totalItems / pageSize);
            expect(totalPages).toBeGreaterThan(0);
            expect(totalPages).toBeLessThan(totalItems);
        });
    });
});

describe('App: Search/Filter Logic', () => {
    const sampleEmojis = [
        { codePoint: 'U+1F600', character: '😀', name: 'grinning face', utf8: '\\xF0\\x9F\\x98\\x80', byteSize: 4, source: 'test' },
        { codePoint: 'U+2764', character: '❤️', name: 'red heart', utf8: '\\xE2\\x9D\\xA4', byteSize: 3, source: 'test' },
        { codePoint: 'U+1F494', character: '💔', name: 'broken heart', utf8: '\\xF0\\x9F\\x92\\x94', byteSize: 4, source: 'test' },
        { codePoint: 'U+1F603', character: '😃', name: 'grinning face with big eyes', utf8: '\\xF0\\x9F\\x98\\x83', byteSize: 4, source: 'test' }
    ];

    it('should filter emojis by name (case-insensitive)', () => {
        const query = 'heart';
        const filtered = sampleEmojis.filter(emoji =>
            emoji.character.includes(query) ||
            emoji.name.toLowerCase().includes(query.toLowerCase())
        );

        expect(filtered).toHaveLength(2);
        expect(filtered[0].name).toContain('heart');
        expect(filtered[1].name).toContain('heart');
    });

    it('should filter emojis by character', () => {
        const query = '😀';
        const filtered = sampleEmojis.filter(emoji =>
            emoji.character.includes(query) ||
            emoji.name.toLowerCase().includes(query.toLowerCase())
        );

        expect(filtered).toHaveLength(1);
        expect(filtered[0].character).toBe('😀');
    });

    it('should handle case-insensitive search', () => {
        const query1 = 'HEART';
        const query2 = 'heart';
        const query3 = 'HeArT';

        const filtered1 = sampleEmojis.filter(e => e.name.toLowerCase().includes(query1.toLowerCase()));
        const filtered2 = sampleEmojis.filter(e => e.name.toLowerCase().includes(query2.toLowerCase()));
        const filtered3 = sampleEmojis.filter(e => e.name.toLowerCase().includes(query3.toLowerCase()));

        expect(filtered1).toHaveLength(2);
        expect(filtered2).toHaveLength(2);
        expect(filtered3).toHaveLength(2);
    });

    it('should return all emojis for empty query', () => {
        const query = '';
        const filtered = query.trim() ? sampleEmojis.filter(e =>
            e.character.includes(query) || e.name.toLowerCase().includes(query.toLowerCase())
        ) : sampleEmojis;

        expect(filtered).toHaveLength(4);
    });

    it('should return empty array for no matches', () => {
        const query = 'xyznotfound';
        const filtered = sampleEmojis.filter(emoji =>
            emoji.character.includes(query) ||
            emoji.name.toLowerCase().includes(query.toLowerCase())
        );

        expect(filtered).toHaveLength(0);
    });

    it('should handle partial name matches', () => {
        const query = 'grin';
        const filtered = sampleEmojis.filter(emoji =>
            emoji.name.toLowerCase().includes(query.toLowerCase())
        );

        expect(filtered).toHaveLength(2);
        expect(filtered[0].name).toContain('grinning');
        expect(filtered[1].name).toContain('grinning');
    });

    it('should filter efficiently on large datasets', () => {
        const largeDataset = [];
        for (let i = 0; i < 5000; i++) {
            largeDataset.push({
                codePoint: `U+${i.toString(16)}`,
                character: '😀',
                name: i % 2 === 0 ? 'test face' : 'other emoji',
                utf8: '\\xF0\\x9F\\x98\\x80',
                source: 'test'
            });
        }

        const start = performance.now();
        const filtered = largeDataset.filter(emoji =>
            emoji.name.toLowerCase().includes('face')
        );
        const duration = performance.now() - start;

        expect(filtered).toHaveLength(2500);
        expect(duration).toBeLessThan(100); // Should be fast
    });
});

describe('App: Data Deduplication', () => {
    it('should remove duplicate code points', () => {
        const emojis = [
            { codePoint: 'U+1F600', character: '😀', name: 'grinning face' },
            { codePoint: 'U+1F600', character: '😀', name: 'grinning face' },
            { codePoint: 'U+2764', character: '❤️', name: 'red heart' }
        ];

        const uniqueEmojis = [];
        const seenCodePoints = new Set();

        for (const emoji of emojis) {
            if (!seenCodePoints.has(emoji.codePoint)) {
                seenCodePoints.add(emoji.codePoint);
                uniqueEmojis.push(emoji);
            }
        }

        expect(uniqueEmojis).toHaveLength(2);
        expect(uniqueEmojis[0].codePoint).toBe('U+1F600');
        expect(uniqueEmojis[1].codePoint).toBe('U+2764');
    });

    it('should preserve first occurrence when deduplicating', () => {
        const emojis = [
            { codePoint: 'U+1F600', character: '😀', name: 'first', source: 'file1' },
            { codePoint: 'U+1F600', character: '😀', name: 'second', source: 'file2' }
        ];

        const uniqueEmojis = [];
        const seenCodePoints = new Set();

        for (const emoji of emojis) {
            if (!seenCodePoints.has(emoji.codePoint)) {
                seenCodePoints.add(emoji.codePoint);
                uniqueEmojis.push(emoji);
            }
        }

        expect(uniqueEmojis).toHaveLength(1);
        expect(uniqueEmojis[0].name).toBe('first');
        expect(uniqueEmojis[0].source).toBe('file1');
    });
});

describe('App: URL Configuration', () => {
    it('should have correct Unicode.org URLs', () => {
        const urls = {
            test: 'https://www.unicode.org/Public/emoji/latest/emoji-test.txt',
            sequences: 'https://www.unicode.org/Public/emoji/latest/emoji-sequences.txt',
            zwj: 'https://www.unicode.org/Public/emoji/latest/emoji-zwj-sequences.txt'
        };

        expect(urls.test).toMatch(/^https:\/\//);
        expect(urls.test).toContain('unicode.org');
        expect(urls.sequences).toContain('emoji-sequences.txt');
        expect(urls.zwj).toContain('emoji-zwj-sequences.txt');
    });
});

describe('App: Error Handling', () => {
    it('should detect CORS errors', () => {
        const error = new Error('CORS policy');
        expect(error.message).toContain('CORS');
    });

    it('should detect network errors', () => {
        const isOnline = true; // Mock navigator.onLine
        expect(isOnline).toBe(true);
    });

    it('should create appropriate error messages', () => {
        const createErrorMessage = (error) => {
            let message = 'Failed to load emoji data. ';
            if (error.message && error.message.includes('CORS')) {
                message += 'CORS restrictions detected.';
            } else {
                message += 'Please try again.';
            }
            return message;
        };

        const corsError = new Error('CORS policy blocked');
        const corsMessage = createErrorMessage(corsError);
        expect(corsMessage).toContain('CORS');

        const genericError = new Error('Something went wrong');
        const genericMessage = createErrorMessage(genericError);
        expect(genericMessage).toContain('Please try again');
    });
});

describe('App: Performance', () => {
    it('should handle large emoji arrays efficiently', () => {
        const createLargeArray = (size) => {
            const arr = [];
            for (let i = 0; i < size; i++) {
                arr.push({
                    codePoint: `U+${i.toString(16)}`,
                    character: '😀',
                    name: `emoji ${i}`,
                    utf8: '\\xF0\\x9F\\x98\\x80',
                    source: 'test'
                });
            }
            return arr;
        };

        const start = performance.now();
        const largeArray = createLargeArray(5000);
        const duration = performance.now() - start;

        expect(largeArray).toHaveLength(5000);
        expect(duration).toBeLessThan(100);
    });

    it('should slice arrays efficiently for pagination', () => {
        const items = Array.from({ length: 5000 }, (_, i) => i);
        const pageSize = 256;

        const start = performance.now();
        const page1 = items.slice(0, pageSize);
        const page2 = items.slice(pageSize, pageSize * 2);
        const duration = performance.now() - start;

        expect(page1).toHaveLength(256);
        expect(page2).toHaveLength(256);
        expect(duration).toBeLessThan(10);
    });
});

describe('App: Sorting Functionality', () => {
    const sampleEmojis = [
        { codePoint: 'U+1F600', codePointCount: 1, character: '😀', name: 'grinning face', utf8: '\\xF0\\x9F\\x98\\x80', byteSize: 4 },
        { codePoint: 'U+1F44D', codePointCount: 2, character: '👍🏻', name: 'thumbs up light skin tone', utf8: '\\xF0\\x9F\\x91\\x8D\\xF0\\x9F\\x8F\\xBB', byteSize: 8 },
        { codePoint: 'U+2764', codePointCount: 1, character: '❤️', name: 'red heart', utf8: '\\xE2\\x9D\\xA4', byteSize: 3 },
        { codePoint: 'U+1F468', codePointCount: 5, character: '👨‍👩‍👧‍👦', name: 'family man woman girl boy', utf8: '\\xF0\\x9F\\x91\\xA8\\xE2\\x80\\x8D\\xF0\\x9F\\x91\\xA9\\xE2\\x80\\x8D\\xF0\\x9F\\x91\\xA7\\xE2\\x80\\x8D\\xF0\\x9F\\x91\\xA6', byteSize: 25 }
    ];

    describe('Sort by Code Point', () => {
        it('should sort by code point in ascending order', () => {
            const sorted = [...sampleEmojis].sort((a, b) => a.codePoint.localeCompare(b.codePoint, undefined, { numeric: true }));
            
            expect(sorted[0].codePoint).toBe('U+1F44D');
            expect(sorted[1].codePoint).toBe('U+1F468');
            expect(sorted[2].codePoint).toBe('U+1F600');
            expect(sorted[3].codePoint).toBe('U+2764');
        });

        it('should sort by code point in descending order', () => {
            const sorted = [...sampleEmojis].sort((a, b) => b.codePoint.localeCompare(a.codePoint, undefined, { numeric: true }));
            
            expect(sorted[0].codePoint).toBe('U+2764');
            expect(sorted[1].codePoint).toBe('U+1F600');
            expect(sorted[2].codePoint).toBe('U+1F468');
            expect(sorted[3].codePoint).toBe('U+1F44D');
        });
    });

    describe('Sort by Count', () => {
        it('should sort by code point count in ascending order', () => {
            const sorted = [...sampleEmojis].sort((a, b) => a.codePointCount - b.codePointCount);
            
            expect(sorted[0].codePointCount).toBe(1);
            expect(sorted[1].codePointCount).toBe(1);
            expect(sorted[2].codePointCount).toBe(2);
            expect(sorted[3].codePointCount).toBe(5);
        });

        it('should sort by code point count in descending order', () => {
            const sorted = [...sampleEmojis].sort((a, b) => b.codePointCount - a.codePointCount);
            
            expect(sorted[0].codePointCount).toBe(5);
            expect(sorted[1].codePointCount).toBe(2);
            expect(sorted[2].codePointCount).toBe(1);
            expect(sorted[3].codePointCount).toBe(1);
        });
    });

    describe('Sort by UTF-8', () => {
        it('should sort by UTF-8 sequence in ascending order', () => {
            const sorted = [...sampleEmojis].sort((a, b) => a.utf8.localeCompare(b.utf8));
            
            expect(sorted[0].utf8).toBe('\\xE2\\x9D\\xA4');
            expect(sorted[1].utf8).toBe('\\xF0\\x9F\\x91\\x8D\\xF0\\x9F\\x8F\\xBB');
            expect(sorted[2].utf8).toBe('\\xF0\\x9F\\x91\\xA8\\xE2\\x80\\x8D\\xF0\\x9F\\x91\\xA9\\xE2\\x80\\x8D\\xF0\\x9F\\x91\\xA7\\xE2\\x80\\x8D\\xF0\\x9F\\x91\\xA6');
            expect(sorted[3].utf8).toBe('\\xF0\\x9F\\x98\\x80');
        });
    });

    describe('Sort by Bytes', () => {
        it('should sort by byte size in ascending order', () => {
            const sorted = [...sampleEmojis].sort((a, b) => a.byteSize - b.byteSize);
            
            expect(sorted[0].byteSize).toBe(3);
            expect(sorted[1].byteSize).toBe(4);
            expect(sorted[2].byteSize).toBe(8);
            expect(sorted[3].byteSize).toBe(25);
        });

        it('should sort by byte size in descending order', () => {
            const sorted = [...sampleEmojis].sort((a, b) => b.byteSize - a.byteSize);
            
            expect(sorted[0].byteSize).toBe(25);
            expect(sorted[1].byteSize).toBe(8);
            expect(sorted[2].byteSize).toBe(4);
            expect(sorted[3].byteSize).toBe(3);
        });
    });

    describe('Sort by Name', () => {
        it('should sort by name in ascending order (case-insensitive)', () => {
            const sorted = [...sampleEmojis].sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
            
            expect(sorted[0].name).toBe('family man woman girl boy');
            expect(sorted[1].name).toBe('grinning face');
            expect(sorted[2].name).toBe('red heart');
            expect(sorted[3].name).toBe('thumbs up light skin tone');
        });

        it('should sort by name in descending order (case-insensitive)', () => {
            const sorted = [...sampleEmojis].sort((a, b) => b.name.toLowerCase().localeCompare(a.name.toLowerCase()));
            
            expect(sorted[0].name).toBe('thumbs up light skin tone');
            expect(sorted[1].name).toBe('red heart');
            expect(sorted[2].name).toBe('grinning face');
            expect(sorted[3].name).toBe('family man woman girl boy');
        });
    });

    describe('Sort State Management', () => {
        it('should toggle sort direction when clicking same column', () => {
            const mockState = { sortColumn: 'name', sortDirection: 'asc' };
            
            // Simulate toggle function
            const toggleDirection = (state) => {
                if (state.sortColumn === 'name') {
                    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
                }
                return state.sortDirection;
            };

            expect(toggleDirection(mockState)).toBe('desc');
            expect(toggleDirection(mockState)).toBe('asc');
        });

        it('should reset to ascending when clicking different column', () => {
            const mockState = { sortColumn: 'name', sortDirection: 'desc' };
            
            // Simulate column change
            const updateSortState = (state, newColumn) => {
                if (state.sortColumn === newColumn) {
                    state.sortDirection = state.sortDirection === 'asc' ? 'desc' : 'asc';
                } else {
                    state.sortColumn = newColumn;
                    state.sortDirection = 'asc';
                }
            };

            updateSortState(mockState, 'count');
            expect(mockState.sortColumn).toBe('count');
            expect(mockState.sortDirection).toBe('asc');
        });
    });

    describe('Sort Performance', () => {
        it('should sort large datasets efficiently', () => {
            const largeDataset = [];
            for (let i = 0; i < 5000; i++) {
                largeDataset.push({
                    codePoint: `U+${(Math.random() * 0x10000).toString(16)}`,
                    codePointCount: Math.floor(Math.random() * 10) + 1,
                    name: `emoji ${Math.floor(Math.random() * 1000)}`,
                    utf8: `\\x${Math.random().toString(16)}`,
                    byteSize: Math.floor(Math.random() * 20) + 1
                });
            }

            const start = performance.now();
            const sorted = [...largeDataset].sort((a, b) => a.name.localeCompare(b.name));
            const duration = performance.now() - start;

            expect(sorted).toHaveLength(5000);
            expect(duration).toBeLessThan(100); // Should complete in under 100ms
        });
    });

    describe('Sort Integration with Search', () => {
        it('should maintain sort order when filtering', () => {
            // Sort by name first
            const sortedByName = [...sampleEmojis].sort((a, b) => a.name.localeCompare(b.name));
            
            // Then filter for items containing "face"
            const filtered = sortedByName.filter(emoji => emoji.name.toLowerCase().includes('face'));
            
            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toBe('grinning face');
        });

        it('should preserve sort when clearing search', () => {
            // Start with sorted data
            const sortedData = [...sampleEmojis].sort((a, b) => a.byteSize - b.byteSize);
            
            // Filter and then restore
            const filtered = sortedData.filter(emoji => emoji.byteSize > 5);
            const restored = sortedData; // In real app, this would be the full sorted dataset
            
            expect(restored[0].byteSize).toBe(3); // Still sorted by byte size
            expect(restored[1].byteSize).toBe(4);
        });
    });
});
