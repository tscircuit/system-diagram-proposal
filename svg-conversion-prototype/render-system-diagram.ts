import type {
  NinePointAnchor,
  Point,
  SystemAppearance,
  SystemComponent,
  SystemConnection,
  SystemDiagram,
  SystemDiagramElement,
  SystemShape,
  SystemStyle,
  SystemText,
  SystemTextStyle,
} from "../circuit-json-proposal/system-diagram-types"

type RenderableElement =
  | SystemComponent
  | SystemConnection
  | SystemShape
  | SystemText

const defaultInputPath = "reference-images/refimage001.json"
const defaultOutputPath = "svg-conversion-prototype/refimage001.svg"

const inputPath = Bun.argv[2] ?? defaultInputPath
const outputPath = Bun.argv[3] ?? defaultOutputPath

const rawJson = await Bun.file(inputPath).text()
const elements = JSON.parse(rawJson) as SystemDiagramElement[]
const svg = renderSystemDiagram(elements)

await Bun.write(outputPath, svg)
console.log(`Wrote ${outputPath}`)

export function renderSystemDiagram(elements: SystemDiagramElement[]): string {
  const diagram = elements.find(
    (element): element is SystemDiagram => element.type === "system_diagram",
  )

  if (!diagram) {
    throw new Error("Missing system_diagram element")
  }

  const width = diagram.width ?? 1000
  const height = diagram.height ?? 1000
  const styles = new Map(
    elements
      .filter((element): element is SystemStyle => element.type === "system_style")
      .map((style) => [style.system_style_id, style]),
  )

  const renderables = elements
    .filter((element): element is RenderableElement =>
      ["system_component", "system_connection", "system_shape", "system_text"].includes(
        element.type,
      ),
    )
    .map((element, index) => ({ element, index }))
    .sort((a, b) => getZIndex(a.element) - getZIndex(b.element) || a.index - b.index)

  const body = renderables
    .map(({ element }) => renderElement(element, styles))
    .filter(Boolean)
    .join("\n")

  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    `<defs>`,
    `<marker id="marker-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto-start-reverse">`,
    `<path d="M 0 0 L 10 5 L 0 10 z" fill="context-stroke" />`,
    `</marker>`,
    `<marker id="marker-open-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse">`,
    `<path d="M 1 1 L 9 5 L 1 9" fill="none" stroke="context-stroke" stroke-width="1.5" />`,
    `</marker>`,
    `</defs>`,
    `<rect width="100%" height="100%" fill="#ffffff" />`,
    body,
    `</svg>`,
  ].join("\n")
}

function renderElement(
  element: RenderableElement,
  styles: Map<string, SystemStyle>,
): string {
  switch (element.type) {
    case "system_component":
      return renderComponent(element, styles)
    case "system_connection":
      return renderConnection(element, styles)
    case "system_shape":
      return renderShape(element, styles)
    case "system_text":
      return renderText(element, styles)
  }
}

function renderComponent(
  component: SystemComponent,
  styles: Map<string, SystemStyle>,
): string {
  const style = component.style_id ? styles.get(component.style_id) : undefined
  const appearance = mergeAppearance(style?.appearance, component.appearance)
  const rects = []
  const stackCount = component.shape === "stacked_rect" ? component.stack_count ?? 2 : 1
  const stackOffset = component.stack_offset ?? { x: 5, y: 5 }

  for (let index = stackCount - 1; index >= 0; index -= 1) {
    const center = {
      x: component.center.x + stackOffset.x * index,
      y: component.center.y + stackOffset.y * index,
    }
    rects.push(renderRect(center, component.size, appearance))
  }

  if (!component.label) {
    return group(component.system_component_id, rects.join("\n"))
  }

  const labelStyle = mergeTextStyle(style?.text_style, component.label_style)
  rects.push(
    renderMultilineText({
      id: `${component.system_component_id}_label`,
      text: component.label,
      position: component.center,
      anchor: "center",
      rotation: component.label_rotation,
      style: labelStyle,
    }),
  )

  return group(component.system_component_id, rects.join("\n"))
}

function renderShape(shape: SystemShape, styles: Map<string, SystemStyle>): string {
  const style = shape.style_id ? styles.get(shape.style_id) : undefined
  const appearance = mergeAppearance(style?.appearance, shape.appearance)
  const attrs = appearanceAttrs(appearance)

  switch (shape.shape) {
    case "line":
      if (!shape.start || !shape.end) return ""
      return `<line id="${escapeAttr(shape.system_shape_id)}" x1="${shape.start.x}" y1="${shape.start.y}" x2="${shape.end.x}" y2="${shape.end.y}" ${attrs} />`
    case "rect":
      if (!shape.center || !shape.size) return ""
      return renderRect(shape.center, shape.size, appearance, shape.system_shape_id)
    case "circle":
      if (!shape.center || shape.radius === undefined) return ""
      return `<circle id="${escapeAttr(shape.system_shape_id)}" cx="${shape.center.x}" cy="${shape.center.y}" r="${shape.radius}" ${attrs} />`
    case "ellipse":
      if (!shape.center || !shape.size) return ""
      return `<ellipse id="${escapeAttr(shape.system_shape_id)}" cx="${shape.center.x}" cy="${shape.center.y}" rx="${shape.size.width / 2}" ry="${shape.size.height / 2}" ${attrs} />`
    case "polygon":
      if (!shape.points) return ""
      return `<polygon id="${escapeAttr(shape.system_shape_id)}" points="${pointsAttr(shape.points)}" ${attrs} />`
    case "path":
      if (!shape.points) return ""
      return `<polyline id="${escapeAttr(shape.system_shape_id)}" points="${pointsAttr(shape.points)}" ${attrs} />`
  }
}

function renderText(text: SystemText, styles: Map<string, SystemStyle>): string {
  const textStyle = text.style
  const attachedStyle =
    text.attached_to_system_component_id || text.parent_system_component_id
      ? findStyleForAttachedElement(text, styles)
      : undefined

  return renderMultilineText({
    id: text.system_text_id,
    text: text.text,
    position: text.position,
    anchor: text.anchor ?? "center",
    rotation: text.rotation,
    style: mergeTextStyle(attachedStyle, textStyle),
  })
}

function renderConnection(
  connection: SystemConnection,
  styles: Map<string, SystemStyle>,
): string {
  const style = connection.style_id ? styles.get(connection.style_id) : undefined
  const appearance = mergeAppearance(
    {
      fill_color: "none",
      stroke_color: "#000000",
      stroke_width: 2,
    },
    style?.appearance,
    connection.appearance,
  )
  const pieces: string[] = []

  if (connection.path && connection.path.length > 1) {
    pieces.push(
      renderPolyline(
        `${connection.system_connection_id}_path`,
        connection.path,
        appearance,
        connection.marker_start,
        connection.marker_end,
      ),
    )
  }

  if (connection.branches) {
    connection.branches.forEach((branch, index) => {
      if (branch.path.length < 2) return
      pieces.push(
        renderPolyline(
          `${connection.system_connection_id}_branch_${index}`,
          branch.path,
          appearance,
          undefined,
          branch.marker_end ?? connection.marker_end,
        ),
      )
    })
  }

  connection.labels?.forEach((label, index) => {
    if (!label.position) return
    pieces.push(
      renderMultilineText({
        id: `${connection.system_connection_id}_label_${index}`,
        text: label.text,
        position: label.position,
        anchor: label.anchor ?? "center",
        rotation: label.rotation,
        style: label.style,
      }),
    )
  })

  return group(connection.system_connection_id, pieces.join("\n"))
}

function renderRect(
  center: Point,
  size: { width: number; height: number },
  appearance: SystemAppearance,
  id?: string,
): string {
  const radius = appearance.corner_radius ?? 0
  const attrs = appearanceAttrs(appearance)
  const idAttr = id ? ` id="${escapeAttr(id)}"` : ""
  return `<rect${idAttr} x="${center.x - size.width / 2}" y="${center.y - size.height / 2}" width="${size.width}" height="${size.height}" rx="${radius}" ry="${radius}" ${attrs} />`
}

function renderPolyline(
  id: string,
  points: Point[],
  appearance: SystemAppearance,
  markerStart?: string,
  markerEnd?: string,
): string {
  const markerAttrs = [
    markerUrlAttr("marker-start", markerStart),
    markerUrlAttr("marker-end", markerEnd),
  ]
    .filter(Boolean)
    .join(" ")

  return `<polyline id="${escapeAttr(id)}" points="${pointsAttr(points)}" ${appearanceAttrs(appearance)} ${markerAttrs} />`
}

function renderMultilineText({
  id,
  text,
  position,
  anchor,
  rotation,
  style,
}: {
  id: string
  text: string
  position: Point
  anchor: NinePointAnchor
  rotation?: number
  style?: SystemTextStyle
}): string {
  const lines = text.split("\n")
  const lineHeight = style?.line_height ?? 1.15
  const fontSize = style?.font_size ?? 16
  const anchorAttrs = textAnchorAttrs(anchor)
  const transform = rotation
    ? ` transform="rotate(${rotation} ${position.x} ${position.y})"`
    : ""
  const firstDy = firstLineDy(anchor, lines.length, lineHeight)
  const tspans = lines
    .map((line, index) => {
      const dy = index === 0 ? firstDy : `${lineHeight}em`
      return `<tspan x="${position.x}" dy="${dy}">${escapeText(line)}</tspan>`
    })
    .join("")

  return `<text id="${escapeAttr(id)}" x="${position.x}" y="${position.y}"${transform} font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="${style?.font_weight ?? "normal"}" font-style="${style?.font_style ?? "normal"}" fill="${style?.color ?? "#000000"}" ${anchorAttrs}>${tspans}</text>`
}

function appearanceAttrs(appearance: SystemAppearance): string {
  const fill = appearance.fill_color ?? "none"
  const stroke = appearance.stroke_color ?? "#000000"
  const strokeWidth = appearance.stroke_width ?? 1
  const dash = strokeDashAttr(appearance.stroke_dash)
  const opacity = appearance.opacity === undefined ? "" : ` opacity="${appearance.opacity}"`
  return `fill="${escapeAttr(fill)}" stroke="${escapeAttr(stroke)}" stroke-width="${strokeWidth}"${dash}${opacity}`
}

function strokeDashAttr(strokeDash: SystemAppearance["stroke_dash"]): string {
  if (!strokeDash || strokeDash === "solid") return ""
  if (strokeDash === "dashed") return ` stroke-dasharray="8 6"`
  if (strokeDash === "dotted") return ` stroke-dasharray="1 5"`
  return ` stroke-dasharray="${strokeDash.dash_length} ${strokeDash.gap_length}"`
}

function markerUrlAttr(name: string, marker?: string): string {
  if (!marker || marker === "none") return ""
  if (marker === "open_arrow") return `${name}="url(#marker-open-arrow)"`
  if (marker === "arrow") return `${name}="url(#marker-arrow)"`
  if (marker === "triangle") return `${name}="url(#marker-arrow)"`
  return ""
}

function textAnchorAttrs(anchor: NinePointAnchor): string {
  const horizontal = anchor.endsWith("_left")
    ? "start"
    : anchor.endsWith("_right")
      ? "end"
      : "middle"
  const vertical = anchor.startsWith("top")
    ? "hanging"
    : anchor.startsWith("bottom")
      ? "text-after-edge"
      : "middle"
  return `text-anchor="${horizontal}" dominant-baseline="${vertical}"`
}

function firstLineDy(
  anchor: NinePointAnchor,
  lineCount: number,
  lineHeight: number,
): string {
  if (lineCount <= 1) return "0"
  if (anchor.startsWith("top")) return "0"
  if (anchor.startsWith("bottom")) return `${-(lineCount - 1) * lineHeight}em`
  return `${-(lineCount - 1) * 0.5 * lineHeight}em`
}

function pointsAttr(points: Point[]): string {
  return points.map((point) => `${point.x},${point.y}`).join(" ")
}

function group(id: string, contents: string): string {
  if (!contents) return ""
  return `<g id="${escapeAttr(id)}">\n${contents}\n</g>`
}

function getZIndex(element: RenderableElement): number {
  return "z_index" in element && typeof element.z_index === "number"
    ? element.z_index
    : defaultZIndex(element)
}

function defaultZIndex(element: RenderableElement): number {
  switch (element.type) {
    case "system_connection":
      return 20
    case "system_component":
      return 10
    case "system_shape":
      return 30
    case "system_text":
      return 40
  }
}

function mergeAppearance(
  ...appearances: Array<SystemAppearance | undefined>
): SystemAppearance {
  return Object.assign({}, ...appearances.filter(Boolean))
}

function mergeTextStyle(
  ...styles: Array<SystemTextStyle | undefined>
): SystemTextStyle | undefined {
  const merged = Object.assign({}, ...styles.filter(Boolean))
  return Object.keys(merged).length === 0 ? undefined : merged
}

function findStyleForAttachedElement(
  _text: SystemText,
  _styles: Map<string, SystemStyle>,
): SystemTextStyle | undefined {
  return undefined
}

function escapeText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

function escapeAttr(value: string): string {
  return escapeText(value).replaceAll("\"", "&quot;")
}
