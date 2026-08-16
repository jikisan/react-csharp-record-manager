import { createContext, useContext, useMemo, useReducer, useRef } from "react";
import { reducer } from "./reducer";
import { initialState } from "./state";
import { createIntents } from "./intents";
import { HttpRecordService } from "../services/RecordService";

// The global store, assembled from React primitives — no Redux, no Zustand.
//
// Two things worth calling out:
//
// 1. State and intents live in *separate* contexts. A library would hand you
//    selector-based subscriptions; here, splitting the contexts is the manual
//    equivalent — components that only fire intents (buttons) don't re-render
//    when state changes, because they read the intents context, which is stable.
//
// 2. The RecordService is injected as a prop (defaulting to HTTP). Tests or a
//    Storybook can mount the whole tree against a fake service without a network.

const StateContext = createContext(/** @type {any} */ (null));
const IntentsContext = createContext(/** @type {any} */ (null));

/**
 * @param {{ children: React.ReactNode, service?: import("../services/RecordService").RecordService }} props
 */
export function StoreProvider({ children, service }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Keep a ref to the latest state so async intents (save) can read current
  // values without being re-created on every render.
  const stateRef = useRef(state);
  stateRef.current = state;

  // Intents are built once and stay referentially stable for the app's life.
  const intents = useMemo(
    () => createIntents(dispatch, service ?? new HttpRecordService(), () => stateRef.current),
    [service]
  );

  return (
    <StateContext.Provider value={state}>
      <IntentsContext.Provider value={intents}>
        {children}
      </IntentsContext.Provider>
    </StateContext.Provider>
  );
}

/**
 * Read the whole state, or a derived slice via a selector.
 * @template T
 * @param {(s: import("./state").AppState) => T} [selector]
 * @returns {T}
 */
export function useAppState(selector) {
  const state = useContext(StateContext);
  if (state === null) throw new Error("useAppState must be used within StoreProvider");
  return selector ? selector(state) : state;
}

/**
 * Read the stable intents object.
 * @returns {import("./intents").Intents}
 */
export function useIntents() {
  const intents = useContext(IntentsContext);
  if (intents === null) throw new Error("useIntents must be used within StoreProvider");
  return intents;
}
