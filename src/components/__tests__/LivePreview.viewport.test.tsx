import { describe, test, expect } from 'bun:test';
import { render } from '@testing-library/react';
import { LivePreview } from '../LivePreview';

describe('LivePreview - viewportSize prop', () => {
  test('mobile이면 preview-render의 maxWidth가 375px', () => {
    const { container } = render(<LivePreview code="render(<div/>)" viewportSize="mobile" />);
    const el = container.querySelector('.preview-render') as HTMLElement;
    expect(el.style.maxWidth).toBe('375px');
  });

  test('tablet이면 preview-render의 maxWidth가 768px', () => {
    const { container } = render(<LivePreview code="render(<div/>)" viewportSize="tablet" />);
    const el = container.querySelector('.preview-render') as HTMLElement;
    expect(el.style.maxWidth).toBe('768px');
  });

  test('desktop이면 preview-render의 maxWidth가 100%', () => {
    const { container } = render(<LivePreview code="render(<div/>)" viewportSize="desktop" />);
    const el = container.querySelector('.preview-render') as HTMLElement;
    expect(el.style.maxWidth).toBe('100%');
  });

  test('viewportSize 미지정시 기본값은 desktop (maxWidth 100%)', () => {
    const { container } = render(<LivePreview code="render(<div/>)" />);
    const el = container.querySelector('.preview-render') as HTMLElement;
    expect(el.style.maxWidth).toBe('100%');
  });
});
