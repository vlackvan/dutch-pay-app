import { useState } from 'react';
import type { UserBadgeResponse } from '../../../types/api.types';
import styles from '../SettlementDetailPage.module.css';

interface MemberBadgesProps {
  badges: UserBadgeResponse[];
}

export function MemberBadges({ badges }: MemberBadgesProps) {
  if (!badges || badges.length === 0) return null;

  const badgeDescriptions: Record<string, string> = {
    '성실한 다람이': '정산 요청이 오자마자 빛의 속도로 송금 완료!',
    '핑핑이의 집념': '조금 느리지만 결국은 잊지 않고 정산을 완료했어요.',
    '내 카드로 할게': '항상 먼저 카드를 꺼내는 총무같은 당신!',
    '집게사장의 저축': '이번 달은 한 푼도 쓰지 않고 정산만 받았어요.',
    '집게리아 VIP': '이정도는 돈 쓴 것도 아니야.',
    '동전 하나 없는 징징이': '동전 하나만 주워 주실 분?',
  };
  const badgeConditions: Record<string, string> = {
    '성실한 다람이': '(정산 필요해진 후 5분 이내 지불 완료 누름)',
    '핑핑이의 집념': '(정산 필요해진 후 48시간 후 지불 완료 누름)',
    '내 카드로 할게': '(그룹 내 일주일 동안 단일 결제 금액 1위)',
    '집게사장의 저축': '(월간 결제 횟수 0회 & 정산 수령 회수 5회 이상)',
    '집게리아 VIP': '(일주일간 그룹 내 지출 금액 1위)',
    '동전 하나 없는 징징이': '(일주일간 그룹 내 지출 금액 마지막)',
  };
  const [activeBadgeId, setActiveBadgeId] = useState<number | null>(null);
  const visibleBadges = badges.slice(0, 3);
  return (
    <div className={styles.badgeContainer}>
      {visibleBadges.map((userBadge) => {
        const description =
          badgeDescriptions[userBadge.badge.name] ||
          userBadge.badge.description ||
          userBadge.badge.name;
        const condition = badgeConditions[userBadge.badge.name];
        const isActive = activeBadgeId === userBadge.id;

        return (
          <button
            key={userBadge.id}
            type="button"
            className={styles.badgeButton}
            onClick={() =>
              setActiveBadgeId((prev) => (prev === userBadge.id ? null : userBadge.id))
            }
            aria-label={userBadge.badge.name}
          >
            <img
              src={userBadge.badge.icon}
              alt={userBadge.badge.name}
              className={styles.badgeIcon}
            />
            {isActive && (
              <div className={styles.badgeTooltip}>
                <div className={styles.badgeTooltipTitle}>{description}</div>
                {condition && (
                  <div className={styles.badgeTooltipSub}>{condition}</div>
                )}
              </div>
            )}
          </button>
        );
      })}
      {badges.length > 3 && (
        <span className={styles.badgeMore}>+{badges.length - 3}</span>
      )}
    </div>
  );
}
