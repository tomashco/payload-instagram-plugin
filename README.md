# Payload Instagram Plugin

This plugin allows you to use an instagram connected feed as content to be shown inside payload blog.

🔥 important: starting from 0.0.8 the access token will be stored to db to allow to refresh it automatically. Read the updated setup guide to learn how to configure the plugin.

## How to setup
1. create a facebook developer app following [this tutorial](https://developers.facebook.com/docs/instagram-basic-display-api/getting-started), up to point 3. 

🔥 Important:
- As ```redirect_uri``` set: https://yourBaseUrl/api/instagram/authorize. Change "yourBaseUrl" with your app url. If you are using this from localhost, run your payload instance with ```--experimental-https``` flagged, as https is needed for the instagram token request!
- as revoke authorization set: https://yourBaseUrl/api/instagram/unauthorize
- as request to delete data set: https://yourBaseUrl/api/instagram/delete

2. Add the plugin to the payload.config.ts, together with all your config, as follows:

```
import { instagramPlugin } from 'instagram-payload-plugin'

export default buildConfig({
  plugins: [
    instagramPlugin({ enabled: true })
  ],
})
```

## How to use

In the admin view, a new collection called instagram-posts is added. Do not add manually any item to this collection!

A custom view called Instagram Posts is added on the left panel, allowing you to see a preview of all the connected instagram posts. From here you can click on wathever post you like and add it to the collection.

### item types
The items in the collection have this structure:

```
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

type CAROUSEL_ALBUM will have an additional array of children, each being the actual image of the carousel (i.e. more than one image in a post).

### how to import items into the page

method 1: instagram-posts is just a regular collection, so you can import it like:

```
import configPromise from '@payload-config'
import { getPayloadHMR } from '@payloadcms/next/utilities'

const payload = await getPayloadHMR({ config: await configPromise })

  const { docs } = await payload.find({
    collection: 'instagram-posts',
    depth: 3
  })
  ```

  method 2: Create a relationship block such as:
  ```
  const InstagramIntegration: Block = {
  slug: 'InstagramIntegration',
  interfaceName: 'InstagramIntegrationBlock',
  fields: [
    {
      name: 'instagramSrc',
      type: 'relationship',
      required: true,
      relationTo: 'instagram-posts'
    }
  ]
}
```

and after that you will be able to use the component data in this way:

```
const InstagramIntegration = ({ instagramSrc }: { instagramSrc: PostType }) => {
  const { media_type, media_url, caption, children }: InstagramPost = instagramSrc
  return (
    <section className={cn('relative flex')}>
      <Container>
        {media_type === 'CAROUSEL_ALBUM' && (
          <Carousel>
            <CarouselContent>
              {children?.map(({ media_url }) => (
                <CarouselItem key={media_url}>
                  <div className="relative h-[400px] w-full">
                    <Image layout="fill" objectFit="contain" src={media_url || ''} alt={'carousel image'} />
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

### how to delete an item
To delete an item, simply delete the entrance inside the collection view.


