'use client'
import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Button } from '@payloadcms/ui'
import { baseEndpoint, childrenEndpoint } from '../../plugin'
import InstagramPostsApi from '../../api/hooks/useInstagramPosts'
import InstagramCollectionApi from '../../api/hooks/useInstagramCollection'
import ConfigInstagramApi from '../../api/hooks/useConfigInstagram'
import { PostType } from '../../types'

const queryClient = new QueryClient()

const LoadingCards = () =>
  Array(6)
    .fill(0)
    .map((_el, ind) => <div key={ind} style={style.cardStyle} />)

function ManagePosts() {
  const [endpoint, setEndpoint] = React.useState<string>(baseEndpoint)
  const [appId, setAppId] = React.useState<string>('')
  const [appSecret, setAppSecret] = React.useState<string>('')
  const [first, setFirst] = React.useState<string>('')

  // const { addAccessToken } = TokenApi({ endpoint, queryClient, setToken })
  const { addAppId } = ConfigInstagramApi({ appId, setAppId, setAppSecret })
  const { isPending, error, response, isFetching, isLoading } = InstagramPostsApi({ endpoint })
  const { instagramCollection, mutateInstagramCollection } = InstagramCollectionApi({ queryClient })

  useEffect(() => {
    // disable the previous button if the first page is reached
    if (endpoint === baseEndpoint) {
      setFirst(response?.paging?.before || '')
    }
  }, [response])

  const onSubmitHandler = async (evt: any) => {
    evt.preventDefault()
    await addAppId({ appId, appSecret })
  }

  if (isLoading) return <p>Loading...</p>

  if (error?.message === '403')
    return (
      <form onSubmit={onSubmitHandler}>
        <p>Please insert your Instagram configuration:</p>
        <div className="field-type email">
          <p>App ID:</p>
          <input
            id="field-appId"
            className="field-type__wrap"
            value={appId}
            onChange={evt => setAppId(evt.target.value)}
          />
          <p style={{ marginTop: '2rem' }}>App Secret:</p>
          <input
            id="field-appSecret"
            className="field-type__wrap"
            value={appSecret}
            onChange={evt => setAppSecret(evt.target.value)}
          />
          <Button id="form-token" onClick={onSubmitHandler}>
            Configure Instagram Plugin
          </Button>
        </div>
      </form>
    )

  if (error) return 'An error has occurred: ' + error.message

  const InstagramCard = ({
    id,
    media_type,
    media_url,
    permalink,
    caption,
    index,
  }: PostType & { index: number }) => (
    <div id={`instagramCard-${index}`} style={style.cardStyle}>
      <div style={{ position: 'absolute', top: '0', right: '1rem', zIndex: 10 }}>
        {instagramCollection?.docs?.find(el => el.id === id) ? (
          <Button disabled>Already in collection</Button>
        ) : (
          <Button
            onClick={async () => {
              if (media_type === 'CAROUSEL_ALBUM') {
                const children = await fetch(`${childrenEndpoint}?media_id=${id}`).then(res => {
                  return res.json()
                })
                mutateInstagramCollection({
                  id,
                  media_type,
                  media_url,
                  permalink,
                  caption,
                  children,
                })
              } else {
                mutateInstagramCollection({ id, media_type, media_url, permalink, caption })
              }
            }}
          >
            Add to collection
          </Button>
        )}
      </div>
      {(media_type === 'CAROUSEL_ALBUM' || media_type === 'IMAGE') && <img src={media_url} />}
      {media_type === 'VIDEO' && (
        <video style={{ width: '100%', height: '300px' }} controls playsInline>
          <source src={media_url} type="video/mp4" />
        </video>
      )}

      <p style={style.zeroMarginStyle}>
        <b>media id: </b>
        {id}
      </p>
      <p style={style.zeroMarginStyle}>
        <a href={permalink}>
          <b>Link to post</b>
        </a>
      </p>
      <p style={style.zeroMarginStyle}>
        <a href={media_url}>
          <b>Link to {media_type}</b>
        </a>
      </p>
      <p>{caption}</p>
    </div>
  )

  const Pagination = () => (
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
            `${baseEndpoint}${response?.paging?.after ? `?after=${response?.paging?.after}` : ''}`,
          )
        }}
      >
        Next
      </Button>
    </div>
  )

  return (
    <>
      <p>here is a list of your posts:</p>
      <div style={style.postsContainerStyle}>
        {!isPending && !isFetching && Array.isArray(response.data) ? (
          response?.data?.map((Post, index) => (
            <InstagramCard key={Post.id} index={index} {...Post} />
          ))
        ) : (
          <LoadingCards />
        )}
      </div>
      <Pagination />
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
        <ManagePosts />
      </QueryClientProvider>
    </div>
  )
}

const style: {
  postsContainerStyle: React.CSSProperties
  cardStyle: React.CSSProperties
  zeroMarginStyle: React.CSSProperties
} = {
  postsContainerStyle: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  cardStyle: {
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
  },
  zeroMarginStyle: {
    margin: 0,
  },
}

export default InstagramPostsClient
