import type {
  Point,
  Size,
  SystemAppearance,
  SystemComponent,
  SystemConnection,
  SystemDiagramElement,
  SystemShape,
  SystemStyle,
  SystemText,
  SystemTextStyle,
} from "../circuit-json-proposal/system-diagram-types"

const outDir = "reference-images"

type DiagramCtx = {
  id: string
  elements: SystemDiagramElement[]
}

function diagram(id: string, name: string, width: number, height: number): DiagramCtx {
  return {
    id: `system_diagram_${id}`,
    elements: [
      {
        type: "system_diagram",
        system_diagram_id: `system_diagram_${id}`,
        name,
        description: `Semantic system_diagram recreation of reference-images/${id}.png.`,
        width,
        height,
      },
    ],
  }
}

function style(
  ctx: DiagramCtx,
  id: string,
  appearance: SystemAppearance,
  textStyle: SystemTextStyle = {},
): string {
  const styleId = `style_${ctx.id}_${id}`
  ctx.elements.push({
    type: "system_style",
    system_style_id: styleId,
    system_diagram_id: ctx.id,
    appearance,
    text_style: textStyle,
  } satisfies SystemStyle)
  return styleId
}

function comp(
  ctx: DiagramCtx,
  id: string,
  label: string,
  center: Point,
  size: Size,
  styleId: string,
  options: Partial<SystemComponent> = {},
) {
  ctx.elements.push({
    type: "system_component",
    system_component_id: id,
    system_diagram_id: ctx.id,
    component_kind: "module",
    label,
    center,
    size,
    style_id: styleId,
    ...options,
  } satisfies SystemComponent)
}

function text(
  ctx: DiagramCtx,
  id: string,
  value: string,
  position: Point,
  options: Partial<SystemText> = {},
) {
  ctx.elements.push({
    type: "system_text",
    system_text_id: id,
    system_diagram_id: ctx.id,
    text: value,
    position,
    anchor: "center",
    ...options,
  } satisfies SystemText)
}

function line(
  ctx: DiagramCtx,
  id: string,
  start: Point,
  end: Point,
  appearance: SystemAppearance,
  zIndex = 20,
) {
  ctx.elements.push({
    type: "system_shape",
    system_shape_id: id,
    system_diagram_id: ctx.id,
    shape: "line",
    start,
    end,
    appearance,
    z_index: zIndex,
  } satisfies SystemShape)
}

function connection(
  ctx: DiagramCtx,
  id: string,
  path: Point[],
  appearance: SystemAppearance,
  markerStart: SystemConnection["marker_start"] = "none",
  markerEnd: SystemConnection["marker_end"] = "none",
  labels: SystemConnection["labels"] = [],
  zIndex = 20,
) {
  ctx.elements.push({
    type: "system_connection",
    system_connection_id: id,
    system_diagram_id: ctx.id,
    path,
    appearance,
    marker_start: markerStart,
    marker_end: markerEnd,
    labels,
    z_index: zIndex,
  } satisfies SystemConnection)
}

function outlinedArrowH(
  ctx: DiagramCtx,
  id: string,
  x1: number,
  y: number,
  x2: number,
  options: { start?: boolean; end?: boolean; body?: number; head?: number; zIndex?: number } = {},
) {
  const start = options.start ?? true
  const end = options.end ?? true
  const body = options.body ?? 3
  const head = options.head ?? 12
  const points: Point[] = []

  if (start) {
    points.push({ x: x1, y }, { x: x1 + head, y: y - head * 0.5 })
  } else {
    points.push({ x: x1, y: y - body })
  }

  points.push(
    { x: x1 + (start ? head : 0), y: y - body },
    { x: x2 - (end ? head : 0), y: y - body },
  )

  if (end) {
    points.push({ x: x2 - head, y: y - head * 0.5 }, { x: x2, y })
    points.push({ x: x2 - head, y: y + head * 0.5 })
  } else {
    points.push({ x: x2, y: y - body }, { x: x2, y: y + body })
  }

  points.push(
    { x: x2 - (end ? head : 0), y: y + body },
    { x: x1 + (start ? head : 0), y: y + body },
  )

  if (start) {
    points.push({ x: x1 + head, y: y + head * 0.5 })
  } else {
    points.push({ x: x1, y: y + body })
  }

  ctx.elements.push({
    type: "system_shape",
    system_shape_id: id,
    system_diagram_id: ctx.id,
    shape: "polygon",
    points,
    appearance: { fill_color: "#ffffff", stroke_color: "#000000", stroke_width: 1.35 },
    z_index: options.zIndex ?? 28,
  } satisfies SystemShape)
}

function outlinedArrowV(
  ctx: DiagramCtx,
  id: string,
  x: number,
  y1: number,
  y2: number,
  options: { start?: boolean; end?: boolean; body?: number; head?: number; zIndex?: number } = {},
) {
  const start = options.start ?? true
  const end = options.end ?? true
  const body = options.body ?? 3
  const head = options.head ?? 12
  const points: Point[] = []

  if (start) {
    points.push({ x, y: y1 }, { x: x + head * 0.5, y: y1 + head })
  } else {
    points.push({ x: x + body, y: y1 })
  }

  points.push(
    { x: x + body, y: y1 + (start ? head : 0) },
    { x: x + body, y: y2 - (end ? head : 0) },
  )

  if (end) {
    points.push({ x: x + head * 0.5, y: y2 - head }, { x, y: y2 })
    points.push({ x: x - head * 0.5, y: y2 - head })
  } else {
    points.push({ x: x + body, y: y2 }, { x: x - body, y: y2 })
  }

  points.push(
    { x: x - body, y: y2 - (end ? head : 0) },
    { x: x - body, y: y1 + (start ? head : 0) },
  )

  if (start) {
    points.push({ x: x - head * 0.5, y: y1 + head })
  } else {
    points.push({ x: x - body, y: y1 })
  }

  ctx.elements.push({
    type: "system_shape",
    system_shape_id: id,
    system_diagram_id: ctx.id,
    shape: "polygon",
    points,
    appearance: { fill_color: "#ffffff", stroke_color: "#000000", stroke_width: 1.35 },
    z_index: options.zIndex ?? 28,
  } satisfies SystemShape)
}

function outlinedElbowDown(
  ctx: DiagramCtx,
  id: string,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  options: { body?: number; head?: number; zIndex?: number } = {},
) {
  const body = options.body ?? 4
  const head = options.head ?? 14
  const points: Point[] = [
    { x: x1, y: y1 },
    { x: x1 + head, y: y1 - head * 0.5 },
    { x: x1 + head, y: y1 - body },
    { x: x2 + body, y: y1 - body },
    { x: x2 + body, y: y2 - head },
    { x: x2 + head * 0.5, y: y2 - head },
    { x: x2, y: y2 },
    { x: x2 - head * 0.5, y: y2 - head },
    { x: x2 - body, y: y2 - head },
    { x: x2 - body, y: y1 + body },
    { x: x1 + head, y: y1 + body },
    { x: x1 + head, y: y1 + head * 0.5 },
  ]

  ctx.elements.push({
    type: "system_shape",
    system_shape_id: id,
    system_diagram_id: ctx.id,
    shape: "polygon",
    points,
    appearance: { fill_color: "#ffffff", stroke_color: "#000000", stroke_width: 1.35 },
    z_index: options.zIndex ?? 28,
  } satisfies SystemShape)
}

function gridBlocks(
  ctx: DiagramCtx,
  prefix: string,
  labels: string[],
  left: number,
  top: number,
  cols: number,
  box: Size,
  gap: Point,
  styleId: string,
  options: Partial<SystemComponent> = {},
) {
  labels.forEach((label, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    comp(
      ctx,
      `${prefix}_${index}`,
      label,
      { x: left + box.width / 2 + col * (box.width + gap.x), y: top + box.height / 2 + row * (box.height + gap.y) },
      box,
      styleId,
      options,
    )
  })
}

function ref003(): DiagramCtx {
  const ctx = diagram("refimage003", "STM32G030x6/x8 block diagram", 1400, 1406)
  const black = "#111111"
  const white = style(ctx, "white", { fill_color: "#ffffff", stroke_color: black, stroke_width: 1.8 }, { font_size: 17, line_height: 1.08 })
  const chip = style(ctx, "chip", { fill_color: "transparent", stroke_color: black, stroke_width: 2.4 })
  const pale = style(ctx, "pale", { fill_color: "#f7f7f7", stroke_color: black, stroke_width: 1.5 }, { font_size: 20, line_height: 1.05 })
  const peach = style(ctx, "peach", { fill_color: "#f6ddc0", stroke_color: "none", stroke_width: 0 }, { font_size: 20 })
  const violet = style(ctx, "violet", { fill_color: "#beb2d0", stroke_color: "none", stroke_width: 0 }, { font_size: 20 })
  const green = style(ctx, "green", { fill_color: "#b9dbc9", stroke_color: "none", stroke_width: 0 }, { font_size: 20 })
  const gray = style(ctx, "gray", { fill_color: "#bcbcbc", stroke_color: "none", stroke_width: 0 }, { font_size: 20 })
  const bus = { fill_color: "none", stroke_color: black, stroke_width: 2 }

  text(ctx, "title", "STM32G030x6/x8", { x: 175, y: 78 }, { anchor: "middle_left", style: { font_size: 29, font_weight: "bold" } })
  text(ctx, "desc", "Description", { x: 1240, y: 78 }, { style: { font_size: 26, font_weight: "bold" } })
  line(ctx, "top_rule", { x: 100, y: 105 }, { x: 1330, y: 105 }, { stroke_color: black, stroke_width: 2, fill_color: "none" }, 1)
  text(ctx, "figure", "Figure 1. Block diagram", { x: 700, y: 162 }, { style: { font_size: 27, font_weight: "bold" } })
  comp(ctx, "chip_frame", "", { x: 715, y: 760 }, { width: 1228, height: 1160 }, chip, { is_container: true, z_index: 0 })
  comp(ctx, "cpu", "CPU\nCORTEX-M0+\nfmax = 64 MHz", { x: 386, y: 353 }, { width: 186, height: 226 }, white, { is_container: true })
  comp(ctx, "swd", "SWD", { x: 331, y: 267 }, { width: 74, height: 56 }, white)
  comp(ctx, "nvic", "NVIC", { x: 332, y: 444 }, { width: 74, height: 48 }, white)
  comp(ctx, "ioport", "IOPORT", { x: 438, y: 444 }, { width: 78, height: 48 }, white)
  comp(ctx, "gpio_domain", "", { x: 346, y: 637 }, { width: 100, height: 224 }, peach, { z_index: 1 })
  text(ctx, "gpio_label", "GPIOs", { x: 347, y: 531 }, { style: { font_size: 22 } })
  gridBlocks(ctx, "gpio", ["Port A", "Port B", "Port C", "Port D", "Port F"], 305, 550, 1, { width: 82, height: 31 }, { x: 0, y: 30 }, white)
  comp(ctx, "exti", "EXTI", { x: 350, y: 791 }, { width: 90, height: 45 }, white)
  comp(ctx, "decoder", "decoder", { x: 450, y: 646 }, { width: 38, height: 215 }, white, { label_rotation: -90, label_style: { font_size: 17 } })
  ctx.elements.push({
    type: "system_shape",
    system_shape_id: "bus_matrix_outline",
    system_diagram_id: ctx.id,
    shape: "polygon",
    points: [
      { x: 530, y: 235 },
      { x: 562, y: 267 },
      { x: 562, y: 506 },
      { x: 530, y: 552 },
    ],
    appearance: { fill_color: "#ffffff", stroke_color: black, stroke_width: 1.8 },
    z_index: 10,
  } satisfies SystemShape)
  text(ctx, "bus_matrix_label", "Bus matrix", { x: 543, y: 393 }, { rotation: -90, style: { font_size: 17 } })
  comp(ctx, "dma", "DMAMUX\n\nDMA", { x: 663, y: 275 }, { width: 86, height: 80 }, white)
  line(ctx, "dma_split", { x: 620, y: 275 }, { x: 706, y: 275 }, { fill_color: "none", stroke_color: black, stroke_width: 1.5 }, 30)
  comp(ctx, "if_flash", "I/F", { x: 641, y: 358 }, { width: 38, height: 47 }, white)
  comp(ctx, "flash", "Flash memory\nup to 64 KB", { x: 754, y: 363 }, { width: 116, height: 55 }, white)
  comp(ctx, "sram", "SRAM\n8 KB", { x: 711, y: 432 }, { width: 116, height: 51 }, white)
  comp(ctx, "parity", "Parity", { x: 782, y: 432 }, { width: 67, height: 51 }, white)
  comp(ctx, "rcc", "RCC\nReset & clock control", { x: 711, y: 673 }, { width: 109, height: 66 }, white, { label_style: { font_size: 12, line_height: 1.05 } })
  comp(ctx, "pll_domain", "", { x: 847, y: 528 }, { width: 126, height: 130 }, violet, { z_index: 1 })
  gridBlocks(ctx, "clockbox", ["RC 16 MHz", "PLL", "RC 32 kHz"], 800, 477, 1, { width: 102, height: 28 }, { x: 0, y: 39 }, white)
  text(ctx, "hsi16_label", "HSI16", { x: 743, y: 469 }, { style: { font_size: 17 } })
  text(ctx, "pll_pclk_label", "PLLPCLK", { x: 742, y: 501 }, { style: { font_size: 17 } })
  text(ctx, "pll_rclk_label", "PLLRCLK", { x: 742, y: 529 }, { style: { font_size: 17 } })
  text(ctx, "lsi_label", "LSI", { x: 744, y: 557 }, { style: { font_size: 17 } })
  text(ctx, "hse_label", "HSE", { x: 779, y: 612 }, { style: { font_size: 17 } })
  text(ctx, "lse_label", "LSE", { x: 817, y: 662 }, { style: { font_size: 17 } })
  comp(ctx, "xtal", "XTAL OSC\n4-48 MHz", { x: 1036, y: 573 }, { width: 116, height: 54 }, white)
  comp(ctx, "power_reg", "Voltage\nregulator", { x: 1030, y: 276 }, { width: 106, height: 54 }, white)
  comp(ctx, "power_header", "POWER", { x: 1029, y: 247 }, { width: 128, height: 18 }, gray, { label_style: { font_size: 13 } })
  comp(ctx, "power_domain", "", { x: 1030, y: 421 }, { width: 128, height: 123 }, violet, { z_index: 1 })
  text(ctx, "supply_label", "SUPPLY\nSUPERVISION", { x: 1030, y: 382 }, { style: { font_size: 13, line_height: 1.0 } })
  gridBlocks(ctx, "supply", ["POR", "T sensor"], 981, 395, 1, { width: 96, height: 31 }, { x: 0, y: 27 }, white)
  comp(ctx, "iwdg", "IWDG", { x: 1035, y: 618 }, { width: 114, height: 36 }, white)
  comp(ctx, "if_xtal", "I/F", { x: 1005, y: 650 }, { width: 58, height: 31 }, white)
  text(ctx, "low_voltage_detector", "Low-voltage\ndetector", { x: 1009, y: 684 }, { style: { font_size: 13, line_height: 1.05 } })
  text(ctx, "vdd_small", "VDD", { x: 1058, y: 660 }, { style: { font_size: 12 } })
  comp(ctx, "lse_domain", "", { x: 1030, y: 766 }, { width: 128, height: 101 }, green, { z_index: 1 })
  gridBlocks(ctx, "rtc", ["XTAL32 kHz", "RTC, TAMP\nBackup regs"], 981, 717, 1, { width: 110, height: 30 }, { x: 0, y: 29 }, white, { label_style: { font_size: 18, line_height: 1 } })
  comp(ctx, "rtc_if", "I/F", { x: 987, y: 820 }, { width: 58, height: 31 }, white)
  text(ctx, "vcore_label", "VCORE", { x: 845, y: 278 }, { style: { font_size: 18 } })
  text(ctx, "vddio1_label", "VDDIO1", { x: 852, y: 315 }, { style: { font_size: 18 } })
  text(ctx, "vdda_label", "VDDA", { x: 851, y: 340 }, { style: { font_size: 18 } })
  text(ctx, "vdd_label", "VDD", { x: 851, y: 363 }, { style: { font_size: 18 } })
  text(ctx, "external_supply_label", "VDD/VDDA\nVSS/VSSA", { x: 1143, y: 340 }, { anchor: "middle_left", style: { font_size: 18, line_height: 1.05 } })
  comp(ctx, "crc", "CRC", { x: 529, y: 638 }, { width: 72, height: 40 }, white)
  comp(ctx, "adc_domain", "", { x: 353, y: 974 }, { width: 119, height: 128 }, violet, { z_index: 1 })
  comp(ctx, "adc", "ADC", { x: 356, y: 989 }, { width: 92, height: 59 }, white)
  comp(ctx, "adc_if", "I/F", { x: 414, y: 989 }, { width: 31, height: 59 }, white)
  comp(ctx, "spi1", "SPI1/I2S", { x: 361, y: 1079 }, { width: 132, height: 40 }, white)
  comp(ctx, "spi2", "SPI2", { x: 361, y: 1160 }, { width: 132, height: 40 }, white)
  text(ctx, "system_peripheral_clocks", "System and\nperipheral\nclocks", { x: 724, y: 755 }, { style: { font_size: 18, line_height: 1.05 } })
  comp(ctx, "sycfg", "SYSCFG", { x: 735.5, y: 977.5 }, { width: 119, height: 37 }, white)
  comp(ctx, "pwrctrl", "PWRCTRL", { x: 735.5, y: 1077.5 }, { width: 119, height: 37 }, white)
  comp(ctx, "wwdg", "WWDG", { x: 735.5, y: 1128 }, { width: 119, height: 37 }, white)
  comp(ctx, "dbgmcu", "DBGMCU", { x: 735.5, y: 1178 }, { width: 119, height: 37 }, white)
  gridBlocks(ctx, "right_periph", ["TIM1", "TIM3", "TIM14", "TIM16 & 17", "USART1", "USART2", "I2C1", "I2C2"], 954, 872, 1, { width: 138, height: 31 }, { x: 0, y: 16 }, white, { label_style: { font_size: 18 } })
  comp(ctx, "apb_left", "APB", { x: 554, y: 1067.5 }, { width: 25, height: 357 }, white, { label_rotation: -90 })
  comp(ctx, "apb_right", "APB", { x: 882, y: 947.5 }, { width: 25, height: 615 }, white, { label_rotation: -90 })
  comp(ctx, "ahb_apb", "AHB-to-APB", { x: 622, y: 832 }, { width: 101, height: 31 }, white)
  outlinedArrowH(ctx, "cpu_to_bus_outline_arrow", 480, 355, 534, { head: 12 })
  outlinedArrowH(ctx, "bus_to_dma_outline_arrow", 558, 282, 620, { head: 12 })
  outlinedArrowH(ctx, "bus_to_if_outline_arrow", 558, 362, 622, { head: 10 })
  outlinedArrowH(ctx, "if_to_flash_outline_arrow", 660, 362, 696, { head: 8 })
  outlinedArrowH(ctx, "bus_to_sram_outline_arrow", 558, 432, 653, { head: 12 })
  line(ctx, "left_port_spine", { x: 270, y: 240 }, { x: 270, y: 1278 }, { stroke_color: black, stroke_width: 1.5, fill_color: "none" }, 2)
  line(ctx, "right_port_spine", { x: 1119, y: 326 }, { x: 1119, y: 1278 }, { stroke_color: black, stroke_width: 1.5, fill_color: "none" }, 2)
  line(ctx, "inner_chip_top", { x: 270, y: 205 }, { x: 1119, y: 205 }, { stroke_color: black, stroke_width: 1.5, fill_color: "none" }, 2)
  line(ctx, "inner_chip_bottom", { x: 270, y: 1278 }, { x: 1119, y: 1278 }, { stroke_color: black, stroke_width: 1.5, fill_color: "none" }, 2)
  text(ctx, "swclk_label", "SWCLK\nSWDIO", { x: 197, y: 270 }, { anchor: "middle_right", style: { font_size: 18, line_height: 1.05 } })
  outlinedArrowH(ctx, "swd_external_outline_arrow", 237, 258, 294, { head: 12 })
  outlinedArrowH(ctx, "swdio_external_outline_arrow", 237, 278, 294, { head: 12 })
  outlinedArrowH(ctx, "gpio_to_decoder_a_outline_arrow", 387, 563, 432, { head: 12 })
  outlinedArrowH(ctx, "gpio_to_decoder_b_outline_arrow", 387, 607, 432, { head: 12 })
  outlinedArrowH(ctx, "gpio_to_decoder_c_outline_arrow", 387, 651, 432, { head: 12 })
  outlinedArrowH(ctx, "gpio_to_decoder_d_outline_arrow", 387, 695, 432, { head: 12 })
  outlinedArrowH(ctx, "gpio_to_decoder_f_outline_arrow", 387, 739, 432, { head: 12 })
  outlinedArrowH(ctx, "exti_from_peripherals_outline_arrow", 396, 778, 607, { head: 12 })
  text(ctx, "from_peripherals", "from peripherals", { x: 433, y: 830 }, { style: { font_size: 15 } })
  outlinedArrowH(ctx, "crc_to_bus_outline_arrow", 565, 638, 612, { head: 15 })
  outlinedArrowH(ctx, "adc_to_apb_outline_arrow", 445, 989, 541.5, { head: 16 })
  outlinedArrowH(ctx, "spi1_to_apb_outline_arrow", 427, 1079, 541.5, { head: 16 })
  outlinedArrowH(ctx, "spi2_to_apb_outline_arrow", 427, 1160, 541.5, { head: 16 })
  outlinedElbowDown(ctx, "bus_matrix_to_ahb_bus_outline_arrow", 562, 506, 620, 676, { body: 4, head: 14 })
  outlinedArrowV(ctx, "ahb_to_ahb_apb_outline_arrow", 620, 676, 816, { start: false, body: 5, head: 16 })
  connection(ctx, "ahb_to_rcc_branch", [{ x: 625, y: 790 }, { x: 650, y: 790 }, { x: 650, y: 673 }, { x: 656.5, y: 673 }], { ...bus, stroke_width: 1.5 }, "none", "open_arrow", [], 5)
  outlinedArrowV(ctx, "ahb_apb_to_bus_outline_arrow", 622, 848, 910, { end: false, head: 14 })
  outlinedArrowH(ctx, "lower_bus_to_right_apb_outline_arrow", 570, 910, 882, { head: 12 })
  connection(ctx, "rcc_to_clocks", [{ x: 699, y: 640 }, { x: 699, y: 480 }, { x: 800, y: 480 }], bus, "none", "arrow")
  connection(ctx, "pll_to_xtal", [{ x: 904, y: 548 }, { x: 945, y: 548 }, { x: 945, y: 572 }, { x: 978, y: 572 }], bus, "none", "arrow")
  connection(ctx, "vcore_to_power", [{ x: 882, y: 280 }, { x: 977, y: 280 }], bus, "arrow", "none")
  connection(ctx, "vddio_to_power", [{ x: 882, y: 318 }, { x: 977, y: 318 }], bus, "arrow", "none")
  connection(ctx, "vdda_to_power", [{ x: 882, y: 340 }, { x: 919, y: 340 }, { x: 919, y: 340 }, { x: 977, y: 340 }], bus, "arrow", "none")
  connection(ctx, "vdd_to_power", [{ x: 882, y: 363 }, { x: 919, y: 363 }, { x: 919, y: 340 }], bus, "arrow", "none")
  connection(ctx, "power_to_external_supply", [{ x: 1085, y: 340 }, { x: 1134, y: 340 }], bus, "none", "open_arrow")
  text(ctx, "por_label", "POR", { x: 928, y: 401 }, { anchor: "middle_right", style: { font_size: 17 } })
  text(ctx, "reset_label", "Reset", { x: 928, y: 422 }, { anchor: "middle_right", style: { font_size: 17 } })
  text(ctx, "int_label", "Int", { x: 928, y: 444 }, { anchor: "middle_right", style: { font_size: 17 } })
  connection(ctx, "por_reset_int", [{ x: 954, y: 401 }, { x: 981, y: 401 }], bus, "arrow", "none")
  outlinedArrowH(ctx, "rtc_if_to_apb_outline_arrow", 894.5, 820, 958, { head: 10 })
  outlinedArrowV(ctx, "supply_vertical_outline_arrow", 1030, 483, 544, { head: 12 })
  connection(ctx, "xtal_to_iwdg", [{ x: 1035, y: 600 }, { x: 1035, y: 636 }], bus, "none", "none")
  outlinedArrowH(ctx, "rtc_bidir_outline_arrow", 1092, 778, 1134, { head: 10 })
  ;[887, 934, 981, 1028, 1075, 1122, 1169, 1216].forEach((y, i) => {
    outlinedArrowH(ctx, `right_periph_bus_${i}_outline_arrow`, 894.5, y, 954, { head: 8 })
  })
  ;[
    ["sycfg_to_apb", 977.5],
    ["pwrctrl_to_apb", 1077.5],
    ["wwdg_to_apb", 1128],
    ["dbgmcu_to_apb", 1178],
  ].forEach(([id, y]) => {
    outlinedArrowH(ctx, `${id as string}_outline_arrow`, 795, y as number, 869, {
      head: 12,
    })
  })
  ;[
    { id: "tim3_right_label", label: "4 channels\nETR", y: 934 },
    { id: "tim14_right_label", label: "1 channel", y: 981 },
    { id: "tim16_right_label", label: "1 channel\nBK", y: 1028 },
    { id: "usart2_right_label", label: "RX, TX\nCTS, RTS, CK", y: 1122 },
    { id: "i2c1_right_label", label: "SCL, SDA, SMBA", y: 1169 },
    { id: "i2c2_right_label", label: "SCL, SDA", y: 1216 },
  ].forEach(({ id, label, y }) => {
    text(ctx, id, label, { x: 1148, y }, { anchor: "middle_left", style: { font_size: 17, line_height: 1.05 } })
    comp(ctx, `${id}_square`, "", { x: 1119, y }, { width: 13, height: 13 }, white, { z_index: 35 })
    connection(ctx, `${id}_line`, [{ x: 1100, y }, { x: 1134, y }], bus, "open_arrow", "none")
  })
  ;["PAx", "PBx", "PCx", "PDx", "PFx", "VREF+", "16x IN", "MOSI/SD\nMISO/MCK\nSCK/CK\nNSS/WS", "MOSI, MISO\nSCK, NSS"].forEach((label, i) => {
    const y = [600, 648, 694, 739, 786, 920, 991, 1087, 1158][i]!
    text(ctx, `left_pin_${i}`, label, { x: 220, y }, { anchor: "middle_right", style: { font_size: 17, line_height: 1.05 } })
    comp(ctx, `left_pin_square_${i}`, "", { x: 270, y }, { width: 13, height: 13 }, white, { z_index: 35 })
    connection(ctx, `left_pin_line_${i}`, [{ x: 270, y }, { x: 295, y }], bus, "none", "open_arrow")
  })
  ;["OSC_IN\nOSC_OUT", "NRST", "VBAT", "OSC32_IN\nOSC32_OUT", "RTC_OUT\nRTC_REFIN\nRTC_TS\nTAMP_IN", "4 channels\nBK, BK2, ETR", "RX, TX\nCTS, RTS, CK"].forEach((label, i) => {
    const y = [588, 436, 659, 742, 790, 883, 1080][i]!
    text(ctx, `right_pin_${i}`, label, { x: 1148, y }, { anchor: "middle_left", style: { font_size: 17, line_height: 1.05 } })
    comp(ctx, `right_pin_square_${i}`, "", { x: 1119, y }, { width: 13, height: 13 }, white, { z_index: 35 })
    connection(ctx, `right_pin_line_${i}`, [{ x: 1100, y }, { x: 1134, y }], bus, "open_arrow", "none")
  })
  comp(ctx, "legend_vbat_swatch", "", { x: 532, y: 1310 }, { width: 42, height: 24 }, green)
  text(ctx, "legend_vbat_label", "VBAT", { x: 562, y: 1312 }, { anchor: "middle_left", style: { font_size: 17 } })
  comp(ctx, "legend_vdd_swatch", "", { x: 659, y: 1310 }, { width: 42, height: 24 }, gray)
  text(ctx, "legend_vdd_label", "VDD", { x: 689, y: 1312 }, { anchor: "middle_left", style: { font_size: 17 } })
  comp(ctx, "legend_vdda_swatch", "", { x: 786, y: 1310 }, { width: 42, height: 24 }, violet)
  text(ctx, "legend_vdda_label", "VDDA", { x: 816, y: 1312 }, { anchor: "middle_left", style: { font_size: 17 } })
  comp(ctx, "legend_vddio_swatch", "", { x: 913, y: 1310 }, { width: 42, height: 24 }, peach)
  text(ctx, "legend_vddio_label", "VDDIO1", { x: 943, y: 1312 }, { anchor: "middle_left", style: { font_size: 17 } })
  text(ctx, "legend_label", "Power domain of analog blocks :", { x: 338, y: 1312 }, { style: { font_size: 19 } })
  return ctx
}

function ref004(): DiagramCtx {
  const ctx = diagram("refimage004", "nRF52840 block diagram", 1130, 1630)
  const stroke = "#555555"
  const mono = style(ctx, "mono", { fill_color: "#ffffff", stroke_color: stroke, stroke_width: 1.8 }, { font_size: 16, line_height: 1.05 })
  const frame = style(ctx, "frame", { fill_color: "#e9e9e9", stroke_color: stroke, stroke_width: 2.4 }, { font_size: 16 })
  const busStyle = { fill_color: "none", stroke_color: "#666666", stroke_width: 1.6 }
  const blackPinStyle = { ...busStyle, stroke_color: "#111111", stroke_width: 1.8 }
  text(ctx, "title", "nRF52840", { x: 166, y: 53 }, { anchor: "middle_left", style: { font_size: 17 } })
  comp(ctx, "chip", "", { x: 565, y: 815 }, { width: 816, height: 1568 }, frame, { is_container: true, z_index: 0 })
  gridBlocks(ctx, "ram", ["RAM₀", "RAM₁", "RAM₂", "RAM₃", "RAM₄", "RAM₅", "RAM₆", "RAM₇", "RAM₈", "GPIO"], 283, 42, 10, { width: 59, height: 60 }, { x: 6, y: 0 }, mono, { label_style: { font_size: 15 } })
  comp(ctx, "ahb_multilayer", "AHB multilayer", { x: 619, y: 286 }, { width: 663, height: 62 }, mono, { label_style: { font_size: 16 } })
  comp(ctx, "cpu_cluster", "", { x: 295, y: 489 }, { width: 250, height: 128 }, mono, { is_container: true })
  comp(ctx, "ahb_ap", "AHB-AP", { x: 210, y: 425 }, { width: 82, height: 36 }, mono, { label_style: { font_size: 14 } })
  comp(ctx, "etm", "ETM", { x: 294, y: 425 }, { width: 84, height: 36 }, mono, { label_style: { font_size: 14 } })
  text(ctx, "cpu_label", "CPU\nARM\nCORTEX-M4", { x: 295, y: 492 }, { style: { font_size: 16, line_height: 1.05 } })
  comp(ctx, "nvic", "NVIC", { x: 255, y: 571 }, { width: 84, height: 38 }, mono)
  comp(ctx, "systick", "SysTick", { x: 346, y: 571 }, { width: 84, height: 38 }, mono)
  comp(ctx, "ahb_apb_bridge", "AHB TO APB\nBRIDGE", { x: 506, y: 462 }, { width: 123, height: 94 }, mono)
  comp(ctx, "apb0_bus", "APB0", { x: 486, y: 1040 }, { width: 22, height: 820 }, mono, { label_rotation: -90, label_style: { font_size: 13 } })
  comp(ctx, "apb_bus", "APB", { x: 625, y: 920 }, { width: 30, height: 1206 }, mono, { label_rotation: -90 })
  comp(ctx, "ficr", "FICR", { x: 726, y: 431 }, { width: 58, height: 62 }, mono, { label_style: { font_size: 14 } })
  comp(ctx, "uicr", "UICR", { x: 794, y: 431 }, { width: 58, height: 62 }, mono, { label_style: { font_size: 14 } })
  comp(ctx, "flash_code", "I-Cache\nCODE", { x: 878, y: 443 }, { width: 97, height: 102 }, mono, { label_style: { font_size: 14, line_height: 1.05 } })
  comp(ctx, "nvmc", "NVMC", { x: 796, y: 544 }, { width: 165, height: 30 }, mono, { label_style: { font_size: 14 } })
  gridBlocks(ctx, "left_debug", ["TPIU", "SW-DP", "CTRL-AP"], 207, 115, 1, { width: 75, height: 62 }, { x: 0, y: 28 }, mono)
  gridBlocks(ctx, "left_stack", ["POWER", "WDT", "PPI", "CLOCK", "", "", "", "GPIOTE", "COMP", "LPCOMP", "", "QDEC", "", "", ""], 251, 610, 1, { width: 170, height: 48 }, { x: 0, y: 14 }, mono, { label_style: { font_size: 15, line_height: 1.05 } })
  gridBlocks(ctx, "right_stack", ["RNG", "RTC [0..2]", "TIMER [0..4]", "TEMP", "", "", "", "", "", "", ""], 715, 575, 1, { width: 166, height: 48 }, { x: 0, y: 13 }, mono, { label_style: { font_size: 15, line_height: 1.05 } })
  ;[
    { id: "radio", title: "RADIO", x1: 251, x2: 421, cx: 336, cy: 882, bottom: "EasyDMA" },
    { id: "usbd", title: "USBD", x1: 251, x2: 421, cx: 336, cy: 944, bottom: "EasyDMA" },
    { id: "nfct", title: "NFCT", x1: 251, x2: 421, cx: 336, cy: 1006, bottom: "EasyDMA" },
    { id: "saadc", title: "SAADC", x1: 251, x2: 421, cx: 336, cy: 1254, bottom: "EasyDMA" },
    { id: "pwm", title: "PWM [0..3]", x1: 251, x2: 421, cx: 336, cy: 1378, bottom: "EasyDMA" },
    { id: "i2s", title: "I2S", x1: 251, x2: 421, cx: 336, cy: 1440, bottom: "EasyDMA" },
    { id: "pdm", title: "PDM", x1: 251, x2: 421, cx: 336, cy: 1502, bottom: "EasyDMA" },
    { id: "ecb", title: "ECB", x1: 715, x2: 881, cx: 798, cy: 843, bottom: "EasyDMA" },
    { id: "ccm", title: "CCM", x1: 715, x2: 881, cx: 798, cy: 904, bottom: "EasyDMA" },
    { id: "aar", title: "AAR", x1: 715, x2: 881, cx: 798, cy: 965, bottom: "EasyDMA" },
    { id: "cryptocell", title: "CryptoCell", x1: 715, x2: 881, cx: 798, cy: 1026, bottom: "DMA" },
    { id: "spim", title: "SPIM [0..3]", x1: 715, x2: 881, cx: 798, cy: 1087, bottom: "EasyDMA" },
    { id: "twis", title: "TWIS [0..1]", x1: 715, x2: 881, cx: 798, cy: 1148, bottom: "EasyDMA" },
    { id: "twim", title: "TWIM [0..1]", x1: 715, x2: 881, cx: 798, cy: 1209, bottom: "EasyDMA" },
  ].forEach((block) => {
    const dividerY = block.cy + 12
    line(ctx, `${block.id}_dma_divider`, { x: block.x1, y: dividerY }, { x: block.x2, y: dividerY }, { fill_color: "none", stroke_color: stroke, stroke_width: 1.8 }, 24)
    text(ctx, `${block.id}_title`, block.title, { x: block.cx, y: block.cy - 7 }, { style: { font_size: 15, line_height: 1.05 } })
    text(ctx, `${block.id}_dma_label`, block.bottom, { x: block.cx, y: block.cy + 20 }, { style: { font_size: 15, line_height: 1.05 } })
  })
  ;[
    { id: "qspi", title: "QSPI", centerY: 1306, height: 116, dividerY: 1334 },
    { id: "uarte", title: "UARTE [0..1]", centerY: 1430, height: 92, dividerY: 1451 },
    { id: "spis", title: "SPIS [0..2]", centerY: 1532, height: 92, dividerY: 1553 },
  ].forEach((block) => {
    comp(ctx, `right_stack_${block.id}`, "", { x: 798, y: block.centerY }, { width: 166, height: block.height }, mono)
    line(ctx, `right_stack_${block.id}_divider`, { x: 715, y: block.dividerY }, { x: 881, y: block.dividerY }, { fill_color: "none", stroke_color: stroke, stroke_width: 1.8 }, 24)
    text(ctx, `right_stack_${block.id}_title`, block.title, { x: 798, y: block.dividerY - 41 }, { style: { font_size: 15, line_height: 1.05 } })
    text(ctx, `right_stack_${block.id}_dma`, "EasyDMA", { x: 798, y: block.dividerY + 14 }, { style: { font_size: 15, line_height: 1.05 } })
  })
  for (let x = 313; x <= 903; x += 65) {
    outlinedArrowV(ctx, `ram_bus_${x}_outline_arrow`, x, 108, 255, { body: 3, head: 12 })
    text(ctx, `ram_bus_${x}_slave`, "slave", { x: x + 10, y: 176 }, { rotation: -90, style: { font_size: 17 } })
  }
  ;[
    { id: "cpu_master", x: 330, y2: 390, label: "master" },
    { id: "bridge_slave", x: 506, y2: 414, label: "slave" },
    { id: "ficr_slave", x: 726, y2: 392, label: "slave" },
    { id: "uicr_slave", x: 794, y2: 392, label: "slave" },
    { id: "code_slave", x: 878, y2: 392, label: "slave" },
  ].forEach((arrow) => {
    outlinedArrowV(ctx, `ahb_down_${arrow.id}_outline_arrow`, arrow.x, 318, arrow.y2, { body: 3, head: 12 })
    text(ctx, `ahb_down_${arrow.id}_label`, arrow.label, { x: arrow.x + 11, y: (318 + arrow.y2) / 2 }, { rotation: -90, style: { font_size: 14 } })
  })
  ;[
    { id: "nvmc_to_ficr", x: 726, topY: 462 },
    { id: "nvmc_to_uicr", x: 794, topY: 462 },
    { id: "nvmc_to_code", x: 878, topY: 494 },
  ].forEach(({ id, x, topY }) => connection(ctx, id, [{ x, y: 529 }, { x, y: topY }], { fill_color: "none", stroke_color: "#111111", stroke_width: 2 }, "none", "arrow"))
  outlinedArrowV(ctx, "apb0_to_ahb_apb_bridge_outline_arrow", 486, 509, 630, { end: false, body: 3, head: 12 })
  for (let y = 641; y <= 1526; y += 64) outlinedArrowH(ctx, `left_to_apb_${y}_outline_arrow`, 421, y, 475, { body: 3, head: 10 })
  ;[591, 655, 719, 783].forEach((y, index) => {
    outlinedArrowH(ctx, `right_to_apb_${index}_outline_arrow`, 475, y, 715, { body: 5, head: 16 })
  })
  ;[
    { id: "left_radio", y: 911 },
    { id: "left_nfct", y: 1039 },
    { id: "left_saadc", y: 1231 },
    { id: "left_pwm", y: 1306 },
    { id: "left_i2s", y: 1430 },
    { id: "left_pdm", y: 1532 },
  ].forEach((arrow) => {
    outlinedArrowH(ctx, `${arrow.id}_master_outline_arrow`, 510, arrow.y, 595, { body: 7, head: 18, zIndex: 35 })
    text(ctx, `${arrow.id}_master_label`, "master", { x: 552, y: arrow.y }, { style: { font_size: 12 }, z_index: 36 })
  })
  ;[847, 911, 975, 1039, 1103, 1167, 1231, 1306, 1430, 1532].forEach((y, index) => {
    outlinedArrowH(ctx, `right_master_${index}_outline_arrow`, 650, y, 706, { body: 7, head: 16, zIndex: 35 })
    text(ctx, `right_master_${index}_label`, "master", { x: 678, y }, { style: { font_size: 11 }, z_index: 36 })
  })
  ;["TP", "SWCLK\nSWDIO", "nRESET", "XC1\nXC2\nXL1\nXL2", "ANT", "VBUS\nD+\nD-", "NFC1\nNFC2", "P0.0 - P0.31\nP1.0 - P1.15", "AIN0 - AIN7", "LED\nA\nB", "OUT0 - OUT3", "MCK\nLRCK\nSCLK\nSDOUT\nSDIN", "CLK\nDIN"].forEach((label, i) => {
    const y = [159, 212, 634, 820, 882, 944, 1006, 1068, 1254, 1316, 1378, 1457, 1572][i]!
    text(ctx, `nrf_left_label_${i}`, label, { x: 100, y }, { anchor: "middle_right", style: { font_size: 18, line_height: 1.04 } })
    if (i === 0) {
      connection(ctx, "nrf_left_pin_tp_to_chip", [{ x: 122, y }, { x: 153, y }], { ...busStyle, stroke_color: "#555555", stroke_width: 1.8 }, "open_arrow", "none")
      connection(ctx, "nrf_left_pin_tp_to_tpiu", [{ x: 153, y }, { x: 207, y }], { ...busStyle, stroke_color: "#555555", stroke_width: 1.8 }, "none", "open_arrow")
      return
    }
    if (i === 1) {
      connection(ctx, "nrf_left_pin_swclk", [{ x: 116, y: 200 }, { x: 207, y: 200 }], blackPinStyle, "none", "arrow")
      connection(ctx, "nrf_left_pin_swdio", [{ x: 116, y: 224 }, { x: 207, y: 224 }], blackPinStyle, "arrow", "none")
      return
    }
    if (i === 3) {
      ;[
        { id: "xc1", y: 802, start: "arrow" as const, end: "arrow" as const, appearance: blackPinStyle },
        { id: "xc2", y: 817, start: "arrow" as const, end: "arrow" as const, appearance: blackPinStyle },
        { id: "xl1", y: 832, start: "open_arrow" as const, end: "open_arrow" as const, appearance: busStyle },
        { id: "xl2", y: 847, start: "open_arrow" as const, end: "open_arrow" as const, appearance: busStyle },
      ].forEach((pin) => connection(ctx, `nrf_left_pin_${pin.id}`, [{ x: 116, y: pin.y }, { x: 251, y: pin.y }], pin.appearance, pin.start, pin.end))
      return
    }
    if (i === 4) {
      connection(ctx, "nrf_left_pin_ant", [{ x: 116, y }, { x: 251, y }], blackPinStyle, "arrow", "arrow")
      return
    }
    if (i === 5) {
      ;[
        { id: "vbus", y: 926 },
        { id: "d_plus", y: 944 },
        { id: "d_minus", y: 962 },
      ].forEach((pin) => connection(ctx, `nrf_left_pin_${pin.id}`, [{ x: 116, y: pin.y }, { x: 251, y: pin.y }], blackPinStyle, "arrow", "arrow"))
      return
    }
    if (i === 6) {
      ;[
        { id: "nfc1", y: 994 },
        { id: "nfc2", y: 1018 },
      ].forEach((pin) => connection(ctx, `nrf_left_pin_${pin.id}`, [{ x: 116, y: pin.y }, { x: 251, y: pin.y }], blackPinStyle, "arrow", "arrow"))
      return
    }
    if (i === 7) {
      connection(ctx, "nrf_left_pin_gpio_to_gpiote", [{ x: 116, y }, { x: 251, y }], busStyle, "none", "open_arrow")
      return
    }
    if (i === 8) {
      connection(ctx, "nrf_left_pin_ain_to_branch", [{ x: 116, y }, { x: 154, y }], busStyle, "none", "none")
      line(ctx, "nrf_left_pin_ain_branch", { x: 154, y: 1130 }, { x: 154, y: 1254 }, { fill_color: "none", stroke_color: "#111111", stroke_width: 1.8 }, 22)
      ;[
        { id: "comp", y: 1130 },
        { id: "lpcomp", y: 1192 },
        { id: "saadc", y: 1254 },
      ].forEach((pin) => {
        ctx.elements.push({
          type: "system_shape",
          system_shape_id: `nrf_left_pin_ain_${pin.id}_dot`,
          system_diagram_id: ctx.id,
          shape: "circle",
          center: { x: 154, y: pin.y },
          radius: 5,
          appearance: { fill_color: "#111111", stroke_color: "#111111", stroke_width: 0 },
          z_index: 24,
        } satisfies SystemShape)
        connection(ctx, `nrf_left_pin_ain_to_${pin.id}`, [{ x: 154, y: pin.y }, { x: 251, y: pin.y }], busStyle, "none", "open_arrow")
      })
      return
    }
    if (i === 9) {
      ;[
        { id: "led", y: 1296, start: "open_arrow" as const, end: "none" as const },
        { id: "a", y: 1316, start: "none" as const, end: "open_arrow" as const },
        { id: "b", y: 1336, start: "none" as const, end: "open_arrow" as const },
      ].forEach((pin) => connection(ctx, `nrf_left_pin_qdec_${pin.id}`, [{ x: 116, y: pin.y }, { x: 251, y: pin.y }], busStyle, pin.start, pin.end))
      return
    }
    if (i === 10) {
      connection(ctx, "nrf_left_pin_out_to_pwm", [{ x: 116, y }, { x: 251, y }], busStyle, "open_arrow", "open_arrow")
      return
    }
    connection(ctx, `nrf_left_pin_${i}`, [{ x: 116, y }, { x: 250, y }], busStyle, "none", "open_arrow")
  })
  ;["P0.0 - P0.31\nP1.0 - P1.15", "SCK\nMOSI\nMISO", "SCL\nSDA", "SCL\nSDA", "IO0\nIO1\nIO2\nIO3\nSCK\nCSN", "RTS\nCTS\nTXD\nRXD", "CSN\nMISO\nMOSI\nSCK"].forEach((label, i) => {
    const y = [66, 1088, 1148, 1209, 1315, 1439, 1541][i]!
    text(ctx, `nrf_right_label_${i}`, label, { x: 1024, y }, { anchor: "middle_left", style: { font_size: 18, line_height: 1.04 } })
    if (i === 1) {
      ;[
        { id: "sck", y: 1072, start: "none" as const, end: "open_arrow" as const },
        { id: "mosi", y: 1088, start: "none" as const, end: "open_arrow" as const },
        { id: "miso", y: 1104, start: "open_arrow" as const, end: "none" as const },
      ].forEach((pin) => connection(ctx, `nrf_right_pin_spim_${pin.id}`, [{ x: 881, y: pin.y }, { x: 1010, y: pin.y }], busStyle, pin.start, pin.end))
      return
    }
    if (i === 2) {
      ;[1139, 1157].forEach((rowY, row) =>
        connection(ctx, `nrf_right_pin_twis_${row}`, [{ x: 881, y: rowY }, { x: 1010, y: rowY }], busStyle, "open_arrow", "open_arrow"),
      )
      return
    }
    if (i === 3) {
      ;[1200, 1218].forEach((rowY, row) =>
        connection(ctx, `nrf_right_pin_twim_${row}`, [{ x: 881, y: rowY }, { x: 1010, y: rowY }], busStyle, "open_arrow", "open_arrow"),
      )
      return
    }
    if (i === 4) {
      ;[1276, 1290, 1304, 1318, 1332, 1346].forEach((rowY, row) =>
        connection(ctx, `nrf_right_pin_qspi_${row}`, [{ x: 881, y: rowY }, { x: 1010, y: rowY }], busStyle, "open_arrow", "open_arrow"),
      )
      return
    }
    if (i === 5) {
      ;[
        { id: "rts", y: 1402, start: "none" as const, end: "open_arrow" as const },
        { id: "cts", y: 1417, start: "open_arrow" as const, end: "none" as const },
        { id: "txd", y: 1432, start: "none" as const, end: "open_arrow" as const },
        { id: "rxd", y: 1447, start: "open_arrow" as const, end: "none" as const },
      ].forEach((pin) => connection(ctx, `nrf_right_pin_uarte_${pin.id}`, [{ x: 881, y: pin.y }, { x: 1010, y: pin.y }], busStyle, pin.start, pin.end))
      return
    }
    if (i === 6) {
      ;[
        { id: "csn", y: 1504, start: "open_arrow" as const, end: "none" as const },
        { id: "miso", y: 1519, start: "none" as const, end: "open_arrow" as const },
        { id: "mosi", y: 1534, start: "open_arrow" as const, end: "none" as const },
        { id: "sck", y: 1549, start: "open_arrow" as const, end: "none" as const },
      ].forEach((pin) => connection(ctx, `nrf_right_pin_spis_${pin.id}`, [{ x: 881, y: pin.y }, { x: 1010, y: pin.y }], busStyle, pin.start, pin.end))
      return
    }
    const startX = i === 0 ? 928 : 881
    connection(ctx, `nrf_right_pin_${i}`, [{ x: startX, y }, { x: 1010, y }], busStyle, "open_arrow", "none")
  })
  return ctx
}

function ref005(): DiagramCtx {
  const ctx = diagram("refimage005", "ESP32-S3 functional block diagram", 1284, 1086)
  const stroke = "#111111"
  const section = style(ctx, "section", { fill_color: "#ffffff", stroke_color: stroke, stroke_width: 1.2, corner_radius: 8 }, { font_size: 23, font_weight: "bold" })
  const tile = style(ctx, "tile", { fill_color: "#e5e5e5", stroke_color: stroke, stroke_width: 1.1, corner_radius: 8 }, { font_size: 19, line_height: 1.05 })
  const low = style(ctx, "low_power", { fill_color: "#bebebe", stroke_color: stroke, stroke_width: 1.1, corner_radius: 8 }, { font_size: 19, line_height: 1.05 })
  const frame = style(ctx, "frame", { fill_color: "#ffffff", stroke_color: "#777777", stroke_width: 1.2, corner_radius: 8 })
  comp(ctx, "outer_frame", "", { x: 642, y: 480 }, { width: 1200, height: 890 }, frame, { is_container: true, z_index: 0 })
  text(ctx, "title", "Espressif ESP32-S3 Wi-Fi + Bluetooth® Low Energy SoC", { x: 642, y: 53 }, { style: { font_size: 22, font_weight: "bold" } })
  comp(ctx, "cpu_sec", "", { x: 265, y: 218 }, { width: 404, height: 267 }, section, { is_container: true })
  comp(ctx, "rf_sec", "", { x: 674, y: 218 }, { width: 380, height: 267 }, section, { is_container: true })
  comp(ctx, "wireless_sec", "", { x: 1051, y: 218 }, { width: 330, height: 267 }, section, { is_container: true })
  comp(ctx, "periph_sec", "", { x: 466, y: 657 }, { width: 810, height: 540 }, section, { is_container: true })
  comp(ctx, "security_sec", "", { x: 1051, y: 546 }, { width: 330, height: 340 }, section, { is_container: true })
  comp(ctx, "rtc_sec", "", { x: 1051, y: 829 }, { width: 330, height: 212 }, section, { is_container: true })
  ;[
    { id: "cpu", label: "CPU and Memory", x: 265, y: 103, size: 22 },
    { id: "rf", label: "RF", x: 674, y: 103, size: 22 },
    { id: "wireless", label: "Wireless Digital Circuits", x: 1051, y: 103, size: 21 },
    { id: "periph", label: "Peripherals", x: 466, y: 378, size: 23 },
    { id: "security", label: "Security", x: 1051, y: 380, size: 23 },
    { id: "rtc", label: "RTC", x: 1051, y: 738, size: 23 },
  ].forEach((heading) =>
    text(ctx, `${heading.id}_section_title`, heading.label, { x: heading.x, y: heading.y }, { style: { font_size: heading.size, font_weight: "bold" }, z_index: 30 }),
  )
  comp(ctx, "xtensa", "Xtensa® Dual-core 32-bit LX7\nMicroprocessor", { x: 264, y: 156 }, { width: 366, height: 58 }, tile, { label_style: { font_size: 19, line_height: 1.05 } })
  comp(ctx, "cache", "Cache", { x: 132, y: 228 }, { width: 113, height: 59 }, tile)
  comp(ctx, "sram", "SRAM", { x: 264, y: 228 }, { width: 113, height: 59 }, tile)
  comp(ctx, "interrupt_matrix", "Interrupt\nMatrix", { x: 396, y: 244 }, { width: 113, height: 118 }, tile)
  comp(ctx, "jtag", "JTAG", { x: 132, y: 300 }, { width: 113, height: 59 }, tile)
  comp(ctx, "rom", "ROM", { x: 264, y: 300 }, { width: 113, height: 59 }, tile)

  comp(ctx, "rf_balun", "2.4 GHz Balun +\nSwitch", { x: 579, y: 156 }, { width: 205, height: 58 }, tile)
  comp(ctx, "rf_ext_clock", "External\nMain Clock", { x: 765, y: 156 }, { width: 112, height: 58 }, tile)
  ;[
    { id: "receiver", label: "2.4 GHz\nReceiver", x: 528 },
    { id: "transmitter", label: "2.4 GHz\nTransmitter", x: 599 },
    { id: "synth", label: "RF\nSynthesizer", x: 670 },
  ].forEach((item) => comp(ctx, `rf_${item.id}`, item.label, { x: item.x, y: 245 }, { width: 58, height: 118 }, tile, { label_rotation: -90, label_style: { font_size: 18, line_height: 1.05 } }))
  comp(ctx, "rf_fast_rc", "Fast RC\nOscillator", { x: 765, y: 228 }, { width: 112, height: 59 }, tile)
  comp(ctx, "rf_pll", "Phase Lock\nLoop", { x: 765, y: 300 }, { width: 112, height: 59 }, tile)

  comp(ctx, "wifi_mac", "Wi-Fi MAC", { x: 958, y: 156 }, { width: 145, height: 58 }, tile)
  comp(ctx, "wifi_baseband", "Wi-Fi\nBaseband", { x: 1120, y: 156 }, { width: 145, height: 58 }, tile)
  comp(ctx, "ble_link", "Bluetooth LE Link Controller", { x: 1039, y: 228 }, { width: 290, height: 58 }, tile, { label_style: { font_size: 19 } })
  comp(ctx, "ble_baseband", "Bluetooth LE Baseband", { x: 1039, y: 300 }, { width: 290, height: 58 }, tile, { label_style: { font_size: 19 } })

  const periphLabels = [
    ["GDMA", "System\nTimer", "General-\npurpose\nTimers", "GPIO", "RTC GPIO"],
    ["SD/MMC\nHost", "Pulse\nCounter", "World\nController", "USB Serial/\nJTAG", "eFuse\nController"],
    ["SPI0/1", "SPI2/3", "I2S", "Main System\nWatchdog\nTimers", "RTC\nWatchdog\nTimer"],
    ["USB OTG", "TWAI®", "I2C", "Super\nWatchdog", "Touch\nSensor"],
    ["UART", "LED PWM", "MCPWM", "Super\nWatchdog", "Touch\nSensor"],
    ["RMT", "LCD\nInterface", "Camera\nInterface", "RTC I2C", "Temperature\nSensor"],
  ]
  periphLabels.forEach((row, r) =>
    row.forEach((label, c) => {
      const styleId = ["RTC GPIO", "RTC\nWatchdog\nTimer", "Super\nWatchdog", "Touch\nSensor", "RTC I2C", "Temperature\nSensor"].includes(label) ? low : tile
      comp(ctx, `periph_${r}_${c}`, label, { x: 132 + c * 158, y: 449 + r * 86 }, { width: 143, height: 74 }, styleId, { label_style: { font_size: 18, line_height: 1.02 } })
    }),
  )

  gridBlocks(ctx, "security_tiles", ["SHA", "RSA", "AES", "RNG", "HMAC", "RSA_DS", "Secure Boot", "Flash\nEncryption", "Permission\nControl"], 900, 407, 4, { width: 64, height: 58 }, { x: 15, y: 14 }, tile, { label_style: { font_size: 18, line_height: 1.02 } })
  gridBlocks(ctx, "rtc_tiles", ["RTC\nMemory", "PMU", "ULP Coprocessor"], 900, 769, 2, { width: 143, height: 58 }, { x: 14, y: 18 }, low, { label_style: { font_size: 18, line_height: 1.02 } })
  text(ctx, "legend_title", "Power consumption", { x: 78, y: 996 }, { anchor: "middle_left", style: { font_size: 22, font_weight: "bold" } })
  comp(ctx, "legend_normal", "", { x: 122, y: 1024 }, { width: 96, height: 21 }, tile)
  text(ctx, "legend_normal_text", "Normal", { x: 177, y: 1025 }, { anchor: "middle_left", style: { font_size: 19 } })
  comp(ctx, "legend_low", "", { x: 122, y: 1052 }, { width: 96, height: 21 }, low)
  text(ctx, "legend_low_text", "Low power consumption components capable of working in Deep-sleep mode", { x: 177, y: 1053 }, { anchor: "middle_left", style: { font_size: 19 } })
  return ctx
}

function ref006(): DiagramCtx {
  const ctx = diagram("refimage006", "i.MX RT1060 Crossover MCU", 1862, 940)
  const sec = style(ctx, "section", { fill_color: "#eeeeee", stroke_color: "none", stroke_width: 0 }, { font_size: 18, font_weight: "bold" })
  const orange = style(ctx, "orange", { fill_color: "#f6bd3f", stroke_color: "none", stroke_width: 0 }, { font_size: 16 })
  const green = style(ctx, "green", { fill_color: "#c4dc4f", stroke_color: "none", stroke_width: 0 }, { font_size: 16 })
  const greenLight = style(ctx, "green_light", { fill_color: "#e9f1b6", stroke_color: "none", stroke_width: 0 }, { font_size: 16 })
  const mint = style(ctx, "mint", { fill_color: "#aad7d8", stroke_color: "none", stroke_width: 0 }, { font_size: 16 })
  const blue = style(ctx, "blue", { fill_color: "#b7c4e5", stroke_color: "none", stroke_width: 0 }, { font_size: 16 })
  const purple = style(ctx, "purple", { fill_color: "#a998c4", stroke_color: "#555555", stroke_width: 1, stroke_dash: { dash_length: 4, gap_length: 3 } }, { font_size: 16, line_height: 1.08 })
  const tan = style(ctx, "tan", { fill_color: "#ffdfa7", stroke_color: "none", stroke_width: 0 }, { font_size: 16, line_height: 1.08 })
  const security = style(ctx, "security", { fill_color: "#74a9dc", stroke_color: "none", stroke_width: 0 }, { font_size: 16 })
  const legendMark = style(ctx, "legend_mark", { fill_color: "transparent", stroke_color: "#111111", stroke_width: 1.2, stroke_dash: { dash_length: 4, gap_length: 3 } })
  text(ctx, "title", "i.MX RT1060 Crossover MCU", { x: 25, y: 74 }, { anchor: "middle_left", style: { font_size: 40, font_weight: "bold" } })
  comp(ctx, "sys_sec", "", { x: 689, y: 327 }, { width: 320, height: 395 }, sec, { is_container: true })
  gridBlocks(ctx, "sys", ["Secure JTAG", "PLL, OSC", "eDMA", "4 x Watch Dog", "6 x GP Timer", "4 x Quadrature ENC", "4 x QuadTimer", "4 x FlexPWM", "IOMUX"], 542, 157, 1, { width: 290, height: 31 }, { x: 0, y: 10 }, orange)
  comp(ctx, "mem_sec", "", { x: 689, y: 588 }, { width: 320, height: 112 }, sec, { is_container: true })
  gridBlocks(ctx, "mem", ["Up to 1 MB SRAM Total", "128 KB ROM"], 542, 561, 1, { width: 290, height: 33 }, { x: 0, y: 9 }, blue)
  comp(ctx, "pwr_sec", "", { x: 689, y: 715 }, { width: 320, height: 104 }, sec, { is_container: true })
  gridBlocks(ctx, "pwr", ["DC/DC & LDO", "Temp Monitor"], 542, 681, 1, { width: 290, height: 33 }, { x: 0, y: 9 }, blue)
  comp(ctx, "cpu_sec", "", { x: 1089, y: 247 }, { width: 465, height: 240 }, sec, { is_container: true })
  comp(ctx, "cpu_core", "", { x: 1090, y: 256 }, { width: 422, height: 197 }, green)
  comp(ctx, "cpu_arm_tile", "", { x: 1090, y: 203 }, { width: 390, height: 50 }, greenLight)
  text(ctx, "cpu_core_title", "Core", { x: 1090, y: 172 }, { style: { font_size: 16 } })
  text(ctx, "cpu_core_arm", "Arm® Cortex®-M7", { x: 1090, y: 205 }, { style: { font_size: 16 } })
  gridBlocks(ctx, "cpu_sub", ["32 KB\nI-cache", "32 KB\nD-cache", "FPU", "Up to 512 KB TCM"], 888, 243, 2, { width: 193, height: 46 }, { x: 9, y: 11 }, greenLight)
  comp(ctx, "mm_sec", "", { x: 1090, y: 462 }, { width: 465, height: 190 }, sec, { is_container: true })
  comp(ctx, "mm_camera", "8-/16-bit Parallel Camera Interface", { x: 1089, y: 416 }, { width: 435, height: 34 }, purple)
  comp(ctx, "mm_lcd", "24-bit Parallel LCD (RGB)", { x: 1089, y: 456 }, { width: 435, height: 34 }, purple)
  comp(ctx, "mm_pxp", "Pixel Processing Pipeline (PXP)\n2D Graphics Acceleration\nResize, CSC, Overlay, Rotation", { x: 1089, y: 514 }, { width: 435, height: 76 }, purple, { label_style: { font_size: 16, line_height: 1.08 } })
  comp(ctx, "ext_sec", "", { x: 1090, y: 685 }, { width: 465, height: 199 }, sec, { is_container: true })
  gridBlocks(ctx, "extmem", ["2 x Dual-Channel Quad-SPI with Bus\nEncryption Engine", "External Memory Controller\n8-/16-bit SDRAM\nParallel NOR Flash\nNAND Flash"], 872, 599, 1, { width: 435, height: 54 }, { x: 0, y: 10 }, tan)
  comp(ctx, "conn_sec", "", { x: 1495, y: 385 }, { width: 320, height: 518 }, sec, { is_container: true })
  gridBlocks(ctx, "conn", ["eMMC 4.5/SD 3.0 x 2", "8 x UART", "8 x 8 Keypad", "4 x I²C", "4 x SPI", "Single Clock Cycle GPIO", "3 x I²S/SAI", "S/PDIF Tx/Rx", "1 x CAN FD", "2 x CAN", "2 x USB 2.0\nwith PHY", "2 x 10/100 ENET\nwith IEEE® 1588"], 1345, 157, 1, { width: 290, height: 31 }, { x: 0, y: 8 }, mint)
  comp(ctx, "adc_sec", "", { x: 1495, y: 752 }, { width: 320, height: 105 }, sec, { is_container: true })
  gridBlocks(ctx, "adc", ["2 x ADC (20-ch.)", "4 x ACMP"], 1345, 690, 1, { width: 290, height: 33 }, { x: 0, y: 9 }, blue)
  comp(ctx, "security_sec", "", { x: 1090, y: 812 }, { width: 1120, height: 71 }, sec, { is_container: true })
  gridBlocks(ctx, "sec", ["Ciphers & RNG", "Secure RTC", "eFuse", "HAB"], 542, 801, 4, { width: 250, height: 33 }, { x: 35, y: 0 }, security)
  ;[
    { id: "sys", label: "System Control", x: 689, y: 143 },
    { id: "mem", label: "Internal Memory", x: 689, y: 546 },
    { id: "pwr", label: "Power Management", x: 689, y: 671 },
    { id: "cpu", label: "Main CPU Platform", x: 1089, y: 143 },
    { id: "mm", label: "Multimedia", x: 1090, y: 386 },
    { id: "ext", label: "External Memory", x: 1090, y: 581 },
    { id: "conn", label: "Connectivity", x: 1495, y: 143 },
    { id: "adc", label: "ADC/DAC", x: 1495, y: 671 },
    { id: "security", label: "Security", x: 1090, y: 785 },
  ].forEach((heading) =>
    text(ctx, `rt1060_${heading.id}_section_title`, heading.label, { x: heading.x, y: heading.y }, { style: { font_size: 18, font_weight: "bold" }, z_index: 30 }),
  )
  comp(ctx, "legend_box", "", { x: 532, y: 876 }, { width: 14, height: 14 }, legendMark)
  text(ctx, "legend", "Available on certain product families", { x: 548, y: 876 }, { anchor: "middle_left", style: { font_size: 13 } })
  return ctx
}

function ref007(): DiagramCtx {
  const ctx = diagram("refimage007", "STM32H723xE/G block diagram", 1036, 1428)
  const black = "#111111"
  const white = style(ctx, "white", { fill_color: "#ffffff", stroke_color: black, stroke_width: 1.2 }, { font_size: 11, line_height: 1.02 })
  const outline = style(ctx, "outline", { fill_color: "transparent", stroke_color: black, stroke_width: 1.6 })
  const gray = style(ctx, "gray", { fill_color: "#b8beb8", stroke_color: black, stroke_width: 1.2 }, { font_size: 11, line_height: 1.02 })
  const dark = style(ctx, "dark", { fill_color: "#81887f", stroke_color: black, stroke_width: 1.2 }, { font_size: 10, line_height: 1 })
  const purple = style(ctx, "purple", { fill_color: "#c8bed0", stroke_color: black, stroke_width: 1.2 }, { font_size: 10 })
  const tag = style(ctx, "tag", { fill_color: "#5ea6d3", stroke_color: black, stroke_width: 0.7 }, { font_size: 7, line_height: 1 })
  const yellow = style(ctx, "yellow", { fill_color: "#ffe586", stroke_color: black, stroke_width: 0.9 }, { font_size: 10 })
  const bus = { fill_color: "none", stroke_color: "#aeb5b9", stroke_width: 7 }
  const sig = { fill_color: "none", stroke_color: black, stroke_width: 1.2 }
  text(ctx, "title", "Figure 1. STM32H723xE/G block diagram", { x: 518, y: 32 }, { style: { font_size: 22, font_weight: "bold" } })
  comp(ctx, "frame", "", { x: 506, y: 708 }, { width: 984, height: 1324 }, white, { is_container: true, z_index: 0 })
  comp(ctx, "inner_frame", "", { x: 513, y: 740 }, { width: 654, height: 1236 }, outline, { is_container: true, z_index: 2 })
  comp(ctx, "cpu", "Arm CPU\nCortex-M7\n550 MHz", { x: 303, y: 219 }, { width: 121, height: 95 }, gray)
  comp(ctx, "cpu_jtag", "JTAG/SW", { x: 235, y: 219 }, { width: 38, height: 80 }, gray, { label_style: { font_size: 7.5 } })
  comp(ctx, "cpu_etm", "ETM", { x: 236, y: 256 }, { width: 40, height: 23 }, gray, { label_style: { font_size: 7.5 } })
  text(ctx, "cpu_axim", "AXIM", { x: 345, y: 236 }, { style: { font_size: 7 } })
  text(ctx, "cpu_ahbp", "AHBP", { x: 294, y: 188 }, { style: { font_size: 7 } })
  text(ctx, "cpu_ahbs", "AHBS", { x: 352, y: 289 }, { style: { font_size: 7 } })
  gridBlocks(ctx, "cache", ["D-TCM\n64KB", "D-TCM\n64KB", "I-Cache\n32KB", "D-Cache\n32KB"], 194, 133, 2, { width: 57, height: 43 }, { x: 13, y: 115 }, white)
  comp(ctx, "itcm", "I-TCM 64KB\nShared AXI\nI-TCM 192KB", { x: 447, y: 207 }, { width: 132, height: 111 }, white)
  comp(ctx, "itcm_yellow", "128 KB AXI\nSRAM", { x: 446, y: 223 }, { width: 92, height: 24 }, yellow, { label_style: { font_size: 8.5, line_height: 1 } })
  comp(ctx, "flash", "1 MB FLASH\nFMC", { x: 462, y: 309 }, { width: 116, height: 37 }, white)
  comp(ctx, "axi_matrix", "64-bit AXI BUS-MATRIX", { x: 399, y: 370 }, { width: 42, height: 331 }, purple, { label_rotation: -90 })
  comp(ctx, "mdma_dark", "MDMA", { x: 261, y: 326 }, { width: 70, height: 29 }, dark)
  comp(ctx, "mdma_fifo", "16 Streams\nFIFO", { x: 322, y: 326 }, { width: 51, height: 29 }, dark, { label_style: { font_size: 8, line_height: 1 } })
  comp(ctx, "wwdg_tag", "AHB/APB", { x: 266, y: 427 }, { width: 46, height: 10 }, tag)
  comp(ctx, "left_bus_tag", "AHB/APB", { x: 328, y: 604 }, { width: 15, height: 45 }, tag, { label_rotation: -90, label_style: { font_size: 7 } })
  gridBlocks(ctx, "left_mem", ["", "CHROM-ART\n(DMA2D)\nFIFO", "LCD-TFT\nFIFO", "WWDG", "DLYBSD1", "DCMI\nPSSI", "DFSDM", "SAI1\nFIFO", "SPI5", "TIM17", "TIM16", "TIM15", "SPI4", "SPI1/I2S1", "UART9", "UART10", "USART6", "USART1", "TIM1/PWM", "TIM8/PWM", "ADC3", "GPIO PORTA..H", "GPIO PORTJ,K"], 236, 326, 1, { width: 113, height: 24 }, { x: 0, y: 10 }, white, { label_style: { font_size: 9.5, line_height: 1 } })
  comp(ctx, "ahb_matrix", "32-bit AHB BUS-MATRIX", { x: 705, y: 178 }, { width: 350, height: 27 }, purple)
  gridBlocks(ctx, "top", ["DMA1\n8 Stream\nFIFOs", "DMA2\n8 Stream\nFIFOs", "ETHER\nMAC", "SDMMC2", "PHY\nOTG_HS"], 548, 126, 5, { width: 56, height: 82 }, { x: 5, y: 0 }, gray, { label_style: { font_size: 10, line_height: 1 } })
  gridBlocks(ctx, "compute", ["DMA\nMux1", "RNG", "CORDIC", "FMAC"], 610, 289, 1, { width: 80, height: 25 }, { x: 0, y: 8 }, white)
  gridBlocks(ctx, "octo", ["OCTOSPI1", "OCTOSPI2"], 428, 339, 1, { width: 23, height: 72 }, { x: 0, y: 5 }, white, { label_rotation: -90, label_style: { font_size: 7 } })
  gridBlocks(ctx, "octo_mid", ["OCTOSPI1", "OCTOSPI2"], 470, 341, 1, { width: 31, height: 66 }, { x: 0, y: 5 }, white, { label_rotation: -90, label_style: { font_size: 7 } })
  comp(ctx, "fmc_signals", "FMC_signals", { x: 489, y: 346 }, { width: 47, height: 12 }, white, { label_style: { font_size: 6 } })
  comp(ctx, "dlybos", "DLYBOS1-2", { x: 467, y: 438 }, { width: 118, height: 12 }, white, { label_style: { font_size: 7 } })
  gridBlocks(ctx, "sram", ["SRAM1\n16 KB", "SRAM2\n16 KB"], 738, 260, 2, { width: 50, height: 31 }, { x: 0, y: 0 }, yellow)
  gridBlocks(ctx, "right_periph", ["ADC1", "ADC2", "TIM2", "TIM3", "TIM4", "TIM5", "TIM23", "TIM24", "TIM12", "TIM13", "TIM14", "USART2", "USART3", "UART4", "UART5", "UART7", "UART8", "SPI2/I2S2", "SPI3/I2S3", "I2C1/SMBUS", "I2C2/SMBUS", "I2C3/SMBUS", "I2C5/SMBUS", "USBCR", "MDIOS", "TT-FDCAN1", "FDCAN2", "FDCAN3", "SPDIFRX1", "HDMI-CEC", "DAC", "LPTIM1", "OPAMP1", "OPAMP2"], 724, 314, 1, { width: 95, height: 18 }, { x: 0, y: 5 }, white, { label_style: { font_size: 8.5 } })
  comp(ctx, "apb_right", "APB1  138 MHz", { x: 708, y: 705 }, { width: 18, height: 784 }, white, { label_rotation: -90, label_style: { font_size: 10 } })
  gridBlocks(ctx, "bottom_left", ["SAI4\nFIFO", "COMP1&2", "LPTIM5\n16b", "LPTIM4\n16b", "LPTIM3", "I2C4", "SPI6/I2S6", "LPUART1", "LPTIM2\n16b"], 236, 1074, 1, { width: 96, height: 19 }, { x: 0, y: 7 }, white, { label_style: { font_size: 8, line_height: 1 } })
  comp(ctx, "dma_mux2_bdma", "DMA\nMux2\nBDMA", { x: 475, y: 770 }, { width: 56, height: 38 }, white, { label_style: { font_size: 8.5, line_height: 1 } })
  comp(ctx, "dap", "DAP", { x: 625, y: 770 }, { width: 50, height: 30 }, white, { label_style: { font_size: 9.5 } })
  comp(ctx, "hsem", "HSEM", { x: 423, y: 892 }, { width: 54, height: 16 }, white, { label_style: { font_size: 7.5 } })
  comp(ctx, "crc", "CRC", { x: 423, y: 912 }, { width: 54, height: 16 }, white, { label_style: { font_size: 7.5 } })
  comp(ctx, "sram_10k", "10 KB SRAM\nRAM\nI/F", { x: 674, y: 790 }, { width: 34, height: 76 }, white, { label_rotation: -90, label_style: { font_size: 7.5, line_height: 1 } })
  comp(ctx, "sram_16k", "16 KB SRAM", { x: 556, y: 910 }, { width: 64, height: 18 }, yellow, { label_style: { font_size: 7.5 } })
  comp(ctx, "bkp_4k", "4 KB BKP\nRAM", { x: 648, y: 910 }, { width: 62, height: 24 }, yellow, { label_style: { font_size: 7.5, line_height: 1 } })
  comp(ctx, "rcc_bottom", "RCC\nReset &\ncontrol", { x: 590, y: 988 }, { width: 54, height: 54 }, white, { label_style: { font_size: 8.5, line_height: 1 } })
  gridBlocks(ctx, "sys_bottom", ["VREF", "SYSCFG", "EXTI WKUP", "IWDG", "Temperature\nsensor"], 392, 1084, 1, { width: 78, height: 19 }, { x: 0, y: 13 }, white, { label_style: { font_size: 8, line_height: 1 } })
  comp(ctx, "clock", "HSI RC\nHSI48 RC\nCSI RC\nLSI RC\nPLL1+PLL2+PLL3", { x: 582, y: 1218 }, { width: 82, height: 78 }, white, { label_style: { font_size: 8, line_height: 1.02 } })
  comp(ctx, "power_mgmt", "BBgen + POWER MNGT", { x: 808, y: 1094 }, { width: 110, height: 18 }, gray, { label_style: { font_size: 7.5 } })
  comp(ctx, "pwrctrl", "PWRCTRL", { x: 748, y: 1130 }, { width: 25, height: 64 }, white, { label_rotation: -90, label_style: { font_size: 7.5 } })
  comp(ctx, "power", "Voltage\nregulator\n3.3 to 1.2V", { x: 822, y: 1132 }, { width: 80, height: 56 }, white, { label_style: { font_size: 8.5, line_height: 1.02 } })
  comp(ctx, "rtc_ls", "LS\n\nLS", { x: 748, y: 1220 }, { width: 30, height: 108 }, white, { label_style: { font_size: 8, line_height: 1.2 } })
  comp(ctx, "rtc_xtal32", "XTAL 32 kHz", { x: 820, y: 1178 }, { width: 78, height: 18 }, white, { label_style: { font_size: 7.5 } })
  comp(ctx, "rtc", "RTC\nBackup registers\nAWU", { x: 820, y: 1224 }, { width: 112, height: 70 }, gray, { label_style: { font_size: 8.5, line_height: 1.02 } })
  comp(ctx, "xtal_osc", "XTAL OSC\n4-48 MHz", { x: 823, y: 1306 }, { width: 93, height: 32 }, white, { label_style: { font_size: 7.5, line_height: 1 } })
  comp(ctx, "supply", "SUPPLY SUPERVISION\nPOR/PDR/BOR\nPVD", { x: 802, y: 1364 }, { width: 150, height: 44 }, white, { label_style: { font_size: 8.5, line_height: 1.02 } })
  line(ctx, "bus_left", { x: 360, y: 190 }, { x: 360, y: 1288 }, bus, 1)
  line(ctx, "bus_mid", { x: 520, y: 170 }, { x: 520, y: 1210 }, bus, 1)
  line(ctx, "bus_right", { x: 728, y: 190 }, { x: 728, y: 1165 }, bus, 1)
  line(ctx, "bus_top_to_right", { x: 520, y: 242 }, { x: 728, y: 242 }, bus, 1)
  line(ctx, "bus_mid_right_drop", { x: 585, y: 422 }, { x: 585, y: 585 }, bus, 1)
  line(ctx, "bus_mid_left", { x: 360, y: 587 }, { x: 585, y: 587 }, bus, 1)
  line(ctx, "bus_bottom_left", { x: 320, y: 940 }, { x: 657, y: 940 }, bus, 1)
  line(ctx, "bus_bottom_drop", { x: 657, y: 940 }, { x: 657, y: 1288 }, bus, 1)
  line(ctx, "bus_clock_left", { x: 360, y: 1288 }, { x: 657, y: 1288 }, bus, 1)
  line(ctx, "ahb_lower_matrix", { x: 435, y: 848 }, { x: 645, y: 848 }, { fill_color: "none", stroke_color: "#c8bed0", stroke_width: 25 }, 1)
  text(ctx, "ahb_lower_matrix_label", "32-bit AHB BUS-MATRIX", { x: 542, y: 848 }, { style: { font_size: 10 } })
  text(ctx, "left_apb3_label", "APB3 (180 MHz)", { x: 219, y: 407 }, { style: { font_size: 7 }, rotation: -90 })
  text(ctx, "left_ahb2_label", "AHB2 (240MHz)", { x: 326, y: 708 }, { style: { font_size: 7 }, rotation: -90 })
  text(ctx, "left_ahb4_label", "AHB4", { x: 327, y: 926 }, { style: { font_size: 7 }, rotation: -90 })
  text(ctx, "mid_ahb_label", "AHB4", { x: 518, y: 787 }, { style: { font_size: 7 }, rotation: -90 })
  text(ctx, "right_ahb_label", "AHB1 (240MHz)", { x: 683, y: 725 }, { style: { font_size: 7 }, rotation: -90 })
  text(ctx, "right_apb_freq_label", "APB1 138 MHz", { x: 676, y: 1005 }, { style: { font_size: 8 }, rotation: -90 })
  comp(ctx, "top_apb_box", "To APB1-2\nperipherals", { x: 587, y: 94 }, { width: 70, height: 34 }, white, { label_style: { font_size: 8 } })
  outlinedArrowV(ctx, "top_apb_arrow", 588, 112, 142, { start: true, end: true, body: 1.2, head: 6, zIndex: 45 })
  ;[575, 638, 699, 763, 824].forEach((x, i) => outlinedArrowV(ctx, `top_dma_arrow_${i}`, x, 210, 235, { start: true, end: true, body: 1.2, head: 5, zIndex: 45 }))
  ;[613, 651, 689].forEach((x, i) => outlinedArrowV(ctx, `sram_bus_arrow_${i}`, x, 260, 282, { start: true, end: true, body: 1.2, head: 5, zIndex: 45 }))
  ;[195, 265, 346].forEach((x, i) => outlinedArrowH(ctx, `cpu_left_arrow_${i}`, 160, 207 + i * 18, 216, { start: true, end: true, body: 1.2, head: 6, zIndex: 45 }))
  outlinedArrowH(ctx, "cpu_axi_to_matrix", 347, 236, 377, { start: true, end: true, body: 1.2, head: 6, zIndex: 45 })
  outlinedArrowH(ctx, "axi_to_itcm", 419, 199, 525, { start: true, end: true, body: 1.2, head: 6, zIndex: 45 })
  outlinedArrowH(ctx, "axi_to_flash", 419, 309, 404, { start: true, end: true, body: 1.2, head: 6, zIndex: 45 })
  outlinedArrowH(ctx, "compute_to_bus", 532, 340, 610, { start: true, end: true, body: 1.2, head: 6, zIndex: 45 })
  ;[288, 321, 354].forEach((y, i) => outlinedArrowH(ctx, `compute_left_arrow_${i}`, 530, y, 610, { start: true, end: true, body: 1.2, head: 6, zIndex: 45 }))
  outlinedArrowH(ctx, "center_bus_arrow_0", 400, 770, 444, { start: true, end: true, body: 1, head: 5, zIndex: 45 })
  outlinedArrowV(ctx, "dma_mux2_arrow", 475, 789, 832, { start: true, end: true, body: 1, head: 5, zIndex: 45 })
  outlinedArrowV(ctx, "dap_arrow", 625, 787, 832, { start: true, end: true, body: 1, head: 5, zIndex: 45 })
  outlinedArrowV(ctx, "lower_matrix_to_sram_arrow", 556, 864, 891, { start: true, end: true, body: 1, head: 5, zIndex: 45 })
  outlinedArrowV(ctx, "lower_matrix_to_bkp_arrow", 648, 864, 890, { start: true, end: true, body: 1, head: 5, zIndex: 45 })
  outlinedArrowV(ctx, "lower_matrix_to_rcc_arrow", 590, 860, 960, { start: true, end: true, body: 1, head: 5, zIndex: 45 })
  for (let i = 0; i < 34; i++) {
    const y = 314 + 9 + i * 23
    outlinedArrowH(ctx, `right_bus_to_block_${i}`, 717, y, 724, { start: true, end: true, body: 0.9, head: 4, zIndex: 50 })
    outlinedArrowH(ctx, `right_edge_${i}`, 819, y, 900, { start: true, end: false, body: 1.2, head: 6, zIndex: 50 })
  }
  for (let i = 0; i < 23; i++) {
    const y = 326 + 12 + i * 34
    outlinedArrowH(ctx, `left_edge_${i}`, 105, y, 236, { start: false, end: true, body: 1.2, head: 6, zIndex: 50 })
    outlinedArrowH(ctx, `left_block_to_bus_${i}`, 349, y, 360, { start: true, end: true, body: 0.9, head: 4, zIndex: 50 })
  }
  for (let i = 0; i < 9; i++) {
    const y = 1074 + 9.5 + i * 26
    outlinedArrowH(ctx, `bottom_left_edge_${i}`, 105, y, 236, { start: false, end: true, body: 1.1, head: 5, zIndex: 50 })
    outlinedArrowH(ctx, `bottom_left_to_bus_${i}`, 332, y, 360, { start: true, end: true, body: 0.9, head: 4, zIndex: 50 })
  }
  for (let i = 0; i < 5; i++) {
    const y = 1084 + 9.5 + i * 32
    outlinedArrowH(ctx, `sys_bottom_to_bus_${i}`, 360, y, 392, { start: true, end: true, body: 0.9, head: 4, zIndex: 50 })
  }
  line(ctx, "power_to_rtc", { x: 822, y: 1160 }, { x: 822, y: 1188 }, sig, 45)
  line(ctx, "rtc_to_xtal", { x: 822, y: 1259 }, { x: 822, y: 1290 }, sig, 45)
  line(ctx, "rtc_to_supply", { x: 822, y: 1259 }, { x: 822, y: 1342 }, sig, 45)
  ;["NJTRST, JTDI\nJTCK/SWCLK\nJTDO/SWDIO, JTDO\nTRACECLK\nTRACED[3:0]", "LCD_R[7:0], LCD_G[7:0]\nLCD_B[7:0], LCD_HSYNC\nLCD_VSYNC, LCD_DE, LCD_CLK", "D[7:0], D[12:3]DIR, DODIR\nCMD, CKas AF", "MOSI, MISO, SCK, NSS as AF", "RX, TX, CTS, RTS, DE as AF", "PA..H[15:0]\nPJ,K[11:0]"].forEach((label, i) => {
    text(ctx, `h7_left_label_${i}`, label, { x: 92, y: [170, 378, 475, 650, 815, 1018][i]! }, { anchor: "middle_right", style: { font_size: 6.5, line_height: 1 } })
  })
  ;["D[7:0], DP, DM, STP,\nNXT,ULPI:CK\nD[7:0], DIR,\nCMD, CKas AF", "Up to 20 analog inputs Most\nare common to ADC1 & 2", "CH[4:1], ETR as AF", "RX, TX, CK, CTS, RTS, DE as AF", "SCL, SDA, SMBA as AF", "TX, RX, RXFD_MODE,\nTXFD_MODE as AF", "OUT1, OUT2 as AF", "VDD\nVSS\nVCAP, VDDLDO", "OSC32_IN\nOSC32_OUT", "OSC_IN\nOSC_OUT"].forEach((label, i) => {
    text(ctx, `h7_right_label_${i}`, label, { x: 875, y: [86, 322, 420, 640, 820, 924, 1019, 1134, 1230, 1302][i]! }, { anchor: "middle_left", style: { font_size: 6.5, line_height: 1 } })
  })
  return ctx
}

async function writeDiagram(id: string, ctx: DiagramCtx) {
  await Bun.write(`${outDir}/${id}.json`, `${JSON.stringify(ctx.elements, null, 2)}\n`)
}

await writeDiagram("refimage003", ref003())
await writeDiagram("refimage004", ref004())
await writeDiagram("refimage005", ref005())
await writeDiagram("refimage006", ref006())
await writeDiagram("refimage007", ref007())
