"""
Seed script for group-specific badges.
Usage: python -m app.scripts.seed_group_badges
"""

from app.database import SessionLocal
from app.models.badge import (
    Badge,
    GROUP_BADGE_SANDY,
    GROUP_BADGE_GARY_SNAIL,
    GROUP_BADGE_USE_MY_CARD,
    GROUP_BADGE_MR_KRABS,
    GROUP_BADGE_KRABBY_PATTY_VIP,
    GROUP_BADGE_NO_COIN_SQUIDWARD,
)


def seed_group_badges():
    db = SessionLocal()
    try:
        badges_data = [
            {
                "name": "성실한 다람이",
                "description": "정산 요청 후 5분 이내 지불 완료",
                "icon": "/badges/Sandy.png",
                "badge_type": "special",
                "condition_code": GROUP_BADGE_SANDY,
            },
            {
                "name": "핑핑이의 집념",
                "description": "정산 요청 후 48시간 이후 지불 완료",
                "icon": "/badges/GarySnail.png",
                "badge_type": "special",
                "condition_code": GROUP_BADGE_GARY_SNAIL,
            },
            {
                "name": "내 카드로 할게",
                "description": "일주일 간 그룹 내 단일 결제 금액 1위",
                "icon": "/badges/UseMyCard.png",
                "badge_type": "special",
                "condition_code": GROUP_BADGE_USE_MY_CARD,
            },
            {
                "name": "집게사장의 저축",
                "description": "일주일 간 그룹 내 단일 결제 금액 마지막",
                "icon": "/badges/MrKrabs.png",
                "badge_type": "special",
                "condition_code": GROUP_BADGE_MR_KRABS,
            },
            {
                "name": "집게리아 VIP",
                "description": "일주일 간 그룹 내 개인 지출 1위",
                "icon": "/badges/KrabbyPattyVIP.png",
                "badge_type": "special",
                "condition_code": GROUP_BADGE_KRABBY_PATTY_VIP,
            },
            {
                "name": "동전 하나 없는 징징이",
                "description": "일주일 간 그룹 내 지출 마지막",
                "icon": "/badges/NoCoinSquidward.png",
                "badge_type": "special",
                "condition_code": GROUP_BADGE_NO_COIN_SQUIDWARD,
            },
        ]

        for badge_data in badges_data:
            existing = (
                db.query(Badge)
                .filter(Badge.condition_code == badge_data["condition_code"])
                .first()
            )
            if existing:
                print(f"Badge '{badge_data['name']}' already exists, skipping.")
                continue

            badge = Badge(**badge_data)
            db.add(badge)
            print(f"Created badge: {badge_data['name']}")

        db.commit()
        print("Badge seeding completed successfully!")

    except Exception as e:
        print(f"Error seeding badges: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_group_badges()
