extends RefCounted
class_name GameRules

static func resolve_event(risk: bool, roll: float, reward_multiplier: float) -> Dictionary:
    var safe := clampf(reward_multiplier, 0.0, 100.0)
    if not risk:
        return {
            "success": true,
            "coins": int(round(220.0 * safe)),
            "xp": 8,
            "keys": 0
        }

    var success := roll < 0.62
    var coins := 620.0 if success else 40.0
    return {
        "success": success,
        "coins": int(round(coins * safe)),
        "xp": 22 if success else 8,
        "keys": 1 if success else 0
    }
