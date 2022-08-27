import { buildPython } from '../utils/build'
import { getUploadQueue } from '../utils/queues'
import prettyMs from 'pretty-ms'
import { findVersionById, markVersionBuilt } from '../services/version'
import logger from '../utils/logger'
import { getUserByInternalId } from '../services/user'
import { QueueMessage } from '../../lib/p-mongo-queue/pMongoQueue'
import { BuildHandler } from 'server/utils/build/BuildHandler'

import createWorkingDirectory from 'server/utils/build/CreateWorkingDirectory'
import getRawFiles from 'server/utils/build/GetRawFiles'
import extractFiles from 'server/utils/build/ExtractFiles'
import getSeldonDockerfile from 'server/utils/build/GetSeldonDockerfile'
import imgBuildDockerfile from 'server/utils/build/ImgBuildDockerfile'

export default async function processUploads() {
  ;(await getUploadQueue()).process(async (msg: QueueMessage) => {
    logger.info({ job: msg.payload }, 'Started processing upload')

    const user = await getUserByInternalId(msg.payload.userId)
    if (!user) {
      throw new Error(`Unable to find upload user '${msg.payload.userId}'`)
    }

    const version = await findVersionById(user, msg.payload.versionId, { populate: true })
    if (!version) {
      throw new Error(`Unable to find version '${msg.payload.versionId}'`)
    }

    const buildHandler = new BuildHandler([
      { construct: createWorkingDirectory() },
      { construct: getRawFiles() },
      { construct: extractFiles() },
      { construct: getSeldonDockerfile() },
      { construct: imgBuildDockerfile() },
    ])

    await buildHandler.process(version, {
      binary: msg.payload.binary,
      code: msg.payload.code,
    })

    await markVersionBuilt(version._id)
  })
}
