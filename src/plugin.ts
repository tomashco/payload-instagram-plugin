import type { Plugin } from 'payload/config'

import { onInitExtension } from './onInitExtension'
import type { PluginTypes } from './types'
import InstagramPosts from './InstagramPosts'
import { AfterNavLinks } from './components/AfterNavLinks'
import InstagramPostsView from './InstagramPostsView'
import { GlobalConfig } from 'payload/types'

export const baseEndpoint = '/api/instagram/list'
export const addAccessTokenEndpoint = '/api/apikeys'
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
        read: async ({ req }) => {
          try {
            // if updatedAt is more than 10 days old, refresh the token
            const { updatedAt, refreshToken } = await req.payload.findGlobal({
              slug: 'apikeys',
              overrideAccess: true,
              showHiddenFields: true,
            })

            const currentDate = new Date()
            const updatedAtDate = new Date(updatedAt as unknown as string)

            if (currentDate.getTime() - 10 * 24 * 60 * 60 * 1000 < updatedAtDate.getTime()) {
              return false
            }

            const { access_token } = await fetch(
              `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${refreshToken}`,
            ).then(res => res.json())

            req.context.bypass = true

            req.payload.updateGlobal({
              slug: 'apikeys',
              data: {
                refreshToken: access_token || '',
              },
              context: {
                bypass: true,
              },
            })
            req.payload.logger.warn('token updated succesfully')
          } catch (error) {
            req.payload.logger.error('Error refreshing token', error)
          } finally {
            return false
          }
        },
        update: ({ req }) => !req.user && !req.context.bypass,
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
      ],
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
        path: '/apikeys',
        method: 'post',
        handler: async req => {
          try {
            const body = req.json ? await req.json() : {}
            const { accessToken } = body

            const test = await fetch(
              `https://graph.instagram.com/me/media?fields=id,media_url,permalink,media_type,caption&access_token=${accessToken}&limit=6`,
            )
            if (!test.ok) {
              return new Response(JSON.stringify({ message: 'Invalid token' }), {
                status: 403,
              })
            }

            await req.payload.updateGlobal({
              slug: 'apikeys',
              data: {
                refreshToken: accessToken,
              },
            })
            return new Response(
              JSON.stringify({
                accessToken,
              }),
              {
                status: 200,
              },
            )
          } catch (error) {
            return new Response(JSON.stringify({ message: 'Error refreshing token' }), {
              status: 500,
            })
          }
        },
      },
      {
        path: '/instagram/list',
        method: 'get',
        handler: async req => {
          const { before, after } = req.query
          const { refreshToken } = (await req.payload.findGlobal({
            slug: 'apikeys',
            overrideAccess: true,
            showHiddenFields: true,
          })) as unknown as { refreshToken: string }

          if (!req.user) {
            return new Response(JSON.stringify({ message: 'You are not logged in' }), {
              status: 401,
            })
          } else {
            if (!refreshToken) {
              return new Response(JSON.stringify({ message: 'No token provided' }), {
                status: 403,
              })
            } else {
              const endpoint = `https://graph.instagram.com/me/media?fields=id,media_url,permalink,media_type,caption&access_token=${refreshToken}&limit=6${
                before ? `&before=${before}` : ''
              }${after ? `&after=${after}` : ''}`

              const response = await fetch(endpoint).then(res => res.json())

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
          const { refreshToken } = (await req.payload.findGlobal({
            slug: 'apikeys',
            overrideAccess: true,
            showHiddenFields: true,
          })) as unknown as { refreshToken: string }

          const endpoint = `https://graph.instagram.com/${media_id}?fields=id,media_type,media_url,timestamp&access_token=${refreshToken}`

          const response = await fetch(endpoint).then(res => res.json())

          return new Response(JSON.stringify(response), {
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
          const { refreshToken } = (await req.payload.findGlobal({
            slug: 'apikeys',
            overrideAccess: true,
            showHiddenFields: true,
          })) as unknown as { refreshToken: string } // if (!req.user) {

          const endpoint = `https://graph.instagram.com/${media_id}/children?fields=id,media_type,media_url,timestamp&access_token=${refreshToken}&limit=6${
            before ? `&before=${before}` : ''
          }${after ? `&after=${after}` : ''}`

          const response = await fetch(endpoint).then(res => res.json())
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
