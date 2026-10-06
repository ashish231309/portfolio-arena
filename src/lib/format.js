/**
 * Headline copy sometimes has to derive from data but keep the editorial voice
 * ("Two recreations, one obsession" / "Four years, ten subjects"). These two
 * helpers do exactly that — the rendered words stay identical to the old
 * hardcoded strings while the number itself comes from the data.
 */
const NUM_WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty',
]

export const spellNumber = (n) => NUM_WORDS[n] ?? String(n)

export const capitalize = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s)
