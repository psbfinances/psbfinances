'use strict'

export default class AppError extends Error {
  meta

  /**
   * @param {string} message
   * @param {Object} meta - extra data about error.
   */
  constructor (message, meta) {
    super(message)
    this.meta = meta
  }
}
