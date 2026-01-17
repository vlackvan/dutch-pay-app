import { useEffect, useMemo, useRef, useState } from 'react';
import { SectionCard } from './SectionCard';
import styles from './PaymentCard.module.css';

type PaymentMethod = '카카오페이' | '토스' | '네이버페이' | '계좌이체' | '신용/체크카드';

const METHODS: PaymentMethod[] = ['카카오페이', '토스', '네이버페이', '계좌이체', '신용/체크카드'];

const BANKS = [
  '국민은행', '신한은행', '우리은행', '하나은행', '농협', '기업은행',
  '카카오뱅크', '토스뱅크', '케이뱅크', '새마을금고', '우체국'
];

export function PaymentCard() {
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('카카오페이');

  // 계좌이체 추가 입력
  const [bank, setBank] = useState('');
  const [account, setAccount] = useState('');

  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // 결제수단 바뀔 때 계좌이체 아니면 입력값 숨김(값 유지하고 싶으면 이 부분 제거)
  useEffect(() => {
    if (method !== '계좌이체') {
      // setBank(''); setAccount(''); // 값까지 지우고 싶으면 주석 해제
      setOpen(false);
    }
  }, [method]);

  const methodLabel = useMemo(() => method ?? '', [method]);

  return (
    <SectionCard title="결제 정보">
      <div className={styles.desc}>주로 사용하는 결제 수단을 등록해주세요</div>

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
                  key={m}
                  type="button"
                  className={`${styles.menuItem} ${m === method ? styles.active : ''}`}
                  onClick={() => {
                    setMethod(m);
                    setOpen(false);
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {method === '계좌이체' && (
        <div className={styles.transferBox}>
          <div className={styles.fieldGroup}>
            <div className={styles.fieldLabel}>은행</div>
            <select
              className={styles.input}
              value={bank}
              onChange={(e) => setBank(e.target.value)}
            >
              <option value="" disabled>
                은행 선택
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
              placeholder="예) 110-123-456789"
              inputMode="numeric"
            />
            <div className={styles.hint}>본인 계좌만 등록해주세요</div>
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
        stroke="#9CA3AF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
