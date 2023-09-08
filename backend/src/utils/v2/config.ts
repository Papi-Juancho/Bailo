import bunyan from 'bunyan'
import _config from 'config'

import { deepFreeze } from './object.js'

export interface Config {
  app: {
    protocol: string
    host: string
    port: number
  }

  connectors: {
    user: {
      kind: 'silly' | string
    }

    authorisation: {
      kind: 'silly' | string
    }
  }

  smtp: {
    enabled: boolean

    connection: {
      host: string
      port: number
      secure: boolean
      auth: {
        user: string
        pass: string
      }
      tls: {
        rejectUnauthorized: boolean
      }
    }

    from: string
  }

  log: {
    level: bunyan.LogLevel
  }
}

const config: Config = _config.util.toObject()
deepFreeze(config)
export default config
