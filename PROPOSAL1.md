The PR is a good topology seed, but it is too close to a pure graph model. It adds `system_diagram`, `system_component`, `system_port`, and `system_connection`; the current component is basically `center + size + label + schematic_component_ids`, and the current connection is basically ports plus a polyline path. That covers simple block diagrams, but not MCU datasheet-style diagrams with nested regions, buses rendered as blocks, external edge terminals, stacked boxes, rotated labels, legends, dashed regions, and non-electrical annotations. ([GitHub][1]) ([GitHub][2])

I would treat system block diagrams as a separate renderable “view” domain, similar to `schematic_` and `pcb_`, while keeping Circuit JSON’s existing flat-array, reference-based shape. Circuit JSON is already described as a low-level JSON-array of elements where elements reference other elements; that is a good fit here. It also already has a precedent for render primitives such as schematic lines, paths, rects, text, groups, ports, and errors/warnings. ([GitHub][3]) ([GitHub][3]) ([GitHub][3])

The clean model is: semantic blocks, ports, and connections are first-class; presentation is explicit but optional; pure drawing elements exist only for things that are not semantic system objects.

I’d revise the system domain toward this shape:

```ts
type SystemSide = "top" | "bottom" | "left" | "right"
type SystemDirection = "up" | "down" | "left" | "right"

type SystemComponentKind =
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

type SystemShapeKind =
  | "rect"
  | "rounded_rect"
  | "stacked_rect"
  | "circle"
  | "ellipse"
  | "diamond"
  | "pill"
  | "bracket"
  | "custom_path"

type SystemSignalKind =
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

type SystemMarker =
  | "none"
  | "arrow"
  | "open_arrow"
  | "triangle"
  | "bar"
  | "dot"
  | "diamond"

interface SystemAppearance {
  fill_color?: string
  stroke_color?: string
  stroke_width?: number
  stroke_dash?: "solid" | "dashed" | "dotted" | {
    dash_length: number
    gap_length: number
  }
  opacity?: number
  corner_radius?: number
}

interface SystemTextStyle {
  color?: string
  font_size?: number
  font_weight?: "normal" | "bold"
  font_style?: "normal" | "italic"
  horizontal_align?: "left" | "center" | "right"
  vertical_align?: "top" | "middle" | "bottom"
  line_height?: number
}

interface SystemDiagram {
  type: "system_diagram"
  system_diagram_id: string
  name?: string
  description?: string
  width?: number
  height?: number
  subcircuit_id?: string
}
```

For boxes, I would keep the PR’s `system_component` name unless you are willing to rename to `system_block`. The important additions are containment, appearance, shape, render order, and richer references:

```ts
interface SystemComponent {
  type: "system_component"
  system_component_id: string
  system_diagram_id?: string

  // Hierarchy / nesting
  parent_system_component_id?: string
  is_container?: boolean

  // Links back into the rest of circuit-json
  source_component_ids?: string[]
  source_group_ids?: string[]
  schematic_component_ids?: string[]
  pcb_component_ids?: string[]
  subcircuit_id?: string

  // Semantics
  component_kind?: SystemComponentKind
  name?: string
  description?: string

  // Geometry
  center: Point
  size: Size
  rotation?: number
  shape?: SystemShapeKind
  custom_path?: Point[]

  // For datasheet-style “stacked” boxes like UART1/UART2 or SPI0/SPI1
  stack_count?: number
  stack_offset?: Point

  // Presentation
  appearance?: SystemAppearance
  style_id?: string
  z_index?: number

  // Convenience label only. Use system_text for precise text layout.
  label?: string
  label_rotation?: number
  label_style?: SystemTextStyle
}
```

That one change handles most of the attached diagram: the outer chip outline is a `system_component` with `component_kind: "frame"`, CPU Subsystem is a nested `subsystem`, AHB Bus and peripheral buses are `component_kind: "bus"` with rotated labels, dashed CKM/PMU regions are container components with `stroke_dash: "dashed"`, and the duplicate-looking peripheral boxes can use `shape: "stacked_rect"` plus `stack_count`.

Text should be first-class. A single `label?: string` on a component will not cover multi-line captions, rotated bus text, footnotes, legend labels, pin labels, and inner CPU section labels. Existing schematic text already has fields like `text`, `font_size`, `position`, `rotation`, `anchor`, and `color`; system diagrams need the same kind of primitive. ([GitHub][3])

```ts
interface SystemText {
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

  // Useful for vertical datasheet text. Rotation is still enough for most cases.
  writing_mode?: "horizontal_tb" | "vertical_rl" | "vertical_lr"

  role?: "title" | "caption" | "pin_label" | "bus_label" | "legend" | "note" | "other"
  style?: SystemTextStyle
  z_index?: number
}
```

Ports need to represent both component ports and external diagram-edge terminals. The current PR requires `system_component_id`, which makes right-side labels like `TX, RX`, bottom supply pins, and top package pins awkward. ([GitHub][2])

```ts
interface SystemPort {
  type: "system_port"
  system_port_id: string
  system_diagram_id?: string

  // Optional because external ports live on the diagram boundary, not a block.
  system_component_id?: string
  is_external?: boolean

  // Geometry
  center: Point
  side_of_component?: SystemSide
  side_of_diagram?: SystemSide
  facing_direction?: SystemDirection
  distance_from_component_edge?: number

  // Semantics
  name?: string
  label?: string
  port_kind?: SystemSignalKind
  direction?: "input" | "output" | "bidirectional" | "passive" | "unknown"

  // Links back into circuit-json
  source_port_id?: string
  source_net_id?: string
  schematic_port_ids?: string[]
  pcb_port_ids?: string[]

  // Presentation
  is_visible?: boolean
  label_position?: Point
  label_rotation?: number
  label_style?: SystemTextStyle
  subcircuit_id?: string
}
```

Connections should not be limited to `source_system_port_id` and `target_system_port_id`. Block diagrams often connect to a block edge, an off-page edge, a bus block, a free point, or a multi-drop branch. Keep the simple fields for compatibility, but add endpoint objects.

```ts
type SystemEndpoint =
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

interface SystemConnectionBranch {
  path: Point[]
  endpoint?: SystemEndpoint
  marker_end?: SystemMarker
  label?: string
}

interface SystemConnectionLabel {
  text: string
  position?: Point
  rotation?: number
  anchor?: NinePointAnchor
  style?: SystemTextStyle
}

interface SystemConnection {
  type: "system_connection"
  system_connection_id: string
  system_diagram_id?: string
  subcircuit_id?: string

  // Backward-compatible simple fields
  source_system_port_id?: string
  target_system_port_id?: string
  system_port_ids?: string[]

  // More general model
  source?: SystemEndpoint
  target?: SystemEndpoint
  endpoints?: SystemEndpoint[]

  // Explicit route for deterministic rendering
  path?: Point[]
  branches?: SystemConnectionBranch[]
  routing_locked?: boolean

  // Semantics
  name?: string
  signal_name?: string
  signal_kind?: SystemSignalKind
  bus_width?: number
  source_net_id?: string
  source_trace_id?: string

  // Presentation
  appearance?: SystemAppearance
  style_id?: string
  marker_start?: SystemMarker
  marker_end?: SystemMarker
  labels?: SystemConnectionLabel[]
  z_index?: number
}
```

I’d also add two support elements: `system_style` and `system_shape`.

`system_style` is useful because the attached diagram’s colors are semantic: green means one access domain, yellow another, blue another. Inline `appearance` should remain legal so a renderer does not need cascading style resolution, but `style_id` makes legends and repeated colors cleaner.

```ts
interface SystemStyle {
  type: "system_style"
  system_style_id: string
  system_diagram_id?: string
  name?: string
  description?: string

  // Example: "pd1_cpu_access_only", "pd1_cpu_dma_access"
  semantic_role?: string

  appearance?: SystemAppearance
  text_style?: SystemTextStyle
}
```

`system_shape` covers non-semantic drawing details: divider lines inside the CPU box, legend squares, callout arrows that are not actual system connections, separator rules, and decorative frames. This avoids corrupting `system_component` with pure drawing artifacts.

```ts
interface SystemShape {
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
```

For actual errors and warnings, I would not make them visual boxes. Keep them as diagnostics that reference system elements. Circuit JSON already has error/warning-style elements in other domains, including schematic and source errors that reference element ids. ([GitHub][3]) ([GitHub][3])

```ts
interface SystemDiagnostic {
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
```

A fragment of the attached diagram would then look roughly like this:

```json
[
  {
    "type": "system_diagram",
    "system_diagram_id": "system_diagram_mcu",
    "name": "MCU System Block Diagram",
    "width": 120,
    "height": 160
  },
  {
    "type": "system_style",
    "system_style_id": "style_pd1_cpu_only",
    "name": "PD1, CPU access only",
    "semantic_role": "pd1_cpu_access_only",
    "appearance": {
      "fill_color": "#c8ffc8",
      "stroke_color": "#000000",
      "stroke_width": 0.2
    }
  },
  {
    "type": "system_style",
    "system_style_id": "style_pd1_cpu_dma",
    "name": "PD1, CPU/DMA access",
    "semantic_role": "pd1_cpu_dma_access",
    "appearance": {
      "fill_color": "#ffff99",
      "stroke_color": "#000000",
      "stroke_width": 0.2
    }
  },
  {
    "type": "system_component",
    "system_component_id": "sys_chip_frame",
    "system_diagram_id": "system_diagram_mcu",
    "component_kind": "frame",
    "center": { "x": 60, "y": 80 },
    "size": { "width": 105, "height": 145 },
    "appearance": {
      "fill_color": "transparent",
      "stroke_color": "#000000",
      "stroke_width": 0.2
    },
    "is_container": true,
    "z_index": 0
  },
  {
    "type": "system_component",
    "system_component_id": "sys_cpu_subsystem",
    "system_diagram_id": "system_diagram_mcu",
    "parent_system_component_id": "sys_chip_frame",
    "component_kind": "subsystem",
    "label": "CPU Subsystem",
    "center": { "x": 22, "y": 26 },
    "size": { "width": 25, "height": 30 },
    "style_id": "style_pd1_cpu_only",
    "is_container": true
  },
  {
    "type": "system_component",
    "system_component_id": "sys_ahb_bus",
    "system_diagram_id": "system_diagram_mcu",
    "parent_system_component_id": "sys_chip_frame",
    "component_kind": "bus",
    "label": "AHB Bus (MCLK)",
    "label_rotation": 90,
    "center": { "x": 50, "y": 35 },
    "size": { "width": 4, "height": 55 },
    "style_id": "style_pd1_cpu_only"
  },
  {
    "type": "system_component",
    "system_component_id": "sys_flash",
    "system_diagram_id": "system_diagram_mcu",
    "parent_system_component_id": "sys_chip_frame",
    "component_kind": "memory",
    "label": "FLASH",
    "center": { "x": 65, "y": 24 },
    "size": { "width": 13, "height": 5 },
    "style_id": "style_pd1_cpu_dma"
  },
  {
    "type": "system_text",
    "system_text_id": "txt_flash_size",
    "system_diagram_id": "system_diagram_mcu",
    "attached_to_system_component_id": "sys_flash",
    "text": "Up to 128KB",
    "position": { "x": 65, "y": 25.5 },
    "anchor": "center",
    "style": { "font_size": 1.2 }
  },
  {
    "type": "system_port",
    "system_port_id": "port_flash_bus",
    "system_diagram_id": "system_diagram_mcu",
    "system_component_id": "sys_flash",
    "center": { "x": 71.5, "y": 24 },
    "side_of_component": "right",
    "facing_direction": "right",
    "port_kind": "bus",
    "direction": "bidirectional",
    "is_visible": false
  },
  {
    "type": "system_port",
    "system_port_id": "port_ahb_flash",
    "system_diagram_id": "system_diagram_mcu",
    "system_component_id": "sys_ahb_bus",
    "center": { "x": 52, "y": 24 },
    "side_of_component": "right",
    "facing_direction": "right",
    "port_kind": "bus",
    "direction": "bidirectional",
    "is_visible": false
  },
  {
    "type": "system_connection",
    "system_connection_id": "conn_flash_ahb",
    "system_diagram_id": "system_diagram_mcu",
    "source": { "type": "system_port", "system_port_id": "port_flash_bus" },
    "target": { "type": "system_port", "system_port_id": "port_ahb_flash" },
    "signal_kind": "bus",
    "path": [
      { "x": 71.5, "y": 24 },
      { "x": 52, "y": 24 }
    ],
    "marker_start": "arrow",
    "marker_end": "arrow",
    "appearance": {
      "stroke_color": "#000000",
      "stroke_width": 0.2
    },
    "routing_locked": true
  }
]
```

The smallest PR update I’d make is not to model every possible datasheet diagram feature immediately. I’d do this in phases:

First, expand `system_component` with `parent_system_component_id`, `component_kind`, `shape`, `appearance`, `style_id`, `z_index`, `rotation`, and label rotation/style. That unlocks nested boxes, bus blocks, colors, dashed regions, stacked boxes, and containers.

Second, replace the connection endpoint model with generalized `SystemEndpoint`, while keeping `source_system_port_id`, `target_system_port_id`, and `system_port_ids` as compatibility/convenience fields. That unlocks arrows to diagram edges, block edges, buses, and free points.

Third, add `system_text`. Without this, the spec will keep accumulating ad hoc label fields and still fail on rotated bus labels, multi-line captions, footnotes, and legend text.

Fourth, add `system_shape` only as an escape hatch for non-semantic drawing primitives. This prevents turning every divider line or legend swatch into a fake component.

Fifth, add `system_style` if repeated colors/legend semantics matter. Inline appearance should stay legal.

That gives a spec that can represent the attached diagram without becoming arbitrary SVG, while still staying consistent with Circuit JSON’s existing element/reference style.

[1]: https://github.com/tscircuit/circuit-json/pull/604 "Add system block diagram elements by seveibar · Pull Request #604 · tscircuit/circuit-json · GitHub"
[2]: https://github.com/tscircuit/circuit-json/pull/604/files "Add system block diagram elements by seveibar · Pull Request #604 · tscircuit/circuit-json · GitHub"
[3]: https://github.com/tscircuit/circuit-json "GitHub - tscircuit/circuit-json: Circuit JSON a low-level circuit representation. Visually represent schematic, PCB, produce Gerber files, produce bill of materials, run SPICE simulations, view warnings and more. · GitHub"
