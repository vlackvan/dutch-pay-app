import { useEffect, useMemo, useState } from "react";
import styles from "./settlements/SettlementsPage.module.css";
import { useNavigate } from "react-router-dom";

type Group = {
  id: string;
  title: string;
  emoji: string;
  createdAt: string;
  membersCount: number;
};

const DUMMY: Group[] = [
  { id: "1", title: "몰입캠프", emoji: "🍀", createdAt: "2024년 1월 1일", membersCount: 6 },
  { id: "2", title: "튜유", emoji: "🏖️", createdAt: "2024년 1월 10일", membersCount: 4 },
  { id: "3", title: "여수", emoji: "🏖️", createdAt: "2024년 1월 15일", membersCount: 5 },
  { id: "4", title: "Flat 96 and others 🇬🇧", emoji: "🤠", createdAt: "2024년 2월 2일", membersCount: 7 },
  { id: "5", title: "Jeju", emoji: "🏖️", createdAt: "2024년 3월 9일", membersCount: 5 },
  { id: "6", title: "Birmingham 🇬🇧", emoji: "🇬🇧", createdAt: "2024년 4월 1일", membersCount: 3 },
  { id: "7", title: "Barcelona", emoji: "🇪🇸", createdAt: "2024년 5월 15일", membersCount: 4 },
];

type SheetMode = "closed" | "menu" | "create" | "join";

export default function SettlementsPage() {
  const navigate = useNavigate(); // ✅ 추가

  const [groups, setGroups] = useState<Group[]>(DUMMY);
  const [sheet, setSheet] = useState<SheetMode>("closed");

  const [groupTitle, setGroupTitle] = useState("");
  const [currency, setCurrency] = useState("대한민국 원 (KRW)");
  const [participants, setParticipants] = useState<string[]>(["예은 김"]);
  const [newParticipant, setNewParticipant] = useState("");

  const [inviteLink, setInviteLink] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheet("closed");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const openMenu = () => setSheet("menu");

  const resetForms = () => {
    setGroupTitle("");
    setCurrency("대한민국 원 (KRW)");
    setParticipants(["예은 김"]);
    setNewParticipant("");
    setInviteLink("");
  };

  const closeAll = () => {
    setSheet("closed");
    resetForms();
  };

  const goMenu = () => setSheet("menu");
  const goCreate = () => setSheet("create");
  const goJoin = () => setSheet("join");

  const canCreate = useMemo(() => {
    const titleOk = groupTitle.trim().length > 0;
    const peopleOk = participants.filter((p) => p.trim().length > 0).length >= 1;
    return titleOk && peopleOk;
  }, [groupTitle, participants]);

  const addParticipant = () => {
    const name = newParticipant.trim();
    if (!name) return;
    setParticipants((prev) => [...prev, name]);
    setNewParticipant("");
  };

  const removeParticipant = (idx: number) => {
    if (idx === 0) return;
    setParticipants((prev) => prev.filter((_, i) => i !== idx));
  };

  const createGroup = () => {
    if (!canCreate) return;

    const newId = String(Date.now());
    const today = new Date();
    const createdAt = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    const newGroup: Group = {
      id: newId,
      title: groupTitle.trim(),
      emoji: "🏖️",
      createdAt,
      membersCount: participants.filter((p) => p.trim()).length,
    };

    setGroups((prev) => [newGroup, ...prev]);
    closeAll();

    // ✅ 생성 직후 상세로 이동하고 싶으면 주석 해제
    // navigate(`/settlements/${newId}`);
  };

  const joinGroup = () => {
    if (!inviteLink.trim()) return;

    const newId = String(Date.now());
    const today = new Date();
    const createdAt = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;

    const newGroup: Group = {
      id: newId,
      title: "초대받은 그룹",
      emoji: "🔗",
      createdAt,
      membersCount: 2,
    };

    setGroups((prev) => [newGroup, ...prev]);
    closeAll();

    // ✅ 참여 직후 상세로 이동하고 싶으면 주석 해제
    // navigate(`/settlements/${newId}`);
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.logoRow}>
          <div className={styles.logo}>tricount</div>
          <div className={styles.by}>by bunq</div>
        </div>
      </header>

      <main className={styles.list}>
        {groups.map((g) => (
          <button
            key={g.id}
            className={styles.card}
            type="button"
            onClick={() => navigate(`/settlements/${g.id}`)} // ✅ 여기만 교체!
          >
            <div className={styles.left}>
              <div className={styles.emoji} aria-hidden="true">
                {g.emoji}
              </div>

              <div className={styles.text}>
                <div className={styles.title}>{g.title}</div>
                <div className={styles.meta}>
                  <span>{g.createdAt}</span>
                  <span className={styles.dot}>•</span>
                  <span>{g.membersCount}명</span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </main>

      <button className={styles.fab} type="button" aria-label="새 그룹 만들기" onClick={openMenu}>
        +
      </button>
      <button className={styles.fabLabel} type="button" onClick={openMenu}>
        새 그룹 만들기
      </button>

      {sheet !== "closed" && (
        <div className={styles.overlay} role="dialog" aria-modal="true">
          <div className={styles.backdrop} onClick={closeAll} />

          {sheet === "menu" && (
            <div className={styles.sheet}>
              <div className={styles.sheetHeader}>
                <button className={styles.closeX} onClick={closeAll} aria-label="닫기">
                  ×
                </button>
                <div className={styles.sheetTitleCenter}>추가</div>
                <div />
              </div>

              <div className={styles.sheetBody}>
                <button className={styles.sheetItem} type="button" onClick={goCreate}>
                  <div className={`${styles.sheetIconCircle} ${styles.blueCircle}`}>
                    <span className={styles.iconPlus}>+</span>
                  </div>
                  <div className={styles.sheetItemText}>
                    <div className={styles.sheetItemTitle}>새 그룹 만들기</div>
                    <div className={styles.sheetItemSub}>새로운 정산 그룹을 만들어요.</div>
                  </div>
                  <div className={styles.sheetChev}>›</div>
                </button>

                <button className={styles.sheetItem} type="button" onClick={goJoin}>
                  <div className={`${styles.sheetIconCircle} ${styles.greenCircle}`}>
                    <span className={styles.iconLink}>🔗</span>
                  </div>
                  <div className={styles.sheetItemText}>
                    <div className={styles.sheetItemTitle}>이미 있는 그룹에 참여하기</div>
                    <div className={styles.sheetItemSub}>초대 링크로 그룹에 참여해요.</div>
                  </div>
                  <div className={styles.sheetChev}>›</div>
                </button>
              </div>
            </div>
          )}

          {sheet === "create" && (
            <div className={styles.sheetFull}>
              <div className={styles.navBar}>
                <button className={styles.navLeft} onClick={goMenu} type="button">
                  취소
                </button>
                <div className={styles.navTitle}>그룹 추가</div>
                <div />
              </div>

              <div className={styles.form}>
                <div className={styles.sectionTitle}>제목</div>
                <div className={styles.rowField}>
                  <div className={styles.smallIconBox} aria-hidden="true">
                    🏖️
                  </div>
                  <input
                    className={styles.input}
                    placeholder="예: 제주 여행"
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                  />
                </div>

                <div className={styles.sectionTitle}>옵션</div>
                <div className={styles.rowField}>
                  <div className={styles.rowLabel}>통화</div>
                  <select className={styles.select} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option>대한민국 원 (KRW)</option>
                    <option>미국 달러 (USD)</option>
                    <option>유로 (EUR)</option>
                    <option>영국 파운드 (GBP)</option>
                  </select>
                </div>

                <div className={styles.sectionTitle}>참여자</div>
                <div className={styles.participantsBox}>
                  <div className={styles.participantRow}>
                    <div className={styles.participantName}>{participants[0]}</div>
                    <div className={styles.meBadge}>나</div>
                  </div>

                  {participants.slice(1).map((p, i) => (
                    <div key={`${p}-${i}`} className={styles.participantRow}>
                      <div className={styles.participantName}>{p}</div>
                      <button className={styles.removeBtn} type="button" onClick={() => removeParticipant(i + 1)}>
                        ×
                      </button>
                    </div>
                  ))}

                  <div className={styles.participantRow}>
                    <input
                      className={styles.participantInput}
                      placeholder="참여자 이름"
                      value={newParticipant}
                      onChange={(e) => setNewParticipant(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addParticipant();
                      }}
                    />
                  </div>

                  <button className={styles.addAnother} type="button" onClick={addParticipant}>
                    참여자 추가
                  </button>
                </div>

                <button
                  className={`${styles.primaryBtn} ${!canCreate ? styles.disabled : ""}`}
                  type="button"
                  onClick={createGroup}
                  disabled={!canCreate}
                >
                  그룹 만들기
                </button>
              </div>
            </div>
          )}

          {sheet === "join" && (
            <div className={styles.sheetFull}>
              <div className={styles.navBar}>
                <button className={styles.navLeft} onClick={goMenu} type="button">
                  취소
                </button>
                <div className={styles.navTitle}>그룹 참여</div>
                <div />
              </div>

              <div className={styles.joinWrap}>
                <div className={styles.joinIcon} aria-hidden="true">
                  🔗
                </div>
                <div className={styles.joinTitle}>그룹에 참여하기</div>
                <div className={styles.joinDesc}>
                  다른 참여자에게서 초대 링크를 받아 붙여넣어 주세요.
                </div>

                <div className={styles.pasteRow}>
                  <input
                    className={styles.pasteInput}
                    placeholder="초대 링크 붙여넣기"
                    value={inviteLink}
                    onChange={(e) => setInviteLink(e.target.value)}
                  />
                  <button
                    className={styles.pasteBtn}
                    type="button"
                    onClick={async () => {
                      try {
                        const text = await navigator.clipboard.readText();
                        if (text) setInviteLink(text);
                      } catch {
                        alert("클립보드 접근이 허용되지 않았어요. 직접 붙여넣어 주세요!");
                      }
                    }}
                  >
                    붙여넣기
                  </button>
                </div>

                <button
                  className={`${styles.primaryBtn} ${!inviteLink.trim() ? styles.disabled : ""}`}
                  type="button"
                  onClick={joinGroup}
                  disabled={!inviteLink.trim()}
                >
                  참여
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
