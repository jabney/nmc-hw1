const readline = require('readline')
const { createReadStream } = require('fs')

// Create charactermaps for rendering the bear.
const charMap = {
  pos: { f: ' ', a: '8', b: '1', c: 'v', d: ':', e: '.' },
  neg: { f: ' ', a: '.', b: ':', c: 'v', d: '1', e: '8' }
}

/**
 * @typedef {'pos'|'neg'} RenderType
 */
/**
 * Render the bear source image in either positive or negative.
 *
 * @param {string} line
 * @param {RenderType} type
 */
function render(line, type) {
  return [...line].map((char) => charMap[type][char]).join('')
}

/**
 * Summon the bear.
 *
 * @param {RenderType} type
 */
function getBear(type) {
  return new Promise((resolve) => {
    const bear = []
    // Read the input a line at a time.
    readline.createInterface(createReadStream('./data/bear.txt'))
      // Render each line into the buffer.
      .on('line', (line) => bear.push(render(line, type)))
      // Resolve the promise.
      .on('close', () => resolve(bear))
  })
}

module.exports = getBear
