import { createContext, useContext, useMemo, useReducer, useRef } from "react";
import { reducer } from "./reducer";
import { initialState } from "./state";
import { createIntents } from "./intents";
import { HttpRecordService } from "../services/RecordService";

const StateContext = createContext(null);
const IntentsContext = createContext(null);

export function StoreProvider({ children, service }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const stateRef = useRef(state);
  stateRef.current = state;

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

export function useAppState(selector) {
  const state = useContext(StateContext);
  if (state === null) throw new Error("useAppState must be used within StoreProvider");
  return selector ? selector(state) : state;
}

export function useIntents() {
  const intents = useContext(IntentsContext);
  if (intents === null) throw new Error("useIntents must be used within StoreProvider");
  return intents;
}
