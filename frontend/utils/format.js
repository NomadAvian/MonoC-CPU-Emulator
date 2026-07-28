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
    case 'Unsigned':
      return String(u32)

    case 'Binary':
      return '0b' + u32.toString(2).padStart(32, '0')

    case 'Hex':
    default:
      return '0x' + u32.toString(16).padStart(8, '0').toUpperCase()
  }
}