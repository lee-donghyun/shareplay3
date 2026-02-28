import { useState } from "react";

export const make = <
  State extends string | number | symbol,
  Actions extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key in string | number | symbol]: (...payload: any[]) => State;
  }
>(machine: {
  initial: State;
  states: {
    [s in State]: (keyof Actions)[];
  };
}) => {
  const useMachine = (actions: Actions) => {
    const [state, setState] = useState(machine.initial);

    const dispatch = <ActionKey extends keyof Actions>(
      actionKey: ActionKey,
      ...payload: Parameters<Actions[ActionKey]>
    ) => {
      if (!machine.states[state].includes(actionKey)) {
        if (import.meta.env.DEV) {
          throw new Error(
            `Action ${actionKey as string} is not defined for state ${
              state as string
            }`
          );
        }
        return;
      }
      const action = actions[actionKey];
      const nextState = action(...payload);
      setState(nextState);
    };

    return { state, dispatch };
  };
  return useMachine;
};
