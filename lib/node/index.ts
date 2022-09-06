import fetch from 'cross-fetch'
import https from 'https'
import http from 'http'
import { FormDataEncoder } from 'form-data-encoder'
import { FormData } from 'formdata-node'
import qs from 'qs'
import { Readable } from 'stream'

type Response = 'Accepted' | 'Declined'
class Request {
  request: any

  api: API

  constructor(api: API, request: any) {
    this.request = request
    this.api = api
  }

  respond(response: Response) {
    return this.api.apiPost(`/request/${this.request._id}/respond`, {
      choice: response,
    })
  }
}

class User {
  user: any

  api: API

  constructor(api: API, user: any) {
    this.user = user
    this.api = api
  }
}

class Schema {
  schema: any

  api: API

  constructor(api: API, schema: any) {
    this.schema = schema
    this.api = api
  }
}

type VersionName = 'latest' | string
class Version {
  version: any

  api: API

  constructor(api: API, version: any) {
    this.version = version
    this.api = api
  }
}

class Deployment {
  deployment: any

  api: API

  constructor(api: API, deployment: any) {
    this.deployment = deployment
    this.api = api
  }
}

class Model {
  model: any

  api: API

  constructor(api: API, model: any) {
    this.model = model
    this.api = api
  }

  async getDeployments() {
    const deployments = await this.api.apiGet(`/model/${this.model.uuid}/deployments`)

    return deployments.map((deployment) => new Deployment(this.api, deployment))
  }

  async getSchema() {
    return await this.api.apiGet(`/model/${this.model.uuid}/schema`)
  }

  async getVersions() {
    const versions = await this.api.apiGet(`/model/${this.model.uuid}/versions`)

    return versions.map((version) => new Version(this.api, version))
  }

  async getVersion(versionName: VersionName) {
    const version = await this.api.apiGet(`/model/${this.model.uuid}/version/${versionName}`)

    return new Version(this.api, version)
  }
}

type ModelsType = 'favourites' | 'user' | 'all'
type SchemaUse = 'UPLOAD' | 'DEPLOYMENT'

type RequestUse = 'Upload' | 'Deployment'
type RequestFilter = 'all' | 'user'

interface File {
  stream: any
}

interface Pki {
  key: string
  cert: string
}

interface Options {
  pki?: Pki
  rejectUnauthorized?: boolean
}

const defaultOpts: Options = {
  rejectUnauthorized: false
}

export default class API {
  base: string
  httpAgent: http.Agent
  httpsAgent: https.Agent

  constructor(base: string, opts: Options) {
    const options = { ...defaultOpts, ...opts}
    const httpsOptions: https.AgentOptions = {
      rejectUnauthorized: opts.rejectUnauthorized,
    }
    
    if (opts.pki) {
      httpsOptions.key = opts.pki.key
      httpsOptions.cert = opts.pki.cert
    }
    
    this.httpAgent = new http.Agent()
    this.httpsAgent = new https.Agent(httpsOptions)

    this.base = base
  }

  apiFetch(url: string, options?: any) {
    return fetch(url, {
      agent: (parsedUrl: URL) => parsedUrl.protocol == 'http:' ? httpAgent : httpsAgent,
      ...options
    })
  }

  apiGet(endpoint: string) {
    return this.apiFetch(`${this.base}${endpoint}`).then((res) => res.json())
  }

  apiPost(endpoint: string, body: any) {
    return this.apiFetch(`${this.base}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    }).then((res) => res.json())
  }

  async getModels(type: ModelsType, filter?: string) {
    const { models } = await this.apiGet(
      `/models?${qs.stringify({
        type,
        filter,
      })}`
    )

    return models.map((model) => new Model(this, model))
  }

  async getModel(uuid: string) {
    const model = await this.apiGet(`/model/uuid/${uuid}`)

    return new Model(this, model)
  }

  async postModel(code: File, binary: File, metadata: any) {
    const form = new FormData()

    form.append('code', code)
    form.append('binary', binary)
    form.append('metadata', JSON.stringify(metadata))

    const encoder = new FormDataEncoder(form)
    return await this.apiFetch(`${this.base}/model`, {
      method: 'POST',
      headers: encoder.headers,
      body: Readable.from(encoder) as any,
    }).then((res) => res.json())
  }

  async getDeployment(uuid: string) {
    const deployment = await this.apiGet(`/deployment/${uuid}`)

    return new Deployment(this, deployment)
  }

  async getVersion(id: string) {
    const version = await this.apiGet(`/version/${id}`)

    return new Version(this, version)
  }

  async getSchemas(use: SchemaUse) {
    const schemas = await this.apiGet(
      `/schemas?${qs.stringify({
        use,
      })}`
    )

    return schemas.map((schema) => new Schema(this, schema))
  }

  async getDefaultSchema(use: SchemaUse) {
    const schema = await this.apiGet(
      `/schema/default?${qs.stringify({
        use,
      })}`
    )

    return new Schema(this, schema)
  }

  async getSchema(schemaRef: string) {
    const schema = await this.apiGet(`/schema/${schemaRef}`)

    return new Schema(this, schema)
  }

  async getUsers() {
    const { users } = await this.apiGet(`/users`)

    return users.map((user) => new User(this, user))
  }

  async getUser() {
    const user = await this.apiGet(`/user`)

    return new User(this, user)
  }

  async getRequests(type: RequestUse, filter?: RequestFilter): Promise<Array<Request>> {
    const { requests } = await this.apiGet(
      `/requests?${qs.stringify({
        type,
        filter,
      })}`
    )

    return requests.map((request) => new Request(this, request))
  }

  async getRequestCount() {
    const { count } = await this.apiGet(`/requests/count`)

    return count
  }
}
