const config = {
  connectors: {
    user: {
      kind: 'silly',
    },
    authorisation: {
      kind: 'silly',
    },
  },
  log: {
    level: 'debug',
  },
  registry: {
    connection: {
      internal: 'https://localhost:5000',
    },
  },
}

export default config
