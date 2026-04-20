import { useState, useCallback, useRef } from 'react';
import type { GeneratedComponent, Provider } from '../types';
import { parseSSEBuffer } from '../utils/sseParser';

interface UseComponentGeneratorReturn {
  components: GeneratedComponent[];
  isLoading: boolean;
  error: string | null;
  generate: (prompt: string, apiKey: string | undefined, provider: Provider) => Promise<void>;
  removeComponent: (id: string) => void;
  clearAll: () => void;
}

export function useComponentGenerator(): UseComponentGeneratorReturn {
  const [components, setComponents] = useState<GeneratedComponent[]>([]);
  const [error, setError] = useState<string | null>(null);
  // 스트리밍 중인 컴포넌트의 reader를 추적해 삭제 시 스트림 취소에 사용
  const activeReadersRef = useRef<Map<string, ReadableStreamDefaultReader<Uint8Array>>>(new Map());

  const isLoading = components.some((c) => c.isStreaming);

  const generate = useCallback(async (prompt: string, apiKey: string | undefined, provider: Provider) => {
    setError(null);

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    // 즉시 placeholder 삽입
    setComponents((prev) => [
      { id, prompt, code: '', createdAt: new Date(), isStreaming: true },
      ...prev,
    ]);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(apiKey && { apiKey }), provider }),
      });

      if (!res.body) throw new Error('스트림 응답을 받을 수 없습니다.');

      const reader = res.body.getReader();
      activeReadersRef.current.set(id, reader);

      const decoder = new TextDecoder();
      let sseBuffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const { events, remaining } = parseSSEBuffer(sseBuffer, decoder.decode(value, { stream: true }));
        sseBuffer = remaining;

        for (const event of events) {
          if (event.type === 'chunk') {
            setComponents((prev) =>
              prev.map((c) => (c.id === id ? { ...c, code: c.code + event.text } : c))
            );
          } else if (event.type === 'done') {
            setComponents((prev) =>
              prev.map((c) => (c.id === id ? { ...c, code: event.code, isStreaming: false } : c))
            );
          } else if (event.type === 'error') {
            throw new Error(event.message);
          }
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      // AbortError는 사용자가 직접 삭제한 경우이므로 에러 표시 안 함
      if (message !== 'AbortError') {
        setError(message);
      }
      // 에러 시 placeholder 제거
      setComponents((prev) => prev.filter((c) => c.id !== id));
    } finally {
      activeReadersRef.current.delete(id);
    }
  }, []);

  const removeComponent = useCallback((id: string) => {
    // 스트리밍 중이면 스트림 취소
    const reader = activeReadersRef.current.get(id);
    if (reader) {
      reader.cancel().catch(() => {});
      activeReadersRef.current.delete(id);
    }
    setComponents((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    // 모든 활성 스트림 취소
    for (const reader of activeReadersRef.current.values()) {
      reader.cancel().catch(() => {});
    }
    activeReadersRef.current.clear();
    setComponents([]);
  }, []);

  return { components, isLoading, error, generate, removeComponent, clearAll };
}
