import convertNameToUrlFormat from '../../utils/convertNameToUrlFormat'
import getUuidFromUrl from '../../utils/getUuidFromUrl'

const BASE_URL = Cypress.config('baseUrl')

let modelUuid = ''
let deploymentUuid = ''
let containerUrl = ''
let registryUrl = ''

describe('Model with code and binary files', () => {
  before(() => {
    if (BASE_URL) {
      registryUrl = BASE_URL.replace('http://', '')
      containerUrl = BASE_URL.replace('8080', '9999')
    }

    cy.log('Navigating to upload page')
    cy.visit('/upload')

    cy.log('Uploading model')
    cy.get('[data-test=uploadJsonTab]').click({ force: true })

    cy.log('Selecting schema')
    cy.get('[data-test=selectSchemaInput]').trigger('mousedown', { force: true, button: 0 })
    cy.fixture('schema_names.json').then((schemaNames) => {
      cy.get(`[role=option]:contains(${schemaNames.model})`).click()
      cy.get('body').type('{esc}')
    })

    cy.log('Selecting code and binary files')
    cy.get('[for=select-code-file]').selectFile('cypress/fixtures/minimal_code.zip', { force: true })
    cy.get('[for=select-binary-file]').selectFile('cypress/fixtures/minimal_binary.zip', { force: true })

    cy.log('Inputting model metadata')
    cy.fixture('minimal_metadata.json').then((modelMetadata) => {
      cy.get('[data-test=metadataTextarea]').clear()
      cy.get('[data-test=metadataTextarea]').type(JSON.stringify(modelMetadata), {
        parseSpecialCharSequences: false,
        delay: 0,
      })
      cy.get('[data-test=warningCheckbox]').click()

      cy.log('Submitting model')
      cy.get('[data-test=submitButton]').click()

      cy.log('Checking URL has been updated')
      cy.url({ timeout: 15000 })
        .as('modelUrl')
        .should('contain', `/model/${convertNameToUrlFormat(modelMetadata.highLevelDetails.name)}`)
        .then((url) => {
          modelUuid = getUuidFromUrl(url)
        })
    })

    cy.log('Checking model cannot be deployed before being approved')
    cy.get('[data-test=approvalsChip]').should('contain.text', 'Approvals 0/2')
    cy.get('[data-test="modelActionsButton"]').click({ force: true })
    cy.get('[data-test=submitDeployment]').should('have.attr', 'aria-disabled', 'true')
    cy.get('body').type('{esc}')

    cy.log('Checking model has been built')
    cy.get('[data-test=buildLogsTab]').click({ force: true })
    cy.get('[data-test=terminalLog] > span', { timeout: 600000 }).should('contain', 'Successfully completed build')
  })

  it('Can review, deploy and test a model', () => {
    cy.log('Navigating to review page')
    cy.get('[data-test=reviewLink]').click()
    cy.url().should('contain', '/review')

    cy.log('Approving model')
    cy.get(`[data-test=approveButtonReviewer${modelUuid}]`).click({ force: true })
    cy.get('[data-test=confirmReviewButton]').click({ force: true })
    cy.get('[data-test=confirmReviewButton]').should('not.exist')
    cy.get(`[data-test=approveButtonManager${modelUuid}]`).click({ force: true })
    cy.get('[data-test=confirmReviewButton]').click({ force: true })

    cy.log('Navigating to model page')
    cy.visit(`/model/${modelUuid}`)

    cy.log('Checking model has been approved')
    cy.get('[data-test=approvalsChip]').should('contain.text', 'Approvals 2/2')

    cy.log('Deploying model')
    cy.get('[data-test="modelActionsButton"]').click({ force: true })
    cy.get('[data-test=submitDeployment]').click()
    cy.fixture('minimal_metadata.json').then((modelMetadata) => {
      cy.url({ timeout: 10000 })
        .should('contain', `/model/${convertNameToUrlFormat(modelMetadata.highLevelDetails.name)}`)
        .should('contain', '/deploy')
    })
    cy.get('[data-test=uploadJsonTab]').click({ force: true })

    cy.log('Selecting schema and inputting deployment metadata')
    cy.get('[data-test=selectSchemaInput]').trigger('mousedown', { force: true, button: 0 })
    cy.fixture('schema_names.json').then((schemaNames) => {
      cy.get(`[role=option]:contains(${schemaNames.deployment})`).click()
    })
    cy.fixture('deployment.json').then((metadata) => {
      cy.get('[data-test=metadataTextarea]').clear()
      cy.get('[data-test=metadataTextarea]').type(JSON.stringify(metadata), {
        parseSpecialCharSequences: false,
        delay: 0,
      })
    })
    cy.get('[data-test=warningCheckbox]').click()

    cy.log('Submitting deployment')
    cy.get('[data-test=submitButton]').click()

    cy.log('Checking URL has been updated')
    cy.fixture('deployment.json').then({ timeout: 60000 }, (deploymentMetadata) => {
      cy.url({ timeout: 10000 })
        .as('deploymentUrl')
        .should('contain', `/deployment/${convertNameToUrlFormat(deploymentMetadata.highLevelDetails.name)}`)
        .then({ timeout: 60000 }, async (url) => {
          deploymentUuid = getUuidFromUrl(url)

          cy.log('Navigating to review page')
          cy.get('[data-test=reviewLink]').click()
          cy.url().should('contain', '/review')

          cy.log('Approving deployment')
          cy.get(`[data-test=approveButtonManager${deploymentUuid}]`).click({ force: true })
          cy.get('[data-test=confirmReviewButton]').click({ force: true })

          cy.log('Navigating to deployment page')
          cy.visit(`/deployment/${deploymentUuid}`)

          cy.log('Checking deployment has been approved')
          cy.get('[data-test=approvalsChip]').should('contain.text', 'Approvals 1/1')

          cy.log('Checking model runs as expected')
          cy.get('[data-test=userMenuButton]').click()

          cy.log('Navigating to settings page')
          cy.get('[data-test=settingsLink]').click()
          cy.url().should('contain', '/settings')

          cy.log('Getting docker password')
          cy.get('[data-test=showTokenButton]').click()
          cy.get('[data-test=dockerPassword]').should('not.contain.text', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxxx')
          cy.get('[data-test=dockerPassword]')
            .invoke('text')
            .then({ timeout: 60000 }, (dockerPassword) => {
              cy.fixture('minimal_metadata.json').then({ timeout: 60000 }, async (modelMetadata) => {
                const imageName = `${registryUrl}/${deploymentUuid}/${modelUuid}:${modelMetadata.highLevelDetails.modelCardVersion}`
                cy.exec(`docker login ${registryUrl} -u ${'user'} -p ${dockerPassword}`)

                cy.exec(`cypress/scripts/pullContainer.sh "${imageName}"`)

                cy.exec(`cypress/scripts/startContainer.sh "${imageName}"`)
                // eslint-disable-next-line cypress/no-unnecessary-waiting
                cy.wait(5000)

                cy.request('POST', `${containerUrl}/predict`, {
                  jsonData: { data: ['should be returned backwards'] },
                }).then((response) => {
                  expect(response.body.data.ndarray[0]).to.eq('sdrawkcab denruter eb dluohs')
                })
                cy.exec(`cypress/scripts/stopContainer.sh "${imageName}"`)
              })
            })
        })
    })
  })
})

export {}
