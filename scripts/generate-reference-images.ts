import { basename } from "node:path"
import { renderSystemDiagram } from "../svg-conversion-prototype/render-system-diagram"
import type { SystemDiagramElement } from "../circuit-json-proposal/system-diagram-types"

const refImageGlob = new Bun.Glob("refimage*.json")

const inputDir = "reference-images"
const outputDir = "svg-conversion-prototype"
const inputPathArg = Bun.argv[2]

const inputPaths = inputPathArg
  ? [inputPathArg]
  : [...refImageGlob.scanSync(inputDir)]
      .sort((a, b) => a.localeCompare(b))
      .filter((inputName) => /^refimage\d{3}\.json$/.test(inputName))

for (const inputPathOrName of inputPaths) {
  const id = basename(inputPathOrName, ".json")
  const inputPath = inputPathArg ? inputPathOrName : `${inputDir}/${inputPathOrName}`
  const outputPath = `${outputDir}/${id}.svg`
  const rawJson = await Bun.file(inputPath).text()
  const elements = JSON.parse(rawJson) as SystemDiagramElement[]
  const svg = renderSystemDiagram(elements)

  await Bun.write(outputPath, svg)
  console.log(`Wrote ${outputPath}`)
}
