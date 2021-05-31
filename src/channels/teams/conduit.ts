import { BotFrameworkAdapter, ConversationReference, TurnContext } from 'botbuilder'
import _ from 'lodash'
import LRU from 'lru-cache'
import ms from 'ms'
import { Conduit, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { TeamsConfig } from './config'
import { TeamsContext } from './context'
import { TeamsRenderers } from './renderers'
import { TeamsSenders } from './senders'

export class TeamsConduit extends Conduit<TeamsConfig, TeamsContext> {
  public adapter!: BotFrameworkAdapter
  private convoRefs!: LRU<string, Partial<ConversationReference>>

  protected async setupConnection() {
    this.adapter = new BotFrameworkAdapter({
      appId: this.config.appId,
      appPassword: this.config.appPassword,
      channelAuthTenant: this.config.tenantId
    })

    this.convoRefs = this.app.caching.newLRU()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), ...TeamsRenderers]
  }

  protected setupSenders() {
    return TeamsSenders
  }

  protected async map(payload: TurnContext): Promise<EndpointContent> {
    const { activity } = payload
    const convoRef = TurnContext.getConversationReference(activity)

    await this.setConvoRef(convoRef.conversation!.id, convoRef)

    return {
      content: { type: 'text', text: activity.value?.text || activity.text },
      foreignUserId: activity.from.id,
      foreignConversationId: convoRef.conversation!.id
    }
  }

  protected async context(base: ChannelContext<any>): Promise<TeamsContext> {
    return {
      ...base,
      client: this.adapter,
      messages: [],
      convoRef: await this.getConvoRef(base.foreignConversationId!)
    }
  }

  private async getConvoRef(threadId: string): Promise<Partial<ConversationReference>> {
    let convoRef = this.convoRefs.get(threadId)
    if (convoRef) {
      return convoRef
    }

    convoRef = await this.app.kvs.get(this.clientId, threadId)
    this.convoRefs.set(threadId, convoRef!)
    return convoRef!
  }

  private async setConvoRef(threadId: string, convoRef: Partial<ConversationReference>): Promise<void> {
    if (this.convoRefs.get(threadId)) {
      return
    }

    this.convoRefs.set(threadId, convoRef)
    return this.app.kvs.set(this.clientId, threadId, convoRef)
  }
}