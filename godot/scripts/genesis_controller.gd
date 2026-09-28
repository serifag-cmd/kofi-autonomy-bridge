extends Node3D

@export var route_count := 12
@export var route_radius := 6.2
@export var travel_time := 0.72

var route: Array[Vector3] = []
var marker := Node3D.new()
var marker_target := 0

func _ready() -> void:
    _build_route()
    marker.name = "DalmaMarker"
    add_child(marker)
    marker.position = route[0]
    _create_marker_visual(marker)

func _build_route() -> void:
    for i in route_count:
        var a := float(i) / float(route_count) * TAU
        route.append(Vector3(cos(a) * route_radius, 0.28, sin(a) * route_radius))

func _create_marker_visual(root: Node3D) -> void:
    var mesh_instance := MeshInstance3D.new()
    var mesh := SphereMesh.new()
    mesh.radius = 0.42
    mesh.height = 0.84
    var mat := StandardMaterial3D.new()
    mat.albedo_color = Color(0.94,0.91,0.82,1)
    mat.roughness = 0.44
    mesh_instance.mesh = mesh
    mesh_instance.material_override = mat
    root.add_child(mesh_instance)

func animate_move(steps: int) -> void:
    marker_target = (marker_target + steps) % route_count
    var start := marker.position
    var finish := route[marker_target]
    var tw := create_tween().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN_OUT)
    tw.tween_property(marker, "position", finish, travel_time)
    tw.parallel().tween_property(marker, "scale", Vector3(1.18,1.18,1.18), travel_time * 0.32)
    tw.tween_property(marker, "scale", Vector3.ONE, travel_time * 0.36)
