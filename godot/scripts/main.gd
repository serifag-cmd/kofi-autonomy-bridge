extends Node3D

const SAVE_PATH := "user://dalma_adventure.json"
const WORLD_COUNT := 7
const TILE_COUNT := 24
const MAX_BUILD_LEVEL := 5
const ENERGY_RECOVERY_SECONDS := 600.0

var worlds = [
  {"id":"genesis","name":"GENESIS","subtitle":"Origin Gate","glyph":"✦","color":Color("#D8B866"),"threshold":0,
   "lore":"Stone, roots and warm origin light. DALMA's signal begins here.",
   "buildings":["Origin Gate","Sunwell","Root Archive","Crown Hall","Genesis Beacon"]},
  {"id":"astral","name":"ASTRAL WILDS","subtitle":"Sky becomes terrain","glyph":"◈","color":Color("#9FC4FF"),"threshold":18,
   "lore":"Floating land, altered gravity and luminous vegetation.",
   "buildings":["Sky Bridge","Star Garden","Cloud Forge","Observatory","Gravity Spire"]},
  {"id":"abyss","name":"ABYSSAL OCEAN","subtitle":"Cities below pressure","glyph":"≈","color":Color("#73D9D2"),"threshold":38,
   "lore":"Mineral coral towers, deep currents and pressure-born treasures.",
   "buildings":["Tide Vault","Coral Citadel","Pressure Loom","Deep Archive","Abyss Crown"]},
  {"id":"volcanic","name":"VOLCANIC CROWN","subtitle":"Kingdom of heat","glyph":"△","color":Color("#FF9964"),"threshold":62,
   "lore":"Basalt, obsidian and living lava turn risk into power.",
   "buildings":["Basalt Gate","Obsidian Forge","Lava Lift","Ash Temple","Crown Caldera"]},
  {"id":"neon","name":"NEON NEXUS","subtitle":"Living digital city","glyph":"⌁","color":Color("#E3A6FF"),"threshold":90,
   "lore":"Energy routes, holographic districts and a city that rewrites itself.",
   "buildings":["Pulse Plaza","Data Garden","Photon Rail","Signal Tower","Nexus Core"]},
  {"id":"shadow","name":"SHADOW DIMENSION","subtitle":"Absence as matter","glyph":"◐","color":Color("#B8B9C8"),"threshold":125,
   "lore":"Impossible geometry, hidden phases and routes that reward precision.",
   "buildings":["Null Gate","Veil Market","Echo Hall","Phase Library","Shadow Throne"]},
  {"id":"origin","name":"ORIGIN CORE","subtitle":"The source beneath worlds","glyph":"◎","color":Color("#F4E4A2"),"threshold":165,
   "lore":"Primordial geometry. The final rule is not discovered; it is built.",
   "buildings":["Core Gate","First Engine","Memory Well","Genesis Array","Origin Heart"]}
]

var tile_types = [
  "COIN","COIN","BUILD","CHEST","RAID","CARD","EVENT","COIN",
  "SHIELD","ATTACK","COIN","KEY","BUILD","RAID","CARD","ENERGY",
  "CHEST","EVENT","COIN","SHIELD","ATTACK","KEY","BUILD","COIN"
]
var tile_glyphs = {
  "COIN":"◉","ENERGY":"⚡","BUILD":"⌂","CHEST":"◆","RAID":"⚔",
  "CARD":"◈","EVENT":"?","SHIELD":"⬟","ATTACK":"✹","KEY":"⌕"
}
var card_catalog = [
  {"id":"bali","name":"DALMA • BALI","set":"GENESIS","rarity":"SACRED","bonus":"+5% all rewards","value":5,"glyph":"♥"},
  {"id":"gate","name":"Gate Keeper","set":"GENESIS","rarity":"RARE","bonus":"+5% build rewards","value":5,"glyph":"✦"},
  {"id":"root","name":"Root Memory","set":"GENESIS","rarity":"EPIC","bonus":"+4% XP gain","value":4,"glyph":"❖"},
  {"id":"aurora","name":"Aurora Runner","set":"ASTRAL SIGNAL","rarity":"EPIC","bonus":"+6% coin rewards","value":6,"glyph":"✦"},
  {"id":"sky","name":"Sky Warden","set":"ASTRAL SIGNAL","rarity":"RARE","bonus":"+1 shield capacity","value":1,"glyph":"◈"},
  {"id":"tide","name":"Tide Keeper","set":"DEEP PRESSURE","rarity":"LEGENDARY","bonus":"+8% chest rewards","value":8,"glyph":"≈"},
  {"id":"reef","name":"Reef Architect","set":"DEEP PRESSURE","rarity":"RARE","bonus":"-5% build cost","value":5,"glyph":"◇"},
  {"id":"forge","name":"Obsidian Smith","set":"VOLCANIC RISE","rarity":"EPIC","bonus":"+10% raid loot","value":10,"glyph":"△"},
  {"id":"ember","name":"Ember Scout","set":"VOLCANIC RISE","rarity":"RARE","bonus":"+1 energy capacity","value":1,"glyph":"◆"},
  {"id":"pulse","name":"Pulse Runner","set":"NEON NEXUS","rarity":"EPIC","bonus":"+1 step on 7+","value":1,"glyph":"⌁"},
  {"id":"signal","name":"Signal Keeper","set":"NEON NEXUS","rarity":"LEGENDARY","bonus":"+12% event rewards","value":12,"glyph":"◉"},
  {"id":"veil","name":"Veil Walker","set":"SHADOW VEIL","rarity":"EPIC","bonus":"+10% shield protection","value":10,"glyph":"◐"},
  {"id":"echo","name":"Echo Archivist","set":"SHADOW VEIL","rarity":"RARE","bonus":"+2% XP gain","value":2,"glyph":"◎"},
  {"id":"core","name":"Origin Sentinel","set":"ORIGIN CORE","rarity":"LEGENDARY","bonus":"+15% core rewards","value":15,"glyph":"✧"},
  {"id":"first","name":"First Spark","set":"ORIGIN CORE","rarity":"MYTHIC","bonus":"+1 key from rare chests","value":1,"glyph":"✺"}
]

var g = {
  "energy":10,"energy_cap":10,"coins":1200,"shields":2,"keys":3,"stars":4,
  "xp":22,"level":1,"pos":0,"world":0,"spins":0,"raids":0,"attacks":0,"chests":1,
  "streak":1,"last_seen":0,"buildings":[],"owned_cards":[],"mission_progress":{"roll":0,"build":0,"raid":0,"card":0,"world":0},"claimed":[],"daily_claimed":false
}

var camera: Camera3D
var board_root: Node3D
var dog_root: Node3D
var dog_model: Node3D
var fx_root: Node3D
var ui: Control
var info_label: Label
var resource_label: Label
var world_label: Label
var level_label: Label
var dice_label: Label
var toast: Label
var roll_button: Button
var progress_bar: ProgressBar
var overlay: ColorRect
var overlay_title: Label
var overlay_subtitle: Label
var building_panel: ColorRect
var raid_panel: ColorRect
var collection_panel: ColorRect
var mission_panel: ColorRect
var world_panel: ColorRect
var route_points: Array[Vector3] = []
var tile_nodes: Array[Node3D] = []
var building_nodes: Array[Node3D] = []
var world_decorations: Array[Node3D] = []
var world_ring: MeshInstance3D
var world_core: MeshInstance3D
var world_light: OmniLight3D
var rolling := false
var selected_tab := "BOARD"
var dice_a := 2
var dice_b := 5
var rng := RandomNumberGenerator.new()
var elapsed := 0.0

func _ready() -> void:
  rng.randomize()
  _init_save()
  _build_world()
  _build_camera()
  _build_dog()
  _build_lighting()
  _build_ui()
  _refresh_world()
  _refresh_ui()
  _set_tab("BOARD")
  _show_toast("Genesis is waiting for DALMA.")

func _process(delta: float) -> void:
  elapsed += delta
  if dog_model:
    dog_model.position.y = sin(elapsed * 2.1) * 0.045
  if toast:
    toast.modulate.a = maxf(0.0, toast.modulate.a - delta * 0.35)

func _init_save() -> void:
  g["buildings"] = []
  for _i in WORLD_COUNT:
    g["buildings"].append([0,0,0,0,0])
  if FileAccess.file_exists(SAVE_PATH):
    var f := FileAccess.open(SAVE_PATH, FileAccess.READ)
    var parsed = JSON.parse_string(f.get_as_text()) if f else null
    if typeof(parsed) == TYPE_DICTIONARY:
      for k in parsed.keys():
        g[k] = parsed[k]
  var now := Time.get_unix_time_from_system()
  var elapsed_offline := maxf(0.0, now - float(g["last_seen"]))
  var cap := _energy_cap()
  g["energy"] = mini(cap, int(g["energy"]) + int(elapsed_offline / ENERGY_RECOVERY_SECONDS))
  g["last_seen"] = now
  if g["buildings"].size() != WORLD_COUNT:
    g["buildings"] = []
    for _w in WORLD_COUNT:
      g["buildings"].append([0,0,0,0,0])
  _save()

func _save() -> void:
  g["last_seen"] = Time.get_unix_time_from_system()
  var f := FileAccess.open(SAVE_PATH, FileAccess.WRITE)
  if f:
    f.store_string(JSON.stringify(g))

func _energy_cap() -> int:
  return int(g["energy_cap"]) + (1 if _has_card("ember") else 0)

func _has_card(id: String) -> bool:
  return id in g["owned_cards"]

func _reward_multiplier() -> float:
  var m := 1.0
  if _has_card("bali"):
    m += 0.05
  for c in card_catalog:
    if _has_card(str(c["id"])) and str(c["bonus"]).contains("coin"):
      m += float(c["value"]) / 100.0
  return m

func _total_buildings() -> int:
  var total := 0
  for row in g["buildings"]:
    for value in row:
      total += int(value)
  return total

func _xp_needed() -> int:
  return 80 + int(g["level"]) * 25

func _build_world() -> void:
  board_root = Node3D.new()
  add_child(board_root)
  fx_root = Node3D.new()
  add_child(fx_root)
  var radius := 8.6
  for i in TILE_COUNT:
    var a := float(i) / float(TILE_COUNT) * TAU + 0.18
    route_points.append(Vector3(cos(a) * radius, 0.18, sin(a) * radius))
  _create_board_geometry()
  _create_world_center()
  _build_world_decorations(0)

func _create_board_geometry() -> void:
  var floor := MeshInstance3D.new()
  var plane := PlaneMesh.new()
  plane.size = Vector2(31,31)
  floor.mesh = plane
  floor.material_override = _mat(Color("#0D1117"),0.62,0.08)
  board_root.add_child(floor)
  world_ring = MeshInstance3D.new()
  world_ring.name = "WorldRing"
  var torus := TorusMesh.new()
  torus.inner_radius = 8.10
  torus.outer_radius = 9.05
  world_ring.mesh = torus
  world_ring.material_override = _mat(worlds[0]["color"],0.32,0.20)
  board_root.add_child(world_ring)
  for i in TILE_COUNT:
    var tile := Node3D.new()
    tile.position = route_points[i]
    tile.rotation.y = -float(i) / float(TILE_COUNT) * TAU
    board_root.add_child(tile)
    var base := MeshInstance3D.new()
    var base_mesh := BoxMesh.new()
    base_mesh.size = Vector3(2.20,0.34,1.62)
    base.mesh = base_mesh
    base.material_override = _mat(Color("#171B20"),0.50,0.10)
    tile.add_child(base)
    var frame := MeshInstance3D.new()
    var frame_mesh := BoxMesh.new()
    frame_mesh.size = Vector3(2.34,0.12,1.76)
    frame.mesh = frame_mesh
    frame.position.y = 0.23
    frame.material_override = _mat(Color("#38382D"),0.48,0.18)
    tile.add_child(frame)
    var glyph := Label3D.new()
    glyph.text = tile_glyphs[tile_types[i]]
    glyph.font_size = 52
    glyph.modulate = worlds[0]["color"]
    glyph.position = Vector3(0,0.34,0)
    glyph.outline_size = 12
    tile.add_child(glyph)
    var label := Label3D.new()
    label.text = tile_types[i]
    label.font_size = 18
    label.modulate = Color("#C9CDD2")
    label.position = Vector3(0,0.60,0)
    label.outline_size = 9
    tile.add_child(label)
    tile_nodes.append(tile)

func _create_world_center() -> void:
  var center := MeshInstance3D.new()
  var mesh := CylinderMesh.new()
  mesh.top_radius = 2.7
  mesh.bottom_radius = 3.2
  mesh.height = 0.55
  center.mesh = mesh
  center.position.y = 0.28
  center.material_override = _mat(Color("#242019"),0.36,0.16)
  board_root.add_child(center)
  world_core = MeshInstance3D.new()
  world_core.name = "WorldCore"
  var sphere := SphereMesh.new()
  sphere.radius = 1.2
  sphere.height = 2.4
  world_core.mesh = sphere
  world_core.position.y = 1.65
  world_core.material_override = _emissive_mat(worlds[0]["color"],1.7)
  board_root.add_child(world_core)
  world_ring = MeshInstance3D.new()
  var torus := TorusMesh.new()
  torus.inner_radius = 1.45
  torus.outer_radius = 1.58
  ring.mesh = torus
  ring.position.y = 1.18
  ring.rotation.x = PI/2.0
  ring.material_override = _emissive_mat(worlds[0]["color"],0.9)
  board_root.add_child(ring)

func _build_camera() -> void:
  camera = Camera3D.new()
  camera.position = Vector3(0,16.8,16.8)
  camera.rotation_degrees = Vector3(-43,0,0)
  camera.fov = 51
  camera.current = true
  add_child(camera)

func _build_dog() -> void:
  dog_root = Node3D.new()
  dog_root.position = route_points[int(g["pos"])] + Vector3(0,0.62,0)
  add_child(dog_root)
  dog_model = Node3D.new()
  dog_root.add_child(dog_model)
  _create_dog_body()

func _create_dog_body() -> void:
  var body := MeshInstance3D.new()
  var bm := CapsuleMesh.new()
  bm.radius = 0.62
  bm.height = 2.2
  body.mesh = bm
  body.rotation_degrees = Vector3(90,0,0)
  body.material_override = _mat(Color("#F2F0E8"),0.80,0.0)
  dog_model.add_child(body)
  _add_spot(Vector3(-0.32,0.18,-0.52),0.25)
  _add_spot(Vector3(0.22,0.34,-0.42),0.18)
  _add_spot(Vector3(0.34,-0.08,0.36),0.22)
  _add_spot(Vector3(-0.25,-0.18,0.42),0.16)
  var neck := MeshInstance3D.new()
  var nm := CapsuleMesh.new()
  nm.radius = 0.42
  nm.height = 1.05
  neck.mesh = nm
  neck.position = Vector3(0,0.86,-0.62)
  neck.rotation_degrees = Vector3(-12,0,0)
  neck.material_override = _mat(Color("#F2F0E8"),0.80,0.0)
  dog_model.add_child(neck)
  var head := MeshInstance3D.new()
  var hm := SphereMesh.new()
  hm.radius = 0.72
  hm.height = 1.25
  head.mesh = hm
  head.position = Vector3(0,1.54,-1.08)
  head.material_override = _mat(Color("#F2F0E8"),0.80,0.0)
  dog_model.add_child(head)
  _add_head_spot(Vector3(-0.36,1.78,-1.58),0.19)
  _add_head_spot(Vector3(0.38,1.68,-1.52),0.16)
  var muzzle := MeshInstance3D.new()
  var mm := SphereMesh.new()
  mm.radius = 0.34
  mm.height = 0.50
  muzzle.mesh = mm
  muzzle.position = Vector3(0,1.36,-1.62)
  muzzle.material_override = _mat(Color("#F5F3ED"),0.88,0.0)
  dog_model.add_child(muzzle)
  var nose := MeshInstance3D.new()
  var no := SphereMesh.new()
  no.radius = 0.16
  no.height = 0.26
  nose.mesh = no
  nose.position = Vector3(0,1.39,-1.90)
  nose.material_override = _mat(Color("#17181B"),0.42,0.0)
  dog_model.add_child(nose)
  _add_eye(Vector3(-0.30,1.72,-1.65))
  _add_eye(Vector3(0.30,1.72,-1.65))
  _add_ear(Vector3(-0.52,2.08,-1.04),-17.0)
  _add_ear(Vector3(0.52,2.08,-1.04),17.0)
  _add_leg(Vector3(-0.48,0.15,-0.46))
  _add_leg(Vector3(0.48,0.15,-0.46))
  _add_leg(Vector3(-0.48,0.15,0.46))
  _add_leg(Vector3(0.48,0.15,0.46))
  var tail := MeshInstance3D.new()
  var tm := CapsuleMesh.new()
  tm.radius = 0.12
  tm.height = 1.45
  tail.mesh = tm
  tail.position = Vector3(0,0.58,1.02)
  tail.rotation_degrees = Vector3(-55,0,0)
  tail.material_override = _mat(Color("#EFEDE5"),0.80,0.0)
  dog_model.add_child(tail)

func _add_spot(pos:Vector3,r:float) -> void:
  var s := MeshInstance3D.new()
  var m := SphereMesh.new()
  m.radius=r
  m.height=r*1.45
  s.mesh=m
  s.position=pos
  s.scale.z=0.28
  s.material_override=_mat(Color("#18191C"),0.46,0.0)
  dog_model.add_child(s)

func _add_head_spot(pos:Vector3,r:float) -> void:
  var s := MeshInstance3D.new()
  var m := SphereMesh.new()
  m.radius=r
  m.height=r*1.5
  s.mesh=m
  s.position=pos
  s.scale.z=0.32
  s.material_override=_mat(Color("#18191C"),0.44,0.0)
  dog_model.add_child(s)

func _add_eye(pos:Vector3) -> void:
  var s := MeshInstance3D.new()
  var m := SphereMesh.new()
  m.radius=0.075
  m.height=0.15
  s.mesh=m
  s.position=pos
  s.material_override=_emissive_mat(Color("#C79A43"),1.0)
  dog_model.add_child(s)

func _add_ear(pos:Vector3,rot:float) -> void:
  var s := MeshInstance3D.new()
  var m := CapsuleMesh.new()
  m.radius=0.16
  m.height=0.85
  s.mesh=m
  s.position=pos
  s.rotation_degrees=Vector3(0,0,rot)
  s.material_override=_mat(Color("#25272D"),0.64,0.0)
  dog_model.add_child(s)

func _add_leg(pos:Vector3) -> void:
  var s := MeshInstance3D.new()
  var m := CapsuleMesh.new()
  m.radius=0.13
  m.height=0.82
  s.mesh=m
  s.position=pos
  s.rotation_degrees=Vector3(0,0,180)
  s.material_override=_mat(Color("#F1EFE8"),0.82,0.0)
  dog_model.add_child(s)

func _build_lighting() -> void:
  var env:=WorldEnvironment.new()
  var e:=Environment.new()
  e.background_mode=Environment.BG_COLOR
  e.background_color=Color("#070A10")
  e.ambient_light_source=Environment.AMBIENT_SOURCE_COLOR
  e.ambient_light_color=Color("#6D7484")
  e.ambient_light_energy=0.58
  e.tonemap_mode=Environment.TONE_MAPPER_FILMIC
  e.glow_enabled=true
  e.glow_intensity=0.82
  e.fog_enabled=true
  e.fog_light_color=Color("#111824")
  e.fog_light_energy=0.28
  e.fog_density=0.007
  env.environment=e
  add_child(env)
  var sun:=DirectionalLight3D.new()
  sun.rotation_degrees=Vector3(-52,-28,0)
  sun.light_color=Color("#FFF0C8")
  sun.light_energy=1.45
  sun.shadow_enabled=true
  sun.directional_shadow_max_distance=65
  add_child(sun)
  world_light=OmniLight3D.new()
  world_light.position=Vector3(0,5,0)
  world_light.light_color=worlds[0]["color"]
  world_light.light_energy=5.2
  world_light.omni_range=14
  add_child(world_light)

func _mat(color:Color,roughness:float,metallic:float)->StandardMaterial3D:
  var m:=StandardMaterial3D.new()
  m.albedo_color=color
  m.roughness=roughness
  m.metallic=metallic
  return m

func _emissive_mat(color:Color,energy:float)->StandardMaterial3D:
  var m:=StandardMaterial3D.new()
  m.albedo_color=color
  m.emission_enabled=true
  m.emission=color
  m.emission_energy_multiplier=energy
  m.roughness=0.30
  return m

func _build_ui() -> void:
  ui=Control.new()
  ui.set_anchors_and_offsets_preset(Control.PRESET_FULL_RECT)
  add_child(ui)

  var top:=ColorRect.new()
  top.color=Color(0.035,0.04,0.06,0.92)
  top.position=Vector2(24,24)
  top.size=Vector2(1032,145)
  ui.add_child(top)

  var title:=Label.new()
  title.text="DALMA"
  title.position=Vector2(28,12)
  title.add_theme_font_size_override("font_size",52)
  title.add_theme_color_override("font_color",Color.WHITE)
  top.add_child(title)

  world_label=Label.new()
  world_label.position=Vector2(31,78)
  world_label.add_theme_font_size_override("font_size",18)
  top.add_child(world_label)

  resource_label=Label.new()
  resource_label.position=Vector2(465,22)
  resource_label.size=Vector2(540,70)
  resource_label.horizontal_alignment=HORIZONTAL_ALIGNMENT_RIGHT
  resource_label.add_theme_font_size_override("font_size",20)
  top.add_child(resource_label)

  level_label=Label.new()
  level_label.position=Vector2(31,112)
  level_label.add_theme_font_size_override("font_size",13)
  level_label.add_theme_color_override("font_color",Color("#858B96"))
  top.add_child(level_label)

  progress_bar=ProgressBar.new()
  progress_bar.position=Vector2(465,102)
  progress_bar.size=Vector2(510,19)
  progress_bar.show_percentage=false
  top.add_child(progress_bar)

  info_label=Label.new()
  info_label.position=Vector2(30,184)
  info_label.size=Vector2(1020,66)
  info_label.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
  info_label.add_theme_font_size_override("font_size",19)
  ui.add_child(info_label)

  dice_label=Label.new()
  dice_label.position=Vector2(350,262)
  dice_label.size=Vector2(380,70)
  dice_label.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
  dice_label.add_theme_font_size_override("font_size",34)
  dice_label.add_theme_color_override("font_color",Color("#F1D67D"))
  ui.add_child(dice_label)

  roll_button=Button.new()
  roll_button.text="ROLL DALMA"
  roll_button.position=Vector2(270,1570)
  roll_button.size=Vector2(540,96)
  roll_button.add_theme_font_size_override("font_size",25)
  roll_button.pressed.connect(_roll)
  ui.add_child(roll_button)

  var nav:=HBoxContainer.new()
  nav.position=Vector2(20,1705)
  nav.size=Vector2(1040,128)
  nav.add_theme_constant_override("separation",6)
  ui.add_child(nav)
  _nav_button("BOARD","⌁",nav)
  _nav_button("WORLD","◈",nav)
  _nav_button("BUILD","⌂",nav)
  _nav_button("RAID","⚔",nav)
  _nav_button("COLLECTION","◆",nav)
  _nav_button("MISSIONS","⚑",nav)

  toast=Label.new()
  toast.position=Vector2(100,1498)
  toast.size=Vector2(880,50)
  toast.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
  toast.add_theme_font_size_override("font_size",18)
  toast.add_theme_color_override("font_color",Color("#C4C8D0"))
  ui.add_child(toast)

  overlay=ColorRect.new()
  overlay.color=Color(0.02,0.024,0.035,0.96)
  overlay.position=Vector2(70,360)
  overlay.size=Vector2(940,1160)
  overlay.visible=false
  ui.add_child(overlay)

  overlay_title=Label.new()
  overlay_title.position=Vector2(45,34)
  overlay_title.size=Vector2(850,80)
  overlay_title.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
  overlay_title.add_theme_font_size_override("font_size",34)
  overlay_title.add_theme_color_override("font_color",Color.WHITE)
  overlay.add_child(overlay_title)

  overlay_subtitle=Label.new()
  overlay_subtitle.position=Vector2(60,128)
  overlay_subtitle.size=Vector2(820,200)
  overlay_subtitle.horizontal_alignment=HORIZONTAL_ALIGNMENT_CENTER
  overlay_subtitle.vertical_alignment=VERTICAL_ALIGNMENT_CENTER
  overlay_subtitle.autowrap_mode=TextServer.AUTOWRAP_WORD_SMART
  overlay_subtitle.add_theme_font_size_override("font_size",18)
  overlay_subtitle.add_theme_color_override("font_color",Color("#A8ADB7"))
  overlay.add_child(overlay_subtitle)

  _build_panels()

func _nav_button(label:String,glyph:String,parent:HBoxContainer)->void:
  var b:=Button.new()
  b.text=glyph+"\\n"+label
  b.custom_minimum_size=Vector2(196,116)
  b.add_theme_font_size_override("font_size",15)
  b.pressed.connect(func(): _set_tab(label))
  parent.add_child(b)

func _build_panels() -> void:
  building_panel=_panel()
  raid_panel=_panel()
  collection_panel=_panel()
  mission_panel=_panel()
  world_panel=_panel()
  ui.add_child(building_panel)
  ui.add_child(raid_panel)
  ui.add_child(collection_panel)
  ui.add_child(mission_panel)
  ui.add_child(world_panel)
  _populate_build_panel()
  _populate_raid_panel()
  _populate_collection_panel()
  _populate_mission_panel()
  _populate_world_panel()

func _panel()->ColorRect:
  var p:=ColorRect.new()
  p.color=Color(0.045,0.05,0.065,0.98)
  p.position=Vector2(40,330)
  p.size=Vector2(1000,1255)
  p.visible=false
  return p

func _populate_build_panel()->void:
  var h:=Label.new()
  h.text="BUILD DISTRICT"
  h.position=Vector2(40,30)
  h.add_theme_font_size_override("font_size",32)
  building_panel.add_child(h)
  var sub:=Label.new()
  sub.name="Sub"
  sub.position=Vector2(40,82)
  sub.size=Vector2(900,55)
  sub.add_theme_font_size_override("font_size",16)
  sub.add_theme_color_override("font_color",Color("#9399A3"))
  building_panel.add_child(sub)
  for i in 5:
    var b:=Button.new()
    b.name="Build%d"%i
    b.position=Vector2(35,155+i*205)
    b.size=Vector2(930,175)
    b.add_theme_font_size_override("font_size",19)
    b.pressed.connect(func(idx=i): _build_building(int(g["world"]),idx))
    building_panel.add_child(b)

func _populate_raid_panel()->void:
  var h:=Label.new()
  h.text="RAID MAP"
  h.position=Vector2(40,30)
  h.add_theme_font_size_override("font_size",32)
  raid_panel.add_child(h)
  var sub:=Label.new()
  sub.text="Three rival vaults • hard defenses reward smart shield use."
  sub.position=Vector2(40,82)
  sub.size=Vector2(900,55)
  sub.add_theme_font_size_override("font_size",16)
  sub.add_theme_color_override("font_color",Color("#9399A3"))
  raid_panel.add_child(sub)
  for i in 3:
    var b:=Button.new()
    b.name="Vault%d"%i
    b.position=Vector2(35,170+i*285)
    b.size=Vector2(930,230)
    b.add_theme_font_size_override("font_size",21)
    b.pressed.connect(func(idx=i): _raid(idx))
    raid_panel.add_child(b)

func _populate_collection_panel()->void:
  var h:=Label.new()
  h.text="DALMA COLLECTION"
  h.position=Vector2(40,30)
  h.add_theme_font_size_override("font_size",32)
  collection_panel.add_child(h)
  var sub:=Label.new()
  sub.name="Sub"
  sub.position=Vector2(40,82)
  sub.size=Vector2(900,60)
  sub.add_theme_font_size_override("font_size",16)
  sub.add_theme_color_override("font_color",Color("#9399A3"))
  collection_panel.add_child(sub)
  for i in card_catalog.size():
    var b:=Button.new()
    b.name="Card%d"%i
    b.position=Vector2(35,150+i*67)
    b.size=Vector2(930,58)
    b.add_theme_font_size_override("font_size",14)
    b.pressed.connect(_reveal_card)
    collection_panel.add_child(b)

func _populate_mission_panel()->void:
  var h:=Label.new()
  h.text="MISSION CONTROL"
  h.position=Vector2(40,30)
  h.add_theme_font_size_override("font_size",32)
  mission_panel.add_child(h)
  var sub:=Label.new()
  sub.name="Sub"
  sub.position=Vector2(40,82)
  sub.size=Vector2(900,65)
  sub.add_theme_font_size_override("font_size",16)
  sub.add_theme_color_override("font_color",Color("#9399A3"))
  mission_panel.add_child(sub)
  for i in 5:
    var b:=Button.new()
    b.name="Mission%d"%i
    b.position=Vector2(35,170+i*200)
    b.size=Vector2(930,175)
    b.add_theme_font_size_override("font_size",17)
    b.pressed.connect(func(idx=i): _claim_mission(idx))
    mission_panel.add_child(b)

func _populate_world_panel()->void:
  var h:=Label.new()
  h.text="UNIVERSE MAP"
  h.position=Vector2(40,30)
  h.add_theme_font_size_override("font_size",32)
  world_panel.add_child(h)
  var sub:=Label.new()
  sub.name="Sub"
  sub.position=Vector2(40,82)
  sub.size=Vector2(900,70)
  sub.add_theme_font_size_override("font_size",16)
  sub.add_theme_color_override("font_color",Color("#9399A3"))
  world_panel.add_child(sub)
  for i in WORLD_COUNT:
    var b:=Button.new()
    b.name="World%d"%i
    b.position=Vector2(35,155+i*145)
    b.size=Vector2(930,125)
    b.add_theme_font_size_override("font_size",16)
    b.pressed.connect(func(idx=i): _select_world(idx))
    world_panel.add_child(b)

func _select_world(index:int)->void:
  var w=worlds[index]
  if index>int(g["world"])+1:
    _show_toast("Complete the previous world first.")
    return
  if index==int(g["world"]):
    _set_tab("BOARD")
    return
  if int(g["stars"])<int(w["threshold"]):
    _show_toast("Need %d stars to unlock %s."%[int(w["threshold"]),w["name"]])
    return
  g["world"]=index
  g["pos"]=0
  g["coins"]=int(g["coins"])+1200
  g["energy"]=mini(_energy_cap(),int(g["energy"])+2)
  g["xp"]=int(g["xp"])+30
  g["mission_progress"]["world"]=1
  dog_root.position=route_points[0]+Vector3(0,0.62,0)
  _refresh_world()
  _world_transition(w["color"])
  _save()
  _set_tab("BOARD")
  _show_toast("%s unlocked • new materials, architecture and challenge."%w["name"])

func _refresh_world_panel()->void:
  if not is_instance_valid(world_panel): return
  var sub=world_panel.get_node("Sub") as Label
  var next_index=min(WORLD_COUNT-1,int(g["world"])+1)
  sub.text="%d/%d worlds open • %d stars • next: %s at %d stars"%[int(g["world"])+1,WORLD_COUNT,int(g["stars"]),worlds[next_index]["name"],int(worlds[next_index]["threshold"])]
  for i in WORLD_COUNT:
    var w=worlds[i]
    var b=world_panel.get_node("World%d"%i) as Button
    var open:=i<=int(g["world"])
    var ready:=i==int(g["world"])+1 and int(g["stars"])>=int(w["threshold"])
    var state:="ACTIVE" if i==int(g["world"]) else ("OPEN" if open else ("READY • %d STARS"%int(w["threshold"]) if ready else "LOCKED • %d STARS"%int(w["threshold"])))
    b.text="%s  %s\n%s\n%s"%[w["glyph"],w["name"],w["subtitle"],state]
    b.disabled=i>int(g["world"])+1 or (i==int(g["world"])+1 and int(g["stars"])<int(w["threshold"]))

func _set_tab(tab:String)->void:
  selected_tab=tab
  building_panel.visible=tab=="BUILD"
  raid_panel.visible=tab=="RAID"
  collection_panel.visible=tab=="COLLECTION"
  mission_panel.visible=tab=="MISSIONS"
  world_panel.visible=tab=="WORLD"
  roll_button.visible=tab=="BOARD"
  info_label.visible=tab=="BOARD"
  dice_label.visible=tab=="BOARD"
  if tab=="BUILD": _refresh_build_panel()
  elif tab=="RAID": _refresh_raid_panel()
  elif tab=="COLLECTION": _refresh_collection_panel()
  elif tab=="MISSIONS": _refresh_mission_panel()

func _refresh_world()->void:
  _rebuild_world_buildings()
  var w=worlds[int(g["world"])]
  world_label.text="%s  •  WORLD %02d  •  %s"%[w["glyph"],int(g["world"])+1,w["name"]]
  for tile in tile_nodes:
    for child in tile.get_children():
      if child is Label3D:
        child.modulate=w["color"] if child.font_size>30 else Color("#C9CDD2")
  if world_ring: world_ring.material_override=_mat(w["color"],0.32,0.20)
  if world_core: world_core.material_override=_emissive_mat(w["color"],1.7)
  if world_light: world_light.light_color=w["color"]
  _refresh_ui()

func _rebuild_world_buildings()->void:
  for n in building_nodes:
    if is_instance_valid(n): n.queue_free()
  building_nodes.clear()
  var wi:=int(g["world"])
  var w=worlds[wi]
  for i in 5:
    var level:=int(g["buildings"][wi][i])
    if level<=0: continue
    var root:=Node3D.new()
    var a:=float(i)/5.0*TAU+0.6
    root.position=Vector3(cos(a)*5.0,0.20,sin(a)*5.0)
    board_root.add_child(root)
    building_nodes.append(root)
    for part_i in level:
      var part:=MeshInstance3D.new()
      var box:=BoxMesh.new()
      box.size=Vector3(0.82,0.46+0.18*part_i,0.82)
      part.mesh=box
      part.position.y=0.30+0.27*part_i
      part.material_override=_mat(w["color"].darkened(0.18+0.05*part_i),0.44,0.14)
      root.add_child(part)
    var label:=Label3D.new()
    label.text="%s  %d/5"%[w["buildings"][i],level]
    label.font_size=17
    label.modulate=w["color"]
    label.position.y=1.70+0.15*level
    label.outline_size=8
    root.add_child(label)


func _build_world_decorations(world_idx:int)->void:
  for n in world_decorations:
    if is_instance_valid(n): n.queue_free()
  world_decorations.clear()
  var w=worlds[world_idx]
  for i in 12:
    var root:=Node3D.new()
    var a:=float(i)/12.0*TAU
    var r:=11.3+float(i%3)*1.25
    root.position=Vector3(cos(a)*r,0.0,sin(a)*r)
    root.rotation.y=a
    board_root.add_child(root)
    world_decorations.append(root)
    var accent:Color=w["color"]
    match world_idx:
      0:
        var b:=MeshInstance3D.new()
        var bm:=BoxMesh.new()
        bm.size=Vector3(0.65,1.2+0.15*(i%3),0.65)
        b.mesh=bm
        b.position.y=bm.size.y/2.0
        b.material_override=_mat(accent.darkened(0.42),0.48,0.14)
        root.add_child(b)
      1:
        var p:=MeshInstance3D.new()
        var pm:=PrismMesh.new()
        pm.size=Vector3(0.7,1.2+0.22*(i%4),0.7)
        p.mesh=pm
        p.position.y=pm.size.y/2.0
        p.rotation_degrees=Vector3(0,45,8)
        p.material_override=_emissive_mat(accent,0.8)
        root.add_child(p)
      2:
        for j in 3:
          var coral:=MeshInstance3D.new()
          var cm:=CapsuleMesh.new()
          cm.radius=0.12+0.03*j
          cm.height=0.8+0.18*j
          coral.mesh=cm
          coral.position=Vector3((j-1)*0.28,cm.height/2.0,0)
          coral.rotation_degrees=Vector3(0,(j-1)*12,(j-1)*10)
          coral.material_override=_mat(accent.darkened(0.1+0.08*j),0.62,0.05)
          root.add_child(coral)
      3:
        var lava:=MeshInstance3D.new()
        var lm:=CylinderMesh.new()
        lm.top_radius=0.16
        lm.bottom_radius=0.48
        lm.height=1.4+0.18*(i%3)
        lava.mesh=lm
        lava.position.y=lm.height/2.0
        lava.material_override=_mat(Color("#321A16"),0.44,0.16)
        root.add_child(lava)
        var glow:=MeshInstance3D.new()
        var gm:=SphereMesh.new()
        gm.radius=0.18
        gm.height=0.36
        glow.mesh=gm
        glow.position.y=lm.height*0.64
        glow.material_override=_emissive_mat(accent,2.0)
        root.add_child(glow)
      4:
        var neon:=MeshInstance3D.new()
        var nm:=BoxMesh.new()
        nm.size=Vector3(0.18,1.8+0.12*(i%3),0.18)
        neon.mesh=nm
        neon.position.y=nm.size.y/2.0
        neon.material_override=_emissive_mat(accent,1.5)
        root.add_child(neon)
      5:
        var sh:=MeshInstance3D.new()
        var sm:=BoxMesh.new()
        sm.size=Vector3(0.72,1.5+0.1*(i%4),0.72)
        sh.mesh=sm
        sh.position.y=sm.size.y/2.0
        sh.rotation_degrees=Vector3(0,17,7)
        sh.material_override=_mat(Color("#15151D"),0.80,0.0)
        root.add_child(sh)
      6:
        var orb:=MeshInstance3D.new()
        var om:=SphereMesh.new()
        om.radius=0.18
        om.height=0.36
        orb.mesh=om
        orb.position.y=1.45
        orb.material_override=_emissive_mat(accent,2.2)
        root.add_child(orb)
        var loop:=MeshInstance3D.new()
        var tm:=TorusMesh.new()
        tm.inner_radius=0.5
        tm.outer_radius=0.56
        loop.mesh=tm
        loop.position.y=1.45
        loop.rotation.x=PI/2.0
        loop.material_override=_emissive_mat(accent,1.2)
        root.add_child(loop)

func _refresh_ui()->void:
  var w=worlds[int(g["world"])]
  world_label.text="%s  •  WORLD %02d  •  %s"%[w["glyph"],int(g["world"])+1,w["name"]]
  resource_label.text="⚡ %d/%d     ◉ %s     ⬟ %d     ★ %d     ⌕ %d"%[int(g["energy"]),_energy_cap(),_fmt(int(g["coins"])),int(g["shields"]),int(g["stars"]),int(g["keys"])]
  var need:=_xp_needed()
  var xp_pct:=clampf(float(g["xp"])/float(need),0.0,1.0)
  progress_bar.value=xp_pct*100.0
  level_label.text="LEVEL %d  •  %d XP TO NEXT  •  %d BUILDINGS"%[int(g["level"]),maxi(0,need-int(g["xp"])),_total_buildings()]
  info_label.text="%s  %s\\n%s"%[w["glyph"],w["name"],w["lore"]]
  dice_label.text="⚂ %d   +   ⚄ %d   =   %d STEPS"%[dice_a,dice_b,dice_a+dice_b]
  roll_button.disabled=rolling or int(g["energy"])<=0
  roll_button.text="DALMA IS MOVING…" if rolling else ("ROLL DALMA" if int(g["energy"])>0 else "ENERGY EMPTY • MISSIONS")
  _refresh_build_panel()
  _refresh_raid_panel()
  _refresh_collection_panel()
  _refresh_mission_panel()
  _refresh_world_panel()

func _roll()->void:
  if rolling: return
  if int(g["energy"])<=0:
    _set_tab("MISSIONS")
    _show_toast("Energy is empty. Missions recover momentum.")
    return
  rolling=true
  dice_a=rng.randi_range(1,6)
  dice_b=rng.randi_range(1,6)
  var raw_steps:=dice_a+dice_b
  var steps:=raw_steps+(1 if raw_steps>=7 and _has_card("pulse") else 0)
  var from:=int(g["pos"])
  var to:=(from+steps)%TILE_COUNT
  g["energy"]=int(g["energy"])-1
  _camera_roll_focus()
  _refresh_ui()
  await _animate_travel(from,to,steps)
  _land(to,raw_steps)
  rolling=false
  _save()
  _refresh_ui()

func _animate_travel(from:int,to:int,steps:int)->void:
  for i in steps:
    var idx:=(from+i+1)%TILE_COUNT
    var target:=route_points[idx]+Vector3(0,0.62,0)
    var tw:=create_tween().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_IN_OUT)
    tw.tween_property(dog_root,"position",target,0.18)
    await tw.finished
    if dog_model:
      dog_model.rotation.z=0.06 if i%2==0 else -0.06
      var settle:=create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
      settle.tween_property(dog_model,"rotation:z",0.0,0.10)
  dog_root.position=route_points[to]+Vector3(0,0.62,0)
  _spawn_burst(dog_root.global_position,worlds[int(g["world"])]["color"])
  _camera_land_focus(dog_root.global_position)

func _land(index:int,rolled:int)->void:
  g["pos"]=index
  g["spins"]=int(g["spins"])+1
  g["xp"]=int(g["xp"])+rolled*2
  g["mission_progress"]["roll"]=int(g["mission_progress"]["roll"])+1
  var typ=tile_types[index]
  var mult:=_reward_multiplier()
  match typ:
    "COIN":
      var reward:=int(round((170+rolled*10)*mult))
      g["coins"]=int(g["coins"])+reward
      _show_toast("Route reward  +%s coins."%_fmt(reward))
    "ENERGY":
      g["energy"]=mini(_energy_cap(),int(g["energy"])+2)
      _show_toast("Energy node  +2 energy.")
    "SHIELD":
      g["shields"]=int(g["shields"])+1
      _show_toast("Shield cache  +1 shield.")
    "KEY":
      g["keys"]=int(g["keys"])+1
      _show_toast("Signal key recovered  +1 key.")
    "BUILD":
      _show_overlay("BUILD SITE READY","Construction changes the civilization, not only a number.","BUILD")
    "CHEST":
      g["chests"]=int(g["chests"])+1
      g["keys"]=int(g["keys"])+1
      g["coins"]=int(g["coins"])+int(260*mult)
      _show_overlay("RELIC CHEST","A chest and a key have entered the collection loop.","CHEST")
    "CARD":
      _show_overlay("CARD FRAGMENT","A collectible with a permanent gameplay bonus is resonating.","CARD")
    "RAID":
      _show_overlay("RIVAL VAULT EXPOSED","Choose pressure, shield and loot.","RAID")
    "ATTACK":
      var loot:=240+int(g["level"])*35+rng.randi_range(1,3)*140
      g["attacks"]=int(g["attacks"])+1
      g["coins"]=int(g["coins"])+loot
      g["xp"]=int(g["xp"])+14
      _spawn_hit(worlds[int(g["world"])]["color"])
      _show_toast("Quick strike  +%s coins."%_fmt(loot))
    "EVENT":
      _show_overlay("RISK EVENT","Secure a smaller payout or risk more for keys and rare rewards.","EVENT")
  _level_check()
  _save()
  _refresh_ui()

func _level_check()->void:
  while int(g["xp"])>=_xp_needed():
    g["xp"]=int(g["xp"])-_xp_needed()
    g["level"]=int(g["level"])+1
    g["stars"]=int(g["stars"])+1
    g["coins"]=int(g["coins"])+500
    g["energy"]=mini(_energy_cap(),int(g["energy"])+2)
    _show_toast("LEVEL UP  •  %d  •  +500 coins"%int(g["level"]))

func _build_building(world_idx:int,index:int)->void:
  var level:=int(g["buildings"][world_idx][index])
  if level>=MAX_BUILD_LEVEL: return
  var cost:=int(round(((int(worlds[world_idx]["threshold"])+1)*160+int(g["level"])*55+level*180)*(0.95 if _has_card("reef") else 1.0)))
  if int(g["coins"])<cost:
    _show_toast("Not enough coins. Need %s."%_fmt(cost))
    return
  g["coins"]=int(g["coins"])-cost
  g["buildings"][world_idx][index]=level+1
  if level==0: g["stars"]=int(g["stars"])+1
  g["xp"]=int(g["xp"])+18
  g["mission_progress"]["build"]=int(g["mission_progress"]["build"])+1
  if world_idx==int(g["world"]): _rebuild_world_buildings()
  _build_cinematic(worlds[world_idx]["color"])
  _show_toast("%s upgraded to %d/5."%[worlds[world_idx]["buildings"][index],level+1])
  _level_check()
  _save()
  _refresh_ui()

func _raid(which:int)->void:
  var names=["MOON VAULT","CROWN MINE","SIGNAL BANK"]
  var vault_coins:=900+int(g["level"])*180+which*260
  var hard:=which%2==0
  var use_shield:=hard and int(g["shields"])>0
  if use_shield: g["shields"]=int(g["shields"])-1
  var success:=not hard or use_shield or rng.randf()<0.58
  var raid_bonus:=1.0
  if _has_card("forge"): raid_bonus+=0.10
  var loot:=int(round(vault_coins*(1.0 if success else 0.18)*raid_bonus*_reward_multiplier()))
  g["coins"]=int(g["coins"])+loot
  g["raids"]=int(g["raids"])+1
  g["xp"]=int(g["xp"])+(24 if success else 8)
  g["mission_progress"]["raid"]=int(g["mission_progress"]["raid"])+1
  _raid_cinematic(success,worlds[int(g["world"])]["color"])
  _show_toast("%s  •  %s  +%s coins."%[names[which],"EXTRACTED" if success else "DEFENDED",_fmt(loot)])
  _level_check()
  _save()
  _refresh_ui()

func _reveal_card()->void:
  for c in card_catalog:
    if not _has_card(str(c["id"])):
      g["owned_cards"].append(str(c["id"]))
      g["coins"]=int(g["coins"])+260
      g["xp"]=int(g["xp"])+20
      g["mission_progress"]["card"]=int(g["mission_progress"]["card"])+1
      _card_cinematic(c)
      _show_toast("Card revealed  •  %s  •  %s."%[c["name"],c["rarity"]])
      _level_check()
      _save()
      _refresh_ui()
      return
  _show_toast("Collection complete.")

func _claim_mission(index:int)->void:
  var goals=[8,3,2,2,1]
  var ids=["roll","build","raid","card","world"]
  var rewards=["+2 energy • +300 coins","+700 coins • +2 stars","+1 key • +600 coins","+400 coins • +1 shield","+1200 coins • +2 energy"]
  var id=ids[index]
  var progress=int(g["mission_progress"][id])
  if index==4 and int(g["world"])>0: progress=1
  if id in g["claimed"]:
    _show_toast("Mission already claimed.")
    return
  if progress<goals[index]:
    _show_toast("Mission in progress  •  %d/%d."%[progress,goals[index]])
    return
  g["claimed"].append(id)
  match id:
    "roll":
      g["energy"]=mini(_energy_cap(),int(g["energy"])+2); g["coins"]=int(g["coins"])+300
    "build":
      g["coins"]=int(g["coins"])+700; g["stars"]=int(g["stars"])+2
    "raid":
      g["keys"]=int(g["keys"])+1; g["coins"]=int(g["coins"])+600
    "card":
      g["coins"]=int(g["coins"])+400; g["shields"]=int(g["shields"])+1
    "world":
      g["coins"]=int(g["coins"])+1200; g["energy"]=mini(_energy_cap(),int(g["energy"])+2)
  _show_toast("Mission claimed  •  %s"%rewards[index])
  _save()
  _refresh_ui()

func _show_overlay(title_text:String,sub_text:String,kind:String)->void:
  overlay.visible=true
  overlay_title.text=title_text
  overlay_subtitle.text=sub_text
  for child in overlay.get_children():
    if child is Button: child.queue_free()
  var action:=Button.new()
  action.text="CONTINUE"
  action.position=Vector2(205,930)
  action.size=Vector2(530,90)
  action.add_theme_font_size_override("font_size",21)
  overlay.add_child(action)
  if kind=="BUILD":
    action.text="OPEN BUILD DISTRICT"
    action.pressed.connect(func(): overlay.visible=false; _set_tab("BUILD"))
  elif kind=="RAID":
    action.text="OPEN RAID MAP"
    action.pressed.connect(func(): overlay.visible=false; _set_tab("RAID"))
  elif kind=="CHEST":
    action.text="OPEN CHEST"
    action.pressed.connect(func(): overlay.visible=false; _open_chest())
  elif kind=="CARD":
    action.text="REVEAL CARD"
    action.pressed.connect(func(): overlay.visible=false; _reveal_card())
  elif kind=="EVENT":
    action.text="RISK EVENT"
    action.pressed.connect(func(): overlay.visible=false; _resolve_event(true))
  else:
    action.pressed.connect(func(): overlay.visible=false)

func _open_chest()->void:
  if int(g["chests"])<=0 or int(g["keys"])<=0:
    _show_toast("You need a chest and a key.")
    return
  g["chests"]=int(g["chests"])-1
  g["keys"]=int(g["keys"])-1
  g["coins"]=int(g["coins"])+480
  _reveal_card()
  _save()
  _refresh_ui()

func _resolve_event(risk:bool)->void:
  var success:=not risk or rng.randf()<0.62
  var coins:=int(round((620 if success and risk else (40 if risk else 220))*_reward_multiplier()))
  g["coins"]=int(g["coins"])+coins
  g["xp"]=int(g["xp"])+(22 if success and risk else 8)
  if success and risk: g["keys"]=int(g["keys"])+1
  _show_toast(("Risk paid off" if risk and success else ("Risk failed" if risk else "Safe route"))+"  +%s coins."%_fmt(coins))
  _level_check()
  _save()
  _refresh_ui()

func _build_cinematic(color:Color)->void:
  var c:=ColorRect.new()
  c.color=Color(color.r,color.g,color.b,0.20)
  c.position=Vector2(0,0)
  c.size=Vector2(1080,1920)
  ui.add_child(c)
  var tw:=create_tween()
  tw.tween_property(c,"modulate",Color(1,1,1,0),0.70)
  tw.tween_callback(c.queue_free)
  var bump:=create_tween().set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
  bump.tween_property(dog_model,"scale",Vector3.ONE*1.12,0.12)
  bump.tween_property(dog_model,"scale",Vector3.ONE,0.25)

func _raid_cinematic(success:bool,color:Color)->void:
  var tw:=create_tween().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
  tw.tween_property(camera,"fov",46.0,0.18)
  tw.tween_property(camera,"fov",51.0,0.34)
  _spawn_burst(dog_root.global_position+Vector3(0,1.0,0),color if success else Color("#A85566"))

func _card_cinematic(c:Dictionary)->void:
  _show_overlay(str(c["name"]).to_upper(),"%s\\n%s\\n\\nPermanent gameplay bonus: %s"%[c["set"],c["rarity"],c["bonus"]],"RESULT")
  for _i in 9:
    _spawn_burst(camera.global_position+Vector3(rng.randf_range(-2,2),rng.randf_range(-1,2),-3),worlds[int(g["world"])]["color"])

func _camera_roll_focus()->void:
  var tw:=create_tween().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_OUT)
  tw.tween_property(camera,"fov",46.5,0.20)
  tw.tween_property(camera,"fov",51.0,0.60)

func _camera_land_focus(target:Vector3)->void:
  var original:=camera.position
  var close:=target+Vector3(0,8.8,10.8)
  var tw:=create_tween().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN_OUT)
  tw.tween_property(camera,"position",close,0.15)
  tw.tween_interval(0.18)
  tw.tween_property(camera,"position",original,0.44)

func _world_transition(color:Color)->void:
  var tw:=create_tween().set_trans(Tween.TRANS_CUBIC).set_ease(Tween.EASE_IN_OUT)
  tw.tween_property(camera,"fov",62.0,0.22)
  tw.tween_property(camera,"fov",51.0,0.56)
  _spawn_burst(Vector3(0,1,0),color)
  _spawn_burst(Vector3(0,2,0),color)

func _spawn_hit(color:Color)->void:
  _spawn_burst(dog_root.global_position+Vector3(0,1,0),color)

func _spawn_burst(pos:Vector3,color:Color)->void:
  for _i in 10:
    var p:=MeshInstance3D.new()
    var m:=SphereMesh.new()
    m.radius=0.055+0.025*rng.randf()
    m.height=m.radius*2.0
    p.mesh=m
    p.material_override=_emissive_mat(color,1.8)
    p.global_position=pos
    fx_root.add_child(p)
    var end:=pos+Vector3(rng.randf_range(-1.8,1.8),rng.randf_range(0.3,2.2),rng.randf_range(-1.8,1.8))
    var tw:=create_tween().set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
    tw.tween_property(p,"global_position",end,0.48+0.18*rng.randf())
    tw.parallel().tween_property(p,"scale",Vector3.ZERO,0.54)
    tw.tween_callback(p.queue_free)

func _refresh_build_panel()->void:
  var w=worlds[int(g["world"])]
  var sub=building_panel.get_node("Sub") as Label
  sub.text="%s  •  %s  •  %s coins available"%[w["name"],w["subtitle"],_fmt(int(g["coins"]))]
  for i in 5:
    var b=building_panel.get_node("Build%d"%i) as Button
    var level:=int(g["buildings"][int(g["world"])][i])
    var cost:=int(round(((int(w["threshold"])+1)*160+int(g["level"])*55+level*180)*(0.95 if _has_card("reef") else 1.0)))
    b.text="%s\\nLEVEL %d/5\\n%s"%[w["buildings"][i],level,"MASTERED" if level>=5 else "BUILD • %s COINS"%_fmt(cost)]
    b.disabled=level>=5 or int(g["coins"])<cost

func _refresh_raid_panel()->void:
  var names=["MOON VAULT","CROWN MINE","SIGNAL BANK"]
  for i in 3:
    var b=raid_panel.get_node("Vault%d"%i) as Button
    var coins:=900+int(g["level"])*180+i*260
    var hard:=i%2==0
    b.text="%s\\n%s DEFENSE\\n%s COINS\\n%s"%[names[i],"HARD" if hard else "OPEN",_fmt(coins),"SHIELD RAID" if hard and int(g["shields"])>0 else "RISK RAID"]

func _refresh_collection_panel()->void:
  var sub=collection_panel.get_node("Sub") as Label
  sub.text="%d/%d discovered  •  Permanent bonuses"%[g["owned_cards"].size(),card_catalog.size()]
  for i in card_catalog.size():
    var c=card_catalog[i]
    var b=collection_panel.get_node("Card%d"%i) as Button
    var owned:=_has_card(str(c["id"]))
    b.text=("✓  %s  •  OWNED  •  %s"%[c["name"],c["bonus"]]) if owned else ("%s  %s  •  %s  •  %s"%[c["glyph"],c["name"],c["rarity"],c["bonus"]])
    b.disabled=owned

func _refresh_mission_panel()->void:
  var goals=[8,3,2,2,1]
  var names=["MOMENTUM","ARCHITECT","VAULT RUNNER","ARCHIVIST","WORLDWALKER"]
  var rewards=["+2 energy • +300 coins","+700 coins • +2 stars","+1 key • +600 coins","+400 coins • +1 shield","+1200 coins • +2 energy"]
  var sub=mission_panel.get_node("Sub") as Label
  sub.text="Persistent objectives • offline energy recovery • %d day streak"%int(g["streak"])
  for i in 5:
    var id=["roll","build","raid","card","world"][i]
    var progress:=int(g["mission_progress"][id])
    if i==4 and int(g["world"])>0: progress=1
    var b=mission_panel.get_node("Mission%d"%i) as Button
    b.text="%s\\n%d/%d\\nREWARD  %s"%[names[i],mini(progress,goals[i]),goals[i],rewards[i]]
    b.disabled=id in g["claimed"]

func _show_toast(text_value:String)->void:
  toast.text=text_value
  toast.modulate.a=1.0

func _fmt(n:int)->String:
  var s:=str(n)
  var out:=""
  while s.length()>3:
    out=","+s.substr(s.length()-3,3)+out
    s=s.substr(0,s.length()-3)
  return s+out
