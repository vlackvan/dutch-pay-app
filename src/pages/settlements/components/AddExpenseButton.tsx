import { useMemo, useRef, useState } from 'react';
import styles from '../SettlementDetailPage.module.css';
import { useCreateSettlement } from '@/hooks/queries/useSettlements';
import type { GroupMemberResponse, SplitType } from '@/types/api.types';

type SplitMode = 'equal' | 'custom';

const EMOJIS = ['🍀', '🏖️', '🍻', '🍜', '☕', '🍰', '🎟️', '🚕', '🛒', '🏨'];

interface AddExpenseButtonProps {
  groupId: number;
  members: GroupMemberResponse[];
  currentUserId?: number;
  onBack: () => void;
}

export default function AddExpenseButton({
  groupId,
  members,
  currentUserId,
  onBack,
}: AddExpenseButtonProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const createSettlement = useCreateSettlement();

  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState('🍀');
  const [emojiOpen, setEmojiOpen] = useState(false);

  const [receiptName, setReceiptName] = useState<string>('');

  const [amount, setAmount] = useState<number | ''>('');
  const [payerId, setPayerId] = useState<number>(currentUserId || members[0]?.user_id || 0);
  const [when, setWhen] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [splitMode, setSplitMode] = useState<SplitMode>('equal');

  const [selected, setSelected] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    members.forEach((m) => (init[m.user_id] = true));
    return init;
  });

  const [custom, setCustom] = useState<Record<number, number | ''>>(() => {
    const init: Record<number, number | ''> = {};
    members.forEach((m) => (init[m.user_id] = ''));
    return init;
  });

  const selectedIds = useMemo(
    () => members.filter((m) => selected[m.user_id]).map((m) => m.user_id),
    [members, selected]
  );

  const amountNumber = typeof amount === 'number' ? amount : 0;

  const equalShare = useMemo(() => {
    const n = selectedIds.length || 1;
    return Math.round(amountNumber / n);
  }, [amountNumber, selectedIds.length]);

  const autoTargetId = useMemo(() => {
    return selectedIds.length ? selectedIds[selectedIds.length - 1] : members[0]?.user_id;
  }, [selectedIds, members]);

  const knownSum = useMemo(() => {
    if (splitMode !== 'custom') return 0;
    return selectedIds
      .filter((id) => id !== autoTargetId)
      .reduce((sum, id) => sum + (typeof custom[id] === 'number' ? custom[id] : 0), 0);
  }, [custom, selectedIds, splitMode, autoTargetId]);

  const autoAmount = useMemo(() => {
    if (splitMode !== 'custom') return 0;
    const rest = amountNumber - knownSum;
    return rest < 0 ? 0 : rest;
  }, [amountNumber, knownSum, splitMode]);

  const computedRowAmount = (userId: number) => {
    if (!selected[userId]) return 0;
    if (splitMode === 'equal') return equalShare;
    if (userId === autoTargetId) return autoAmount;
    return typeof custom[userId] === 'number' ? custom[userId] : 0;
  };

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (!(amountNumber > 0)) return false;
    if (selectedIds.length === 0) return false;
    return true;
  }, [title, amountNumber, selectedIds.length]);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const splitType: SplitType = splitMode === 'equal' ? 'EQUAL' : 'AMOUNT';

    const participants = selectedIds.map((userId) => {
      if (splitMode === 'equal') {
        return { user_id: userId };
      }
      return {
        user_id: userId,
        amount: computedRowAmount(userId),
      };
    });

    createSettlement.mutate(
      {
        group_id: groupId,
        title: title.trim(),
        total_amount: amountNumber,
        split_type: splitType,
        icon: emoji,
        participants,
      },
      {
        onSuccess: () => {
          onBack();
        },
      }
    );
  };

  const getMemberName = (userId: number) => {
    const member = members.find((m) => m.user_id === userId);
    if (!member) return 'Unknown';
    const name = member.nickname || member.user_name;
    return userId === currentUserId ? `${name} (나)` : name;
  };

  return (
    <div>
      <header className={styles.addTop}>
        <button className={styles.addBack} onClick={onBack} type="button" aria-label="뒤로가기">
          ←
        </button>
        <div className={styles.addTitle}>정산 추가</div>
      </header>

      <div className={styles.addFormWrap}>
        <div className={styles.blockTitle}>제목</div>
        <div className={styles.titleRow}>
          <input
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 술, 저녁, 택시"
          />

          <div className={styles.iconBtnWrap}>
            <button
              type="button"
              className={styles.squareIconBtn}
              aria-label="이모지 선택"
              onClick={() => setEmojiOpen((v) => !v)}
            >
              <span className={styles.squareIconText}>{emoji}</span>
            </button>

            {emojiOpen && (
              <div className={styles.emojiPopover}>
                {EMOJIS.map((e) => (
                  <button
                    key={e}
                    type="button"
                    className={styles.emojiChoice}
                    onClick={() => {
                      setEmoji(e);
                      setEmojiOpen(false);
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            className={styles.squareIconBtn}
            aria-label="영수증 선택"
            onClick={() => fileRef.current?.click()}
          >
            📷
          </button>

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              setReceiptName(f ? f.name : '');
            }}
          />
        </div>

        {receiptName ? <div className={styles.receiptHint}>선택된 영수증: {receiptName}</div> : null}

        <div className={styles.blockTitle}>금액</div>
        <div className={styles.amountBigRow}>
          <div className={styles.currencyBox}>₩</div>
          <input
            className={styles.amountBigInput}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="0"
          />
        </div>

        <div className={styles.twoCol}>
          <div>
            <div className={styles.blockTitle}>결제자</div>
            <div className={styles.selectBox}>
              <select
                className={styles.selectPlain}
                value={payerId}
                onChange={(e) => setPayerId(Number(e.target.value))}
              >
                {members.map((m) => (
                  <option key={m.user_id} value={m.user_id}>
                    {getMemberName(m.user_id)}
                  </option>
                ))}
              </select>
              <span className={styles.selectChevron}>▾</span>
            </div>
          </div>

          <div>
            <div className={styles.blockTitle}>날짜</div>
            <div className={styles.selectBox}>
              <input
                className={styles.dateInput}
                type="date"
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
              <span className={styles.selectChevron}>▾</span>
            </div>
          </div>
        </div>

        <div className={styles.splitHeader}>
          <div className={styles.blockTitle}>분할</div>

          <div className={styles.splitMode}>
            <button
              type="button"
              className={`${styles.modeBtn} ${splitMode === 'equal' ? styles.modeBtnActive : ''}`}
              onClick={() => setSplitMode('equal')}
            >
              동일하게
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${splitMode === 'custom' ? styles.modeBtnActive : ''}`}
              onClick={() => setSplitMode('custom')}
            >
              직접 입력
            </button>
          </div>
        </div>

        <div className={styles.splitList}>
          {members.map((m) => {
            const rowAmount = computedRowAmount(m.user_id);

            return (
              <div key={m.user_id} className={styles.splitRow}>
                <label className={styles.splitLeft}>
                  <input
                    type="checkbox"
                    checked={!!selected[m.user_id]}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelected((prev) => ({ ...prev, [m.user_id]: checked }));

                      if (!checked) {
                        setCustom((prev) => ({ ...prev, [m.user_id]: '' }));
                      }
                    }}
                  />
                  <span className={styles.splitName}>{getMemberName(m.user_id)}</span>
                </label>

                {splitMode === 'custom' ? (
                  <div className={styles.customInputWrap}>
                    <span className={styles.customWon}>₩</span>
                    <input
                      className={styles.customInput}
                      type="number"
                      disabled={!selected[m.user_id] || m.user_id === autoTargetId}
                      value={m.user_id === autoTargetId ? autoAmount : custom[m.user_id] ?? ''}
                      onChange={(e) =>
                        setCustom((prev) => ({
                          ...prev,
                          [m.user_id]: e.target.value === '' ? '' : Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <div className={styles.splitRight}>₩{rowAmount.toLocaleString()}</div>
                )}
              </div>
            );
          })}
        </div>

        <button
          className={`${styles.addSubmitBtn} ${!canSubmit || createSettlement.isPending ? styles.addSubmitDisabled : ''}`}
          type="button"
          disabled={!canSubmit || createSettlement.isPending}
          onClick={handleSubmit}
        >
          {createSettlement.isPending ? '추가 중...' : '추가'}
        </button>

        {createSettlement.isError && (
          <div className={styles.errorMsg}>정산 추가에 실패했습니다. 다시 시도해주세요.</div>
        )}
      </div>
    </div>
  );
}
