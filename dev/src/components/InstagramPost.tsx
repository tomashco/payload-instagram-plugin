import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import InstagramPostClient from './InstagramPostClient'

const InstagramPost: React.FC = async () => {
  const payload = await getPayload({ config: configPromise })

  const { docs: posts } = await payload.find({
    collection: 'instagram-posts',
  })
  return (
    <section className="py-10 first:mt-16">
      <div className="prose dark:prose-invert md:prose-lg">
        {/* @ts-expect-error */}
        <InstagramPostClient posts={posts} />
      </div>
    </section>
  )
}

export default InstagramPost
