import { FrameworkEnv } from '@botpress/messaging-framework'

export type MessagingEnv = FrameworkEnv & {
  SYNC?: string
  SPINNED?: string
  SPINNED_URL?: string
  NO_LAZY_LOADING?: string
  TWILIO_TESTING?: string
  BILLING_ENDPOINT?: string
  ENABLE_BILLING_STATS?: string
  DISABLE_SOCKETS?: string
  ENABLE_LEGACY_CHANNELS?: string
  METRICS_ENABLED?: string
  METRICS_PORT?: string
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends MessagingEnv {}
    export interface Process {
      pkg: any
    }
  }
}
