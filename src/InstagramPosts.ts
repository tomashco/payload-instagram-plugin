import axios from 'axios'
import { CollectionConfig } from 'payload/types'
import { childrenEndpoint, mediaEndpoint } from './plugin'
import { PostType } from './types'

// Example Collection - For reference only, this must be added to payload.config.ts to be used.
const InstagramPosts: CollectionConfig = {
  slug: 'instagram-posts',
  admin: {
    useAsTitle: 'caption',
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
  hooks: {
    beforeRead: [
      async ({ doc, req }) => {
        const { id, media_type } = doc
        const baseUrl =
          req.host === 'localhost' ? `${req.origin}:${process.env.PORT || 3000}` : req.origin

        try {
          const response = await axios.get(doc?.media_url)
          return doc
        } catch (err) {
          req.payload
          const response = await axios
            .get(`${baseUrl}${mediaEndpoint}?media_id=${id}`)
            .then(res => res.data)

          const { media_url: updatedMediaUrl }: PostType = response
          let children
          if (media_type === 'CAROUSEL_ALBUM') {
            children = await axios.get(`${baseUrl}${childrenEndpoint}?media_id=${id}`).then(res => {
              return res.data
            })
          }
          try {
            const result = await req.payload.update({
              collection: 'instagram-posts',
              id,
              data: {
                media_url: updatedMediaUrl,
                children,
              },
            })
          } catch (err) {
            console.error(err)
          }

          return doc
        }
      },
    ],
  },
}

export default InstagramPosts
