export type Provider = 'anthropic' | 'google';
export type ViewportSize = 'mobile' | 'tablet' | 'desktop';

export interface GeneratedComponent {
  id: string;
  prompt: string;
  code: string;
  createdAt: Date;
  isStreaming?: boolean;
}

export type SSEEvent =
  | { type: 'chunk'; text: string }
  | { type: 'done'; code: string }
  | { type: 'error'; message: string };
