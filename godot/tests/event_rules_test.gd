extends SceneTree

const GameRules = preload("res://scripts/game_rules.gd")

func _init() -> void:
    var safe := GameRules.resolve_event(false, 0.0, 1.0)
    assert(int(safe["coins"]) == 220)
    assert(int(safe["xp"]) == 8)
    assert(int(safe["keys"]) == 0)

    var risk_win := GameRules.resolve_event(true, 0.10, 1.0)
    assert(risk_win["success"] == true)
    assert(int(risk_win["coins"]) == 620)
    assert(int(risk_win["xp"]) == 22)
    assert(int(risk_win["keys"]) == 1)

    var risk_loss := GameRules.resolve_event(true, 0.90, 1.0)
    assert(risk_loss["success"] == false)
    assert(int(risk_loss["coins"]) == 40)
    assert(int(risk_loss["xp"]) == 8)
    assert(int(risk_loss["keys"]) == 0)

    print("EVENT_RULES_TEST=PASS")
    quit()
