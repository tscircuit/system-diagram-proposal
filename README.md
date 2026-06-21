# system-diagram-proposal
tscircuit System Diagram Proposal, includes props, circuit-json and svg conversion with reference graphics

This repo has four directories:

- `circuit-json-proposal` - the proposed circuit json types
- `svg-conversion-prototype` - examples converting the proposed circuit-json to an SVG and comparing how close we can get to the reference images
- `tsx-generation-prototype` - example TSX syntax and generation of circuit json from the tsx
- `reference-images` - reference images to recreate, `refimage001.png`, `refimage002.png`, etc.

## Reference image workflow

Generate SVGs for every reference image:

```sh
bun run generate:refimages
```

Generate visual diffs for every reference image:

```sh
bun run diff:refimages
```

Generate a focused visual diff for one reference image:

```sh
bun run diff:refimages refimage007
```

Diff artifacts are written to `image-diffs/`:

- `<id>.actual.png` - rasterized output from the generated SVG
- `<id>.diff.png` - red pixels show visual mismatch against the reference PNG
- `report.json` - mismatch ratios and mean absolute error scores
