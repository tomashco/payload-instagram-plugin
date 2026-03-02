# Payload Instagram Plugin

This plugin allows you to use an Instagram connected feed as content to be shown inside a Payload CMS blog.

> **Important:** Starting from 0.0.8, the access token is stored in the database and refreshes automatically. The token refreshes every 10 days and is valid for 60 days.

## Requirements

- **Instagram Business or Creator account** — a personal Instagram account will not work. See the [Setup Guide](./SETUP_GUIDE.md#part-1-convert-to-instagram-businesscreator-account) for how to convert your account (free, reversible).
- **Meta Developer App** with Instagram product configured.
- **HTTPS** — Instagram requires HTTPS for OAuth redirects, even on localhost.

## How to setup

Follow the [Setup Guide](./SETUP_GUIDE.md) for detailed step-by-step instructions covering:

1. Converting your Instagram account to Business/Creator
2. Creating and configuring a Meta Developer App
3. Installing and authorizing the plugin

**Quick summary:**

Set your redirect URI in the Meta Developer App to:
```
https://yourBaseUrl/api/instagram/authorize
```
Replace `yourBaseUrl` with your app URL. If running locally, use `--experimental-https` to start your dev server with HTTPS.

Also set:
- Revoke authorization URL: `https://yourBaseUrl/api/instagram/unauthorize`
- Data deletion request URL: `https://yourBaseUrl/api/instagram/delete`

Add the plugin to your `payload.config.ts`:

```ts
import { instagramPlugin } from 'instagram-payload-plugin'

export default buildConfig({
  plugins: [
    instagramPlugin({ enabled: true })
  ],
})
```

## How to use

In the admin view, a new collection called `instagram-posts` is added. Do not add items to this collection manually!

A custom view called **Instagram Posts** is added to the left panel, allowing you to preview all connected Instagram posts. From here you can click on any post to add it to the collection.

### Item types

The items in the collection have this structure:

```ts
type PostType = {
  id: string
  media_url: string
  permalink: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  caption: string
  children?: {
    id: string
    media_url: string
    permalink: string
    media_type: string
  }[]
}
```

Type `CAROUSEL_ALBUM` will have an additional array of `children`, each being the actual image of the carousel (i.e. more than one image in a post).

### How to import items into the page

**Method 1:** `instagram-posts` is a regular Payload collection, so you can query it like any other:

```ts
import configPromise from '@payload-config'
import { getPayload } from 'payload'

const payload = await getPayload({ config: configPromise })

const { docs } = await payload.find({
  collection: 'instagram-posts',
  depth: 3,
})
```

**Method 2:** Create a relationship block:

```ts
const InstagramIntegration: Block = {
  slug: 'InstagramIntegration',
  interfaceName: 'InstagramIntegrationBlock',
  fields: [
    {
      name: 'instagramSrc',
      type: 'relationship',
      required: true,
      relationTo: 'instagram-posts',
    },
  ],
}
```

Then use the component data:

```tsx
const InstagramIntegration = ({ instagramSrc }: { instagramSrc: PostType }) => {
  const { media_type, media_url, caption, children } = instagramSrc
  return (
    <section className="relative flex">
      <Container>
        {media_type === 'CAROUSEL_ALBUM' && (
          <Carousel>
            <CarouselContent>
              {children?.map(({ media_url }) => (
                <CarouselItem key={media_url}>
                  <div className="relative h-[400px] w-full">
                    <Image layout="fill" objectFit="contain" src={media_url || ''} alt="carousel image" />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        )}
        {caption && (
          <div className="w-full p-6 dark:text-zinc-100">
            <p>{caption}</p>
          </div>
        )}
      </Container>
    </section>
  )
}
```

### How to delete an item

To delete an item, simply delete the entry from the collection view.
