import type { SSEEvent } from '../types';

export function parseSSEBuffer(
  remaining: string,
  newChunk: string
): { events: SSEEvent[]; remaining: string } {
  const buffer = remaining + newChunk;
  const events: SSEEvent[] = [];

  // SSE 이벤트는 \n\n으로 구분됨
  const parts = buffer.split('\n\n');
  // 마지막 조각은 불완전할 수 있으므로 버퍼에 보존
  const incomplete = parts.pop() ?? '';

  for (const part of parts) {
    for (const line of part.split('\n')) {
      if (!line.startsWith('data: ')) continue;
      try {
        const parsed = JSON.parse(line.slice(6)) as SSEEvent;
        events.push(parsed);
      } catch {
        // 잘못된 JSON 무시
      }
    }
  }

  return { events, remaining: incomplete };
}
