import { ChannelRenderer } from '../../base/renderer'
import { TwilioContext } from '../context'

export class TwilioCarouselRenderer implements ChannelRenderer<TwilioContext> {
  get channel(): string {
    return 'twilio'
  }

  get priority(): number {
    return 0
  }

  get id(): string {
    return TwilioCarouselRenderer.name
  }

  handles(context: TwilioContext): boolean {
    return context.payload.items?.length
  }

  render(context: TwilioContext) {
    const payload = context.payload // as sdk.CarouselContent

    for (const { subtitle, title, image, actions } of payload.items) {
      const body = `${title}\n\n${subtitle || ''}`
      // const options: sdk.ChoiceOption[] = []
      const options = []

      for (const button of actions || []) {
        const title = button.title as string

        if (button.action === 'Open URL') {
          options.push({ title: `${title} : ${button.url}`, value: undefined })
        } else if (button.action === 'Postback') {
          options.push({ title, value: button.payload })
        } else if (button.action === 'Say something') {
          options.push({
            title,
            value: button.text as string
          })
        }
      }

      // TODO fix any not working with medial url
      context.messages.push(<any>{ body, mediaUrl: image })
      context.payload.choices = options
    }
  }
}