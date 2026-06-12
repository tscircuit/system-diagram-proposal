export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

export type NinePointAnchor =
  | "top_left"
  | "top_center"
  | "top_right"
  | "middle_left"
  | "center"
  | "middle_right"
  | "bottom_left"
  | "bottom_center"
  | "bottom_right"

export type SystemSide = "top" | "bottom" | "left" | "right"
export type SystemDirection = "up" | "down" | "left" | "right"

export type SystemComponentKind =
  | "frame"
  | "subsystem"
  | "module"
  | "cpu"
  | "memory"
  | "bus"
  | "peripheral"
  | "timer"
  | "analog"
  | "power"
  | "clock"
  | "debug"
  | "io"
  | "security"
  | "container"
  | "legend_swatch"
  | "other"

export type SystemShapeKind =
  | "rect"
  | "rounded_rect"
  | "stacked_rect"
  | "circle"
  | "ellipse"
  | "diamond"
  | "pill"
  | "bracket"
  | "custom_path"

export type SystemSignalKind =
  | "signal"
  | "bus"
  | "power"
  | "ground"
  | "clock"
  | "reset"
  | "analog"
  | "control"
  | "interrupt"
  | "fault"
  | "debug"
  | "io"
  | "other"

export type SystemMarker =
  | "none"
  | "arrow"
  | "open_arrow"
  | "triangle"
  | "bar"
  | "dot"
  | "diamond"

export interface SystemAppearance {
  fill_color?: string
  stroke_color?: string
  stroke_width?: number
  stroke_dash?:
    | "solid"
    | "dashed"
    | "dotted"
    | {
        dash_length: number
        gap_length: number
      }
  opacity?: number
  corner_radius?: number
}

export interface SystemTextStyle {
  color?: string
  font_size?: number
  font_weight?: "normal" | "bold"
  font_style?: "normal" | "italic"
  horizontal_align?: "left" | "center" | "right"
  vertical_align?: "top" | "middle" | "bottom"
  line_height?: number
}

export interface SystemDiagram {
  type: "system_diagram"
  system_diagram_id: string
  name?: string
  description?: string
  width?: number
  height?: number
  subcircuit_id?: string
}

export interface SystemStyle {
  type: "system_style"
  system_style_id: string
  system_diagram_id?: string
  name?: string
  description?: string
  semantic_role?: string
  appearance?: SystemAppearance
  text_style?: SystemTextStyle
}

export interface SystemComponent {
  type: "system_component"
  system_component_id: string
  system_diagram_id?: string
  parent_system_component_id?: string
  is_container?: boolean
  source_component_ids?: string[]
  source_group_ids?: string[]
  schematic_component_ids?: string[]
  pcb_component_ids?: string[]
  subcircuit_id?: string
  component_kind?: SystemComponentKind
  name?: string
  description?: string
  center: Point
  size: Size
  rotation?: number
  shape?: SystemShapeKind
  custom_path?: Point[]
  stack_count?: number
  stack_offset?: Point
  appearance?: SystemAppearance
  style_id?: string
  z_index?: number
  label?: string
  label_rotation?: number
  label_style?: SystemTextStyle
}

export interface SystemText {
  type: "system_text"
  system_text_id: string
  system_diagram_id?: string
  parent_system_component_id?: string
  attached_to_system_component_id?: string
  attached_to_system_connection_id?: string
  subcircuit_id?: string
  text: string
  position: Point
  rotation?: number
  anchor?: NinePointAnchor
  max_width?: number
  writing_mode?: "horizontal_tb" | "vertical_rl" | "vertical_lr"
  role?: "title" | "caption" | "pin_label" | "bus_label" | "legend" | "note" | "other"
  style?: SystemTextStyle
  z_index?: number
}

export interface SystemPort {
  type: "system_port"
  system_port_id: string
  system_diagram_id?: string
  system_component_id?: string
  is_external?: boolean
  center: Point
  side_of_component?: SystemSide
  side_of_diagram?: SystemSide
  facing_direction?: SystemDirection
  distance_from_component_edge?: number
  name?: string
  label?: string
  port_kind?: SystemSignalKind
  direction?: "input" | "output" | "bidirectional" | "passive" | "unknown"
  source_port_id?: string
  source_net_id?: string
  schematic_port_ids?: string[]
  pcb_port_ids?: string[]
  is_visible?: boolean
  label_position?: Point
  label_rotation?: number
  label_style?: SystemTextStyle
  subcircuit_id?: string
}

export type SystemEndpoint =
  | { type: "system_port"; system_port_id: string }
  | {
      type: "system_component_edge"
      system_component_id: string
      side: SystemSide
      offset?: number
    }
  | {
      type: "diagram_edge"
      side: SystemSide
      offset: number
      label?: string
    }
  | { type: "point"; point: Point }

export interface SystemConnectionBranch {
  path: Point[]
  endpoint?: SystemEndpoint
  marker_end?: SystemMarker
  label?: string
}

export interface SystemConnectionLabel {
  text: string
  position?: Point
  rotation?: number
  anchor?: NinePointAnchor
  style?: SystemTextStyle
}

export interface SystemConnection {
  type: "system_connection"
  system_connection_id: string
  system_diagram_id?: string
  subcircuit_id?: string
  source_system_port_id?: string
  target_system_port_id?: string
  system_port_ids?: string[]
  source?: SystemEndpoint
  target?: SystemEndpoint
  endpoints?: SystemEndpoint[]
  path?: Point[]
  branches?: SystemConnectionBranch[]
  routing_locked?: boolean
  name?: string
  signal_name?: string
  signal_kind?: SystemSignalKind
  bus_width?: number
  source_net_id?: string
  source_trace_id?: string
  appearance?: SystemAppearance
  style_id?: string
  marker_start?: SystemMarker
  marker_end?: SystemMarker
  labels?: SystemConnectionLabel[]
  z_index?: number
}

export interface SystemShape {
  type: "system_shape"
  system_shape_id: string
  system_diagram_id?: string
  parent_system_component_id?: string
  subcircuit_id?: string
  shape: "line" | "rect" | "circle" | "ellipse" | "polygon" | "path"
  center?: Point
  size?: Size
  start?: Point
  end?: Point
  points?: Point[]
  radius?: number
  rotation?: number
  appearance?: SystemAppearance
  style_id?: string
  z_index?: number
}

export interface SystemDiagnostic {
  type: "system_diagnostic"
  system_diagnostic_id: string
  system_diagram_id?: string
  severity: "error" | "warning" | "info"
  diagnostic_type: string
  message: string
  target_system_element_ids?: string[]
  center?: Point
  path?: Point[]
  subcircuit_id?: string
}

export type SystemDiagramElement =
  | SystemDiagram
  | SystemStyle
  | SystemComponent
  | SystemText
  | SystemPort
  | SystemConnection
  | SystemShape
  | SystemDiagnostic
