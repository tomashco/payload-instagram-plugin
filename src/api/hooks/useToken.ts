import { QueryClient, useMutation } from '@tanstack/react-query'
import { addAccessTokenEndpoint } from '../../plugin'

type UseTokenType = {
  endpoint: string
  queryClient: QueryClient
  setToken: React.Dispatch<React.SetStateAction<string>>
}

const useToken = ({ endpoint, queryClient, setToken }: UseTokenType) => {
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

  return { addAccessToken }
}

export default useToken
