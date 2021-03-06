import _ from 'lodash'
import { Events } from 'quasar'

// Export singleton
let Store = {
  set (path, value) {
    const previousValue = this.get(path)
    _.set(this, path, value)
    let eventName = _.kebabCase(`${path}-changed`)
    Events.$emit(eventName, value, previousValue)
  },
  get (path, defaultValue) {
    return _.get(this, path, defaultValue)
  },
  patch (path, value) {
    // Patching should not change the obejct reference to maintain reactivity
    let previousValue = this.get(path)
    if (previousValue) {
      Object.assign(previousValue, value)
      this.set(path, previousValue)
    }
  },
  unset (path) {
    _.unset(this, path)
    let eventName = _.kebabCase(`${path}-changed`)
    Events.$emit(eventName, undefined)
  },
  has (path) {
    return _.has(this, path)
  }
}

export { Store }
