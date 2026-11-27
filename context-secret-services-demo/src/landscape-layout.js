// Use an actual landscape browsing viewport: CSS media queries, dialogs and
// pointer events inside the game then share the same coordinate system.
export function landscapeLayout(width, height, mobile) {
  const rotated = Boolean(mobile && height > width);
  return { rotated, width: rotated ? height : width, height: rotated ? width : height };
}
