'use strict'

import { c } from '../core/constants.js'

const utils = {
  /**
   * Returns common request fields.
   * @param {AppRequest} req
   * @return {{tenantId, id, userId}}
   */
  getBasicRequestData: req => {
    return { tenantId: req.user.tenantId, userId: req.user.id, id: req.params.id }
  },

  /**
   * Sends data validation error to client.
   * @param res
   * @param errors
   * @param {string} [title]
   * @return {*}
   */
  sendError: (res, errors, title = 'Invalid data') => {
    return res.status(400).json({ title, invalidParams: errors })
  },

  getUserCacheKey: email => `${c.cacheKey.USER}|${email}`

}
export default utils
