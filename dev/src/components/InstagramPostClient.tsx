'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import ReactPlayer from 'react-player'
import { PostType } from '../../../src'

const InstagramPostClient: React.FC<{ posts: PostType[] }> = ({ posts }) => (
  <>
    {posts?.map(({ id, media_type, media_url, permalink, caption, children, ...props }) => (
      <div key={id}>
        {media_type === 'IMAGE' ||
          (media_type === 'CAROUSEL_ALBUM' && (
            <Image src={media_url} alt={caption} width={720} height={480} />
          ))}
        {media_type === 'VIDEO' && <ReactPlayer controls={true} width={'100%'} url={media_url} />}
      </div>
    ))}
  </>
)

export default InstagramPostClient
