import appController from '../core/appController.js'

class fetchApi1 {
  static baseUrl = '/api'

  static headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'authorization': ``
  }
  url = fetchApi1.baseUrl

  constructor (url) {
    this.url = `${fetchApi1.baseUrl}/${url}`
  }

  getIdPathName = id => `${this.url}/${id}`

  static setAuthToken = () => fetchApi1.headers.authorization = `Bearer ${appController.token}`

  list = async () => {
    fetchApi1.setAuthToken()
    const response = await fetch(this.url, { headers: fetchApi1.headers })
    return await response.json()
  }

  post = async item => {
    fetchApi1.setAuthToken()
    const response = await fetch(this.url, {
      body: JSON.stringify(item),
      method: 'POST',
      headers: fetchApi1.headers
    })
    return await response.json()
  }

  put = async item => {
    fetchApi1.setAuthToken()
    const response = await fetch(this.getIdPathName(item.id), {
      body: JSON.stringify(item),
      method: 'PUT',
      headers: fetchApi1.headers
    })
    return await response.json()
  }

  delete = async id => {
    fetchApi1.setAuthToken()
    const response = await fetch(this.getIdPathName(id), {
      method: 'DELETE',
      headers: fetchApi1.headers
    })
    return await response.json()
  }
}

export const accountsFetchApi = new fetchApi1('accounts')
