/**
 * @typedef {(code: number, payload?: Object) => void} HandlerCallback
 */

/**
 * @typedef {(data: any, callback: HandlerCallback) => void} RouteHandler
 */

const http = require('http')
const url = require('url')
const { StringDecoder } = require('string_decoder')

const caesar = require('./lib/caesar')
const getBear = require('./lib/bear')

const bearPosPromise = getBear('pos').then((data) => data)
const bearNegPromise = getBear('neg').then((data) => data)

const PORT = 4000

// Instantiate the http server.
const httpServer = http.createServer(async (req, res) => {
  // Get the url and parse it.
  const parsedUrl = url.parse(req.url, true)

  // Get the url path.
  const path = parsedUrl.pathname.replace(/^\/+|\/+$/g, '')

  // Get the query object.
  const query = parsedUrl.query

  // Get the HTTP method.
  const method = req.method.toLowerCase()

  // Get the request headers.
  const headers = req.headers

  // Get the payload if any.
  const decoder = new StringDecoder('utf-8')
  let buffer = ''
  req.on('data', (chunk) => { buffer += decoder.write(chunk) })
  req.on('end', () => {
    buffer += decoder.end()

    // Choose the handler for this request.
    const handler = handlers[path] || handlers.notFound

    // Create a data object to pass to the handler.
    const data = {
      query,
      method,
      headers,
      path: path,
      payload: buffer
    }

    handler(data, (code, data) => {
      // Set a fallback for status code.
      const statusCode = typeof code == 'number' ? code : 200

      // Set a fallback for the data payload.
      const payload = typeof data === 'object' ? data : {}

      // Stringify Json.
      const json = JSON.stringify(payload)

      // Get the byte length of the json payload.
      const contentLength = Buffer.byteLength(json, 'utf-8')

      // Set the content type header.
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Length', contentLength)

      // Send the response.
      res.writeHead(statusCode)
      res.end(json)

      console.log(`Returning response ${statusCode} for "${path}" route`)
    })
  })
})

 // Start the http server.
httpServer.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

// Create route handlers container.
const handlers = {}

/**
 * Hello route handler.
 *
 * @type {RouteHandler}
 */
handlers.hello = async (data, callback) => {
  // Send the bears!
  callback(200, {
    bears: {
      pos: await bearPosPromise,
      neg: await bearNegPromise,
    }
  })
}

/**
 * Caesar route handler.
 *
 * @type {RouteHandler}
 */
handlers.caesar = (data, callback) => {
  // Get the shift number for the cipher from the headers.
  const shift = parseInt(data.headers.shift)

  // Get the message to encrypt.
  const message = data.payload

  // Create the payload container.
  const payload = { message: message || 'no message given' }

  // If there's a message and a proper shift number, encrypt.
  if (message && !isNaN(shift)) {
    // Encrypt the message.
    payload.ciphertext = caesar.encrypt(message, shift)

    // Get the length of the character set for encryption.
    const length = caesar.characterSet.length

    // Inform the sender if no shift was performed.
    if (shift % length === 0) {
      payload.warning = `Message not encrypted. Avoid shift values of 0 or multiples of ${length}`
    }
  }

  callback(200, payload)
}

/**
 * 404 route handler.
 *
 * @type {RouteHandler}
 */
handlers.notFound = (data, callback) => {
  callback(404, { error: 'not found' })
}
