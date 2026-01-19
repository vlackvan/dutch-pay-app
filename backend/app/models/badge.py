from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.sql import func

from app.database import Base


class Badge(Base):
    __tablename__ = "badges"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(255), nullable=True)  # Icon URL or identifier

    # Badge type: monthly, cumulative, special
    badge_type = Column(String(50), default="special")

    # Condition for earning (stored as JSON string or condition code)
    condition_code = Column(String(100), nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())


# Predefined badges:
# - game_master: 게임 마스터 (미니게임 3회 이상 승리)
# - penny_pincher: 구두쇠 (한 달간 결제 0회)
# - big_spender: 큰손 (한 달간 가장 많이 결제)
# - kakaopay_rich: 카카오페이 부자 (카카오페이로 10회 이상 정산)
# - quick_settler: 빠른 정산러 (정산 요청 후 1시간 내 완료)
# - group_founder: 그룹 창시자 (그룹 3개 이상 생성)

# Group-specific badges
GROUP_BADGE_SANDY = "sandy"
GROUP_BADGE_GARY_SNAIL = "gary_snail"
GROUP_BADGE_USE_MY_CARD = "use_my_card"
GROUP_BADGE_MR_KRABS = "mr_krabs"
GROUP_BADGE_KRABBY_PATTY_VIP = "krabby_patty_vip"
GROUP_BADGE_NO_COIN_SQUIDWARD = "no_coin_squidward"
