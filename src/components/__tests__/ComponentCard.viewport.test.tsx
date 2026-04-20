import { describe, test, expect, mock } from 'bun:test';
import { render, screen, fireEvent } from '@testing-library/react';
import { ComponentCard } from '../ComponentCard';
import type { GeneratedComponent } from '../../types';

const mockComponent: GeneratedComponent = {
  id: 'test-1',
  prompt: '테스트 버튼',
  code: 'render(<div>test</div>)',
  createdAt: new Date(),
};

const defaultProps = {
  component: mockComponent,
  onRemove: mock(() => {}),
  onRegenerate: mock(() => {}),
  isLoading: false,
};

describe('ComponentCard - 반응형 뷰 버튼', () => {
  test('미리보기 탭 기본 상태에서 뷰포트 버튼 3개가 표시된다', () => {
    render(<ComponentCard {...defaultProps} />);
    expect(screen.getByTitle('모바일 (375px)')).toBeInTheDocument();
    expect(screen.getByTitle('태블릿 (768px)')).toBeInTheDocument();
    expect(screen.getByTitle('데스크탑 (100%)')).toBeInTheDocument();
  });

  test('코드 탭으로 전환하면 뷰포트 버튼이 숨겨진다', () => {
    render(<ComponentCard {...defaultProps} />);
    fireEvent.click(screen.getByText('코드'));
    expect(screen.queryByTitle('모바일 (375px)')).not.toBeInTheDocument();
    expect(screen.queryByTitle('태블릿 (768px)')).not.toBeInTheDocument();
    expect(screen.queryByTitle('데스크탑 (100%)')).not.toBeInTheDocument();
  });

  test('기본값으로 데스크탑 버튼이 active 상태', () => {
    render(<ComponentCard {...defaultProps} />);
    expect(screen.getByTitle('데스크탑 (100%)')).toHaveClass('btn-viewport--active');
    expect(screen.getByTitle('모바일 (375px)')).not.toHaveClass('btn-viewport--active');
    expect(screen.getByTitle('태블릿 (768px)')).not.toHaveClass('btn-viewport--active');
  });

  test('모바일 버튼 클릭 시 모바일이 active로 변경된다', () => {
    render(<ComponentCard {...defaultProps} />);
    fireEvent.click(screen.getByTitle('모바일 (375px)'));
    expect(screen.getByTitle('모바일 (375px)')).toHaveClass('btn-viewport--active');
    expect(screen.getByTitle('데스크탑 (100%)')).not.toHaveClass('btn-viewport--active');
  });

  test('태블릿 버튼 클릭 시 태블릿이 active로 변경된다', () => {
    render(<ComponentCard {...defaultProps} />);
    fireEvent.click(screen.getByTitle('태블릿 (768px)'));
    expect(screen.getByTitle('태블릿 (768px)')).toHaveClass('btn-viewport--active');
    expect(screen.getByTitle('데스크탑 (100%)')).not.toHaveClass('btn-viewport--active');
  });
});
