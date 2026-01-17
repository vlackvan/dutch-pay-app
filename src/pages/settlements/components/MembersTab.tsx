import styles from "../SettlementDetailPage.module.css";

type Member = {
  id: string;
  nickname: string;
  name: string;
  tags?: string[];
};

const DUMMY_MEMBERS: Member[] = [
  { id: "m1", nickname: "철수", name: "김철수", tags: ["그룹장", "💰 구두쇠", "🎮 게임 마스터"] },
  { id: "m2", nickname: "영희", name: "이영희", tags: ["🎉 파티 플래너"] },
  { id: "m3", nickname: "민수", name: "박민수" },
  { id: "m4", nickname: "수진", name: "정수진", tags: ["💰 구두쇠"] },
  { id: "m5", nickname: "동욱", name: "최동욱", tags: ["🍀 럭키 세븐"] },
];

export default function MembersTab() {
  return (
    <>
      <div className={styles.membersTop}>
        <button className={styles.inviteBtn} type="button">
          👤 멤버 초대
        </button>
      </div>

      <main className={styles.memberList}>
        {DUMMY_MEMBERS.map((m) => (
          <div key={m.id} className={styles.memberCard}>
            <div className={styles.avatar}>{m.nickname.slice(0, 1)}</div>
            <div className={styles.memberInfo}>
              <div className={styles.memberRow}>
                <div className={styles.memberNickname}>{m.nickname}</div>
                <div className={styles.tags}>
                  {(m.tags ?? []).map((t) => (
                    <span key={t} className={styles.tag}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.memberName}>{m.name}</div>
            </div>
          </div>
        ))}
      </main>
    </>
  );
}
