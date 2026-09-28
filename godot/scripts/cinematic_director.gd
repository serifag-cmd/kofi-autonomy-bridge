extends Node

var camera: Camera3D

func _ready() -> void:
    camera = get_parent().get_node("CameraRig/Camera3D")

func roll_cinematic(center: Vector3, duration := 1.1) -> void:
    var original := camera.position
    var target := center + Vector3(0, 8.5, 11.5)
    var tw := create_tween().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
    tw.tween_property(camera, "position", target, duration * 0.45)
    tw.tween_interval(duration * 0.18)
    tw.tween_property(camera, "position", original, duration * 0.37)
