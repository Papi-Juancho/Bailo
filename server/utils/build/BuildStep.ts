import { VersionDoc } from 'server/models/Version'
import { FileRef } from './build'
import { BuildLogger } from './BuildLogger'

export type Files = {
  [name: string]: FileRef
}

export interface BuildOpts {
  retryable: boolean
}

export abstract class BuildStep {
  logger: BuildLogger
  opts: BuildOpts = {
    retryable: false,
  }

  constructor(logger: BuildLogger, opts: Partial<BuildOpts>, _props: any) {
    this.opts = { ...this.opts, ...opts }
    this.logger = logger
  }

  abstract name(version: VersionDoc, files: Files, state: any): Promise<string>
  abstract build(version: VersionDoc, files: Files, state: any): Promise<void>
  abstract rollback(version: VersionDoc, files: Files, state: any): Promise<void>

  // optional tidyup
  async tidyup(version: VersionDoc, files: Files, state: any): Promise<void> {}
}