extends Node3D
class_name DalmaProxy

var body: Node3D
var head: Node3D
var tail: Node3D
var left_front: Node3D
var right_front: Node3D
var left_back: Node3D
var right_back: Node3D
var phase := 0.0

func _ready() -> void:
    body = _part("Body", Vector3(1.55,0.78,0.72), Vector3(0,1.3,0))
    head = _part("Head", Vector3(0.95,0.76,0.82), Vector3(0,2.25,-0.72))
    _part("Muzzle", Vector3(0.48,0.34,0.48), Vector3(0,2.18,-1.35))
    _part("Nose", Vector3(0.22,0.18,0.28), Vector3(0,2.18,-1.62), Color(0.04,0.04,0.045,1))
    tail = _part("Tail", Vector3(0.24,0.24,1.35), Vector3(0,1.65,0.78), Color(0.94,0.92,0.86,1))
    tail.rotation_degrees = Vector3(-24,0,0)
    left_front = _leg("LF",-0.82,0.72,-0.52)
    right_front = _leg("RF",0.82,0.72,-0.52)
    left_back = _leg("LB",-0.82,0.72,0.54)
    right_back = _leg("RB",0.82,0.72,0.54)
    _ear(-0.42,2.82,-0.62,-18.0)
    _ear(0.42,2.82,-0.62,18.0)
    _spot(Vector3(-0.34,2.45,-1.25),0.11)
    _spot(Vector3(0.36,2.35,-1.05),0.10)
    _spot(Vector3(-0.62,1.55,-0.60),0.16)
    _spot(Vector3(0.57,1.35,0.28),0.13)
    _spot(Vector3(-0.32,1.32,0.48),0.10)

func _process(delta: float) -> void:
    phase += delta * 3.4
    var stride := sin(phase) * 0.10
    left_front.position.y = 0.72 + stride
    right_front.position.y = 0.72 - stride
    left_back.position.y = 0.72 - stride
    right_back.position.y = 0.72 + stride
    head.position.y = 2.25 + sin(phase * 0.5) * 0.035
    tail.rotation_degrees.y = sin(phase * 0.7) * 10.0

func celebrate(power := 1.0) -> void:
    var tw := create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
    tw.tween_property(self, "scale", Vector3.ONE * (1.0 + 0.08 * power), 0.16)
    tw.tween_property(self, "scale", Vector3.ONE, 0.24)

func impact() -> void:
    var tw := create_tween().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
    tw.tween_property(self, "rotation_degrees:x", -7.0, 0.08)
    tw.tween_property(self, "rotation_degrees:x", 3.0, 0.08)
    tw.tween_property(self, "rotation_degrees:x", 0.0, 0.16)

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
    var n := _part(label, Vector3(0.28,0.78,0.28), Vector3(x,y,z))
    return n

func _ear(x: float, y: float, z: float, rot: float) -> void:
    var n := _part("Ear", Vector3(0.23,0.58,0.16), Vector3(x,y,z))
    n.rotation_degrees.z = rot

func _spot(pos: Vector3, radius: float) -> void:
    _part("Spot", Vector3(radius,radius,radius), pos, Color(0.035,0.035,0.04,1))
