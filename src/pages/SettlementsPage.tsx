import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./settlements/SettlementsPage.module.css";

type GroupStatus = "done" | "progress" | "pending";

type Group = {
  id: string;
  title: string;
  emoji: string;
  createdAt: string;
  membersCount: number;
  status: GroupStatus;
};

const STATUS_LABEL: Record<GroupStatus, string> = {
  done: "정산 완료",
  progress: "진행 중",
  pending: "미정산",
};

const DUMMY: Group[] = [
  { id: "1", title: "몰입캠프", emoji: "🏝️", createdAt: "2024년 1월 1일", membersCount: 6, status: "done" },
  { id: "2", title: "튜유", emoji: "🍺", createdAt: "2024년 1월 10일", membersCount: 4, status: "progress" },
  { id: "3", title: "여수", emoji: "🐚", createdAt: "2024년 1월 15일", membersCount: 5, status: "pending" },
  { id: "4", title: "Jeju", emoji: "🍹", createdAt: "2024년 3월 9일", membersCount: 5, status: "done" },
  { id: "5", title: "물고기 마라톤", emoji: "🐟", createdAt: "2024년 4월 1일", membersCount: 7, status: "pending" },
];

type SheetMode = "closed" | "menu" | "create" | "join";

export default function SettlementsPage() {
  const navigate = useNavigate();

  const [groups, setGroups] = useState<Group[]>(DUMMY);
  const [sheet, setSheet] = useState<SheetMode>("closed");

  const [groupTitle, setGroupTitle] = useState("");
  const [currency, setCurrency] = useState("원화 (KRW)");
  const [participants, setParticipants] = useState<string[]>(["나", "김정산"]);
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
    setCurrency("원화 (KRW)");
    setParticipants(["나", "김정산"]);
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
      emoji: "🏝️",
      createdAt,
      membersCount: participants.filter((p) => p.trim()).length,
      status: "progress",
    };

    setGroups((prev) => [newGroup, ...prev]);
    closeAll();
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
      status: "progress",
    };

    setGroups((prev) => [newGroup, ...prev]);
    closeAll();
  };

  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <section className={styles.counter}>
          <div className={styles.characterWrap} aria-hidden="true">
            <div className={styles.characterBubble}>🐸</div>
          </div>
          <div className={styles.listPanel}>
            {groups.map((g) => {
              const statusLabel = STATUS_LABEL[g.status];
              const statusClass =
                g.status === "done"
                  ? styles.statusDone
                  : g.status === "progress"
                    ? styles.statusProgress
                    : styles.statusPending;

              return (
                <button
                  key={g.id}
                  className={styles.groupCard}
                  type="button"
                  onClick={() => navigate(`/settlements/${g.id}`)}
                >
                  <div className={styles.groupIcon} aria-hidden="true">
                    {g.emoji}
                  </div>

                  <div className={styles.groupText}>
                    <div className={styles.groupTitle}>{g.title}</div>
                    <div className={styles.groupMeta}>
                      <span>{g.createdAt}</span>
                      <span className={styles.metaDot}>·</span>
                      <span>{g.membersCount}명</span>
                    </div>
                  </div>

                  <span className={`${styles.groupStatus} ${statusClass}`}>{statusLabel}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <div className={styles.createAction}>
        <button className={styles.createButton} type="button" aria-label="새 정산 만들기" onClick={openMenu}>
          <span className={styles.createPlus}>+</span>
        </button>
        <button className={styles.createLabel} type="button" onClick={openMenu}>
          새 정산 만들기
        </button>
      </div>

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
                    <div className={styles.sheetItemTitle}>이미 있는 그룹에 참여</div>
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
                <div className={styles.sectionTitle}>이름</div>
                <div className={styles.rowField}>
                  <div className={styles.smallIconBox} aria-hidden="true">
                    🏝️
                  </div>
                  <input
                    className={styles.input}
                    placeholder="예: 여름 여행"
                    value={groupTitle}
                    onChange={(e) => setGroupTitle(e.target.value)}
                  />
                </div>

                <div className={styles.sectionTitle}>통화</div>
                <div className={styles.rowField}>
                  <div className={styles.rowLabel}>선택</div>
                  <select className={styles.select} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    <option>원화 (KRW)</option>
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
                  초대 링크를 붙여넣으면 정산 그룹에 참여할 수 있어요.
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
                        alert("클립보드 접근이 불가해요. 직접 붙여넣어 주세요.");
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
