from datetime import datetime
from zoneinfo import ZoneInfo

# Monthly cycles are defined in Pakistan time, matching how the app displays
# kickoff times - a match at 11pm PKT on the 31st shouldn't get bucketed into
# the wrong month just because it's already past midnight in UTC.
PKT = ZoneInfo("Asia/Karachi")


def current_period() -> str:
    """The current monthly cycle, as 'YYYY-MM'."""
    return datetime.now(PKT).strftime("%Y-%m")


def period_for(dt: datetime) -> str:
    """Which monthly cycle a given datetime falls into, as 'YYYY-MM'."""
    return dt.astimezone(PKT).strftime("%Y-%m")
