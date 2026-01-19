import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionCard } from './SectionCard';
import styles from './PaymentCard.module.css';
import type { UserProfileResponse } from '@/types/api.types';
import { useUpdateProfile } from '@/hooks/queries/useUser';

type PaymentMethod = 'kakaopay' | 'toss' | 'bank';

const METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'kakaopay', label: '카카오페이' },
  { value: 'toss', label: '토스' },
  { value: 'bank', label: '계좌이체' },
];

const BANKS = [
  '국민은행',
  '신한은행',
  '우리은행',
  '하나은행',
  '농협',
  '기업은행',
  '카카오뱅크',
  '토스뱅크',
  '케이뱅크',
  '새마을금고',
  '우체국',
];

interface PaymentCardProps {
  user?: UserProfileResponse;
}

export function PaymentCard({ user }: PaymentCardProps) {
  const updateProfile = useUpdateProfile();
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>(
    (user?.payment_method as PaymentMethod) || 'kakaopay',
  );

  const [bank, setBank] = useState('');
  const [account, setAccount] = useState(user?.payment_account || '');

  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  useEffect(() => {
    if (method !== 'bank') {
      setOpen(false);
    }
  }, [method]);

  const handleMethodChange = (newMethod: PaymentMethod) => {
    setMethod(newMethod);
    setOpen(false);
    updateProfile.mutate({ payment_method: newMethod });
  };

  const handleAccountSave = () => {
    const accountInfo = bank ? `${bank} ${account}` : account;
    updateProfile.mutate({ payment_account: accountInfo });
  };

  const methodLabel = useMemo(
    () => METHODS.find((m) => m.value === method)?.label ?? '',
    [method],
  );

  return (
    <SectionCard title="결제 정보" className={styles.cardOpen}>
      <div className={styles.desc}>주로 사용하는 결제 수단을 등록해 주세요</div>

      <div className={styles.group}>
        <div className={styles.label}>주 결제 방법</div>

        <div className={styles.selectWrap} ref={boxRef}>
          <button
            type="button"
            className={styles.selectBtn}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <span className={styles.value}>{methodLabel}</span>
            <ChevronDown open={open} />
          </button>

          {open && (
            <div className={styles.menu} role="listbox" aria-label="결제 방법 선택">
              {METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`${styles.menuItem} ${m.value === method ? styles.active : ''}`}
                  onClick={() => handleMethodChange(m.value)}
                >
                  {m.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {method === 'bank' && (
        <div className={styles.transferBox}>
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>은행</div>
            <select
              className={styles.input}
              value={bank}
              onChange={(e) => setBank(e.target.value)}
            >
              <option value="" disabled>
                은행을 선택하세요
              </option>
              {BANKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>계좌번호</div>
            <input
              className={styles.input}
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              onBlur={handleAccountSave}
              placeholder="예: 110-123-456789"
              inputMode="numeric"
            />
            <div className={styles.hint}>본인 계좌만 등록할 수 있어요</div>
          </div>
        </div>
      )}
    </SectionCard>
  );
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 120ms' }}
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="#7b8a8b"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
