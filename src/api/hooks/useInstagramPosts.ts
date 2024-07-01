import { useQuery } from '@tanstack/react-query'
import { PostType } from '../../types'

type UseInstagramPostsType = {
  endpoint: string
}

type UseInstagramResponseType = {
  isPending: boolean
  error: Error | null
  isFetching: boolean
  isLoading: boolean
  response: {
    data: PostType[]
    paging: { before: string; after: string }
  }
}

const useInstagramPosts = ({ endpoint }: UseInstagramPostsType): UseInstagramResponseType => {
  const {
    isPending,
    error,
    data: response,
    isFetching,
    isLoading,
  } = useQuery({
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
  return { isPending, error, response, isFetching, isLoading }
}

export default useInstagramPosts
