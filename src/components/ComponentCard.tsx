import { useState } from 'react';
import type { GeneratedComponent, ViewportSize } from '../types';
import { LivePreview } from './LivePreview';
import { CodeView } from './CodeView';

interface ComponentCardProps {
  component: GeneratedComponent;
  onRemove: (id: string) => void;
  onRegenerate: (prompt: string) => void;
  isLoading: boolean;
}

type Tab = 'preview' | 'code';

export function ComponentCard({ component, onRemove, onRegenerate, isLoading }: ComponentCardProps) {
  // null = 사용자가 아직 탭을 직접 선택하지 않음 → streaming 상태로 파생
  const [userSelectedTab, setUserSelectedTab] = useState<Tab | null>(null);
  const [previewKey, setPreviewKey] = useState(0);
  const [viewportSize, setViewportSize] = useState<ViewportSize>('desktop');

  // 사용자 선택 우선, 없으면 스트리밍 여부로 결정 (완료 시 자동으로 preview)
  const activeTab = userSelectedTab ?? (component.isStreaming ? 'code' : 'preview');

  const handleTabClick = (tab: Tab) => {
    if (tab === 'preview' && component.isStreaming) return;
    setUserSelectedTab(tab);
  };

  return (
    <div className="component-card">
      <div className="card-header">
        <p className="card-prompt">{component.prompt}</p>
        <div className="card-actions">
          <button
            className="btn-refresh"
            onClick={() => setPreviewKey((k) => k + 1)}
            title="미리보기 새로고침"
            disabled={component.isStreaming}
          >
            ↻
          </button>
          <button
            className="btn-regenerate"
            onClick={() => onRegenerate(component.prompt)}
            disabled={isLoading}
          >
            {isLoading ? '생성 중...' : '재생성'}
          </button>
          <button
            className="btn-remove"
            onClick={() => onRemove(component.id)}
          >
            삭제
          </button>
        </div>
      </div>
      <div className="card-tabs">
        <div>
          <button
            className={`tab ${activeTab === 'preview' ? 'tab--active' : ''} ${component.isStreaming ? 'tab--disabled' : ''}`}
            onClick={() => handleTabClick('preview')}
            title={component.isStreaming ? '생성 완료 후 미리보기를 볼 수 있습니다' : undefined}
          >
            미리보기
          </button>
          <button
            className={`tab ${activeTab === 'code' ? 'tab--active' : ''}`}
            onClick={() => handleTabClick('code')}
          >
            코드
          </button>
        </div>
        {activeTab === 'preview' && !component.isStreaming && (
          <div className="viewport-controls">
            <button
              className={`btn-viewport ${viewportSize === 'mobile' ? 'btn-viewport--active' : ''}`}
              onClick={() => setViewportSize('mobile')}
              title="모바일 (375px)"
            >
              📱
            </button>
            <button
              className={`btn-viewport ${viewportSize === 'tablet' ? 'btn-viewport--active' : ''}`}
              onClick={() => setViewportSize('tablet')}
              title="태블릿 (768px)"
            >
              📟
            </button>
            <button
              className={`btn-viewport ${viewportSize === 'desktop' ? 'btn-viewport--active' : ''}`}
              onClick={() => setViewportSize('desktop')}
              title="데스크탑 (100%)"
            >
              🖥
            </button>
          </div>
        )}
      </div>
      <div className="card-content">
        {activeTab === 'preview' ? (
          component.isStreaming ? (
            <div className="streaming-placeholder">
              <div className="streaming-placeholder-pulse" />
              <p>코드를 생성하고 있습니다...</p>
            </div>
          ) : (
            <LivePreview key={previewKey} code={component.code} viewportSize={viewportSize} />
          )
        ) : (
          <CodeView code={component.code} isStreaming={component.isStreaming} />
        )}
      </div>
    </div>
  );
}
