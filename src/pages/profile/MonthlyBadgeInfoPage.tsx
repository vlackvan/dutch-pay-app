import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MonthlyBadgeInfoPage.module.css';

const badgeInfo = [
  {
    name: '성실한 다람이',
    icon: '/badges/Sandy.png',
    description: '정산 요청이 오자마자 빛의 속도로 송금 완료!',
    condition: '(정산 필요해진 후 5분 이내 지불 완료 누름)',
  },
  {
    name: '핑핑이의 집념',
    icon: '/badges/GarySnail.png',
    description: '조금 느리지만 결국은 잊지 않고 정산을 완료했어요.',
    condition: '(정산 필요해진 후 48시간 후 지불 완료 누름)',
  },
  {
    name: '내 카드로 할게',
    icon: '/badges/UseMyCard.png',
    description: '항상 먼저 카드를 꺼내는 총무같은 당신!',
    condition: '(그룹 내 일주일 동안 단일 결제 금액 1위)',
  },
  {
    name: '집게사장의 저축',
    icon: '/badges/MrKrabs.png',
    description: '이번 달은 한 푼도 쓰지 않고 정산만 받았어요.',
    condition: '(월간 결제 횟수 0회 & 정산 수령 회수 5회 이상)',
  },
  {
    name: '집게리아 VIP',
    icon: '/badges/KrabbyPattyVIP.png',
    description: '이정도는 돈 쓴 것도 아니야.',
    condition: '(일주일간 그룹 내 지출 금액 1위)',
  },
  {
    name: '동전 하나 없는 징징이',
    icon: '/badges/NoCoinSquidward.png',
    description: '동전 하나만 주워 주실 분?',
    condition: '(일주일간 그룹 내 지출 금액 마지막)',
  },
];

export default function MonthlyBadgeInfoPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className={styles.page}>
      <header className={styles.appBar}>
        <button
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label="뒤로가기"
          type="button"
        >
          ‹
        </button>
        <div className={styles.appTitle}>배지 안내</div>
      </header>

      <div className={styles.divider} />

      <main className={styles.content}>
        <section className={styles.card}>
          <div className={styles.grid}>
            {badgeInfo.map((badge) => (
              <div key={badge.name} className={styles.item}>
                <img className={styles.icon} src={badge.icon} alt={badge.name} />
                <div className={styles.text}>
                  <div className={styles.name}>{badge.name}</div>
                  <div className={styles.desc}>{badge.description}</div>
                  <div className={styles.cond}>{badge.condition}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
