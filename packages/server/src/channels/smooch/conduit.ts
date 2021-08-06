// @ts-ignore
import Smooch from 'smooch-core'
import yn from 'yn'
import { ConduitInstance, EndpointContent } from '../base/conduit'
import { ChannelContext } from '../base/context'
import { CardToCarouselRenderer } from '../base/renderers/card'
import { DropdownToChoicesRenderer } from '../base/renderers/dropdown'
import { SmoochConfig } from './config'
import { SmoochMessage, SmoochPayload, SmoochContext, SmoochWebhook } from './context'
import { SmoochRenderers } from './renderers'
import { SmoochSenders } from './senders'

export class SmoochConduit extends ConduitInstance<SmoochConfig, SmoochContext> {
  private smooch: any
  public secret!: string

  async initialize() {
    const target = await this.getRoute()
    const { webhooks } = await this.smooch.webhooks.list()

    if (yn(process.env.SPINNED)) {
      const legacyWh = webhooks.find((x: any) => x.target?.includes('/mod/channel-smooch'))
      if (legacyWh) {
        await this.smooch.webhooks.delete(legacyWh._id)
        this.logger.info('Deleted legacy webhook', legacyWh.target)
      }
    }

    let webhook = webhooks.find((x: any) => x.target === target)
    if (!webhook) {
      webhook = (
        await this.smooch.webhooks.create({
          target,
          triggers: ['message:appUser']
        })
      ).webhook
    }

    this.secret = webhook.secret
  }

  protected async setupConnection() {
    this.smooch = new Smooch({
      keyId: this.config.keyId,
      secret: this.config.secret,
      scope: 'app'
    })

    const { webhooks } = await this.smooch.webhooks.list()
    const target = await this.getRoute()
    const webhook = webhooks.find((x: any) => x.target === target)
    this.secret = webhook?.secret

    await this.printWebhook()
  }

  protected setupRenderers() {
    return [new CardToCarouselRenderer(), new DropdownToChoicesRenderer(), ...SmoochRenderers]
  }

  protected setupSenders() {
    return SmoochSenders
  }

  public async extractEndpoint(payload: { context: SmoochPayload; message: SmoochMessage }): Promise<EndpointContent> {
    return {
      content: { type: 'text', text: payload.message.text },
      thread: payload.context.conversation._id,
      sender: payload.context.appUser._id
    }
  }

  protected async getContext(base: ChannelContext<any>): Promise<SmoochContext> {
    return {
      ...base,
      client: this.smooch,
      messages: []
    }
  }
}
