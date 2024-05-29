import { CollectionConfig } from 'payload/types'

// Example Collection - For reference only, this must be added to payload.config.ts to be used.
const InstagramPosts: CollectionConfig = {
  slug: 'instagram-posts',
  admin: {
    useAsTitle: 'id',
  },
  fields: [
    {
      name: 'id',
      type: 'text',
    },
    {
      name: 'media_type',
      type: 'text',
    },
    {
      name: 'media_url',
      type: 'text',
    },
    {
      name: 'permalink',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'username',
      type: 'text',
    },
    {
      name: 'timestamp',
      type: 'text',
    },
    {
      name: 'children',
      type: 'array',
      fields: [
        {
          name: 'id',
          type: 'text',
        },
        {
          name: 'media_type',
          type: 'text',
        },
        {
          name: 'media_url',
          type: 'text',
        },
        {
          name: 'permalink',
          type: 'text',
        },
      ],
    },
  ],
}

export default InstagramPosts
