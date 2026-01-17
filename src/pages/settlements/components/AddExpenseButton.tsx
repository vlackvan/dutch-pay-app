import { useMemo, useRef, useState } from "react";
import styles from "../SettlementDetailPage.module.css";

type SplitMode = "equal" | "custom";
type Member = { id: string; name: string; isMe?: boolean };

const MEMBERS: Member[] = [
  { id: "m1", name: "건희" },
  { id: "m2", name: "상범" },
  { id: "m3", name: "○○" },
  { id: "m4", name: "예은 (나)", isMe: true },
  { id: "m5", name: "준한" },
];

const EMOJIS = ["🍀", "🏖️", "🍻", "🍜", "☕", "🍰", "🎟️", "🚕", "🛒", "🏨"];

export default function AddExpenseButton({ onBack }: { onBack: () => void }) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [emoji, setEmoji] = useState("🍀");
  const [emojiOpen, setEmojiOpen] = useState(false);

  const [receiptName, setReceiptName] = useState<string>("");

  const [amount, setAmount] = useState<number | "">("");
  const [payer, setPayer] = useState("예은 (나)");
  const [when, setWhen] = useState(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  });

  const [splitMode, setSplitMode] = useState<SplitMode>("equal");

  // ✅ 체크 상태 (기본: 전원 선택)
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    MEMBERS.forEach((m) => (init[m.id] = true));
    return init;
  });

  // ✅ 커스텀 입력값 (자동 대상 제외한 사람들만 입력)
  const [custom, setCustom] = useState<Record<string, number | "">>(() => {
    const init: Record<string, number | ""> = {};
    MEMBERS.forEach((m) => (init[m.id] = ""));
    return init;
  });

  const selectedIds = useMemo(
    () => MEMBERS.filter((m) => selected[m.id]).map((m) => m.id),
    [selected]
  );

  const amountNumber = typeof amount === "number" ? amount : 0;

  // ===== equal =====
  const equalShare = useMemo(() => {
    const n = selectedIds.length || 1;
    return Math.round(amountNumber / n);
  }, [amountNumber, selectedIds.length]);

  // ===== custom: 자동 대상 1명(기본: 나, 없으면 마지막 선택자) =====
  const autoTargetId = useMemo(() => {
    return selectedIds.length ? selectedIds[selectedIds.length - 1] : MEMBERS[0].id;
  }, [selected, selectedIds]);

  // 자동 대상 제외한 입력 합
  const knownSum = useMemo(() => {
    if (splitMode !== "custom") return 0;
    return selectedIds
      .filter((id) => id !== autoTargetId)
      .reduce((sum, id) => sum + (typeof custom[id] === "number" ? custom[id] : 0), 0);
  }, [custom, selectedIds, splitMode, autoTargetId]);

  // 자동 대상 금액 = 총액 - 입력합 (음수면 0)
  const autoAmount = useMemo(() => {
    if (splitMode !== "custom") return 0;
    const rest = amountNumber - knownSum;
    return rest < 0 ? 0 : rest;
  }, [amountNumber, knownSum, splitMode]);

  const computedRowAmount = (id: string) => {
    if (!selected[id]) return 0;

    if (splitMode === "equal") return equalShare;

    // custom
    if (id === autoTargetId) return autoAmount;
    return typeof custom[id] === "number" ? custom[id] : 0;
  };

  // ✅ 제출 가능 조건: 제목/금액/선택인원만 체크 (custom 합계 검증 X)
  const canSubmit = useMemo(() => {
    if (!title.trim()) return false;
    if (!(amountNumber > 0)) return false;
    if (selectedIds.length === 0) return false;
    return true;
  }, [title, amountNumber, selectedIds.length]);

  return (
    <div>
      {/* 상단바 */}
      <header className={styles.addTop}>
        <button className={styles.addBack} onClick={onBack} type="button" aria-label="뒤로가기">
          ←
        </button>
        <div className={styles.addTitle}>정산 추가</div>
      </header>

      <div className={styles.addFormWrap}>
        {/* 제목 */}
        <div className={styles.blockTitle}>제목</div>
        <div className={styles.titleRow}>
          <input
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 술, 저녁, 택시"
          />

          {/* 이모지 */}
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

          {/* 영수증 */}
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
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              setReceiptName(f ? f.name : "");
            }}
          />
        </div>

        {receiptName ? <div className={styles.receiptHint}>선택된 영수증: {receiptName}</div> : null}

        {/* 금액 */}
        <div className={styles.blockTitle}>금액</div>
        <div className={styles.amountBigRow}>
          <div className={styles.currencyBox}>₩</div>
          <input
            className={styles.amountBigInput}
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="0"
          />
        </div>

        {/* 결제자 / 날짜 */}
        <div className={styles.twoCol}>
          <div>
            <div className={styles.blockTitle}>결제자</div>
            <div className={styles.selectBox}>
              <select className={styles.selectPlain} value={payer} onChange={(e) => setPayer(e.target.value)}>
                {MEMBERS.map((m) => (
                  <option key={m.id} value={m.name}>
                    {m.name}
                  </option>
                ))}
              </select>
              <span className={styles.selectChevron}>▾</span>
            </div>
          </div>

          <div>
            <div className={styles.blockTitle}>날짜</div>
            <div className={styles.selectBox}>
              <input className={styles.dateInput} type="date" value={when} onChange={(e) => setWhen(e.target.value)} />
              <span className={styles.selectChevron}>▾</span>
            </div>
          </div>
        </div>

        {/* 분할 */}
        <div className={styles.splitHeader}>
          <div className={styles.blockTitle}>분할</div>

          <div className={styles.splitMode}>
            <button
              type="button"
              className={`${styles.modeBtn} ${splitMode === "equal" ? styles.modeBtnActive : ""}`}
              onClick={() => setSplitMode("equal")}
            >
              동일하게
            </button>
            <button
              type="button"
              className={`${styles.modeBtn} ${splitMode === "custom" ? styles.modeBtnActive : ""}`}
              onClick={() => setSplitMode("custom")}
            >
              직접 입력
            </button>
          </div>
        </div>

        {/* 멤버 분할 리스트 */}
        <div className={styles.splitList}>
          {MEMBERS.map((m) => {
            const rowAmount = computedRowAmount(m.id);

            return (
              <div key={m.id} className={styles.splitRow}>
                <label className={styles.splitLeft}>
                  <input
                    type="checkbox"
                    checked={!!selected[m.id]}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setSelected((prev) => ({ ...prev, [m.id]: checked }));

                      // 체크 해제하면 입력값 초기화
                      if (!checked) {
                        setCustom((prev) => ({ ...prev, [m.id]: "" }));
                      }
                    }}
                  />
                  <span className={styles.splitName}>{m.name}</span>
                </label>

                {splitMode === "custom" ? (
                  <div className={styles.customInputWrap}>
                    <span className={styles.customWon}>₩</span>
                    <input
                      className={styles.customInput}
                      type="number"
                      disabled={!selected[m.id] || m.id === autoTargetId}
                      value={m.id === autoTargetId ? autoAmount : (custom[m.id] ?? "")}
                      onChange={(e) =>
                        setCustom((prev) => ({
                          ...prev,
                          [m.id]: e.target.value === "" ? "" : Number(e.target.value),
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
          className={`${styles.addSubmitBtn} ${!canSubmit ? styles.addSubmitDisabled : ""}`}
          type="button"
          disabled={!canSubmit}
          onClick={() => {
            const participants = MEMBERS.filter((m) => selected[m.id]).map((m) => m.name).join(", ");

            alert(
              `추가됨(데모)\n제목: ${emoji} ${title}\n금액: ₩${amountNumber.toLocaleString()}\n결제자: ${payer}\n날짜: ${when}\n분할: ${
                splitMode === "equal" ? "동일하게" : "직접 입력(1명 자동)"
              }\n참여자: ${participants}`
            );
            onBack();
          }}
        >
          추가
        </button>
      </div>
    </div>
  );
}
