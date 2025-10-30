// parser.js - Unicode emoji file parsers

/**
 * Converts an array of hex code points to UTF-8 byte representation
 * @param {string[]} codePoints - Array of hex code point strings
 * @returns {Object} Object with utf8 string and byteSize number
 */
function codePointsToUTF8(codePoints) {
    try {
        const char = String.fromCodePoint(...codePoints.map(cp => parseInt(cp, 16)));
        const encoder = new TextEncoder();
        const bytes = encoder.encode(char);
        const utf8 = Array.from(bytes)
            .map(byte => '\\x' + byte.toString(16).toUpperCase().padStart(2, '0'))
            .join('');
        return {
            utf8: utf8,
            byteSize: bytes.length
        };
    } catch (error) {
        console.warn('Error converting code points to UTF-8:', codePoints, error);
        return {
            utf8: '',
            byteSize: 0
        };
    }
}

/**
 * Parse emoji-test.txt format
 * Example line: 1F600 ; fully-qualified # 😀 E1.0 grinning face
 *
 * @param {string} fileContent - Raw file content
 * @returns {Array} Array of emoji objects
 */
function parseEmojiTest(fileContent) {
    const emojis = [];
    const lines = fileContent.split('\n');

    for (const line of lines) {
        // Skip comments and empty lines
        if (!line.trim() || line.trim().startsWith('#')) {
            continue;
        }

        try {
            // Match pattern: CODE_POINTS ; status # EMOJI VERSION NAME
            const match = line.match(/^([0-9A-F ]+)\s*;\s*([^#]+)\s*#\s*(.+)$/i);
            if (!match) continue;

            const codePointsStr = match[1].trim();
            const commentPart = match[3].trim();

            // Extract code points
            const codePoints = codePointsStr.split(/\s+/);

            // Convert to character
            const character = String.fromCodePoint(...codePoints.map(cp => parseInt(cp, 16)));

            // Generate UTF-8 representation and byte size
            const { utf8, byteSize } = codePointsToUTF8(codePoints);

            // Extract name from comment (after version info like "E1.0")
            const nameMatch = commentPart.match(/[EV][\d.]+\s+(.+)$/);
            const name = nameMatch ? nameMatch[1].trim() : commentPart.split(/\s+/).slice(2).join(' ');

            // Create code point string (e.g., "U+1F600" or "U+1F468 U+200D")
            const codePoint = codePoints.map(cp => 'U+' + cp).join(' ');

            emojis.push({
                codePoint,
                codePointCount: codePoints.length,
                character,
                utf8,
                byteSize,
                name,
                source: 'emoji-test.txt'
            });
        } catch (error) {
            console.warn('Error parsing line:', line, error);
        }
    }

    console.log(`Parsed ${emojis.length} emojis from emoji-test.txt`);
    return emojis;
}

/**
 * Parse emoji-sequences.txt format
 * Example line: 1F441 FE0F 200D 1F5E8 FE0F ; RGI_Emoji_Sequence ; eye in speech bubble
 *
 * @param {string} fileContent - Raw file content
 * @returns {Array} Array of emoji objects
 */
function parseEmojiSequences(fileContent) {
    const emojis = [];
    const lines = fileContent.split('\n');

    for (const line of lines) {
        // Skip comments and empty lines
        if (!line.trim() || line.trim().startsWith('#')) {
            continue;
        }

        try {
            // Match pattern: CODE_POINTS ; TYPE ; NAME
            const match = line.match(/^([0-9A-F ]+)\s*;\s*([^;]+)\s*;\s*(.+)$/i);
            if (!match) continue;

            const codePointsStr = match[1].trim();
            const name = match[3].trim();

            // Extract code points
            const codePoints = codePointsStr.split(/\s+/);

            // Convert to character
            const character = String.fromCodePoint(...codePoints.map(cp => parseInt(cp, 16)));

            // Generate UTF-8 representation and byte size
            const { utf8, byteSize } = codePointsToUTF8(codePoints);

            // Create code point string
            const codePoint = codePoints.map(cp => 'U+' + cp).join(' ');

            emojis.push({
                codePoint,
                codePointCount: codePoints.length,
                character,
                utf8,
                byteSize,
                name,
                source: 'emoji-sequences.txt'
            });
        } catch (error) {
            console.warn('Error parsing line:', line, error);
        }
    }

    console.log(`Parsed ${emojis.length} emojis from emoji-sequences.txt`);
    return emojis;
}

/**
 * Parse emoji-zwj-sequences.txt format
 * Example line: 1F468 200D 1F373 ; RGI_Emoji_ZWJ_Sequence ; man cook
 *
 * @param {string} fileContent - Raw file content
 * @returns {Array} Array of emoji objects
 */
function parseEmojiZWJ(fileContent) {
    const emojis = [];
    const lines = fileContent.split('\n');

    for (const line of lines) {
        // Skip comments and empty lines
        if (!line.trim() || line.trim().startsWith('#')) {
            continue;
        }

        try {
            // Match pattern: CODE_POINTS ; TYPE ; NAME
            const match = line.match(/^([0-9A-F ]+)\s*;\s*([^;]+)\s*;\s*(.+)$/i);
            if (!match) continue;

            const codePointsStr = match[1].trim();
            const name = match[3].trim();

            // Extract code points (including ZWJ - Zero Width Joiner: 200D)
            const codePoints = codePointsStr.split(/\s+/);

            // Convert to character
            const character = String.fromCodePoint(...codePoints.map(cp => parseInt(cp, 16)));

            // Generate UTF-8 representation and byte size
            const { utf8, byteSize } = codePointsToUTF8(codePoints);

            // Create code point string
            const codePoint = codePoints.map(cp => 'U+' + cp).join(' ');

            emojis.push({
                codePoint,
                codePointCount: codePoints.length,
                character,
                utf8,
                byteSize,
                name,
                source: 'emoji-zwj-sequences.txt'
            });
        } catch (error) {
            console.warn('Error parsing line:', line, error);
        }
    }

    console.log(`Parsed ${emojis.length} emojis from emoji-zwj-sequences.txt`);
    return emojis;
}
