'use client';

import * as React from 'react';
import { toast as sonnerToast, type ToastT } from 'sonner';

// Define the types that were previously imported from sonner
type ToastActionElement = React.ReactNode;

interface ToastProps {
  variant?: 'default' | 'destructive' | 'success' | 'warning' | 'info';
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  duration?: number;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
};

const actionTypes = {
  ADD_TOAST: 'ADD_TOAST',
  UPDATE_TOAST: 'UPDATE_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  REMOVE_TOAST: 'REMOVE_TOAST',
} as const;

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type ActionType = typeof actionTypes;

type Action =
  | {
      type: ActionType['ADD_TOAST'];
      toast: ToasterToast;
    }
  | {
      type: ActionType['UPDATE_TOAST'];
      toast: Partial<ToasterToast>;
    }
  | {
      type: ActionType['DISMISS_TOAST'];
      toastId?: ToasterToast['id'];
    }
  | {
      type: ActionType['REMOVE_TOAST'];
      toastId?: ToasterToast['id'];
    };

interface State {
  toasts: ToasterToast[];
}

// Track active toasts for our internal state management
const activeToasts = new Map<string, ToasterToast>();
const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({
      type: 'REMOVE_TOAST',
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      };

    case 'DISMISS_TOAST': {
      const { toastId } = action;

      // Side effects
      if (toastId) {
        addToRemoveQueue(toastId);
        sonnerToast.dismiss(toastId); // Dismiss in Sonner
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
          sonnerToast.dismiss(toast.id); // Dismiss in Sonner
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: State) => void> = [];

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type Toast = Omit<ToasterToast, 'id'>;

// Helper to map our variant to Sonner's type
function variantToSonnerType(variant?: string) {
  switch (variant) {
    case 'destructive':
      return 'error';
    case 'success':
      return 'success';
    case 'warning':
      return 'warning';
    case 'info':
      return 'info';
    default:
      return undefined; // Default toast
  }
}

function toast({ ...props }: Toast) {
  const id = genId();
  
  // Create the toast in our internal state
  const update = (props: ToasterToast) => {
    dispatch({
      type: 'UPDATE_TOAST',
      toast: { ...props, id },
    });
    
    // Also update in Sonner by dismissing and recreating
    sonnerToast.dismiss(id);
    
    const type = variantToSonnerType(props.variant as string);
    if (type) {
      sonnerToast[type](props.title as string, {
        id,
        description: props.description,
        action: props.action,
        duration: props.duration || 5000,
      });
    } else {
      sonnerToast(props.title as string, {
        id,
        description: props.description,
        action: props.action,
        duration: props.duration || 5000,
      });
    }
  };
  
  const dismiss = () => {
    dispatch({ type: 'DISMISS_TOAST', toastId: id });
    sonnerToast.dismiss(id);
  };

  // Add to our internal state
  dispatch({
    type: 'ADD_TOAST',
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open: boolean) => { // Added type annotation here
        if (!open) dismiss();
      },
    },
  });
  
  // Create the actual Sonner toast
  const type = variantToSonnerType(props.variant as string);
  if (type) {
    sonnerToast[type](props.title as string, {
      id,
      description: props.description,
      action: props.action,
      duration: props.duration || 5000,
    });
  } else {
    sonnerToast(props.title as string, {
      id,
      description: props.description,
      action: props.action,
      duration: props.duration || 5000,
    });
  }

  return {
    id: id,
    dismiss,
    update,
  };
}

function useToast() {
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

export { useToast, toast };