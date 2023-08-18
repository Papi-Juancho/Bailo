export const SchemaKind = {
  Model: 'model',
  Deployment: 'deployment',
} as const
export type SchemaKindKeys = (typeof SchemaKind)[keyof typeof SchemaKind]

export const GetModelFilters = {
  Mine: 'mine',
} as const

export type GetModelFiltersKeys = (typeof GetModelFilters)[keyof typeof GetModelFilters]
