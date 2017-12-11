import { Events } from 'quasar'
import { createQuerablePromise } from '../utils'

let objectProxyMixin = {
  props: {
    id: {
      type: String,
      default: ''
    },
    perspective: {
      type: String,
      default: ''
    }
  },
  methods: {
    getObject () {
      return this._object
    },
    getObjectId () {
      return this._object ? this._object._id : ''
    },
    loadObject () {
      // Create a new mixin promise if required
      const objectChanged = this.id && (this.getObjectId() !== this.id)
      if (!this.objectPromise || objectChanged) {
        this.objectPromise = createQuerablePromise((resolve, reject) => {
          if (!this.id) {
            resolve()
            return
          }
          let params = {}
          if (this.perspective) {
            params = { query: { $select: [this.perspective] } }
          }
          this.loadService()
          .get(this.id, params)
          .then(object => {
            this._object = object
            resolve(object)
          })
          .catch(error => {
            Events.$emit('error', error)
            reject(error)
          })
        })
      }
      return this.objectPromise
    }
  }
}

export default objectProxyMixin
