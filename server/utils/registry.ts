import https from 'https'
import config from 'config'
import axios, { AxiosResponse, Method } from 'axios'
import { Access, getAccessToken } from '../routes/v1/registryAuth'
import logger from './logger'

export enum ContentTypes {
  APPLICATION_OCTET_STREAM = 'application/octet-stream',
  APPLICATION_MANIFEST = 'application/vnd.docker.distribution.manifest.v2+json',
  APPLICATION_LAYER = 'application/vnd.docker.image.rootfs.diff.tar',
  APPLICATION_CONFIG = 'application/vnd.docker.container.image.v1+json',
}

interface Registry {
  address: string
  agent: https.Agent
}

interface ImageRef {
  namespace: string
  model: string
  version: string
}

export async function createRegistryClient(): Promise<Registry> {
  const httpsAgent = new https.Agent({
    rejectUnauthorized: !config.get('registry.insecure'),
  })

  return {
    address: `${config.get('registry.protocol')}://${config.get('registry.host')}/v2`,
    agent: httpsAgent,
  }
}

interface Request {
  path: string
  method: Method
  authorisation: string
  headers?: Record<string, string>
}

export async function makeRegistryRequest<T>(registry: Registry, req: Request): Promise<AxiosResponse<T>> {
  const res = await axios({
    url: `${registry.address}${req.path}`,
    method: req.method,
    httpsAgent: registry.agent,
    headers: {
      ...req.headers,
      Authorization: req.authorisation,
    },
    validateStatus: (status) => status < 500,
  })

  return res
}

export async function getAdminAuthorisation(scope: Array<Access>): Promise<string> {
  const token = await getAccessToken({ id: 'admin', _id: 'admin' }, scope)
  const authorisation = `Bearer ${token}`

  return authorisation
}

export async function getImageDigest(registry: Registry, image: ImageRef): Promise<string | undefined> {
  const authorisation = await getAdminAuthorisation([
    { type: 'repository', name: `${image.namespace}/${image.model}`, actions: ['pull'] },
  ])

  const res = await makeRegistryRequest<any>(registry, {
    path: `/${image.namespace}/${image.model}/manifests/${image.version}`,
    method: 'HEAD',
    authorisation,
    headers: {
      Accept: ContentTypes.APPLICATION_MANIFEST,
    },
  })

  if (res.status === 404) {
    return undefined
  }

  if (res.status !== 200) {
    logger.error({ status: res.status, image }, 'Invalid registry request response when getting image digest')
    throw new Error('Invalid registry request response')
  }

  const digest = res.headers['docker-content-digest']
  logger.info({ image, digest }, 'Found image digest')

  return digest
}

export async function deleteImageTag(registry: Registry, image: ImageRef) {
  const digest = await getImageDigest(registry, image)

  if (!digest) {
    logger.info({ image, digest }, 'Invalid image tag, unable to remove')
    throw new Error('Image not found')
  }

  const authorisation = await getAdminAuthorisation([
    { type: 'repository', name: `${image.namespace}/${image.model}`, actions: ['pull', 'delete'] },
  ])

  const res = await makeRegistryRequest<any>(registry, {
    path: `/${image.namespace}/${image.model}/manifests/${digest}`,
    method: 'DELETE',
    authorisation,
    headers: {
      Accept: ContentTypes.APPLICATION_MANIFEST,
    },
  })

  if (res.status >= 400) {
    const error = `Unable to delete registry image: ${await res.data}`
    logger.error({ image }, error)
    throw new Error(error)
  }
}
