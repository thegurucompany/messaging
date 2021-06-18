import { Knex } from 'knex'
import { Table } from '../base/table'

export class ConduitTable extends Table {
  get id() {
    return 'msg_conduits'
  }

  create(table: Knex.CreateTableBuilder) {
    table.uuid('id').primary()
    table.uuid('providerId').references('id').inTable('msg_providers')
    table.uuid('channelId').references('id').inTable('msg_channels')
    table.text('config')
    table.unique(['providerId', 'channelId'])
  }
}
