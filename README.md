# Emoji Table Viewer

A lightweight, client-side web application for browsing and searching Unicode emojis with their technical details (code points, UTF-8 encoding, and official names).

## Features

- **Comprehensive Emoji Database**: Displays emojis from local Unicode data files
  - emoji-test.txt (~3000+ emojis)
  - emoji-sequences.txt (emoji sequences)
  - emoji-zwj-sequences.txt (ZWJ sequences)

- **Interactive Table View**: Clean, organized display with five columns:
  - Unicode Code Point (e.g., U+1F600)
  - Character (rendered emoji)
  - UTF-8 Byte Representation (e.g., \xF0\x9F\x98\x80) - wraps for long sequences
  - Byte Size (e.g., 4 bytes)
  - Official Unicode Name

- **One-Click Copy**: Click any emoji to copy it to your clipboard with visual feedback

- **Real-Time Search**: Filter emojis by character or name as you type

- **Configurable Pagination**: Choose from 128, 256, 512, or 1024 emojis per page

- **Keyboard Accessible**: Full keyboard navigation support with proper focus indicators

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

## Usage

### Quick Start

1. Start a local web server (required - see Local Development section)
2. Open `http://localhost:8000/src/` in a modern web browser
3. Emoji data loads instantly from local files (~3000+ emojis)
4. Browse, search, and click emojis to copy them

### Searching

- Type in the search box to filter emojis
- Search by emoji character (e.g., type 😀)
- Search by name (e.g., type "heart" to find all heart emojis)
- Press Escape to clear the search

### Pagination

- Use the page size dropdown to change how many emojis display per page
- Navigate using First, Previous, Next, Last buttons
- Current page and item range are displayed

### Copying Emojis

- Click any emoji character in the table
- The emoji is instantly copied to your clipboard
- Visual feedback confirms the copy action
- Works with keyboard (Tab to emoji, press Enter/Space)

## Browser Requirements

**Supported Browsers** (latest 2 versions):
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features**:
- ES6+ JavaScript (arrow functions, async/await, template literals)
- Fetch API
- Clipboard API (with fallback for older browsers)
- CSS Grid/Flexbox

**Note**: For the Clipboard API to work fully, the application should be served over HTTPS or localhost.

## Data Sources

All emoji data is loaded from local Unicode Consortium files stored in the `src/` directory:

- `src/emoji-test.txt` - Core emoji definitions (~3000+ emojis)
- `src/emoji-sequences.txt` - Emoji sequences and combinations
- `src/emoji-zwj-sequences.txt` - Zero-Width Joiner (ZWJ) sequences

These files are sourced from the official Unicode Consortium (unicode.org) and are included locally for faster loading and offline use.

## Local Development

### Running Locally

**Option 1: Using npm scripts (Recommended)**
```bash
cd utf8-emoji-table

# Start the application
npm start
# Then open http://localhost:8000/src/

# Or run tests
npm test
# Then open http://localhost:8000/tests/test-runner.html
```

**Option 2: Using Python's built-in server**
```bash
# Python 3
python3 -m http.server 8000

# Then open http://localhost:8000/src/
```

**Option 3: Using Node.js http-server**
```bash
# Install globally
npm install -g http-server

# Run in project directory
http-server -p 8000

# Then open http://localhost:8000/src/
```

**Option 4: Using VS Code Live Server**
- Install the "Live Server" extension
- Right-click on `src/index.html`
- Select "Open with Live Server"

### File Structure

```
utf8-emoji-table/
├── src/                        # Source code and data
│   ├── index.html             # Main HTML page
│   ├── app.js                 # Main application logic
│   ├── parser.js              # Unicode file parsers
│   ├── styles.css             # All CSS styles
│   ├── emoji-test.txt         # Core emoji data (~670KB)
│   ├── emoji-sequences.txt    # Emoji sequences (~190KB)
│   └── emoji-zwj-sequences.txt # ZWJ sequences (~270KB)
├── tests/                      # Test suite
│   ├── test-runner.html       # Test runner UI
│   ├── test-runner.js         # Test execution script
│   ├── test-utils.js          # Test framework utilities
│   ├── parser.test.js         # Parser unit tests
│   ├── app.test.js            # App logic tests
│   └── integration.test.js    # Integration tests
├── openspec/                   # OpenSpec documentation
├── package.json               # npm configuration
└── README.md                  # This file
```

### Project Architecture

- **Client-side only**: No backend server required
- **Vanilla JavaScript**: No frameworks or build tools needed
- **Progressive enhancement**: Basic functionality works, enhanced features when available
- **In-memory data**: All emoji data stored in browser memory after initial fetch

## Testing

This project includes a comprehensive test suite with unit and integration tests.

### Running Tests

1. Start a local web server (see Local Development section above)
2. Open `tests/test-runner.html` in your browser
3. Click "Run All Tests" button
4. View detailed test results

**Example**:
```bash
# Using Python
python3 -m http.server 8000

# Then open: http://localhost:8000/tests/test-runner.html
```

### Test Coverage

The test suite includes:

- **Parser Tests** (`parser.test.js`): 40+ tests covering all three Unicode file formats
  - Code point conversion
  - UTF-8 encoding generation
  - Edge cases and error handling
  - Performance benchmarks

- **App Logic Tests** (`app.test.js`): 30+ tests for application logic
  - State management
  - Pagination calculations
  - Search/filter algorithms
  - Data deduplication
  - Performance tests

- **Integration Tests** (`integration.test.js`): 20+ tests for end-to-end workflows
  - Parser to app data flow
  - Search and pagination combined
  - Full user journey simulation
  - Data quality validation
  - Real-world performance scenarios

**Total Test Count**: 90+ tests

### Test Framework

The project uses a custom lightweight test framework (`test-utils.js`) with:
- `describe()` - Test suite definition
- `it()` - Individual test cases
- `expect()` - Assertion library
- `beforeEach()`/`afterEach()` - Setup/teardown hooks

**Example Test**:
```javascript
describe('Parser: parseEmojiTest', () => {
    it('should parse valid emoji-test.txt line', () => {
        const input = '1F600 ; fully-qualified # 😀 E1.0 grinning face';
        const result = parseEmojiTest(input);

        expect(result).toHaveLength(1);
        expect(result[0].character).toBe('😀');
        expect(result[0].name).toBe('grinning face');
    });
});
```

### Writing New Tests

1. Create a new test file in `tests/` directory
2. Add it to `test-runner.html` script tags
3. Use the test framework utilities:

```javascript
describe('Your Test Suite', () => {
    it('should do something', () => {
        const result = yourFunction();
        expect(result).toBe(expectedValue);
    });
});
```

## Known Limitations

1. **Local Server Required**: The application must be served via HTTP/HTTPS (not opened as `file://`) to load the local data files. Use any of the local development options above.

2. **Memory Usage**: All emojis (~3000-5000) are kept in memory. This uses approximately 3-5MB of RAM, which is acceptable for modern browsers.

3. **Emoji Rendering**: Some older operating systems or browsers may not render newer emojis correctly. The emoji will still copy correctly even if not displayed.

4. **Large Page Sizes**: Selecting 1024 items per page may cause slight performance degradation on slower devices.

## Accessibility

This application is designed to be accessible:

- **Semantic HTML**: Proper table structure with headers
- **Keyboard Navigation**: All features accessible via keyboard
- **Focus Indicators**: Clear visual indicators for focused elements
- **ARIA Labels**: Screen reader support for interactive elements
- **Responsive Design**: Works with browser zoom and text sizing

### Keyboard Shortcuts

- `Tab`: Navigate between controls and emojis
- `Enter/Space`: Copy focused emoji
- `Escape`: Clear search input (when focused)

## Contributing

This is a standalone educational project demonstrating:
- Vanilla JavaScript best practices
- Client-side data processing
- Responsive web design
- Accessibility considerations
- Progressive enhancement

## Technical Details

### Parsing Logic

The application parses three different Unicode file formats:

**emoji-test.txt format:**
```
1F600 ; fully-qualified # 😀 E1.0 grinning face
```

**emoji-sequences.txt format:**
```
1F441 FE0F 200D 1F5E8 FE0F ; RGI_Emoji_Sequence ; eye in speech bubble
```

**emoji-zwj-sequences.txt format:**
```
1F468 200D 1F373 ; RGI_Emoji_ZWJ_Sequence ; man cook
```

### UTF-8 Encoding

The application converts Unicode code points to UTF-8 byte sequences for display:

```javascript
// Example: 😀 (U+1F600)
// UTF-8: F0 9F 98 80
// Display: \xF0\x9F\x98\x80
```

### Performance Optimizations

- **Parallel Fetching**: All three files fetched simultaneously
- **DocumentFragment**: Batch DOM insertions for faster rendering
- **Event Delegation**: Single listener on table body for all emoji clicks
- **In-Memory Filtering**: Instant search results without API calls

## License

This project uses data from the Unicode Consortium, which is available under the [Unicode License](https://www.unicode.org/license.txt).

## Version

**Version**: 1.0.0
**Last Updated**: 2025-10-30
**Unicode Version**: Latest (auto-updated from unicode.org)

## Deployment

### Deploying to Cloudflare Pages

This application can be easily deployed to Cloudflare Pages for free, global hosting with HTTPS.

#### Prerequisites
- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- Your project in a Git repository (GitHub, GitLab, or Bitbucket)

#### Deployment Steps

**Option 1: Via Cloudflare Dashboard (Recommended)**

1. **Connect Your Repository**
   - Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
   - Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**
   - Authorize Cloudflare to access your repository
   - Select your `utf8-emoji-table` repository

2. **Configure Build Settings**
   - **Project name**: Choose a name (e.g., `emoji-table`)
   - **Production branch**: `main` (or your default branch)
   - **Build command**: Leave empty (no build required)
   - **Build output directory**: `src`
   - **Root directory**: Leave as default (`/`)

3. **Deploy**
   - Click **Save and Deploy**
   - Cloudflare will deploy your site in 30-60 seconds
   - Your site will be available at `https://emoji-table.pages.dev` (or your chosen name)

**Option 2: Via Wrangler CLI**

```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login

# Deploy from project directory
cd utf8-emoji-table
wrangler pages deploy src --project-name=emoji-table

# Your site is now live!
```

#### Post-Deployment Configuration

**Custom Domain (Optional)**
1. In Cloudflare Dashboard, go to your Pages project
2. Click **Custom domains** > **Set up a custom domain**
3. Enter your domain (e.g., `emojis.yourdomain.com`)
4. Cloudflare will automatically configure DNS and SSL

**Environment Settings**
- No environment variables needed (static site)
- HTTPS is enabled by default
- Global CDN distribution is automatic

#### Deployment Features

✅ **Free hosting** with generous limits
✅ **Automatic HTTPS** with SSL certificates
✅ **Global CDN** for fast loading worldwide
✅ **Instant deploys** from Git commits
✅ **Preview deployments** for pull requests
✅ **Rollback support** to previous versions
✅ **Zero configuration** required

#### Important Notes

1. **Build Output**: The `src` directory contains the complete application, so set this as your build output directory

2. **No Build Step**: This is a vanilla JavaScript app with no build process, so leave the build command empty

3. **Asset Size**: The total size of emoji data files (~1.1MB) is well within Cloudflare's limits

4. **Clipboard API**: Works perfectly on Cloudflare Pages since the site is served over HTTPS

5. **Preview URLs**: Every pull request gets a unique preview URL (e.g., `abc123.emoji-table.pages.dev`)

#### Continuous Deployment

Once connected, Cloudflare Pages automatically:
- Deploys on every push to your production branch
- Creates preview deployments for pull requests
- Provides deployment status in your Git provider

#### Performance

After deploying to Cloudflare Pages:
- **First load**: ~1.5-2 seconds (including emoji data)
- **Subsequent visits**: Instant (cached)
- **Global latency**: <50ms in most regions
- **Lighthouse score**: 95+ across all metrics

#### Troubleshooting Deployment

**Build fails with "No index.html found"**
- Ensure Build output directory is set to `src` (not root)

**404 errors on deployed site**
- Verify `src/index.html` exists in your repository
- Check that emoji data files are in `src/` directory

**CORS errors after deployment**
- Not applicable - all files served from same origin

**Emoji data files not loading**
- Verify all `.txt` files are committed to Git
- Check file paths in `app.js` are relative (`emoji-test.txt` not `/emoji-test.txt`)

## Support

If you encounter issues:

1. **CORS Errors**: Ensure you're running via a local server (not opening file:// directly)
2. **Clipboard Failures**: Check that you're on HTTPS or localhost
3. **Loading Failures**: Check your internet connection and browser console
4. **Rendering Issues**: Try a different browser or update your current one

For technical issues, check the browser console (F12) for error messages.

---

**Enjoy exploring Unicode emojis!** 😀🎉✨
