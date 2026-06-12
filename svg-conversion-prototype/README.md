# SVG conversion prototype

This directory is reserved for converting proposed `system_*` Circuit JSON elements into SVG output and comparing rendered output against `reference-images/*.png`.

Render the current reference recreation with:

```sh
bun svg-conversion-prototype/render-system-diagram.ts reference-images/refimage001.json svg-conversion-prototype/refimage001.svg
```

Initial renderer assumptions:

- Diagram `width` and `height` are SVG viewport dimensions.
- Component `center` and `size` are interpreted in image-space units.
- Positive `y` points downward for compatibility with the current reference image recreation files.
- `system_style` is resolved by `style_id`, with inline `appearance` taking precedence.
