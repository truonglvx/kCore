import { TooManyRequests, Forbidden } from 'feathers-errors'
import { RateLimiter } from 'limiter'
import makeDebug from 'debug'

const debug = makeDebug('kalisio:kCore:service:hooks')

export function rateLimit (options) {
  const limiter = new RateLimiter(options.tokensPerInterval, options.interval)

  return function (hook) {
    if (hook.type !== 'before') {
      throw new Error(`The 'rateLimit' hook should only be used as a 'before' hook.`)
    }
    const operation = hook.method
    const service = hook.service.name
    let rateLimit = true
    if (options.operation && (options.operation !== operation)) {
      rateLimit = false
    }
    if (options.service && (options.service !== service)) {
      rateLimit = false
    }

    if (rateLimit) {
      debug(limiter.getTokensRemaining() + ' remaining token for rateLimit hook on service ' + service)
      if (!limiter.tryRemoveTokens(1)) { // if exceeded
        throw new TooManyRequests('Too many requests in a given amount of time (rate limiting) on service ' + service, { translation: { key: 'RATE_LIMITING' } })
      }
    }
    return hook
  }
}

export function countLimit (options) {
  return function (hook) {
    if (hook.type !== 'before') {
      throw new Error(`The 'countLimit' hook should only be used as a 'before' hook.`)
    }
    let app = hook.app
    let count = options.max
    // Either we build a count request using a service or the caller has its own count routine
    const customCount = (typeof options.count === 'function')
    if (!customCount) {
      let service
      if (typeof options.service === 'function') {
        service = options.service(hook)
      } else {
        service = app.getService(options.service, hook.service.context)
      }
      // Indicate we'd only like to count
      let query = { $limit: 0 }
      if (typeof options.query === 'function') {
        Object.assign(query, options.query(hook))
      } else {
        Object.assign(query, options.query)
      }
      count = service.find({ query }).total
    } else {
      count = options.count(hook)
    }

    const customMax = (typeof options.max === 'function')
    const max = (customMax ? options.max(hook) : options.max)
    if (count >= max) {
      throw new Forbidden('Resource quota exceeded (count limiting) on service ' + options.service, { translation: { key: 'COUNT_LIMITING' } })
    }
    return hook
  }
}
