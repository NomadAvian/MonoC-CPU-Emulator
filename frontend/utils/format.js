/**
 * formatValue — converts a 32-bit integer to the chosen display format.
 *
 * @param {number} value   — raw integer (treated as unsigned 32-bit)
 * @param {string} format  — 'Hex' | 'Unsigned' | 'Binary'
 * @returns {string}
 */
export function formatValue(value, format) {
  const u32 = value >>> 0  // coerce to unsigned 32-bit

  switch (format) {
    case 'Unsigned': {
      const dec = String(u32).padStart(10, '0')
      return `${dec.slice(0, 4)} ${dec.slice(4, 8)} ${dec.slice(8)}`
    }

    case 'Binary': {
      const bin = u32.toString(2).padStart(32, '0')
      return bin.match(/.{1,4}/g).join(' ')
    }

    case 'Hex':
    default: {
      const hex = u32.toString(16).padStart(8, '0').toUpperCase()
      return `${hex.slice(0, 4)} ${hex.slice(4)}`
    }
  }
}