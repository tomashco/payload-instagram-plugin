'use client'
import React from 'react'
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Button } from '@payloadcms/ui/elements/Button'
import ReactPlayer from 'react-player'
import axios from 'axios'

import './index.scss'
import type { PostType } from '../../types'

const queryClient = new QueryClient()

type ResponseType = {
  data: PostType[]
  paging: { before: string; after: string }
}

const LoadingCards = () =>
  Array(6)
    .fill(0)
    .map(() => <div style={cardStyle} />)

const baseEndpoint = '/api/instagram/list/'

function Posts() {
  const [endpoint, setEndpoint] = React.useState<string>(baseEndpoint)
  const [first, setFirst] = React.useState<string>('')

  const {
    isPending,
    error,
    data: response,
    isFetching,
  } = useQuery<ResponseType>({
    queryKey: [endpoint],
    queryFn: () =>
      axios.get(endpoint).then(res => {
        if (endpoint === baseEndpoint) setFirst(res?.data?.paging?.before)
        return res.data
      }),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const { data: instagramPosts } = useQuery<{ docs: PostType[] }>({
    queryKey: ['api/instagram-posts'],
    queryFn: () =>
      axios.get('api/instagram-posts').then(res => {
        return res.data
      }),
  })

  const { mutate } = useMutation({
    mutationFn: (post: PostType) =>
      axios.post('api/instagram-posts', post).then(res => {
        if (endpoint === baseEndpoint) setFirst(res?.data?.paging?.before)
        return res.data
      }),
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: ['api/instagram-posts'] })
      alert(`Status: ${res.message}`)
    },
  })

  if (error) return 'An error has occurred: ' + error.message

  return (
    <>
      <div style={postsContainerStyle}>
        {!isPending && !isFetching && Array.isArray(response.data) ? (
          response?.data?.map(({ id, media_type, media_url, permalink, caption }) => (
            <div style={cardStyle}>
              <div style={{ position: 'absolute', top: '0', right: '1rem' }}>
                {instagramPosts?.docs?.find(el => el.id === id) ? (
                  <Button disabled>Already in collection</Button>
                ) : (
                  <Button
                    onClick={async () => {
                      if (media_type === 'CAROUSEL_ALBUM') {
                        const children = await axios
                          .get(`api/instagram/children?media_id=${id}`)
                          .then(res => {
                            return res.data
                          })
                        mutate({ id, media_type, media_url, permalink, caption, children })
                      } else {
                        mutate({ id, media_type, media_url, permalink, caption })
                      }
                    }}
                  >
                    Add to collection
                  </Button>
                )}
              </div>
              {(media_type === 'CAROUSEL_ALBUM' || media_type === 'IMAGE') && (
                <img src={media_url} />
              )}
              {media_type === 'VIDEO' && (
                <ReactPlayer controls={true} width={'100%'} url={media_url} />
              )}
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
          ))
        ) : (
          <LoadingCards />
        )}
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
        <Button
          disabled={!response?.paging?.before || response?.paging?.before === first}
          onClick={() => {
            setEndpoint(
              `/api/instagram/list/${
                response?.paging?.before ? `?before=${response?.paging?.before}` : ''
              }`,
            )
          }}
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            setEndpoint('/api/instagram/list/')
          }}
        >
          Reset
        </Button>
        <Button
          disabled={!response?.paging?.after}
          onClick={() => {
            setEndpoint(
              `/api/instagram/list/${
                response?.paging?.after ? `?after=${response?.paging?.after}` : ''
              }`,
            )
          }}
        >
          Next
        </Button>
      </div>
    </>
  )
}

const AfterDashboard: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <h4>Instagram posts</h4>
        <h5>
          This Plugin allows you to import Instagram Posts into Payload and use them as regular
          posts
        </h5>
        <p>here is a list of your posts:</p>
        <Posts />
      </div>
      <ReactQueryDevtools initialIsOpen />
    </QueryClientProvider>
  )
}

const postsContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '10px',
  flexWrap: 'wrap',
}
const cardStyle: React.CSSProperties = {
  position: 'relative',
  width: '30%',
  flexGrow: 1,
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  borderRadius: '5px',
  height: '400px',
  overflow: 'scroll',
}
const zeroMarginStyle: React.CSSProperties = {
  margin: 0,
}

export default AfterDashboard
