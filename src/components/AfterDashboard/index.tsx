'use client'
import React from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import axios from 'axios'

import './index.scss'

// Create a client
const queryClient = new QueryClient()

// const baseClass = 'after-dashboard'

function Posts() {
  const { isPending, error, data, isFetching } = useQuery({
    queryKey: ['IGPostsList'],
    queryFn: () =>
      axios
        .get(
          `https://graph.instagram.com/me/media?fields=id,media_url,permalink,media_type,caption&access_token={{accessToken}}&limit=25`,
        )
        .then(res => res.data),
  })

  if (isPending) return 'Loading...'

  if (error) return 'An error has occurred: ' + error.message

  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        // gridAutoRows: 'minmax(100px, 30%)',
      }}
    >
      {/* @ts-expect-error */}
      {data?.data?.map(({ id, media_type, media_url, permalink, caption }) => (
        <div
          style={{
            width: '30%',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            borderRadius: '5px',
          }}
        >
          {(media_type === 'CAROUSEL_ALBUM' || media_type === 'IMAGE') && <img src={media_url} />}
          <p>
            <b>media id: </b>
            {id}
          </p>
          <p
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.2em',
              height: '1.2em',
            }}
          >
            <b>Link to post: </b>
            <a href={permalink}>{permalink}</a>
          </p>
          <p
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: '1.2em',
              height: '1.2em',
            }}
          >
            <b>{media_type}: </b>
            <a href={media_url}>{media_url}</a>
          </p>
          {/* <p dangerouslySetInnerHTML={{ __html: caption }} /> */}
          <p>{caption}</p>
        </div>
      ))}
      <div>{isFetching ? 'Updating...' : ''}</div>
      <ReactQueryDevtools initialIsOpen />
    </div>
  )
}

const AfterDashboard: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div
      //  className={baseClass}
      >
        <h4>Instagram posts</h4>
        <h5>
          This Plugin allows you to import Instagram Posts into Payload and use them as regular
          posts
        </h5>
        <p>here is a list of your posts:</p>
        <Posts />
      </div>
    </QueryClientProvider>
  )
}

export default AfterDashboard
