import { useState, useCallback } from "react";

interface UseRetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

interface UseRetryReturn<T> {
  execute: () => Promise<T>;
  isLoading: boolean;
  error: Error | null;
  attempt: number;
  reset: () => void;
}

export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  options: UseRetryOptions = {},
): UseRetryReturn<T> {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);

  const execute = useCallback(async (): Promise<T> => {
    setIsLoading(true);
    setError(null);

    let lastError: Error;

    for (let i = 0; i < maxAttempts; i++) {
      setAttempt(i + 1);

      try {
        const result = await asyncFunction();
        setIsLoading(false);
        setAttempt(0);
        return result;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));

        // Don't wait after the last attempt
        if (i < maxAttempts - 1) {
          const waitTime = backoff ? delay * Math.pow(2, i) : delay;
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    setError(lastError!);
    setIsLoading(false);
    throw lastError!;
  }, [asyncFunction, maxAttempts, delay, backoff]);

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setAttempt(0);
  }, []);

  return { execute, isLoading, error, attempt, reset };
}
