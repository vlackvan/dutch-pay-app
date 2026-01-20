import sys
import os
from datetime import datetime

# Add the parent directory to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models.badge import Badge
from app.models.user import User, UserBadge
from app.models.group import GroupParticipant

def award_all_badges(identifier: str):
    db = SessionLocal()
    try:
        # Find user by name or email
        user = db.query(User).filter(
            (User.name == identifier) | (User.email == identifier)
        ).first()
        if not user:
            print(f"User '{identifier}' not found!")
            return

        print(f"Found user: {user.name} (ID: {user.id}, Email: {user.email})")

        # Get all badges
        badges = db.query(Badge).all()
        print(f"Found {len(badges)} badges")

        # Get user's first group (for group-specific badges)
        participant = db.query(GroupParticipant).filter(
            GroupParticipant.user_id == user.id
        ).first()

        group_id = participant.group_id if participant else None
        if group_id:
            print(f"Using group_id: {group_id}")
        else:
            print("Warning: User not in any group, awarding badges without group_id")

        # Award each badge
        for badge in badges:
            # Check if already awarded
            existing = db.query(UserBadge).filter(
                UserBadge.user_id == user.id,
                UserBadge.badge_id == badge.id,
                UserBadge.group_id == group_id
            ).first()

            if existing:
                print(f"Badge '{badge.name}' already awarded, skipping.")
                continue

            # Award badge
            user_badge = UserBadge(
                user_id=user.id,
                badge_id=badge.id,
                group_id=group_id,
                earned_at=datetime.utcnow()
            )
            db.add(user_badge)
            print(f"Awarded badge: {badge.name}")

        db.commit()
        print("\nAll badges awarded successfully!")

    except Exception as e:
        print(f"Error awarding badges: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python award_all_badges_to_user.py <name_or_email>")
        sys.exit(1)

    identifier = sys.argv[1]
    award_all_badges(identifier)
