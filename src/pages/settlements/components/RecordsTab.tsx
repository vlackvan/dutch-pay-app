import { useMemo, useState } from "react";
import type { GroupParticipantResponse, SettlementResponse } from "@/types/api.types";
import styles from "../SettlementDetailPage.module.css";
import { REIMBURSE_ICON } from "@/constants/icons";

interface RecordsTabProps {
  participants: GroupParticipantResponse[];
  settlements: SettlementResponse[];
}

type CategoryKey = "all" | "food" | "drinks" | "transport" | "leisure" | "shopping" | "travel";

const CATEGORY_FILTERS: { key: CategoryKey; label: string; iconMatches?: Set<string> }[] = [
  { key: "all", label: "전체" },
  { key: "food", label: "식비", iconMatches: new Set(["food"]) },
  { key: "drinks", label: "음주", iconMatches: new Set(["beers", "drinks"]) },
  { key: "transport", label: "교통", iconMatches: new Set(["bus", "taxi"]) },
  { key: "leisure", label: "여가", iconMatches: new Set(["bowling", "friendship", "fun", "game", "movie", "music"]) },
  { key: "shopping", label: "쇼핑", iconMatches: new Set(["shopping"]) },
  { key: "travel", label: "여행", iconMatches: new Set(["travel", "sea", "mountain", "relax"]) },
];

const normalizeUrl = (url?: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  return `http://localhost:8000${url}`;
};

const getIconKey = (icon: string | null | undefined) => {
  if (!icon || !icon.startsWith("/")) return null;
  const fileName = icon.split("/").pop();
  if (!fileName) return null;
  return fileName.replace(".png", "");
};

const getCategoryKey = (icon: string | null | undefined): CategoryKey | "other" => {
  const iconKey = getIconKey(icon);
  if (!iconKey) return "other";
  for (const filter of CATEGORY_FILTERS) {
    if (filter.key === "all") continue;
    if (filter.iconMatches?.has(iconKey)) return filter.key;
  }
  return "other";
};

export default function RecordsTab({ participants, settlements }: RecordsTabProps) {
  const [category, setCategory] = useState<CategoryKey>("all");

  const ranked = useMemo(() => {
    const totals = new Map<number, number>();
    participants.forEach((p) => totals.set(p.id, 0));

    settlements.forEach((s) => {
      const iconKey = getIconKey(s.icon);
      if (iconKey === "reimburse" || s.title === "환급" || s.icon === REIMBURSE_ICON) return;
      if (category !== "all" && getCategoryKey(s.icon) !== category) return;
      s.participants.forEach((sp) => {
        const current = totals.get(sp.participant_id) || 0;
        totals.set(sp.participant_id, current + (Number(sp.amount_owed) || 0));
      });
    });

    return participants
      .map((p) => ({
        participant: p,
        amount: totals.get(p.id) || 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [participants, settlements, category]);

  const podium = ranked.slice(0, 3);
  const rest = ranked.slice(3);

  if (participants.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>?懃</div>
        <div className={styles.emptyText}>氅る矂臧€ ?嗢姷?堧嫟</div>
      </div>
    );
  }

  return (
    <section className={styles.recordsWrap}>
      <div className={styles.recordsFilters}>
        {CATEGORY_FILTERS.map((item) => (
          <button
            key={item.key}
            type="button"
            className={`${styles.recordsFilterBtn} ${category === item.key ? styles.recordsFilterBtnActive : ""}`}
            onClick={() => setCategory(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className={styles.podiumStage}>
        {podium.map((entry, index) => {
          const p = entry.participant;
          const fullBody = normalizeUrl(p.user_full_body_photo_url);
          const profile = normalizeUrl(p.user_profile_photo_url);
          const isFirst = index === 0;
          const order = index === 0 ? 1 : index === 1 ? 2 : 3;
          const wrapClass = fullBody
            ? `${styles.podiumAvatarWrap} ${styles.podiumAvatarWrapBody}`
            : `${styles.podiumAvatarWrap} ${styles.podiumAvatarWrapFace}`;
          return (
            <div
              key={p.id}
              className={`${styles.podiumSlot} ${isFirst ? styles.podiumSlotFirst : ""}`}
              data-rank={order}
            >
              <div className={wrapClass}>
                <div
                  className={`${styles.podiumName} ${fullBody ? styles.podiumNameBody : ""}`}
                >
                  {p.name}
                </div>
                {fullBody ? (
                  <img src={fullBody} alt={p.name} className={styles.podiumAvatarBody} />
                ) : profile ? (
                  <img src={profile} alt={p.name} className={styles.podiumAvatarFace} />
                ) : (
                  <div className={styles.podiumAvatarFallback}>{p.name.slice(0, 1)}</div>
                )}
                <div className={styles.podiumAmount}>
                  {entry.amount.toLocaleString()}원
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {rest.length > 0 && (
        <div className={styles.recordsList}>
          {rest.map((entry, index) => {
            const p = entry.participant;
            const profile = normalizeUrl(p.user_profile_photo_url);
            return (
              <div key={p.id} className={styles.memberCard}>
                <div className={styles.recordRankBadge}>{index + 4}등</div>
                <div className={styles.avatar}>
                  {profile ? (
                    <img src={profile} alt={p.name} className={styles.avatarImage} />
                  ) : (
                    p.name.slice(0, 1)
                  )}
                </div>
                <div className={styles.memberInfo}>
                  <div className={styles.memberInfoRow}>
                    <div className={styles.memberText}>
                      <div className={styles.memberRow}>
                        <div className={styles.memberNickname}>{p.name}</div>
                      </div>
                      <div className={styles.memberName}>{p.user_name || "Unclaimed"}</div>
                    </div>
                  </div>
                </div>
                <div className={styles.recordAmount}>{entry.amount.toLocaleString()}원</div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
