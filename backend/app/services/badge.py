from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Optional
from decimal import Decimal

from app.models.badge import Badge, GROUP_BADGE_SANDY, GROUP_BADGE_GARY_SNAIL, GROUP_BADGE_USE_MY_CARD, GROUP_BADGE_MR_KRABS, GROUP_BADGE_KRABBY_PATTY_VIP, GROUP_BADGE_NO_COIN_SQUIDWARD
from app.models.user import UserBadge


class BadgeService:
    def __init__(self, db: Session):
        self.db = db

    def check_and_award_payment_speed_badges(
        self, settlement_result, user_id: int, group_id: int
    ):
        """
        Calculate time diff between settlement_result.debt_updated_at (or created_at) and completed_at
        - If <= 5 min: Award Sandy badge
        - If > 48 hours: Award GarySnail badge
        """
        print(f"[BADGE DEBUG] Checking payment speed badges for user_id={user_id}, group_id={group_id}")

        # Use debt_updated_at if available, otherwise fall back to created_at
        debt_time = settlement_result.debt_updated_at or settlement_result.created_at

        print(f"[BADGE DEBUG] completed_at={settlement_result.completed_at}, debt_time={debt_time}")

        if not settlement_result.completed_at or not debt_time:
            print(f"[BADGE DEBUG] Missing timestamps, skipping")
            return

        time_diff = settlement_result.completed_at - debt_time
        time_diff_seconds = time_diff.total_seconds()
        time_diff_minutes = time_diff_seconds / 60
        time_diff_hours = time_diff_seconds / 3600

        print(f"[BADGE DEBUG] Time diff: {time_diff_minutes:.2f} minutes ({time_diff_hours:.2f} hours)")

        # Check for Sandy badge (5 minutes)
        if time_diff_minutes <= 5:
            print(f"[BADGE DEBUG] Awarding Sandy badge (payment within 5 minutes)")
            sandy_badge = self.db.query(Badge).filter(
                Badge.condition_code == GROUP_BADGE_SANDY
            ).first()
            if sandy_badge:
                print(f"[BADGE DEBUG] Sandy badge found: id={sandy_badge.id}")
                result = self._award_badge_if_not_exists(user_id, sandy_badge.id, group_id)
                print(f"[BADGE DEBUG] Award result: {result}")
            else:
                print(f"[BADGE DEBUG] Sandy badge NOT found in database!")

        # Check for GarySnail badge (48 hours)
        if time_diff_hours > 48:
            print(f"[BADGE DEBUG] Awarding GarySnail badge (payment after 48 hours)")
            gary_badge = self.db.query(Badge).filter(
                Badge.condition_code == GROUP_BADGE_GARY_SNAIL
            ).first()
            if gary_badge:
                self._award_badge_if_not_exists(user_id, gary_badge.id, group_id)
            else:
                print(f"[BADGE DEBUG] GarySnail badge NOT found in database!")

    def calculate_weekly_spending_badges(self, group_id: int) -> List[UserBadge]:
        """
        Query settlements from last 7 days:
        - UseMyCard: MAX(total_amount) per payer
        - MrKrabs: MIN(total_amount) per payer
        - KrabbyPattyVIP: SUM(amount_owed) per participant (highest)
        - NoCoinSquidward: SUM(amount_owed) per participant (lowest)

        Remove old weekly badges before awarding new ones.
        Handle ties: award to all users with same value.
        """
        from app.models.settlement import Settlement, SettlementParticipant
        from app.models.group import GroupParticipant
        from sqlalchemy import func

        # Remove old weekly badges
        self.remove_old_weekly_badges(group_id)

        # Get settlements from last 7 days
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        settlements = self.db.query(Settlement).filter(
            Settlement.group_id == group_id,
            Settlement.created_at >= seven_days_ago
        ).all()

        if not settlements:
            return []

        awarded_badges = []

        # Calculate UseMyCard: MAX single payment per payer
        max_single_payment = Decimal("0")
        max_payers: Dict[int, Decimal] = {}  # user_id -> max payment

        for settlement in settlements:
            payer = settlement.payer_participant
            if payer and payer.user_id:
                current_max = max_payers.get(payer.user_id, Decimal("0"))
                if settlement.total_amount > current_max:
                    max_payers[payer.user_id] = settlement.total_amount
                if settlement.total_amount > max_single_payment:
                    max_single_payment = settlement.total_amount

        if max_single_payment > 0:
            use_my_card_badge = self.db.query(Badge).filter(
                Badge.condition_code == GROUP_BADGE_USE_MY_CARD
            ).first()
            if use_my_card_badge:
                for user_id, amount in max_payers.items():
                    if amount == max_single_payment:
                        badge = self._award_badge_if_not_exists(
                            user_id, use_my_card_badge.id, group_id
                        )
                        if badge:
                            awarded_badges.append(badge)

        # Calculate MrKrabs: MIN single payment per payer
        min_single_payment = min([s.total_amount for s in settlements]) if settlements else Decimal("0")
        min_payers: Dict[int, Decimal] = {}  # user_id -> min payment

        for settlement in settlements:
            payer = settlement.payer_participant
            if payer and payer.user_id:
                if payer.user_id not in min_payers:
                    min_payers[payer.user_id] = settlement.total_amount
                else:
                    current_min = min_payers[payer.user_id]
                    if settlement.total_amount < current_min:
                        min_payers[payer.user_id] = settlement.total_amount

        if min_single_payment > 0:
            mr_krabs_badge = self.db.query(Badge).filter(
                Badge.condition_code == GROUP_BADGE_MR_KRABS
            ).first()
            if mr_krabs_badge:
                for user_id, amount in min_payers.items():
                    if amount == min_single_payment:
                        badge = self._award_badge_if_not_exists(
                            user_id, mr_krabs_badge.id, group_id
                        )
                        if badge:
                            awarded_badges.append(badge)

        # Calculate KrabbyPattyVIP: MAX total spending (sum of amount_owed)
        settlement_ids = [s.id for s in settlements]
        spending_query = self.db.query(
            GroupParticipant.user_id,
            func.sum(SettlementParticipant.amount_owed).label("total_spending")
        ).join(
            SettlementParticipant,
            SettlementParticipant.participant_id == GroupParticipant.id
        ).filter(
            SettlementParticipant.settlement_id.in_(settlement_ids),
            GroupParticipant.user_id.isnot(None)
        ).group_by(
            GroupParticipant.user_id
        ).all()

        if spending_query:
            max_spending = max([s.total_spending for s in spending_query])
            krabby_patty_badge = self.db.query(Badge).filter(
                Badge.condition_code == GROUP_BADGE_KRABBY_PATTY_VIP
            ).first()
            if krabby_patty_badge and max_spending > 0:
                for user_id, total_spending in spending_query:
                    if total_spending == max_spending:
                        badge = self._award_badge_if_not_exists(
                            user_id, krabby_patty_badge.id, group_id
                        )
                        if badge:
                            awarded_badges.append(badge)

            # Calculate NoCoinSquidward: MIN total spending
            min_spending = min([s.total_spending for s in spending_query])
            no_coin_badge = self.db.query(Badge).filter(
                Badge.condition_code == GROUP_BADGE_NO_COIN_SQUIDWARD
            ).first()
            if no_coin_badge and min_spending > 0:
                for user_id, total_spending in spending_query:
                    if total_spending == min_spending:
                        badge = self._award_badge_if_not_exists(
                            user_id, no_coin_badge.id, group_id
                        )
                        if badge:
                            awarded_badges.append(badge)

        self.db.commit()
        return awarded_badges

    def remove_old_weekly_badges(self, group_id: int):
        """Remove previous weekly badges for this group."""
        weekly_badge_codes = [
            GROUP_BADGE_USE_MY_CARD,
            GROUP_BADGE_MR_KRABS,
            GROUP_BADGE_KRABBY_PATTY_VIP,
            GROUP_BADGE_NO_COIN_SQUIDWARD,
        ]

        badges = self.db.query(Badge).filter(
            Badge.condition_code.in_(weekly_badge_codes)
        ).all()
        badge_ids = [b.id for b in badges]

        if badge_ids:
            self.db.query(UserBadge).filter(
                UserBadge.group_id == group_id,
                UserBadge.badge_id.in_(badge_ids)
            ).delete(synchronize_session=False)

    def _award_badge_if_not_exists(
        self, user_id: int, badge_id: int, group_id: Optional[int] = None
    ) -> Optional[UserBadge]:
        """Award badge to user if they don't already have it for this group."""
        print(f"[BADGE DEBUG] _award_badge_if_not_exists: user_id={user_id}, badge_id={badge_id}, group_id={group_id}")
        existing = self.db.query(UserBadge).filter(
            UserBadge.user_id == user_id,
            UserBadge.badge_id == badge_id,
            UserBadge.group_id == group_id
        ).first()

        if existing:
            print(f"[BADGE DEBUG] Badge already exists for user, skipping")
            return None

        user_badge = UserBadge(
            user_id=user_id,
            badge_id=badge_id,
            group_id=group_id
        )
        self.db.add(user_badge)
        print(f"[BADGE DEBUG] Badge added to session: {user_badge}")
        return user_badge
