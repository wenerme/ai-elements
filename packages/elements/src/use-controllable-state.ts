import { useCallback, useState } from "react";

interface UseControllableStateParams<T> {
  prop?: T;
  defaultProp?: T;
  onChange?: (value: T) => void;
}

export const useControllableState = <T>({
  prop,
  defaultProp,
  onChange,
}: UseControllableStateParams<T>) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultProp as T);
  const isControlled = prop !== undefined;
  const value = isControlled ? (prop as T) : uncontrolledValue;

  const setValue = useCallback(
    (nextValue: T | ((previousValue: T) => T)) => {
      const resolvedValue =
        typeof nextValue === "function"
          ? (nextValue as (previousValue: T) => T)(value)
          : nextValue;

      if (!isControlled) {
        setUncontrolledValue(resolvedValue);
      }

      if (resolvedValue !== value) {
        onChange?.(resolvedValue);
      }
    },
    [isControlled, onChange, value]
  );

  return [value, setValue] as const;
};
