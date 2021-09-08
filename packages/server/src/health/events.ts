import { Emitter } from '@botpress/messaging-base'
import { HealthEvent } from './types'

export enum HealthEvents {
  Registered
}

export interface HealthCreatedEvent {
  event: HealthEvent
}

export class HealthEmitter extends Emitter<{
  [HealthEvents.Registered]: HealthCreatedEvent
}> {}

export type HealthWatcher = Omit<HealthEmitter, 'emit'>