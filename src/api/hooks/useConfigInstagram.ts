import { QueryClient, useMutation } from '@tanstack/react-query'
import { addAppIdEndpoint } from '../../plugin'
import { useRouter } from 'next/navigation'

type useConfigInstagramType = {
  appId: string
  setAppId: React.Dispatch<React.SetStateAction<string>>
  setAppSecret: React.Dispatch<React.SetStateAction<string>>
}

const useConfigInstagram = ({ appId, setAppId, setAppSecret }: useConfigInstagramType) => {
  const router = useRouter()
  const { mutate: addAppId } = useMutation({
    mutationFn: (body: { appId: string; appSecret: string }) =>
      fetch(addAppIdEndpoint, {
        body: JSON.stringify({
          ...body,
          redirectUri: `${window.location.origin}/api/instagram/authorize`,
        }),
        method: 'POST',
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error(res.status.toString())
        return res.json()
      }),
    onSuccess: _res => {
      const redirectUri = `${window.location.origin}/api/instagram/authorize`
      const authorizeEndpoint = `https://api.instagram.com/oauth/authorize?client_id=${appId}&redirect_uri=${redirectUri}&scope=instagram_business_basic&response_type=code`
      router.push(authorizeEndpoint)
      setAppId('')
      setAppSecret('')
    },
    onError: _res => {
      alert('Status: the configuration provided is not correct, try again')
      setAppId('')
      setAppSecret('')
    },
  })

  return { addAppId }
}

export default useConfigInstagram


