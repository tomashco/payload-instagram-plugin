import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { instagramCollectionEndpoint } from '../../plugin'
import { PostType } from '../../types'

type UseInstagramCollectionType = {
  queryClient: QueryClient
}

const useInstagramCollection = ({ queryClient }: UseInstagramCollectionType) => {
  const { data: instagramCollection } = useQuery<{ docs: PostType[] }>({
    queryKey: [instagramCollectionEndpoint],
    queryFn: () => fetch(instagramCollectionEndpoint).then(res => res.json()),
  })

  const { mutate: mutateInstagramCollection } = useMutation({
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

  return { instagramCollection, mutateInstagramCollection }
}

export default useInstagramCollection
