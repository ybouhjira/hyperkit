import { Schema as S } from 'effect'
import { SectionContent } from './ContentSchema.js'

export const ReportSection = S.Struct({
  id: S.String,
  label: S.optional(S.String),
  title: S.String,
  description: S.optional(S.String),
  descriptionHtml: S.optional(S.Boolean),
  content: S.Array(SectionContent),
})

export const SuggestedAction = S.Struct({
  label: S.String,
  icon: S.optional(S.String),
  prompt: S.String,
})

export const Report = S.Struct({
  title: S.String,
  subtitle: S.optional(S.String),
  badge: S.optional(S.String),
  brand: S.optional(S.String),
  meta: S.optional(
    S.Array(
      S.Struct({
        label: S.String,
        icon: S.optional(S.String),
      })
    )
  ),
  score: S.optional(
    S.Struct({
      value: S.Number,
      label: S.String,
      description: S.optional(S.String),
      color: S.optional(S.String),
      chips: S.optional(
        S.Array(
          S.Struct({
            text: S.String,
            variant: S.Literal('done', 'partial', 'missing'),
          })
        )
      ),
    })
  ),
  sections: S.Array(ReportSection),
  footer: S.optional(S.String),
})

export const InteractiveReport = S.Struct({
  report: Report,
  suggestedActions: S.Array(SuggestedAction),
})

export type ReportSection = S.Schema.Type<typeof ReportSection>
export type Report = S.Schema.Type<typeof Report>
export type InteractiveReport = S.Schema.Type<typeof InteractiveReport>
