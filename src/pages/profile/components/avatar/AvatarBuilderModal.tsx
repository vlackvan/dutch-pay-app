import styles from './AvatarBuilderModal.module.css';
import { useMemo, useRef, useState } from 'react';
import { toPng } from 'html-to-image';

import type { AvatarConfig } from './avatar.types';
import { AvatarCanvas } from './AvatarCanvas';
import { DEFAULT_AVATAR } from './avatar.presets';

type Props = {
  open: boolean;
  initial?: AvatarConfig;
  onClose: () => void;
  onSave: (config: AvatarConfig, pngDataUrl: string) => void;
};

type Tab = 'body' | 'eyes' | 'mouth';

/** ✅ (선택) 프리셋: 너가 원하면 더 추가하면 됨 */
const PRESETS: { key: string; label: string; config: AvatarConfig }[] = [
  { key: 'bored', label: '정석 심드렁', config: { body: 'brown_round', eyes: 'sleepy', mouth: 'original' } },
  { key: 'plain', label: '기본', config: { body: 'darkgreen_round', eyes: 'original', mouth: 'original' } },
  { key: 'worry', label: '불안', config: { body: 'yellow_round', eyes: 'worry', mouth: 'original' } },
];

export function AvatarBuilderModal({ open, initial, onClose, onSave }: Props) {
  const [tab, setTab] = useState<Tab>('eyes');
  const [config, setConfig] = useState<AvatarConfig>(initial ?? DEFAULT_AVATAR);

  const previewRef = useRef<HTMLDivElement | null>(null);

  const options = useMemo(() => ({
    body: ['brown_round', 'darkgreen_round', 'purple_tri', 'yellow_round'] as const,
    eyes: ['original', 'sleepy', 'worry'] as const,
    mouth: ['original'] as const, // mouth 늘어나면 여기만 추가
  }), []);

  const randomize = () => {
    const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
    setConfig((c) => ({
      ...c,
      body: pick(options.body),
      eyes: pick(options.eyes),
      mouth: pick(options.mouth),
    }));
  };

  if (!open) return null;

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        {/* header */}
        <div className={styles.header}>
          <div className={styles.title}>아바타 만들기</div>
          <button className={styles.iconBtn} onClick={onClose}>✕</button>
        </div>

        {/* preview */}
        <div className={styles.preview}>
          <div className={styles.canvasWrap} ref={previewRef}>
            <AvatarCanvas config={config} size={260} />
          </div>

          <div className={styles.presetRow}>
            {PRESETS.map((p) => (
              <button
                key={p.key}
                className={styles.presetBtn}
                onClick={() => setConfig(p.config)}
                title={p.label}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* tabs */}
        <div className={styles.tabs}>
          <button className={tab === 'body' ? styles.tabActive : styles.tab} onClick={() => setTab('body')}>바디</button>
          <button className={tab === 'eyes' ? styles.tabActive : styles.tab} onClick={() => setTab('eyes')}>눈</button>
          <button className={tab === 'mouth' ? styles.tabActive : styles.tab} onClick={() => setTab('mouth')}>입</button>
        </div>

        {/* panel */}
        <div className={styles.panel}>
          {tab === 'body' && (
            <Grid>
              {options.body.map((v) => (
                <ThumbButton
                  key={v}
                  active={config.body === v}
                  onClick={() => setConfig((c) => ({ ...c, body: v }))}
                  src={`/avatar/body/${v}.png`}
                  label={v}
                />
              ))}
            </Grid>
          )}

          {tab === 'eyes' && (
            <Grid>
              {options.eyes.map((v) => (
                <ThumbButton
                  key={v}
                  active={config.eyes === v}
                  onClick={() => setConfig((c) => ({ ...c, eyes: v }))}
                  src={`/avatar/eyes/${v}.png`}
                  label={v}
                />
              ))}
            </Grid>
          )}

          {tab === 'mouth' && (
            <Grid>
              {options.mouth.map((v) => (
                <ThumbButton
                  key={v}
                  active={config.mouth === v}
                  onClick={() => setConfig((c) => ({ ...c, mouth: v }))}
                  src={`/avatar/mouth/${v}.png`}
                  label={v}
                />
              ))}
            </Grid>
          )}
        </div>

        {/* footer */}
        <div className={styles.footer}>
          <button className={styles.secondary} onClick={randomize}>랜덤</button>
          <button className={styles.secondary} onClick={() => setConfig(DEFAULT_AVATAR)}>초기화</button>

          <button
            className={styles.primary}
            onClick={async () => {
              if (!previewRef.current) return;

              const png = await toPng(previewRef.current, {
                backgroundColor: 'transparent',
                pixelRatio: 2,
              });

              onSave(config, png);
            }}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------- sub components ---------- */

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{children}</div>;
}

function ThumbButton({
  src,
  label,
  active,
  onClick,
}: {
  src: string;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 92,
        borderRadius: 12,
        border: active ? '2px solid rgba(0,0,0,0.55)' : '1px solid rgba(0,0,0,0.15)',
        background: '#fff',
        padding: 8,
        cursor: 'pointer',
      }}
      title={label}
      type="button"
    >
      <div style={{ width: '100%', aspectRatio: '1 / 1', borderRadius: 10, background: '#f5f5f5', display: 'grid', placeItems: 'center' }}>
        <img src={src} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
      </div>
      <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7, textAlign: 'center' }}>
        {label}
      </div>
    </button>
  );
}
