'use client'
import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '@payloadcms/ui/elements/Button'

import type { PostType } from '../../types'
import {
  addAccessTokenEndpoint,
  baseEndpoint,
  childrenEndpoint,
  instagramCollectionEndpoint,
} from '../../plugin'

const queryClient = new QueryClient()

type ResponseType = {
  data: PostType[]
  paging: { before: string; after: string }
}

const LoadingCards = () =>
  Array(6)
    .fill(0)
    .map((_el, ind) => <div key={ind} style={cardStyle} />)

function Posts() {
  const [endpoint, setEndpoint] = React.useState<string>(baseEndpoint)
  const [token, setToken] = React.useState<string>('')
  const [first, setFirst] = React.useState<string>('')

  const {
    isPending,
    error,
    data: response,
    isFetching,
    isLoading,
  } = useQuery<ResponseType>({
    queryKey: [endpoint],
    queryFn: () =>
      fetch(endpoint).then(res => {
        if (!res.ok) throw new Error(res.status.toString())
        return res.json()
      }),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  useEffect(() => {
    if (endpoint === baseEndpoint) {
      setFirst(response?.paging?.before || '')
    }
  }, [response])

  const { data: instagramPosts } = useQuery<{ docs: PostType[] }>({
    queryKey: [instagramCollectionEndpoint],
    queryFn: () => fetch(instagramCollectionEndpoint).then(res => res.json()),
  })

  const { mutate } = useMutation({
    mutationFn: (post: PostType) =>
      fetch(instagramCollectionEndpoint, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(post),
        credentials: 'include',
      }).then(res => {
        return res.json()
      }),
    onSuccess: res => {
      queryClient.invalidateQueries({ queryKey: [instagramCollectionEndpoint] })
      alert(`Status: ${res?.message}`)
    },
  })

  const { mutate: addAccessToken } = useMutation({
    mutationFn: (body: { accessToken: string }) =>
      fetch(addAccessTokenEndpoint, {
        body: JSON.stringify(body),
        method: 'POST',
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error(res.status.toString())
        return res.json()
      }),
    onSuccess: _res => {
      queryClient.invalidateQueries({ queryKey: [endpoint] })
      alert('Status: token successfully added!')
      setToken('')
    },
    onError: _res => {
      alert('Status: the token provided is not correct, try again')
      setToken('')
    },
  })

  const onSubmitHandler = async (evt: any) => {
    evt.preventDefault()
    await addAccessToken({ accessToken: token })
  }

  if (isLoading) return <p>Loading...</p>

  if (error?.message === '403')
    return (
      <form onSubmit={onSubmitHandler}>
        <p>Please insert a valid access token: </p>
        <div className="field-type email">
          <input
            id="field-token"
            className="field-type__wrap"
            value={token}
            onChange={evt => setToken(evt.target.value)}
          />
          <Button id="form-token" onClick={onSubmitHandler}>
            Add Access Token
          </Button>
        </div>
      </form>
    )

  if (error) return 'An error has occurred: ' + error.message

  return (
    <>
      <p>here is a list of your posts:</p>
      <div style={postsContainerStyle}>
        {!isPending && !isFetching && Array.isArray(response.data) ? (
          response?.data?.map(({ id, media_type, media_url, permalink, caption }) => (
            <div key={id} style={cardStyle}>
              <div style={{ position: 'absolute', top: '0', right: '1rem' }}>
                {instagramPosts?.docs?.find(el => el.id === id) ? (
                  <Button disabled>Already in collection</Button>
                ) : (
                  <Button
                    onClick={async () => {
                      if (media_type === 'CAROUSEL_ALBUM') {
                        const children = await fetch(`${childrenEndpoint}?media_id=${id}`).then(
                          res => {
                            return res.json()
                          },
                        )
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
                <video style={{ width: '100%', height: '300px' }} controls playsInline>
                  <source src={media_url} type="video/mp4" />
                </video>
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
              `${baseEndpoint}${
                response?.paging?.before ? `?before=${response?.paging?.before}` : ''
              }`,
            )
          }}
        >
          Previous
        </Button>
        <Button
          onClick={() => {
            setEndpoint(baseEndpoint)
          }}
        >
          Reset
        </Button>
        <Button
          disabled={!response?.paging?.after}
          onClick={() => {
            setEndpoint(
              `${baseEndpoint}${
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

const InstagramPostsClient: React.FC = () => {
  return (
    <div style={{ padding: '2rem' }}>
      <QueryClientProvider client={queryClient}>
        <h4>Instagram posts</h4>
        <h5>
          This Plugin allows you to import Instagram Posts into Payload and use them as regular
          posts
        </h5>
        <Posts />
      </QueryClientProvider>
    </div>
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

export default InstagramPostsClient
