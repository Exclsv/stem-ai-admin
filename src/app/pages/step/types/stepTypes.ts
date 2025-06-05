// Use for creating and updating a step
interface StepTranslationType {
  language_id: number
  value: string
}

export interface StepType {
  project: number
  order: number
  translations : StepTranslationType[]
}

// This is the response type for the step
interface StepTranslationResponseType {
  language_id: number
  language_code: string
  value: string
}
export type StepTypeResponse = {
  id: number
  project: number
  order: number
  translations: StepTranslationResponseType[]
}[]
