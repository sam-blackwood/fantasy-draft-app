# Plan: Draft Admin UI

## Context

The `window.draftAdmin` console API works great on desktop but is inaccessible on mobile browsers. Building a simple in-page admin panel accessible via `?admin=true` URL param removes the need for console access entirely, making it usable from any device.

---

## New File: `AdminPanel.tsx`

**Path:** `frontend/src/components/AdminPanel.tsx`

### Props

```ts
interface AdminPanelProps {
  sendMessage: (msg: ClientMessage) => void;
}
```

Reads all required state directly from `useDraftStore`: `draftStatus`, `registeredUsers`, `connectedUsers`, `currentTurn`.

---

### Pre-draft UI (`draftStatus === 'idle'`)

**Pick order configurator:**
- List of registered users, each with ↑ / ↓ buttons to reorder
- Users not yet connected shown with muted styling (still includeable)
- Internal state: `orderedUsers` (starts as `registeredUsers` in join order)

**Settings:**
- Total Rounds — number input, default `6`
- Timer Duration (seconds) — number input, default `60`

**Action:**

Start Draft button → sends `start_draft` WebSocket message:

```ts
{ type: 'start_draft', pickOrder: orderedUsers.map(u => u.id), totalRounds, timerDuration }
```

---

### In-progress UI (`draftStatus === 'in_progress' | 'paused'`)

- **Pause / Resume** — single toggle button, label changes based on `draftStatus`
  - Pause → sends `{ type: 'pause_draft' }`
  - Resume → sends `{ type: 'resume_draft' }`
- **Autopick** — button → calls the same logic as `useDraftAdmin.autopick()`:
  - Looks up available players from `usePlayerStore`
  - Picks a random one for `currentTurn` user
  - Sends `{ type: 'make_pick', playerID: ... }`

> **Note:** `makePick` for specific users stays console-only for now — it's an edge case not worth adding UI complexity for.

---

### Panel Layout

Collapsible panel, toggled by a sticky ⚙ Admin button fixed to the bottom-right corner (works on mobile and desktop). When expanded, shows as a card overlaid above the draft room content. Styled to match existing Tailwind dark/light theme patterns from the codebase.

---

## Changes to Existing Files

### `DraftRoom.tsx`
- Read `isAdmin` from URL: `new URLSearchParams(window.location.search).get('admin') === 'true'`
- Pass `sendMessage` to `<AdminPanel>` (already available in this component)
- Render `{isAdmin && <AdminPanel sendMessage={sendMessage} />}` — no structural changes needed

### `useDraftAdmin.ts`
- Extract the autopick logic into a shared helper so `AdminPanel` can reuse it without duplicating the random selection code

---

## Critical Files

| File | Purpose |
|------|---------|
| `frontend/src/components/AdminPanel.tsx` | New file |
| `frontend/src/pages/DraftRoom.tsx` | Add `isAdmin` check + render `<AdminPanel>` |
| `frontend/src/hooks/useDraftAdmin.ts` | Extract autopick logic to reuse |
| `frontend/src/types/index.ts` | Reference for `ClientMessage` types (`StartDraftMessage`, `PauseDraftMessage`, `ResumeDraftMessage`, `MakePickMessage`) |
| `frontend/src/store/draftStore.ts` | Reference for state shape |

---

## Verification

- [ ] Run local dev server
- [ ] Navigate to `/draft?admin=true` after joining
- [ ] Pre-draft: verify user list renders, reordering works, Start Draft fires correctly
- [ ] In-progress: verify Pause/Resume toggles state for all connected clients
- [ ] In-progress: verify Autopick makes a valid pick for the current user
- [ ] Navigate to `/draft` (no param) — confirm admin panel is not visible
