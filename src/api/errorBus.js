const listeners = new Set();

export const errorBus = {
  emit: (message, type = "error") => {
    listeners.forEach((fn) => fn({ message, type }));
  },
  subscribe: (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },
};
