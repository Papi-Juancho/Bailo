import config from 'config'
import dedent from 'dedent-js'
import mjml2html from 'mjml'
import { DeploymentDoc } from '../models/Deployment'
import { ModelDoc } from '../models/Model'
import { ApprovalCategory } from '../models/Approval'
import { VersionDoc } from '../models/Version'
import createRequestUrl from '../utils/createRequestUrl'
import { wrapper } from './partials'

export interface ReviewApprovalContext {
  document: VersionDoc | DeploymentDoc
  approvalCategory: ApprovalCategory
}

export function html({ document, approvalCategory }: ReviewApprovalContext) {
  const model = document.model as ModelDoc

  const { requester, uploader } = document.metadata.contacts
  const base = `${config.get('app.protocol')}://${config.get('app.host')}:${config.get('app.port')}`

  const requestUrl = createRequestUrl(model, document, base)

  return mjml2html(
    wrapper(`
    <mj-section background-color="#27598e" padding-bottom="5px" padding-top="20px">
      <mj-column width="100%">
        <mj-text align="center" color="#FFF" font-size="13px" font-family="Helvetica" padding-left="25px" padding-right="25px" padding-bottom="28px" padding-top="28px"><span style="font-size:20px; font-weight:bold">You have been requested to review a ${approvalCategory.toLowerCase()}.</span>
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#356cc7" padding-bottom="15px">
      <mj-column>
        <mj-text align="center" color="#FFF" font-size="15px" font-family="Ubuntu, Helvetica, Arial, sans-serif" padding-left="25px" padding-right="25px" padding-bottom="0px"><strong>Model Name</strong></mj-text>
        <mj-text align="center" color="#FFF" font-size="13px" font-family="Helvetica" padding-left="25px" padding-right="25px" padding-bottom="20px" padding-top="10px">${
          model.currentMetadata.highLevelDetails.name
        }</mj-text>
      </mj-column>
      <mj-column>
        <mj-text align="center" color="#FFF" font-size="15px" font-family="Ubuntu, Helvetica, Arial, sans-serif" padding-left="25px" padding-right="25px" padding-bottom="0px"><strong>Approval Category</strong></mj-text>
        <mj-text align="center" color="#FFF" font-size="13px" font-family="Helvetica" padding-left="25px" padding-right="25px" padding-bottom="20px" padding-top="10px">${approvalCategory}</mj-text>
      </mj-column>
      <mj-column>
        <mj-text align="center" color="#FFF" font-size="15px" font-family="Ubuntu, Helvetica, Arial, sans-serif" padding-left="25px" padding-right="25px" padding-bottom="0px"><strong>Uploader</strong></mj-text>
        <mj-text align="center" color="#FFF" font-size="13px" font-family="Helvetica" padding-left="25px" padding-right="25px" padding-bottom="20px" padding-top="10px">${
          uploader ?? requester
        }</mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#27598e" padding-bottom="20px" padding-top="20px">
      <mj-column width="50%">
        <mj-button background-color="#f37f58" color="#FFF" font-size="14px" align="center" font-weight="bold" border="none" padding="15px 30px" border-radius="10px" href="${requestUrl}" font-family="Helvetica" padding-left="25px" padding-right="25px" padding-bottom="10px">Open ${approvalCategory}</mj-button>
      </mj-column>
      <mj-column width="50%">
        <mj-button background-color="#f37f58" color="#FFF" font-size="14px" align="center" font-weight="bold" border="none" padding="15px 30px" border-radius="10px" href="${base}/review" font-family="Helvetica" padding-left="25px" padding-right="25px" padding-bottom="12px">See Reviews</mj-button>
      </mj-column>
    </mj-section>
  `)
  ).html
}

export function text({ document, approvalCategory }: ReviewApprovalContext) {
  const model = document.model as ModelDoc

  const { requester, uploader } = document.metadata.contacts
  const base = `${config.get('app.protocol')}://${config.get('app.host')}:${config.get('app.port')}`

  const requestUrl = createRequestUrl(model, document, base)

  return dedent(`
    You have been requested to review '${model.currentMetadata.highLevelDetails.name}' on Bailo.

    Approval Category: '${approvalCategory}'
    Uploader: '${uploader ?? requester}'

    Open ${approvalCategory}: ${requestUrl}
    See Reviews: ${base}/review
  `)
}

export function subject({ document }: ReviewApprovalContext) {
  const model = document.model as ModelDoc

  return dedent(`
    You have been requested to review '${model.currentMetadata.highLevelDetails.name}' on Bailo
  `)
}

export function reviewApproval(context: ReviewApprovalContext) {
  return {
    html: html(context),
    text: text(context),
    subject: subject(context),
  }
}