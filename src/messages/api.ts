import { Router } from 'express'
import { ClientService } from '../clients/service'
import { MessageService } from './service'

export class MessageApi {
  constructor(private router: Router, private clients: ClientService, private messages: MessageService) {}

  async setup() {
    this.router.post('/messages', async (req, res) => {
      const { token } = req.headers
      const { conversationId, payload, authorId } = req.body

      // TODO: validate ownership
      const client = (await this.clients.getByToken(token as string))!
      const message = await this.messages.create(conversationId, payload, authorId)

      res.send(message)
    })

    this.router.delete('/messages', async (req, res) => {
      const { token } = req.headers
      const { id, conversationId } = req.query

      // TODO: validate ownership
      const client = (await this.clients.getByToken(token as string))!
      let deleted: number
      if (id) {
        deleted = await this.messages.delete(id as string)
      } else {
        deleted = await this.messages.deleteByConversationId(conversationId as string)
      }

      res.send({ count: deleted })
    })

    this.router.get('/messages/:messageId', async (req, res) => {
      const { token } = req.headers
      const { messageId } = req.params

      // TODO: validate ownership
      const client = (await this.clients.getByToken(token as string))!
      const message = await this.messages.get(messageId)

      if (message) {
        res.send(message)
      } else {
        res.sendStatus(404)
      }
    })

    this.router.get('/messages/', async (req, res) => {
      const { token } = req.headers
      const { conversationId, limit } = req.query

      // TODO: validate ownership
      const client = (await this.clients.getByToken(token as string))!
      const conversations = await this.messages.listByConversationId(conversationId as string, +limit!)

      res.send(conversations)
    })
  }
}