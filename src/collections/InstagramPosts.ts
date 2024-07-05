import { CollectionConfig } from 'payload'
import { childrenEndpoint, mediaEndpoint } from '../plugin'

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
          const test = await fetch(doc?.media_url).then(res => {
            return res
          })
          if (!test.ok) {
            throw new Error('media_url expired')
          }
          return doc
        } catch (errMediaUrlExpired) {
          console.error('MediaUrlExpired', errMediaUrlExpired)
          try {
            const endpoint = `${baseUrl}${mediaEndpoint}?media_id=${id}`

            const response = await fetch(endpoint).then(res => res.json())

            const { media_url: updatedMediaUrl } = response
            let children
            if (media_type === 'CAROUSEL_ALBUM') {
              children = await fetch(`${baseUrl}${childrenEndpoint}?media_id=${id}`).then(res =>
                res.json(),
              )
            }
            try {
              await req.payload.update({
                collection: 'instagram-posts',
                id,
                data: {
                  media_url: updatedMediaUrl,
                  children,
                },
              })
            } catch (errUpdatingMediaUrl) {
              console.error('UpdatingMediaUrl', errUpdatingMediaUrl)
            }
          } catch (errFetchEndpoint) {
            console.error('FetchEndpointToUpdateMediaUrl', errFetchEndpoint)
          }

          return doc
        }
      },
    ],
  },
}

export default InstagramPosts
