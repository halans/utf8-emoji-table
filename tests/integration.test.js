// integration.test.js - Integration tests for end-to-end workflows

describe('Integration: Parser to App Flow', () => {
    it('should parse and combine all three file types', () => {
        const testFileContent = '1F600 ; fully-qualified # 😀 E1.0 grinning face';
        const sequencesContent = '0023 FE0F 20E3 ; RGI_Emoji_Keycap_Sequence ; keycap: #';
        const zwjContent = '1F468 200D 1F373 ; RGI_Emoji_ZWJ_Sequence ; man cook';

        const testEmojis = parseEmojiTest(testFileContent);
        const sequencesEmojis = parseEmojiSequences(sequencesContent);
        const zwjEmojis = parseEmojiZWJ(zwjContent);

        const combined = [...testEmojis, ...sequencesEmojis, ...zwjEmojis];

        expect(combined).toHaveLength(3);
        expect(combined[0].source).toBe('emoji-test.txt');
        expect(combined[1].source).toBe('emoji-sequences.txt');
        expect(combined[2].source).toBe('emoji-zwj-sequences.txt');
    });

    it('should maintain data integrity through parse and filter', () => {
        const input = `1F600 ; fully-qualified # 😀 E1.0 grinning face
1F603 ; fully-qualified # 😃 E0.6 grinning face with big eyes
2764 FE0F ; fully-qualified # ❤️ E0.6 red heart`;

        const emojis = parseEmojiTest(input);
        const filtered = emojis.filter(e => e.name.toLowerCase().includes('grinning'));

        expect(emojis).toHaveLength(3);
        expect(filtered).toHaveLength(2);

        // Verify data structure is maintained
        filtered.forEach(emoji => {
            expect('codePoint' in emoji).toBeTruthy();
            expect('character' in emoji).toBeTruthy();
            expect('utf8' in emoji).toBeTruthy();
            expect('byteSize' in emoji).toBeTruthy();
            expect('name' in emoji).toBeTruthy();
            expect('source' in emoji).toBeTruthy();
        });
    });
});

describe('Integration: Search and Pagination', () => {
    const sampleData = [
        { codePoint: 'U+1F600', character: '😀', name: 'grinning face', utf8: '\\xF0\\x9F\\x98\\x80', byteSize: 4, source: 'test' },
        { codePoint: 'U+1F603', character: '😃', name: 'grinning face with big eyes', utf8: '\\xF0\\x9F\\x98\\x83', byteSize: 4, source: 'test' },
        { codePoint: 'U+2764', character: '❤️', name: 'red heart', utf8: '\\xE2\\x9D\\xA4', byteSize: 3, source: 'test' },
        { codePoint: 'U+1F494', character: '💔', name: 'broken heart', utf8: '\\xF0\\x9F\\x92\\x94', byteSize: 4, source: 'test' }
    ];

    it('should filter and paginate correctly', () => {
        // Filter
        const filtered = sampleData.filter(e => e.name.toLowerCase().includes('heart'));
        expect(filtered).toHaveLength(2);

        // Paginate
        const pageSize = 1;
        const page1 = filtered.slice(0, pageSize);
        const page2 = filtered.slice(pageSize, pageSize * 2);

        expect(page1).toHaveLength(1);
        expect(page2).toHaveLength(1);
        expect(page1[0].name).toBe('red heart');
        expect(page2[0].name).toBe('broken heart');
    });

    it('should reset pagination when search changes', () => {
        let currentPage = 3;
        let filteredEmojis = sampleData;

        // Simulate search change
        const newQuery = 'heart';
        filteredEmojis = sampleData.filter(e => e.name.toLowerCase().includes(newQuery));
        currentPage = 1; // Reset to first page

        expect(currentPage).toBe(1);
        expect(filteredEmojis).toHaveLength(2);
    });

    it('should handle empty search results', () => {
        const filtered = sampleData.filter(e => e.name.toLowerCase().includes('nonexistent'));
        const pageSize = 256;
        const totalPages = Math.ceil(filtered.length / pageSize);

        expect(filtered).toHaveLength(0);
        expect(totalPages).toBe(0);
    });
});

describe('Integration: Full Workflow Simulation', () => {
    it('should simulate complete user journey', () => {
        // Step 1: Parse data from files
        const file1 = `1F600 ; fully-qualified # 😀 E1.0 grinning face
1F603 ; fully-qualified # 😃 E0.6 grinning face with big eyes`;
        const file2 = '2764 FE0F ; fully-qualified # ❤️ E0.6 red heart';

        const emojis1 = parseEmojiTest(file1);
        const emojis2 = parseEmojiTest(file2);
        let allEmojis = [...emojis1, ...emojis2];

        expect(allEmojis).toHaveLength(3);

        // Step 2: Deduplicate
        const uniqueEmojis = [];
        const seen = new Set();
        for (const emoji of allEmojis) {
            if (!seen.has(emoji.codePoint)) {
                seen.add(emoji.codePoint);
                uniqueEmojis.push(emoji);
            }
        }
        allEmojis = uniqueEmojis;

        // Step 3: Initial display (first page)
        const pageSize = 2;
        let currentPage = 1;
        let filteredEmojis = allEmojis;

        let displayedEmojis = filteredEmojis.slice(0, pageSize);
        expect(displayedEmojis).toHaveLength(2);

        // Step 4: User searches for "heart"
        const searchQuery = 'heart';
        filteredEmojis = allEmojis.filter(e =>
            e.character.includes(searchQuery) ||
            e.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        currentPage = 1; // Reset to page 1

        expect(filteredEmojis).toHaveLength(1);
        expect(filteredEmojis[0].name).toBe('red heart');

        // Step 5: Display filtered results
        displayedEmojis = filteredEmojis.slice(0, pageSize);
        expect(displayedEmojis).toHaveLength(1);

        // Step 6: Clear search
        filteredEmojis = allEmojis;
        displayedEmojis = filteredEmojis.slice(0, pageSize);
        expect(displayedEmojis).toHaveLength(2);
    });

    it('should handle page size changes correctly', () => {
        const emojis = Array.from({ length: 1000 }, (_, i) => ({
            codePoint: `U+${i}`,
            character: '😀',
            name: `emoji ${i}`,
            utf8: '\\xF0\\x9F\\x98\\x80',
            byteSize: 4,
            source: 'test'
        }));

        // Start with page size 256
        let pageSize = 256;
        let currentPage = 2;
        let displayed = emojis.slice((currentPage - 1) * pageSize, currentPage * pageSize);
        expect(displayed).toHaveLength(256);
        expect(displayed[0].name).toBe('emoji 256');

        // Change to page size 512
        pageSize = 512;
        currentPage = 1; // Reset to page 1
        displayed = emojis.slice((currentPage - 1) * pageSize, currentPage * pageSize);
        expect(displayed).toHaveLength(512);
        expect(displayed[0].name).toBe('emoji 0');
    });
});

describe('Integration: Data Quality', () => {
    it('should maintain UTF-8 encoding consistency', () => {
        const input = '1F600 ; fully-qualified # 😀 E1.0 grinning face';
        const parsed = parseEmojiTest(input);

        expect(parsed[0].utf8).toContain('\\x');
        expect(parsed[0].utf8).toMatch(/^(\\x[0-9A-F]{2})+$/);

        // Verify it's the correct UTF-8 for 😀
        expect(parsed[0].utf8).toBe('\\xF0\\x9F\\x98\\x80');
    });

    it('should handle all required data fields', () => {
        const testInput = '1F600 ; fully-qualified # 😀 E1.0 grinning face';
        const seqInput = '0023 FE0F 20E3 ; RGI_Emoji_Keycap_Sequence ; keycap: #';
        const zwjInput = '1F468 200D 1F373 ; RGI_Emoji_ZWJ_Sequence ; man cook';

        const test = parseEmojiTest(testInput)[0];
        const seq = parseEmojiSequences(seqInput)[0];
        const zwj = parseEmojiZWJ(zwjInput)[0];

        const requiredFields = ['codePoint', 'character', 'utf8', 'byteSize', 'name', 'source'];

        [test, seq, zwj].forEach(emoji => {
            requiredFields.forEach(field => {
                expect(field in emoji).toBeTruthy();
                if (field !== 'byteSize') {
                    expect(emoji[field]).toBeTruthy();
                } else {
                    expect(typeof emoji[field]).toBe('number');
                    expect(emoji[field]).toBeGreaterThan(0);
                }
            });
        });
    });

    it('should preserve emoji rendering across operations', () => {
        const input = '1F600 ; fully-qualified # 😀 E1.0 grinning face\n2764 FE0F ; fully-qualified # ❤️ E0.6 red heart';
        const parsed = parseEmojiTest(input);

        // Filter operation
        const filtered = parsed.filter(e => e.name.includes('face'));
        expect(filtered[0].character).toBe('😀');

        // Slice operation (pagination)
        const page = parsed.slice(0, 1);
        expect(page[0].character).toBe('😀');

        // Map operation
        const characters = parsed.map(e => e.character);
        expect(characters).toContain('😀');
        expect(characters).toContain('❤️');
    });
});

describe('Integration: Performance Under Load', () => {
    it('should handle realistic dataset sizes efficiently', () => {
        // Simulate ~3000 emojis (typical dataset size)
        const largeInput = Array.from({ length: 3000 }, (_, i) =>
            `1F${(600 + i).toString(16).toUpperCase().padStart(3, '0')} ; fully-qualified # 😀 E1.0 emoji ${i}`
        ).join('\n');

        const start = performance.now();
        const parsed = parseEmojiTest(largeInput);
        const parseDuration = performance.now() - start;

        expect(parsed).toHaveLength(3000);
        expect(parseDuration).toBeLessThan(500); // Should parse in under 500ms

        // Test filtering performance
        const filterStart = performance.now();
        const filtered = parsed.filter(e => e.name.includes('500'));
        const filterDuration = performance.now() - filterStart;

        expect(filterDuration).toBeLessThan(50); // Should filter quickly

        // Test pagination performance
        const pageStart = performance.now();
        const page = parsed.slice(0, 256);
        const pageDuration = performance.now() - pageStart;

        expect(page).toHaveLength(256);
        expect(pageDuration).toBeLessThan(10);
    });

    it('should handle maximum page size efficiently', () => {
        const emojis = Array.from({ length: 5000 }, (_, i) => ({
            codePoint: `U+${i}`,
            character: '😀',
            name: `emoji ${i}`,
            utf8: '\\xF0\\x9F\\x98\\x80',
            byteSize: 4,
            source: 'test'
        }));

        const start = performance.now();
        const page = emojis.slice(0, 1024); // Max page size
        const duration = performance.now() - start;

        expect(page).toHaveLength(1024);
        expect(duration).toBeLessThan(20);
    });
});

describe('Integration: Edge Cases', () => {
    it('should handle emoji with multiple code points correctly', () => {
        const input = '1F468 200D 2764 FE0F 200D 1F468 ; fully-qualified # 👨‍❤️‍👨 E2.0 couple with heart: man, man';
        const parsed = parseEmojiTest(input);

        expect(parsed).toHaveLength(1);
        expect(parsed[0].codePoint.split(' ')).toHaveLength(6);
        expect(parsed[0].character).toBe('👨‍❤️‍👨');
    });

    it('should handle search with special characters', () => {
        const emojis = [
            { codePoint: 'U+1F600', character: '😀', name: 'face: grinning', utf8: '\\xF0\\x9F\\x98\\x80', byteSize: 4, source: 'test' },
            { codePoint: 'U+2764', character: '❤️', name: 'heart (red)', utf8: '\\xE2\\x9D\\xA4', byteSize: 3, source: 'test' }
        ];

        const filtered1 = emojis.filter(e => e.name.includes(':'));
        const filtered2 = emojis.filter(e => e.name.includes('('));

        expect(filtered1).toHaveLength(1);
        expect(filtered2).toHaveLength(1);
    });

    it('should maintain data consistency after multiple operations', () => {
        const input = Array.from({ length: 100 }, (_, i) =>
            `1F${(600 + i).toString(16).toUpperCase().padStart(3, '0')} ; fully-qualified # 😀 E1.0 emoji ${i}`
        ).join('\n');

        // Parse
        let emojis = parseEmojiTest(input);
        expect(emojis).toHaveLength(100);

        // Filter
        emojis = emojis.filter(e => parseInt(e.name.split(' ')[1]) % 2 === 0);
        expect(emojis).toHaveLength(50);

        // Paginate
        emojis = emojis.slice(0, 10);
        expect(emojis).toHaveLength(10);

        // Verify data integrity
        emojis.forEach(emoji => {
            expect('codePoint' in emoji).toBeTruthy();
            expect('character' in emoji).toBeTruthy();
            expect('utf8' in emoji).toBeTruthy();
            expect('byteSize' in emoji).toBeTruthy();
            expect('name' in emoji).toBeTruthy();
            expect(emoji.utf8).toMatch(/^\\x[0-9A-F]{2}/);
        });
    });
});
