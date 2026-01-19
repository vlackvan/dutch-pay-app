"""
Grant all badges to a user for local/dev testing.
Usage: python -m app.scripts.grant_all_badges_to_user --user bbb
"""

from __future__ import annotations

import argparse
from typing import Optional

from app.database import SessionLocal
from app.models.badge import Badge
from app.models.user import User, UserBadge


def find_user(db, identifier: str) -> Optional[User]:
    user = db.query(User).filter(User.email == identifier).first()
    if user:
        return user
    return db.query(User).filter(User.name == identifier).first()


def grant_all_badges(user_identifier: str, group_id: Optional[int]) -> None:
    db = SessionLocal()
    try:
        user = find_user(db, user_identifier)
        if not user:
            print(f"User not found for identifier: {user_identifier}")
            return

        badges = db.query(Badge).all()
        created = 0
        for badge in badges:
            exists = (
                db.query(UserBadge)
                .filter(
                    UserBadge.user_id == user.id,
                    UserBadge.badge_id == badge.id,
                    UserBadge.group_id == group_id,
                )
                .first()
            )
            if exists:
                continue

            db.add(UserBadge(user_id=user.id, badge_id=badge.id, group_id=group_id))
            created += 1

        db.commit()
        print(f"Granted {created} badges to user id={user.id}")
    except Exception as exc:
        db.rollback()
        print(f"Error granting badges: {exc}")
    finally:
        db.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--user", required=True, help="User email or name (e.g. bbb)")
    parser.add_argument("--group-id", type=int, default=None, help="Optional group id")
    args = parser.parse_args()

    grant_all_badges(args.user, args.group_id)


if __name__ == "__main__":
    main()
