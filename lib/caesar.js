
const PORT = 4000

// The ascii ranges for special characters (non-alphanumeric).
const specialRanges = [[32, 47], [58, 64], [91, 96], [123, 126]]

// Uppercase, lowercase, digit characters.
const upper = new Array(26).fill(0).map((_, i) => String.fromCharCode(65 + i))
const lower = new Array(26).fill(0).map((_, i) => String.fromCharCode(97 + i))
const digit = new Array(10).fill(0).map((_, i) => String.fromCharCode(48 + i))

// Non-alphanumeric characters.
const special = specialRanges.reduce((list, range) => {
  const start = range[0]
  const end = range[1]
  const length = end - start + 1
  return list.concat(new Array(length).fill(0).map((_, i) => start + i))
}, []).map(code => String.fromCharCode(code))

// All characters appended together.
const characterSet = [...upper, ...lower, ...digit, ...special]

/**
 * Deal with negative shift values.
 *
 * @param {number} shift
 */
const normalizeShift = function normalizeShift(shift) {
  const _shift = shift % characterSet.length
  return _shift < 0 ? characterSet.length + _shift : _shift
}

/**
 * Perform a caesar shift on the given message.
 *
 * @param {string} message the message to encode
 * @param {number} shift the number of characters to shift
 */
const encrypt = function encrypt(message, shift) {
  const _shift = normalizeShift(shift)
  return [...message].reduce((cipher, char) => {
    const index = characterSet.indexOf(char)
    if (index >= 0) {
      const pos = (index + _shift) % characterSet.length
      return cipher.concat(characterSet[pos])
    }
    return char
  }, '')
}

module.exports = {
  characterSet,
  encrypt,
}
