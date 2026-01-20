import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import styles from './SpendingCard.module.css';
import { useMyGroups, groupKeys } from '@/hooks/queries/useGroups';
import { groupsApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { IconDisplay } from '@/components/IconPicker/IconPicker';
import { REIMBURSE_ICON } from '@/constants/icons';
import type { SettlementResponse } from '@/types/api.types';

type CategoryKey = 'food' | 'drinks' | 'transport' | 'leisure' | 'shopping' | 'travel' | 'other';

const CATEGORY_CONFIG: {
  key: CategoryKey;
  label: string;
  icon: string;
  color: string;
  matches?: Set<string>;
}[] = [
  { key: 'food', label: '식비', icon: '/icons/food.png', color: '#2f7edb', matches: new Set(['food']) },
  { key: 'drinks', label: '음주', icon: '/icons/beers.png', color: '#37b7a5', matches: new Set(['beers', 'drinks']) },
  { key: 'transport', label: '교통', icon: '/icons/bus.png', color: '#f5b24b', matches: new Set(['bus', 'taxi']) },
  { key: 'leisure', label: '여가', icon: '/icons/fun.png', color: '#d688c7', matches: new Set(['bowling', 'friendship', 'fun', 'game', 'movie', 'music']) },
  { key: 'shopping', label: '쇼핑', icon: '/icons/shopping.png', color: '#7a8a8b', matches: new Set(['shopping']) },
  { key: 'travel', label: '여행', icon: '/icons/travel.png', color: '#6aa6d6', matches: new Set(['travel', 'sea', 'mountain', 'relax']) },
  { key: 'other', label: '기타', icon: '/icons/others.png', color: '#8b8b8b' },
];

const CATEGORY_INDEX = CATEGORY_CONFIG.reduce((acc, category) => {
  acc[category.key] = category;
  return acc;
}, {} as Record<CategoryKey, (typeof CATEGORY_CONFIG)[number]>);

const CATEGORY_KEYS = CATEGORY_CONFIG.map((category) => category.key);

function getIconKey(icon: string | null | undefined) {
  if (!icon) return null;
  if (!icon.startsWith('/')) return null;
  const fileName = icon.split('/').pop();
  if (!fileName) return null;
  return fileName.replace('.png', '');
}

function getCategoryKey(icon: string | null | undefined): CategoryKey {
  const iconKey = getIconKey(icon);
  if (!iconKey) return 'other';
  for (const category of CATEGORY_CONFIG) {
    if (category.matches?.has(iconKey)) return category.key;
  }
  return 'other';
}

export function SpendingCard() {
  const currentUser = useAuthStore((state) => state.user);
  const { data: groups = [] } = useMyGroups();

  const settlementQueries = useQueries({
    queries: groups.map((group) => ({
      queryKey: groupKeys.settlements(group.id),
      queryFn: () => groupsApi.getSettlements(group.id),
      enabled: !!group.id,
    })),
  });

  const settlements = useMemo(
    () => settlementQueries.flatMap((query) => query.data ?? []),
    [settlementQueries]
  );

  const { totalAmount, categoryTotals } = useMemo(() => {
    const totals = CATEGORY_KEYS.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {} as Record<CategoryKey, number>);

    if (!currentUser?.id) {
      return { totalAmount: 0, categoryTotals: totals };
    }

    settlements.forEach((settlement: SettlementResponse) => {
      const iconKey = getIconKey(settlement.icon);
      if (iconKey === 'reimburse' || settlement.title === '상환' || settlement.icon === REIMBURSE_ICON) {
        return;
      }

      const myShare = settlement.participants.find((p) => p.user_id === currentUser.id);
      if (!myShare) return;

      const amount = Number(myShare.amount_owed) || 0;
      if (amount <= 0) return;

      const categoryKey = getCategoryKey(settlement.icon);
      totals[categoryKey] += amount;
    });

    const sum = Object.values(totals).reduce((acc, value) => acc + value, 0);
    return { totalAmount: sum, categoryTotals: totals };
  }, [currentUser?.id, settlements]);

  const items = useMemo(() => {
    return CATEGORY_CONFIG.map((category) => {
      const amount = categoryTotals[category.key] || 0;
      const percent = totalAmount > 0 ? Math.round((amount / totalAmount) * 100) : 0;
      return {
        ...category,
        amount,
        percent,
      };
    });
  }, [categoryTotals, totalAmount]);

  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <div className={styles.title}>생활 기록 요약</div>
        <div className={styles.sub}>이번 달</div>
      </div>

      <div className={styles.total}>₩{Math.round(totalAmount || 0).toLocaleString()}</div>
      <div className={styles.totalLabel}>총 정산 금액</div>

      <ul className={styles.list}>
        {items.map((item) => (
          <Item
            key={item.key}
            label={item.label}
            amount={item.amount}
            percent={item.percent}
            color={item.color}
            icon={item.icon}
          />
        ))}
      </ul>
    </section>
  );
}

function Item({
  label,
  amount,
  percent,
  color,
  icon,
}: {
  label: string;
  amount: number;
  percent: number;
  color: string;
  icon: string;
}) {
  return (
    <li className={styles.item}>
      <div className={styles.row}>
        <span className={styles.labelWrap}>
          <IconDisplay icon={icon} size="18px" className={styles.categoryIcon} />
          <span className={styles.label}>{label}</span>
        </span>
        <span className={styles.amount}>
          ₩{Math.round(amount || 0).toLocaleString()}
          <span className={styles.percent}>{percent}%</span>
        </span>
      </div>
      <div className={styles.barBg}>
        <div className={styles.bar} style={{ width: `${percent}%`, background: color }} />
      </div>
    </li>
  );
}
