import { withTheme } from '@rjsf/core'
import React, { Dispatch, SetStateAction } from 'react'

import { SplitSchema, Step } from '../../types/interfaces'
import { setStepState } from '../../utils/formUtils'
import EntitySelector from '../MuiForms/EntitySelector'
import { Theme as MaterialUITheme } from '../MuiForms/index'
import ModelVersionSelector from '../MuiForms/ModelVersionSelector'
import Nothing from '../MuiForms/Nothing'
import SeldonVersionSelector from '../MuiForms/SeldonVersionSelector'
import TextareaWidget from '../MuiForms/TextareaWidget'
import UserSelector from '../MuiForms/UserSelector'

const SchemaForm = withTheme(MaterialUITheme)

export default function RenderForm({
  step,
  splitSchema,
  setSplitSchema,
}: {
  step: Step
  splitSchema: SplitSchema
  setSplitSchema: Dispatch<SetStateAction<SplitSchema>>
}) {
  const onFormChange = (form) => {
    if (form.schema.title !== step.schema.title) {
      return
    }

    setStepState(splitSchema, setSplitSchema, step, { ...step.state, ...form.formData })
  }

  return (
    <SchemaForm
      schema={step.schema}
      formData={step.state}
      onChange={onFormChange}
      widgets={{
        userSelector: UserSelector,
        entitySelector: EntitySelector,
        seldonVersionSelector: SeldonVersionSelector,
        modelVersionSelector: ModelVersionSelector,
        textArea: TextareaWidget,
        nothing: Nothing,
      }}
      uiSchema={step.uiSchema}
      liveValidate={step.shouldValidate}
      omitExtraData
      liveOmit
    >
      {/* eslint-disable-next-line react/jsx-no-useless-fragment */}
      <></>
    </SchemaForm>
  )
}
