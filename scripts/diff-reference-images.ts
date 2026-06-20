import { mkdir } from "node:fs/promises"
import { basename } from "node:path"
import sharp from "sharp"
import { renderSystemDiagram } from "../svg-conversion-prototype/render-system-diagram"
import type { SystemDiagramElement } from "../circuit-json-proposal/system-diagram-types"

const refImageGlob = new Bun.Glob("refimage*.json")

const inputDir = "reference-images"
const svgOutputDir = "svg-conversion-prototype"
const diffOutputDir = "image-diffs"
const inputPathArg = Bun.argv[2]

type DiffReportItem = {
  id: string
  referencePngPath: string
  generatedSvgPath: string
  actualPngPath: string
  diffPngPath: string
  width: number
  height: number
  mismatchedPixels: number
  mismatchRatio: number
  meanAbsoluteError: number
}

if (!inputPathArg) {
  await import("./generate-semantic-reference-json")
}

await mkdir(diffOutputDir, { recursive: true })

const inputPaths = inputPathArg
  ? [normalizeInputPath(inputPathArg)]
  : getReferenceImageInputNames().map((inputName) => `${inputDir}/${inputName}`)

const report: DiffReportItem[] = []

for (const inputPath of inputPaths) {
  const id = getReferenceImageId(inputPath)
  const referencePngPath = `${inputDir}/${id}.png`
  const generatedSvgPath = `${svgOutputDir}/${id}.svg`
  const actualPngPath = `${diffOutputDir}/${id}.actual.png`
  const diffPngPath = `${diffOutputDir}/${id}.diff.png`
  const rawJson = await Bun.file(inputPath).text()
  const elements = JSON.parse(rawJson) as SystemDiagramElement[]
  const svg = renderSystemDiagram(elements)

  await Bun.write(generatedSvgPath, svg)

  const referenceMetadata = await sharp(referencePngPath).metadata()
  const width = referenceMetadata.width
  const height = referenceMetadata.height

  if (!width || !height) {
    throw new Error(`Could not read dimensions for ${referencePngPath}`)
  }

  const reference = await sharp(referencePngPath)
    .flatten({ background: "#ffffff" })
    .ensureAlpha()
    .raw()
    .toBuffer()

  const actualSharp = sharp(Buffer.from(svg))
    .resize(width, height, { fit: "fill" })
    .flatten({ background: "#ffffff" })
    .ensureAlpha()

  const actual = await actualSharp.clone().raw().toBuffer()
  const actualPng = await actualSharp.clone().png().toBuffer()
  const diff = Buffer.alloc(width * height * 4)
  let mismatchedPixels = 0
  let absoluteError = 0

  for (let offset = 0; offset < reference.length; offset += 4) {
    const redDelta = Math.abs(reference[offset]! - actual[offset]!)
    const greenDelta = Math.abs(reference[offset + 1]! - actual[offset + 1]!)
    const blueDelta = Math.abs(reference[offset + 2]! - actual[offset + 2]!)
    const pixelError = redDelta + greenDelta + blueDelta
    const isMismatch = pixelError > 48

    absoluteError += pixelError

    if (isMismatch) {
      mismatchedPixels += 1
      diff[offset] = 255
      diff[offset + 1] = 0
      diff[offset + 2] = 0
      diff[offset + 3] = 255
    } else {
      const gray =
        Math.round(
          (reference[offset]! + reference[offset + 1]! + reference[offset + 2]!) / 3,
        ) * 0.75 +
        64
      diff[offset] = gray
      diff[offset + 1] = gray
      diff[offset + 2] = gray
      diff[offset + 3] = 255
    }
  }

  await Bun.write(actualPngPath, actualPng)
  await Bun.write(
    diffPngPath,
    await sharp(diff, {
      raw: { width, height, channels: 4 },
    })
      .png()
      .toBuffer(),
  )

  const pixelCount = width * height
  const item = {
    id,
    referencePngPath,
    generatedSvgPath,
    actualPngPath,
    diffPngPath,
    width,
    height,
    mismatchedPixels,
    mismatchRatio: mismatchedPixels / pixelCount,
    meanAbsoluteError: absoluteError / (pixelCount * 3),
  }

  report.push(item)
  console.log(
    `${id}: ${(item.mismatchRatio * 100).toFixed(2)}% mismatch, MAE ${item.meanAbsoluteError.toFixed(2)}`,
  )
}

await Bun.write(`${diffOutputDir}/report.json`, `${JSON.stringify(report, null, 2)}\n`)
console.log(`Wrote ${diffOutputDir}/report.json`)

function getReferenceImageInputNames(): string[] {
  const inputNamesById = new Map<string, string>()

  for (const inputName of [...refImageGlob.scanSync(inputDir)].sort((a, b) =>
    a.localeCompare(b),
  )) {
    const match = inputName.match(/^(refimage\d{3})(?:\.source)?\.json$/)

    if (!match?.[1]) continue

    const id = match[1]
    const existingName = inputNamesById.get(id)
    const isCanonicalJson = inputName === `${id}.json`

    if (!existingName || isCanonicalJson) {
      inputNamesById.set(id, inputName)
    }
  }

  return [...inputNamesById.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, inputName]) => inputName)
}

function normalizeInputPath(inputPathOrId: string): string {
  if (/^refimage\d{3}$/.test(inputPathOrId)) {
    return `${inputDir}/${inputPathOrId}.json`
  }

  return inputPathOrId
}

function getReferenceImageId(inputPath: string): string {
  return basename(inputPath, ".json").replace(/\.source$/, "")
}
