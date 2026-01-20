import { useMemo, useState, useEffect } from 'react';
import styles from '../SettlementDetailPage.module.css';
import { useCreateSettlement, useUpdateSettlement } from '@/hooks/queries/useSettlements';
import type { GroupParticipantResponse, SplitType, SettlementResponse } from '@/types/api.types';
import { IconDropdown } from '@/components/IconDropdown';
import { DEFAULT_ICON } from '@/constants/icons';

type SplitMode = 'equal' | 'custom';

interface AddExpenseButtonProps {
  groupId: number;
  participants: GroupParticipantResponse[];
  currentUserParticipantId?: number;
  onBack: () => void;
  initialData?: SettlementResponse;
  isEditMode?: boolean;
}

export default function AddExpenseButton({
  groupId,
  participants,
  currentUserParticipantId,
  onBack,
  initialData,
  isEditMode = false,
}: AddExpenseButtonProps) {
  const createSettlement = useCreateSettlement();
  const updateSettlement = useUpdateSettlement();

  const [title, setTitle] = useState('');
  const [emoji, setEmoji] = useState(DEFAULT_ICON);

  const [amount, setAmount] = useState<number | ''>('');
  const [payerId, setPayerId] = useState<number>(currentUserParticipantId || participants[0]?.id || 0);
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
    participants.forEach((p) => (init[p.id] = true));
    return init;
  });

  const [custom, setCustom] = useState<Record<number, number | ''>>(() => {
    const init: Record<number, number | ''> = {};
    participants.forEach((p) => (init[p.id] = ''));
    return init;
  });

  // Initialize form with initialData when in edit mode
  useEffect(() => {
    if (initialData && isEditMode) {
      setTitle(initialData.title || '');
      setEmoji(initialData.icon || DEFAULT_ICON);
      setAmount(Number(initialData.total_amount) || 0);
      setPayerId(initialData.payer_participant_id);

      // Set date from created_at
      if (initialData.created_at) {
        const date = new Date(initialData.created_at);
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        setWhen(`${yyyy}-${mm}-${dd}`);
      }

      // Set selected participants
      const newSelected: Record<number, boolean> = {};
      participants.forEach((p) => (newSelected[p.id] = false));
      initialData.participants.forEach((p) => {
        newSelected[p.participant_id] = true;
      });
      setSelected(newSelected);

      // Set custom amounts if split_type is 'amount'
      if (initialData.split_type === 'amount') {
        setSplitMode('custom');
        const newCustom: Record<number, number | ''> = {};
        initialData.participants.forEach((p) => {
          newCustom[p.participant_id] = Number(p.amount_owed) || '';
        });
        setCustom(newCustom);
      } else {
        setSplitMode('equal');
      }
    }
  }, [initialData, isEditMode, participants]);

  const selectedIds = useMemo(
    () => participants.filter((p) => selected[p.id]).map((p) => p.id),
    [participants, selected]
  );

  const amountNumber = typeof amount === 'number' ? amount : 0;

  const equalShare = useMemo(() => {
    const n = selectedIds.length || 1;
    return Math.round(amountNumber / n);
  }, [amountNumber, selectedIds.length]);

  const autoTargetId = useMemo(() => {
    return selectedIds.length ? selectedIds[selectedIds.length - 1] : participants[0]?.id;
  }, [selectedIds, participants]);

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

  const computedRowAmount = (participantId: number) => {
    if (!selected[participantId]) return 0;
    if (splitMode === 'equal') return equalShare;
    if (participantId === autoTargetId) return autoAmount;
    return typeof custom[participantId] === 'number' ? custom[participantId] : 0;
  };

  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (!(amountNumber > 0)) return false;
    if (selectedIds.length === 0) return false;
    return true;
  }, [title, amountNumber, selectedIds.length]);

  const handleSubmit = () => {
    if (!canSubmit) return;

    const splitType: SplitType = splitMode === 'equal' ? 'equal' : 'amount';

    const finalParticipantIds = selectedIds;

    const participantsPayload = finalParticipantIds.map((participantId) => {
      if (splitMode === 'equal') {
        return { participant_id: participantId };
      }
      return {
        participant_id: participantId,
        amount: computedRowAmount(participantId),
      };
    });

    if (isEditMode && initialData) {
      // Update existing settlement
      updateSettlement.mutate(
        {
          settlementId: initialData.id,
          data: {
            payer_participant_id: payerId,
            title: title.trim(),
            total_amount: amountNumber,
            split_type: splitType,
            icon: emoji,
            participants: participantsPayload,
            date: when || undefined,
          },
        },
        {
          onSuccess: () => {
            onBack();
          },
        }
      );
    } else {
      // Create new settlement
      createSettlement.mutate(
        {
          group_id: groupId,
          payer_participant_id: payerId,
          title: title.trim(),
          total_amount: amountNumber,
          split_type: splitType,
          icon: emoji,
          participants: participantsPayload,
          date: when || undefined,
        },
        {
          onSuccess: () => {
            onBack();
          },
        }
      );
    }
  };

  const getParticipantName = (participantId: number) => {
    const participant = participants.find((p) => p.id === participantId);
    if (!participant) return 'Unknown';
    const name = participant.name || participant.user_name;
    return participantId === currentUserParticipantId ? `${name} (나)` : name;
  };

  return (
    <div>
      <header className={styles.addTop}>
        <button className={styles.addBack} onClick={onBack} type="button" aria-label="뒤로가기">
          ←
        </button>
        <div className={styles.addTitle}>{isEditMode ? '정산 수정' : '정산 추가'}</div>
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
            <IconDropdown selectedIcon={emoji} onSelectIcon={setEmoji} size="small" />
          </div>
        </div>

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
                onChange={(e) => {
                  const nextId = Number(e.target.value);
                  setPayerId(nextId);
                  setSelected((prev) => ({ ...prev, [nextId]: true }));
                }}
              >
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {getParticipantName(p.id)}
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
          {participants.map((p) => {
            const rowAmount = computedRowAmount(p.id);

            return (
              <div key={p.id} className={styles.splitRow}>
                <label className={styles.splitLeft}>
                  <input
                    type="checkbox"
                    checked={!!selected[p.id]}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelected((prev) => ({ ...prev, [p.id]: checked }));

                      if (!checked) {
                        setCustom((prev) => ({ ...prev, [p.id]: '' }));
                      }
                    }}
                  />
                  <span className={styles.splitName}>{getParticipantName(p.id)}</span>
                </label>

                {splitMode === 'custom' ? (
                  <div className={styles.customInputWrap}>
                    <span className={styles.customWon}>₩</span>
                    <input
                      className={styles.customInput}
                      type="number"
                      disabled={!selected[p.id] || p.id === autoTargetId}
                      value={p.id === autoTargetId ? autoAmount : custom[p.id] ?? ''}
                      onChange={(e) =>
                        setCustom((prev) => ({
                          ...prev,
                          [p.id]: e.target.value === '' ? '' : Number(e.target.value),
                        }))
                      }
                      placeholder="0"
                    />
                  </div>
                ) : (
                  <div className={styles.splitRight}>₩{Math.round(rowAmount || 0).toLocaleString()}</div>
                )}
              </div>
            );
          })}
        </div>

        <button
          className={`${styles.addSubmitBtn} ${!canSubmit || createSettlement.isPending ? styles.addSubmitDisabled : ''}`}
          type="button"
          disabled={!canSubmit || createSettlement.isPending || updateSettlement.isPending}
          onClick={handleSubmit}
        >
          {isEditMode
            ? updateSettlement.isPending
              ? '수정 중...'
              : '수정'
            : createSettlement.isPending
              ? '추가 중...'
              : '추가'}
        </button>

        {(createSettlement.isError || updateSettlement.isError) && (
          <div className={styles.errorMsg}>
            {isEditMode ? '정산 수정에 실패했습니다.' : '정산 추가에 실패했습니다.'} 다시 시도해주세요.
          </div>
        )}
      </div>
    </div>
  );
}
