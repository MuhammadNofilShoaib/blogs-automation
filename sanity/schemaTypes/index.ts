import { type SchemaTypeDefinition } from 'sanity'
import { post } from './blog'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post],
}
