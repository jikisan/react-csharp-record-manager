# Loom Walkthrough Script — Record Manager (Scaled-Architecture branch)

Target length: ~6 minutes. This is the **companion** to the `main` branch. `main`
deliberately keeps the architecture small — two hooks, no store, no library. This
branch answers the obvious next question: *"okay, but can you do the heavyweight
version?"* Same app, same UI, same backend — rebuilt as MVI with a global store,
a reducer, a service layer, and interfaces. Still zero added packages.

Delivery notes: talk to the *decisions*. The point of this branch is not that it's
"better" — it's to show the patterns are a deliberate choice, and that I know what
they buy and what they cost.

---

## 1. Framing (30s)

> "Hi, I'm Kyle. Same record manager as the main branch — React front, C# .NET
> Minimal API back, in-memory state — but this is the scaled-up architecture.
> On main I argued that for six records, two hooks and no library is the right
> call, and I stand by that. This branch is the other half of that argument:
> here's the full MVI-with-a-store version, so you can see the judgment was a
> choice, not a limitation.
>
> Same three constraints still hold — no external packages, no database, derived
> values always accurate. Everything you're about to see is built from React
> primitives: `useReducer`, `useContext`, plain classes. No Redux, no Zustand."

---

## 2. Live demo — kept short (45s)

*Screen: two terminals + browser, both already running.*

> "The app behaves identically to main — that's the point, the architecture
> changed underneath, not the product."

- Point at list + summary bar.
> "Live summary — total, selected, status breakdown. Still derived, never stored
> — I'll show how that's enforced structurally in this version."

- Select a row, edit a field, note Save enabling; Save; refresh; reselect.
> "Select hydrates a controlled form, Save stays disabled until the draft is
> actually dirty, Save is a PUT and the UI syncs from the server's response. The
> edit survives a refresh — held in memory server-side. Same round trip as main."

---

## 3. The architecture: MVI with a real store (2.5 min)

*Screen: VS Code, `client/src/` tree.*

> "The organizing idea is MVI — Model, View, Intent — a strict unidirectional
> loop. Let me walk the layers bottom-up."

- **`services/RecordService.js` — the service layer + interfaces**
  > "JavaScript has no `interface` keyword, so I express the contract two ways:
  > an abstract base class whose methods throw until implemented, and JSDoc
  > typedefs that give the editor real type-checking with zero packages.
  > `RecordService` is the contract; `HttpRecordService` is the one concrete
  > implementation. Everything above this layer depends on the abstract type,
  > never on `fetch`. That's dependency inversion — and the service is *injected*
  > at the composition root, so a test can mount the whole app against a fake
  > with no network."

- **`store/state.js` — the Model**
  > "The single source of truth. Notice what's *not* here: no status counts, no
  > selected record, no dirty flag. Derived values are absent by design — state
  > holds only what can't be recomputed."

- **`store/actions.js` — the Intent vocabulary**
  > "Every state change is one of these plain, serializable actions, modeled as a
  > discriminated union in JSDoc so an unhandled or misshaped action is flagged
  > while I type. Components never build state; they emit intents."

- **`store/reducer.js` — the heart**
  > "A pure `(state, action) => state`. No I/O, no React, no async. Every branch
  > returns a new object — nothing mutated. This is the whole reason to adopt the
  > pattern: the state machine is inspectable and unit-testable with plain objects
  > in and out, no render, no mocks."

- **`store/selectors.js` — derivation**
  > "This is where 'derived output is always accurate' becomes structural. The
  > counts, the selected record, the dirty check are pure functions *of* state,
  > recomputed on demand — they physically can't drift, because they're never
  > stored."

- **`store/intents.js` — the async half**
  > "The reducer is pure, so anything asynchronous lives here: sequencing
  > started/succeeded/failed, calling the injected service. This is the seam a
  > library like redux-thunk would fill — and it's a dozen lines, because I built
  > exactly what the app needs and nothing more."

- **`store/StoreProvider.jsx` — the store itself**
  > "`useReducer` plus context — that's the whole store. Two details I'd point to:
  > state and intents live in *separate* contexts, so components that only fire
  > intents don't re-render when state changes — that's the manual version of the
  > selector subscriptions a store library gives you. And the service is injected
  > here as a prop, defaulting to HTTP."

- **`App.jsx` + `components/` — the View**
  > "App is a thin container: it reads slices through selectors and wires
  > callbacks to intents. The three components stay purely presentational — props
  > in, intents out, zero internal state."

> "So the data flow is a strict loop: View emits an Intent, the Intent runs
> effects and dispatches Actions, the reducer produces new Model, selectors derive
> from it, the View re-renders. One direction, one source of truth."

---

## 4. Backend decisions (45s)

*Screen: `server/Program.cs`.*

> "Backend is unchanged from main — same Minimal API, no NuGet beyond the
> template. Updates use a `with` expression, so I replace records rather than
> mutate them — the same immutability discipline the reducer enforces on the
> front end. The shared list is locked on reads and writes, because `List<T>`
> isn't safe under Kestrel's concurrent requests. And there's fail-fast
> validation: a save can't blank a required field, it returns a 400. I don't
> trust the client to enforce that even though the UI does."

---

## 5. The honest tradeoff (45s)

> "Here's the part I want to be straight about. Compared to main, this branch is
> more files and more indirection for the *same* six-record app. To emit one
> keystroke I now go through an action creator, a reducer branch, and a selector.
> For this size, that's ceremony — main's two hooks are genuinely the better call.
>
> What this branch buys you only pays off at scale: many entities sharing state,
> a reducer as the app grows more state transitions, the service seam when the
> backend gets real, the store when prop-drilling would otherwise hurt. The
> patterns are correct — they're just aimed at a bigger problem than this one.
> That's the whole point of having both branches: matching architecture to the
> problem is the actual skill, and you can only show judgment by showing you can
> build it either way and choose."

---

## 6. If this were production (30s)

> "For production this structure absorbs the obvious next steps cleanly: real
> persistence behind the `RecordService` interface — swap the implementation, the
> injection point already exists. Optimistic updates with rollback become two more
> actions on the save path. Optimistic-concurrency handling slots into the same
> save intent. And the test suite is easy precisely because of this shape: the
> reducer and selectors are pure functions, and the intents run against a fake
> service. The seams were the point."

---

## 7. Close (15s)

> "That's the scaled-architecture walkthrough — the deliberate counterpart to
> main's small version. Fully runnable with the .NET SDK and Node; the README
> covers it. Thanks for your time."

---

## Recording checklist

- [ ] Be explicit on camera that this is the `scaled-architecture` branch and
      main is the intentionally-small version — the contrast is the story
- [ ] Backend + frontend already running *before* you hit record
- [ ] Browser + editor zoomed so code and UI are legible on the share
- [ ] Notifications silenced, unrelated tabs closed
- [ ] 5s mic test; one throwaway warm-up take
- [ ] After: confirm the Loom link is shareable, not private
- [ ] Package runnable (exclude `node_modules`, `bin`, `obj`; README covers it)
- [ ] Email `sid@prosperitconsulting.com` with the Loom link + project
