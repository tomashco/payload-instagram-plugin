import type { Plugin } from 'payload/config'

import { onInitExtension } from './onInitExtension'
import type { PluginTypes } from './types'
import InstagramPosts from './InstagramPosts'
import { AfterNavLinks } from './components/AfterNavLinks'
import axios from 'axios'
import InstagramPostsView from './InstagramPostsView'
import { GlobalConfig, PayloadRequest } from 'payload/types'

export const baseEndpoint = '/api/instagram/list'
export const addAccessTokenEndpoint = '/api/instagram/token'
export const childrenEndpoint = '/api/instagram/children'
export const mediaEndpoint = '/api/instagram/media'
export const instagramCollectionEndpoint = '/api/instagram-posts'

export const instagramPlugin =
  (pluginOptions: PluginTypes): Plugin =>
  incomingConfig => {
    const ApiKeys: GlobalConfig = {
      slug: 'apikeys',
      admin: {
        hidden: true,
        hideAPIURL: true,
      },
      access: {
        read: () => false,
        update: () => false,
      },
      fields: [
        {
          type: 'text',
          name: 'refreshToken',
          hidden: true,
          access: {
            read: () => false,
            update: () => false,
          },
        },
        {
          type: 'date',
          name: 'expirationDate',
          hidden: true,
          access: {
            read: () => false,
            update: () => false,
          },
        },
      ],
    }

    const getToken = async (
      req: PayloadRequest,
    ): Promise<{ accessToken: string; expirationDate: Date }> => {
      const globalToken = (await req.payload.findGlobal({
        slug: 'apikeys',
        overrideAccess: true,
        showHiddenFields: true,
      })) as unknown as { refreshToken: string; expirationDate: Date }

      const currentDate = new Date()
      if (
        globalToken?.expirationDate &&
        new Date(globalToken?.expirationDate).getTime() - 10 * 24 * 60 * 60 * 1000 <
          currentDate.getTime()
      ) {
        const refreshResponse = await refreshAccessToken(req, globalToken?.refreshToken)
        if (refreshResponse) {
          return {
            accessToken: refreshResponse.accessToken,
            expirationDate: refreshResponse.expirationDate,
          }
        }
      }

      return {
        accessToken: globalToken?.refreshToken,
        expirationDate: globalToken?.expirationDate,
      }
    }

    const refreshAccessToken = async (
      req: PayloadRequest,
      accessToken: string,
    ): Promise<{ accessToken: string; expirationDate: Date } | null> => {
      try {
        const response = await axios
          .get(
            `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${accessToken}`,
          )
          .then(res => res.data)

        const { access_token, expires_in } = response

        const currentDate = new Date()

        // Calculate the new date and time after the expiration period
        const expirationDate = new Date(currentDate.getTime() + expires_in * 1000)

        await req.payload.updateGlobal({
          slug: 'apikeys',
          data: {
            refreshToken: access_token || '',
            expirationDate,
          },
        })
        return { expirationDate, accessToken: access_token }
      } catch (error) {
        return null
      }
    }

    let config = { ...incomingConfig }

    // If the plugin is disabled, return the config without modifying it
    // The order of this check is important, we still want any webpack extensions to be applied even if the plugin is disabled
    if (pluginOptions.enabled === false) {
      return config
    }

    config.admin = {
      ...(config.admin || {}),
      components: {
        afterNavLinks: [AfterNavLinks],
        views: {
          instagramPosts: {
            Component: InstagramPostsView,
            path: '/instagram-posts-view',
          },
        },
        ...(config.admin?.components || {}),
      },
    }

    config.collections = [
      ...(config.collections || []),
      // Add additional collections here
      InstagramPosts, // delete this line to remove the example collection
    ]

    config.endpoints = [
      ...(config.endpoints || []),
      {
        path: '/instagram/token',
        method: 'post',
        handler: async req => {
          const body = req.json ? await req.json() : {}
          const { accessToken } = body

          const expirationDate = await refreshAccessToken(req, accessToken)

          if (!expirationDate)
            return new Response(JSON.stringify({ message: 'Error refreshing token' }), {
              status: 500,
            })

          return new Response(
            JSON.stringify({
              expirationDate,
            }),
            {
              status: 200,
            },
          )
        },
      },
      // {
      //   path: '/instagram/token',
      //   method: 'get',
      //   handler: async req => {
      //     // if (req.user) {
      //     const { accessToken, expirationDate: previousExpirationDay } = await getToken(req)

      //     const currentDate = new Date()

      //     // if previousExpirationDay - 10 days is less than the current date, then the token is expired
      //     if (
      //       previousExpirationDay &&
      //       new Date(previousExpirationDay).getTime() - 10 * 24 * 60 * 60 * 1000 <
      //         currentDate.getTime()
      //     ) {
      //       const expirationDate = refreshAccessToken(req, accessToken)

      //       return new Response(
      //         JSON.stringify({
      //           expirationDate,
      //         }),
      //         {
      //           status: 200,
      //         },
      //       )
      //     } else {
      //       // no need to refresh the token
      //       return new Response(
      //         JSON.stringify({
      //           expirationDate: previousExpirationDay,
      //         }),
      //         {
      //           status: 200,
      //         },
      //       )
      //     }
      //   },
      // },
      {
        path: '/instagram/list',
        method: 'get',
        handler: async req => {
          const { before, after } = req.query
          const { accessToken } = await getToken(req)
          if (!req.user) {
            return new Response(JSON.stringify({ message: 'You are not logged in' }), {
              status: 401,
            })
          } else {
            if (!accessToken) {
              return new Response(JSON.stringify({ message: 'No token provided' }), {
                status: 403,
              })
            } else {
              const endpoint = `https://graph.instagram.com/me/media?fields=id,media_url,permalink,media_type,caption&access_token=${accessToken}&limit=6${
                before ? `&before=${before}` : ''
              }${after ? `&after=${after}` : ''}`

              const response = await axios.get(endpoint).then(res => res.data)
              return new Response(
                JSON.stringify({
                  data: response.data,
                  paging: {
                    before: response?.paging?.cursors?.before,
                    after: response?.paging?.cursors?.after,
                  },
                }),
                {
                  status: 200,
                },
              )
            }
          }
        },
      },
      {
        path: '/instagram/media',
        method: 'get',
        handler: async req => {
          const { media_id } = req.query
          const { accessToken } = await getToken(req)
          // if (!req.user) {
          //   return new Response(JSON.stringify({ message: 'You are not logged in' }), {
          //     status: 401,
          //   })
          // } else {
          const endpoint = `https://graph.instagram.com/${media_id}?fields=id,media_type,media_url,timestamp&access_token=${accessToken}`

          const response = await axios.get(endpoint)

          return new Response(JSON.stringify(response.data), {
            status: 200,
          })
          // }
        },
      },
      {
        path: '/instagram/children',
        method: 'get',
        handler: async req => {
          const { before, after, media_id } = req.query
          const { accessToken } = await getToken(req)
          // if (!req.user) {
          //   return new Response(JSON.stringify({ message: 'You are not logged in' }), {
          //     status: 401,
          //   })
          // } else {
          const endpoint = `https://graph.instagram.com/${media_id}/children?fields=id,media_type,media_url,timestamp&access_token=${accessToken}&limit=6${
            before ? `&before=${before}` : ''
          }${after ? `&after=${after}` : ''}`

          const response = await axios.get(endpoint).then(res => res.data)
          return new Response(JSON.stringify(response.data), {
            status: 200,
          })
          // }
        },
      },
    ]

    config.globals = [...(config.globals || []), ApiKeys]

    config.hooks = {
      ...(config.hooks || {}),
      // Add additional hooks here
    }

    config.onInit = async payload => {
      if (incomingConfig.onInit) await incomingConfig.onInit(payload)
      // Add additional onInit code by using the onInitExtension function
      onInitExtension(pluginOptions, payload)
    }

    return config
  }
