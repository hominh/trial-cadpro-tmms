"use client";

import { useCallback, useEffect, useRef } from "react";

export function useAbortableRequest() {
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const run = useCallback(
    async <T>(
      operation: (signal: AbortSignal) => Promise<T>
    ): Promise<{ readonly value: T; readonly generation: number }> => {
      controller.current?.abort();
      const current = new AbortController();
      controller.current = current;
      const currentGeneration = ++generation.current;
      const value = await operation(current.signal);
      if (current.signal.aborted || currentGeneration !== generation.current)
        throw new DOMException("Request superseded", "AbortError");
      return { value, generation: currentGeneration };
    },
    []
  );
  useEffect(() => () => controller.current?.abort(), []);
  return { run, abort: () => controller.current?.abort() };
}
