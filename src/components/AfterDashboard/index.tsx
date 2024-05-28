'use client'
import React from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import axios from 'axios'

import './index.scss'

const queryClient = new QueryClient()

function Posts() {
  const {
    isPending,
    error,
    data: response,
    isFetching,
  } = useQuery<{
    data: {
      id: string
      media_type: string
      media_url: string
      permalink: string
      caption: string
    }[]
    paging: { before: string; after: string }
  }>({
    queryKey: ['IGPostsList'],
    queryFn: () => axios.get(`/api/instagram-list`).then(res => res.data),
  })

  if (isPending) return 'Loading...'

  if (error) return 'An error has occurred: ' + error.message

  return (
    <div style={postsContainerStyle}>
      {response?.data?.map(({ id, media_type, media_url, permalink, caption }) => (
        <div style={cardStyle}>
          {(media_type === 'CAROUSEL_ALBUM' || media_type === 'IMAGE') && <img src={media_url} />}
          <p style={zeroMarginStyle}>
            <b>media id: </b>
            {id}
          </p>
          <p style={zeroMarginStyle}>
            <a href={permalink}>
              <b>Link to post</b>
            </a>
          </p>
          <p style={zeroMarginStyle}>
            <a href={media_url}>
              <b>Link to {media_type}</b>
            </a>
          </p>
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

const postsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
}
const cardStyle: React.CSSProperties = {
  width: '30%',
  flexGrow: 1,
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  borderRadius: '5px',
  maxHeight: '600px',
  overflow: 'scroll',
}
const zeroMarginStyle: React.CSSProperties = {
  margin: 0,
}

export default AfterDashboard
