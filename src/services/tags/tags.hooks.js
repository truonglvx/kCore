import { populateResource, addTagIfNew, removeTagIfUnused, tagResource, untagResource } from '../../hooks'
import { disallow, iff } from 'feathers-hooks-common'
const { authenticate } = require('feathers-authentication').hooks

module.exports = {
  before: {
    all: [ authenticate('jwt') ],
    find: [],
    get: [ disallow() ],
    create: [ populateResource, addTagIfNew ],
    update: [ disallow() ],
    patch: [ disallow('external') ],
    // Let the removal of the actual tag object by ID pass without running these hooks
    // Indeed the initial call is used to remove the tag from the resource with the ID of the resource given, not the tag one
    remove: [ populateResource, iff(hook => hook.params.query && hook.params.query.value && hook.params.query.scope, removeTagIfUnused) ]
  },

  after: {
    all: [],
    find: [],
    get: [],
    // Let the tagging of the resource object occur only when resource has been found are present
    create: [ iff(hook => hook.params.resource, tagResource) ],
    update: [],
    patch: [],
    // Let the untagging of the resource object occur only when resource has been found are present
    remove: [ iff(hook => hook.params.resource, untagResource) ]
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
}