import { describe, test, expect } from 'bun:test';
import { parseSSEBuffer } from '../sseParser';

describe('parseSSEBuffer', () => {
  test('완전한 chunk 이벤트를 파싱한다', () => {
    const { events, remaining } = parseSSEBuffer('', 'data: {"type":"chunk","text":"hello"}\n\n');
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'chunk', text: 'hello' });
    expect(remaining).toBe('');
  });

  test('완전한 done 이벤트를 파싱한다', () => {
    const { events, remaining } = parseSSEBuffer('', 'data: {"type":"done","code":"const A = () => null;"}\n\n');
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'done', code: 'const A = () => null;' });
    expect(remaining).toBe('');
  });

  test('완전한 error 이벤트를 파싱한다', () => {
    const { events } = parseSSEBuffer('', 'data: {"type":"error","message":"API failed"}\n\n');
    expect(events[0]).toEqual({ type: 'error', message: 'API failed' });
  });

  test('한 청크에 여러 이벤트가 있을 때 모두 파싱한다', () => {
    const input = 'data: {"type":"chunk","text":"a"}\n\ndata: {"type":"chunk","text":"b"}\n\n';
    const { events, remaining } = parseSSEBuffer('', input);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ type: 'chunk', text: 'a' });
    expect(events[1]).toEqual({ type: 'chunk', text: 'b' });
    expect(remaining).toBe('');
  });

  test('TCP 청크 경계에서 이벤트가 쪼개지면 나머지를 버퍼에 유지한다', () => {
    const { events: e1, remaining: r1 } = parseSSEBuffer('', 'data: {"type":"chunk","t');
    expect(e1).toHaveLength(0);
    expect(r1).toBe('data: {"type":"chunk","t');

    const { events: e2, remaining: r2 } = parseSSEBuffer(r1, 'ext":"hello"}\n\n');
    expect(e2).toHaveLength(1);
    expect(e2[0]).toEqual({ type: 'chunk', text: 'hello' });
    expect(r2).toBe('');
  });

  test('이전 버퍼와 새 청크를 합쳐서 파싱한다', () => {
    const first = 'data: {"type":"chunk","te';
    const { remaining: r1 } = parseSSEBuffer('', first);

    const second = 'xt":"world"}\n\ndata: {"type":"done","code":"x"}\n\n';
    const { events, remaining } = parseSSEBuffer(r1, second);
    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({ type: 'chunk', text: 'world' });
    expect(events[1]).toEqual({ type: 'done', code: 'x' });
    expect(remaining).toBe('');
  });

  test('잘못된 JSON은 무시하고 나머지 이벤트를 계속 파싱한다', () => {
    const input = 'data: INVALID_JSON\n\ndata: {"type":"chunk","text":"ok"}\n\n';
    const { events } = parseSSEBuffer('', input);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'chunk', text: 'ok' });
  });

  test('data: 접두사가 없는 줄은 무시한다', () => {
    const input = ': keep-alive\n\ndata: {"type":"chunk","text":"hi"}\n\n';
    const { events } = parseSSEBuffer('', input);
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ type: 'chunk', text: 'hi' });
  });

  test('마지막 불완전한 이벤트는 remaining에 보존한다', () => {
    const input = 'data: {"type":"chunk","text":"a"}\n\ndata: {"type":"chunk"';
    const { events, remaining } = parseSSEBuffer('', input);
    expect(events).toHaveLength(1);
    expect(remaining).toBe('data: {"type":"chunk"');
  });
});
