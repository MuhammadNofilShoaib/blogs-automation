import { type SchemaTypeDefinition } from 'sanity'
import { blogPost } from './blog'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [blogPost],
}
