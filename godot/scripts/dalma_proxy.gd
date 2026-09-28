extends Node3D
class_name DalmaProxy

var body: Node3D
var head: Node3D
var neck: Node3D
var muzzle: Node3D
var tail: Node3D
var eyes: Array[Node3D] = []
var ears: Array[Node3D] = []
var legs: Array[Node3D] = []
var phase := 0.0
var locomotion_speed := 3.4
var intensity := 1.0
var base_y := 0.0

func _ready() -> void:
    body = _part("Body", Vector3(1.55,0.78,0.72), Vector3(0,1.34,0))
    neck = _part("Neck", Vector3(0.48,0.54,0.46), Vector3(0,1.92,-0.43))
    head = _part("Head", Vector3(0.95,0.76,0.82), Vector3(0,2.28,-0.78))
    muzzle = _part("Muzzle", Vector3(0.48,0.34,0.48), Vector3(0,2.19,-1.40))
    _part("Nose", Vector3(0.22,0.18,0.28), Vector3(0,2.19,-1.69), Color(0.035,0.035,0.04,1))
    _eye(-0.25,2.43,-1.14)
    _eye(0.25,2.43,-1.14)
    ears.append(_ear(-0.46,2.83,-0.72,-18.0))
    ears.append(_ear(0.46,2.83,-0.72,18.0))
    tail = _part("Tail", Vector3(0.22,0.22,1.35), Vector3(0,1.60,0.82), Color(0.94,0.92,0.86,1))
    tail.rotation_degrees = Vector3(-24,0,0)
    legs.append(_leg("LF",-0.82,0.75,-0.56))
    legs.append(_leg("RF",0.82,0.75,-0.56))
    legs.append(_leg("LB",-0.82,0.75,0.54))
    legs.append(_leg("RB",0.82,0.75,0.54))
    base_y = position.y

func _process(delta: float) -> void:
    phase += delta * locomotion_speed
    var stride := sin(phase) * 0.55 * intensity
    var opposite := sin(phase + PI) * 0.55 * intensity
    legs[0].rotation.x = stride
    legs[1].rotation.x = opposite
    legs[2].rotation.x = opposite
    legs[3].rotation.x = stride

    var bob := abs(sin(phase * 2.0)) * 0.055 * intensity
    body.position.y = 1.34 + bob
    neck.position.y = 1.92 + bob
    head.position.y = 2.28 + bob * 1.12
    muzzle.position.y = 2.19 + bob * 1.08

    head.rotation.z = sin(phase * 0.55) * 0.035 * intensity
    head.rotation.y = sin(phase * 0.70) * 0.055 * intensity
    neck.rotation.z = -head.rotation.z * 0.55
    tail.rotation.z = sin(phase * 0.75) * 0.24 * intensity
    ears[0].rotation.z = -0.32 + sin(phase * 0.65) * 0.035
    ears[1].rotation.z = 0.32 + sin(phase * 0.65 + 0.4) * 0.035

func set_locomotion(active: bool) -> void:
    intensity = 1.0 if active else 0.28
    locomotion_speed = 4.6 if active else 1.9

func walk_to(target: Vector3, duration := 0.75) -> void:
    set_locomotion(true)
    var start := global_position
    var direction := target - start
    if direction.length() > 0.01:
        rotation.y = lerp_angle(rotation.y, atan2(direction.x, direction.z), 0.12)
    var tw := create_tween().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN_OUT)
    tw.tween_property(self, "global_position", target, duration)
    tw.tween_callback(func(): set_locomotion(false))

func celebrate(power := 1.0) -> void:
    var tw := create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
    tw.tween_property(self, "scale", Vector3.ONE * (1.0 + 0.075 * power), 0.14)
    tw.tween_property(self, "rotation_degrees:z", -2.5 * power, 0.08)
    tw.tween_property(self, "rotation_degrees:z", 2.0 * power, 0.08)
    tw.tween_property(self, "rotation_degrees:z", 0.0, 0.15)
    tw.tween_property(self, "scale", Vector3.ONE, 0.20)

func impact() -> void:
    var tw := create_tween().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
    tw.tween_property(self, "rotation_degrees:x", -7.0, 0.07)
    tw.tween_property(self, "position:y", base_y - 0.10, 0.07)
    tw.tween_property(self, "rotation_degrees:x", 3.0, 0.09)
    tw.tween_property(self, "position:y", base_y + 0.025, 0.09)
    tw.tween_property(self, "rotation_degrees:x", 0.0, 0.15)
    tw.tween_property(self, "position:y", base_y, 0.15)

func _part(label: String, size: Vector3, pos: Vector3, color := Color(0.94,0.92,0.86,1)) -> Node3D:
    var n := Node3D.new()
    n.name = label
    n.position = pos
    add_child(n)
    var mi := MeshInstance3D.new()
    var mesh := SphereMesh.new()
    mesh.radius = 0.5
    mesh.height = 1.0
    mi.mesh = mesh
    mi.scale = size
    var mat := StandardMaterial3D.new()
    mat.albedo_color = color
    mat.roughness = 0.48
    mi.material_override = mat
    n.add_child(mi)
    return n

func _leg(label: String, x: float, y: float, z: float) -> Node3D:
    var n := _part(label, Vector3(0.27,0.74,0.27), Vector3(x,y,z))
    return n

func _ear(x: float, y: float, z: float, rot: float) -> Node3D:
    var n := _part("Ear", Vector3(0.23,0.58,0.16), Vector3(x,y,z))
    n.rotation_degrees.z = rot
    return n

func _eye(x: float, y: float, z: float) -> void:
    var n := _part("Eye", Vector3(0.075,0.075,0.075), Vector3(x,y,z), Color(0.64,0.47,0.17,1))
    eyes.append(n)
