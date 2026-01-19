import styles from './AvatarBuilderModal.module.css';
import { useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import type { AvatarConfig } from './avatar.types';
import { AvatarCanvas } from './AvatarCanvas';
import { DEFAULT_AVATAR } from './avatar.presets';
import {
  BODY_IMAGES,
  EYES_IMAGES,
  MOUTH_IMAGES,
  getBodyImagePath,
  getEyesImagePath,
  getMouthImagePath,
} from './AvatarAssets';
import { cropAvatarToBlob, cropAvatarToDataURL } from './avatarCrop';
import { usersApi } from '@/lib/api/users.api';

type Props = {
  open: boolean;
  initial?: AvatarConfig;
  onClose: () => void;
  onSave: (config: AvatarConfig, pngDataUrl: string) => void;
};

type Tab = 'body' | 'eyes' | 'mouth';

const PRESETS: { key: string; label: string; config: AvatarConfig }[] = [
  { key: 'happy', label: '행복', config: { body: 'yellow_round', eyes: 'happy', mouth: 'smile' } },
  { key: 'sleepy', label: '졸림', config: { body: 'purple', eyes: 'sleepy', mouth: 'original' } },
  { key: 'cool', label: '쿨함', config: { body: 'red', eyes: 'pretty', mouth: 'laugh' } },
];

export function AvatarBuilderModal({ open, initial, onClose, onSave }: Props) {
  const [tab, setTab] = useState<Tab>('body');
  const [config, setConfig] = useState<AvatarConfig>(initial ?? DEFAULT_AVATAR);

  const previewRef = useRef<HTMLDivElement | null>(null);

  const options = useMemo(
    () => ({
      body: BODY_IMAGES,
      eyes: EYES_IMAGES,
      mouth: MOUTH_IMAGES,
    }),
    [],
  );

  const randomize = () => {
    const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];
    setConfig({
      body: pick(options.body),
      eyes: pick(options.eyes),
      mouth: pick(options.mouth),
    });
  };

  if (!open) return null;

  const modal = (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.title}>아바타 만들기</div>
          <button className={styles.iconBtn} onClick={onClose} type="button">
            ✕
          </button>
        </div>

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
                type="button"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.tabs}>
          <button
            className={tab === 'body' ? styles.tabActive : styles.tab}
            onClick={() => setTab('body')}
            type="button"
          >
            바디
          </button>
          <button
            className={tab === 'eyes' ? styles.tabActive : styles.tab}
            onClick={() => setTab('eyes')}
            type="button"
          >
            눈
          </button>
          <button
            className={tab === 'mouth' ? styles.tabActive : styles.tab}
            onClick={() => setTab('mouth')}
            type="button"
          >
            입
          </button>
        </div>

        <div className={styles.panel}>
          {tab === 'body' && (
            <Grid>
              {options.body.map((v) => (
                <ThumbButton
                  key={v}
                  active={config.body === v}
                  onClick={() => setConfig((c) => ({ ...c, body: v }))}
                  imageSrc={getBodyImagePath(v)}
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
                  imageSrc={getEyesImagePath(v)}
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
                  imageSrc={getMouthImagePath(v)}
                  label={v}
                />
              ))}
            </Grid>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.secondary} onClick={randomize} type="button">
            랜덤
          </button>
          <button
            className={styles.secondary}
            onClick={() => setConfig(DEFAULT_AVATAR)}
            type="button"
          >
            초기화
          </button>

          <button
            className={styles.primary}
            onClick={async () => {
              try {
                // Generate cropped avatar image
                const croppedDataURL = await cropAvatarToDataURL(config);
                const croppedBlob = await cropAvatarToBlob(config);

                // Upload to backend using API client (includes auth token automatically)
                await usersApi.uploadAvatar(croppedBlob, {
                  body: config.body,
                  eyes: config.eyes,
                  mouth: config.mouth,
                });

                // Call the original onSave callback with data URL for local display
                onSave(config, croppedDataURL);
              } catch (error) {
                console.error('Error saving avatar:', error);
                alert('Failed to save avatar. Please try again.');
              }
            }}
            type="button"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );

  if (typeof document === 'undefined') return modal;
  return createPortal(modal, document.body);
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{children}</div>;
}

function ThumbButton({
  imageSrc,
  label,
  active,
  onClick,
}: {
  imageSrc: string;
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
      <div
        style={{
          width: '100%',
          aspectRatio: '1 / 1',
          borderRadius: 10,
          background: '#f5f5f5',
          display: 'grid',
          placeItems: 'center',
          overflow: 'hidden',
        }}
      >
        <img
          src={imageSrc}
          alt={label}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      <div style={{ marginTop: 6, fontSize: 11, opacity: 0.7, textAlign: 'center' }}>
        {label}
      </div>
    </button>
  );
}
