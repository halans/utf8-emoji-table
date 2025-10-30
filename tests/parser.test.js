// parser.test.js - Tests for Unicode emoji parsers

describe('Parser: codePointsToUTF8', () => {
    it('should convert single code point to UTF-8 and return byte size', () => {
        const result = codePointsToUTF8(['1F600']);
        expect(result.utf8).toBe('\\xF0\\x9F\\x98\\x80');
        expect(result.byteSize).toBe(4);
    });

    it('should convert multiple code points to UTF-8', () => {
        const result = codePointsToUTF8(['1F468', '200D', '1F373']);
        expect(result.utf8).toMatch(/^\\x/);
        expect(result.utf8).toContain('\\x');
        expect(result.byteSize).toBeGreaterThan(4);
    });

    it('should handle basic ASCII characters', () => {
        const result = codePointsToUTF8(['0041']); // 'A'
        expect(result.utf8).toBe('\\x41');
        expect(result.byteSize).toBe(1);
    });

    it('should handle invalid code points gracefully', () => {
        const result = codePointsToUTF8(['INVALID']);
        expect(result.utf8).toBe('');
        expect(result.byteSize).toBe(0);
    });
});

describe('Parser: parseEmojiTest', () => {
    it('should parse valid emoji-test.txt line', () => {
        const input = '1F600 ; fully-qualified # 😀 E1.0 grinning face';
        const result = parseEmojiTest(input);

        expect(result).toHaveLength(1);
        expect(result[0].codePoint).toBe('U+1F600');
        expect(result[0].codePointCount).toBe(1);
        expect(result[0].character).toBe('😀');
        expect(result[0].name).toBe('grinning face');
        expect(result[0].source).toBe('emoji-test.txt');
        expect(result[0].utf8).toContain('\\x');
        expect(result[0].byteSize).toBe(4);
    });

    it('should skip comment lines', () => {
        const input = `# This is a comment
1F600 ; fully-qualified # 😀 E1.0 grinning face
# Another comment`;
        const result = parseEmojiTest(input);

        expect(result).toHaveLength(1);
    });

    it('should skip empty lines', () => {
        const input = `
1F600 ; fully-qualified # 😀 E1.0 grinning face

1F603 ; fully-qualified # 😃 E0.6 grinning face with big eyes
`;
        const result = parseEmojiTest(input);

        expect(result).toHaveLength(2);
    });

    it('should handle multi-codepoint emojis', () => {
        const input = '1F468 200D 2764 FE0F 200D 1F468 ; fully-qualified # 👨‍❤️‍👨 E2.0 couple with heart: man, man';
        const result = parseEmojiTest(input);

        expect(result).toHaveLength(1);
        expect(result[0].codePoint).toContain('U+1F468');
        expect(result[0].codePoint).toContain('U+200D');
    });

    it('should handle malformed lines gracefully', () => {
        const input = `1F600 ; fully-qualified # 😀 E1.0 grinning face
INVALID LINE
1F603 ; fully-qualified # 😃 E0.6 grinning face with big eyes`;
        const result = parseEmojiTest(input);

        expect(result).toHaveLength(2);
    });

    it('should extract emoji name correctly', () => {
        const input = '1F923 ; fully-qualified # 🤣 E3.0 rolling on the floor laughing';
        const result = parseEmojiTest(input);

        expect(result[0].name).toBe('rolling on the floor laughing');
    });

    it('should handle empty input', () => {
        const result = parseEmojiTest('');
        expect(result).toHaveLength(0);
    });

    it('should parse real emoji data correctly', () => {
        const input = `# group: Smileys & Emotion

# subgroup: face-smiling
1F600 ; fully-qualified # 😀 E1.0 grinning face
1F603 ; fully-qualified # 😃 E0.6 grinning face with big eyes
1F604 ; fully-qualified # 😄 E0.6 grinning face with smiling eyes`;

        const result = parseEmojiTest(input);

        expect(result).toHaveLength(3);
        expect(result[0].character).toBe('😀');
        expect(result[1].character).toBe('😃');
        expect(result[2].character).toBe('😄');
    });
});

describe('Parser: Code Point Count', () => {
    it('should calculate correct code point count for single code point emojis', () => {
        const input = '1F600 ; fully-qualified # 😀 E1.0 grinning face';
        const result = parseEmojiTest(input);

        expect(result).toHaveLength(1);
        expect(result[0].codePointCount).toBe(1);
    });

    it('should calculate correct code point count for multi-code point emojis', () => {
        const input = '1F44D 1F3FB ; fully-qualified # 👍🏻 E1.0 thumbs up: light skin tone';
        const result = parseEmojiTest(input);

        expect(result).toHaveLength(1);
        expect(result[0].codePointCount).toBe(2);
    });

    it('should calculate correct code point count for ZWJ sequences', () => {
        const input = '1F468 200D 1F373 ; RGI_Emoji_ZWJ_Sequence ; man cook';
        const result = parseEmojiZWJ(input);

        expect(result).toHaveLength(1);
        expect(result[0].codePointCount).toBe(3);
    });

    it('should calculate correct code point count for complex ZWJ sequences', () => {
        const input = '1F468 200D 1F469 200D 1F467 200D 1F466 ; RGI_Emoji_ZWJ_Sequence ; family: man, woman, girl, boy';
        const result = parseEmojiZWJ(input);

        expect(result).toHaveLength(1);
        expect(result[0].codePointCount).toBe(7);
    });

    it('should calculate correct code point count for emoji sequences', () => {
        const input = '0023 FE0F 20E3 ; RGI_Emoji_Keycap_Sequence ; keycap: #';
        const result = parseEmojiSequences(input);

        expect(result).toHaveLength(1);
        expect(result[0].codePointCount).toBe(3);
    });
});

describe('Parser: parseEmojiSequences', () => {
    it('should parse valid emoji-sequences.txt line', () => {
        const input = '0023 FE0F 20E3 ; RGI_Emoji_Keycap_Sequence ; keycap: #';
        const result = parseEmojiSequences(input);

        expect(result).toHaveLength(1);
        expect(result[0].codePoint).toContain('U+0023');
        expect(result[0].name).toBe('keycap: #');
        expect(result[0].source).toBe('emoji-sequences.txt');
    });

    it('should handle multi-codepoint sequences', () => {
        const input = '1F441 FE0F 200D 1F5E8 FE0F ; RGI_Emoji_Sequence ; eye in speech bubble';
        const result = parseEmojiSequences(input);

        expect(result).toHaveLength(1);
        expect(result[0].codePoint).toContain('U+1F441');
        expect(result[0].codePoint).toContain('U+200D');
        expect(result[0].name).toBe('eye in speech bubble');
    });

    it('should skip comments and empty lines', () => {
        const input = `# Comment line

0023 FE0F 20E3 ; RGI_Emoji_Keycap_Sequence ; keycap: #
# Another comment
002A FE0F 20E3 ; RGI_Emoji_Keycap_Sequence ; keycap: *`;

        const result = parseEmojiSequences(input);
        expect(result).toHaveLength(2);
    });

    it('should handle empty input', () => {
        const result = parseEmojiSequences('');
        expect(result).toHaveLength(0);
    });
});

describe('Parser: parseEmojiZWJ', () => {
    it('should parse valid emoji-zwj-sequences.txt line', () => {
        const input = '1F468 200D 1F373 ; RGI_Emoji_ZWJ_Sequence ; man cook';
        const result = parseEmojiZWJ(input);

        expect(result).toHaveLength(1);
        expect(result[0].codePoint).toContain('U+1F468');
        expect(result[0].codePoint).toContain('U+200D');
        expect(result[0].name).toBe('man cook');
        expect(result[0].source).toBe('emoji-zwj-sequences.txt');
    });

    it('should handle complex ZWJ sequences', () => {
        const input = '1F468 200D 1F469 200D 1F467 200D 1F466 ; RGI_Emoji_ZWJ_Sequence ; family: man, woman, girl, boy';
        const result = parseEmojiZWJ(input);

        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('family: man, woman, girl, boy');
        // Should have multiple U+ entries
        const codePointParts = result[0].codePoint.split(' ');
        expect(codePointParts.length).toBeGreaterThan(3);
    });

    it('should skip comments and empty lines', () => {
        const input = `# ZWJ Sequences

1F468 200D 1F373 ; RGI_Emoji_ZWJ_Sequence ; man cook

# Another section
1F469 200D 1F373 ; RGI_Emoji_ZWJ_Sequence ; woman cook`;

        const result = parseEmojiZWJ(input);
        expect(result).toHaveLength(2);
    });

    it('should handle empty input', () => {
        const result = parseEmojiZWJ('');
        expect(result).toHaveLength(0);
    });

    it('should correctly render ZWJ emojis', () => {
        const input = '1F468 200D 1F373 ; RGI_Emoji_ZWJ_Sequence ; man cook';
        const result = parseEmojiZWJ(input);

        expect(result[0].character).toBe('👨‍🍳');
    });
});

describe('Parser: Edge Cases', () => {
    it('should handle very long input efficiently', () => {
        const lines = [];
        for (let i = 0; i < 1000; i++) {
            lines.push('1F600 ; fully-qualified # 😀 E1.0 grinning face');
        }
        const input = lines.join('\n');

        const start = performance.now();
        const result = parseEmojiTest(input);
        const duration = performance.now() - start;

        expect(result).toHaveLength(1000);
        expect(duration).toBeLessThan(1000); // Should complete in under 1 second
    });

    it('should handle Unicode variation selectors', () => {
        const input = '2764 FE0F ; fully-qualified # ❤️ E0.6 red heart';
        const result = parseEmojiTest(input);

        expect(result).toHaveLength(1);
        expect(result[0].codePoint).toContain('U+2764');
        expect(result[0].codePoint).toContain('U+FE0F');
    });

    it('should handle skin tone modifiers', () => {
        const input = '1F44B 1F3FB ; fully-qualified # 👋🏻 E1.0 waving hand: light skin tone';
        const result = parseEmojiTest(input);

        expect(result).toHaveLength(1);
        expect(result[0].codePoint).toContain('U+1F44B');
        expect(result[0].codePoint).toContain('U+1F3FB');
    });
});
