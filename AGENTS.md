# AGENTS.md — Vucius.github.io

This document provides developer guidelines, architectural details, and API integration specifications for AI coding agents modifying or extending the **Vucius.github.io** Jekyll blog repository.

---

## Project Role & Context

This repository represents the frontend client for the personal blog and web services of Peter Vucius. 
Its most complex component is the **Gomoku AI Play Page** (`/gomoku/`), which acts as the frontend client for the backend deep-learning inference service defined in the sibling workspace **`Colosseum/Vuk_Services`**.

---

## Repository Layout

```text
Vucius.github.io/
├── _config.yml              # Jekyll configuration (defines title, plugins, exclusions)
├── Gemfile                  # Ruby dependencies listing
├── about.markdown           # profile / bio page (contains personal metadata & technical history)
├── gomoku.html              # Core Gomoku AI game client (HTML, CSS, JS, sound engine)
├── index.markdown           # Homepage entrance
├── _includes/               # Shared page parts
│   ├── header.html          # Global header navigation & theme toggling menu
│   ├── footer.html          # Global footer
│   └── theme-toggle.html    # Theme switch UI and local storage preference controller
├── _layouts/                # Templates
│   ├── default.html         # Wraps layouts; runs dark mode scripts to prevent FOUC (flash of unstyled content)
│   ├── home.html            # Main site home
│   └── post.html            # Main site blog post layout
├── _posts/                  # Markdown posts
└── assets/                  # Frontend assets
    ├── css/
    │   ├── tailwind.css     # Style classes compiled via Tailwind
    │   └── remix.css        # Icon sets
    └── js/
```

---

## Gomoku Client-Side Architecture

The file [gomoku.html](file:///C:/AAAAAAAAAAA_temp/desktop/Hephaestus_Repository/Docs_Repositories/Blog/Vucius.github.io/gomoku.html) encapsulates all logic for the Gomoku frontend:

### 1. Game State (`gameState`)
Stores runtime configurations, matching stats, and current board representations:
- `board`: 1D array of size 225 ($15 \times 15$). Value `0` is empty, `1` is Black stone, `-1` is White stone.
- `history`: List of indices representing move order.
- `confidences`: Maps a move index to the confidence percentage returned by the AI.
- `theme`: Current visual skin (`'wood'` or `'cyber'`).
- `apiUrl`: Base URL for model server predictions (defaults to `http://localhost:3000`).

### 2. Audio Engine (`SoundEngine`)
Uses the browser's **Web Audio API** to dynamically synthesize realistic board game sound effects (no external `.mp3`/`.wav` assets required):
- `playClick(isBlack)`: Simulates wood/stone collision using lower-frequency sine waves combined with higher-frequency triangle transients.
- `playWin()` / `playLose()`: Synthesizes musical arpeggios (C major for wins, descending minor chords for losses).
- `playError()`: A short, disharmonious buzz for illegal moves.

### 3. Rule Engine
Check-win scenarios are evaluated client-side in `checkWinner(playerVal)` by scanning the board in four directions (horizontal, vertical, diagonal-up, diagonal-down) for a contiguous sequence of five stones.

---

## API Contract (Gomoku Backend)

When a move prediction is required (either on the AI's turn or when the user requests a hint), the frontend issues an asynchronous HTTP POST request:

### Request Format
- **URL**: `${gameState.apiUrl}/api/gomoku/move`
- **Method**: `POST`
- **Headers**: `Content-Type: application/json`
- **Payload**:
```json
{
  "board": [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    // ... 15 lines of 15 integer elements. 
    // 0: empty, 1: Black, -1: White
    [0, 0, 0, 0, 0, 0, 0, 1, -1, 0, 0, 0, 0, 0, 0]
  ],
  "player": -1,
  "step": 3
}
```
*Note: `player` is `1` if requesting a move for Black (usually the human) or `-1` if requesting for White (usually the AI).*

### Response Format
The backend replies with a unified response envelope:
```json
{
  "code": 200,
  "success": true,
  "data": {
    "row": 7,
    "col": 7,
    "confidence": 0.942
  }
}
```

---

## Engineering Rules for AI Agents

1. **Persistent Settings**:
   The following configuration entries must remain synchronized with `localStorage`:
   - `gomoku_api_url` — Target model server endpoint.
   - `gomoku_theme` — Theme preferences (`'wood'` or `'cyber'`).
   - `gomoku_stats` — Wins/Losses/Draws cache object `{win, lose, draw}`.

2. **Tailwind CSS & Dark Mode**:
   - Layouts are built with custom compiled Tailwind CSS. When adding classes, ensure dark mode styling is explicitly specified using the `dark:` selector prefix.
   - Do not break the theme initialization script in the `<head>` section of `_layouts/default.html` which sets the `.dark` class to avoid flashes of light theme during loads.

3. **CORS and Connection Handling**:
   - Always catch connection errors gracefully when calling `fetch`.
   - Provide visual feedback for connection quality using `testBackendConnection()`, updating the `#conn-status-badge` indicator on the board panel.
   - If an API request fails, use `sound.playError()` and display a detailed warning alert guiding the user to start `Vuk_Services`.

4. **Coordinates and Logs**:
   - Board positions are converted to Go/Gomoku coordinate standards in `getCoordinateString(index)`. The top-left corner corresponds to `A15` and the bottom-right corner to `O1`.
   - Ensure the logs container auto-scrolls down when adding new log nodes (`container.scrollTop = container.scrollHeight`).
