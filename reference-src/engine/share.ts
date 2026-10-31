/** Plain-text blend card for sharing. Brand name and hashtags come from config (empty by default). */
export function buildBlendCard(opts: { title: string; lines: string[]; hashtags: string[]; brand: string }): string {
  const tags = opts.hashtags.join(' ');
  return [opts.title, ...opts.lines, [opts.brand, tags].filter(Boolean).join(' ')].filter(Boolean).join('\n');
}
