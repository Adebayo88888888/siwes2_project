import * as React from 'react';

export interface ToastProps {
  id?: string;
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

const TOAST_LIMIT = 5;

type ActionType =
  | { type: 'ADD_TOAST'; toast: ToastProps }
  | { type: 'DISMISS_TOAST'; toastId?: string };

interface State {
  toasts: ToastProps[];
}

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: ActionType) {
  switch (action.type) {
    case 'ADD_TOAST':
      memoryState = {
        ...memoryState,
        toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
      };
      break;
    case 'DISMISS_TOAST':
      memoryState = {
        ...memoryState,
        toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
      };
      break;
  }
  listeners.forEach((listener) => listener(memoryState));
}

export function toast(props: Omit<ToastProps, 'id'>) {
  const id = Math.random().toString(36).substring(2, 9);
  dispatch({ type: 'ADD_TOAST', toast: { ...props, id } });
  setTimeout(() => {
    dispatch({ type: 'DISMISS_TOAST', toastId: id });
  }, 4000);
}

export function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  };
}
