const ROUTES = [
  'units', // (viewport, px, em, ch, etc.)
  'values', // (strings, numbers, concatenation, math, functions, etc.)
  'properties', // ( lowercase, hyphens, etc.)
  'selectors', // (tags, classes, ids, nested, combos, special (media, pre, etc.), etc.)
  'stylesheet',
  'cascading', // hierarchy, top-down, no native nesting
  // specificity // allows you to break the rules of cascading hierarchy, !important, EXAMPLE
  // 'keywords', // initial, inherit
  // 'color', // foreground vs background
  // typography (em, rem)
  // dimension (width, height, %)
  // layout
  // 'attribute selectors', // (html-specific selectors)
  // 'pseudo selectors', // (html-specific selectors)
  // the box model
  // position
  // margin
  // padding
  // tables
  // display
  // flexbox (single columns, rows)
  // grid (multiple columns, rows, evolution of table layout)
  // typography (fonts, all attributes)
  // cursor
  // shadows (box shadow, text shadow)
  // transition
  // transform
  // z-index
  // viewport (device-scale?)
  // vendor prefixes
  // preprocessing
  // postprocessing
]

module.exports = {
  ROUTES
}