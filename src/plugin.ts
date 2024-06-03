import type { Plugin } from 'payload/config'

import { onInitExtension } from './onInitExtension'
import type { PluginTypes } from './types'
import InstagramPosts from './InstagramPosts'
import { AfterNavLinks } from './components/AfterNavLinks'
import axios from 'axios'
import InstagramPostsView from './InstagramPostsView'

export const instagramPlugin =
  (pluginOptions: PluginTypes): Plugin =>
  incomingConfig => {
    let config = { ...incomingConfig }

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

    // If the plugin is disabled, return the config without modifying it
    // The order of this check is important, we still want any webpack extensions to be applied even if the plugin is disabled
    if (pluginOptions.enabled === false) {
      return config
    }

    config.collections = [
      ...(config.collections || []),
      // Add additional collections here
      InstagramPosts, // delete this line to remove the example collection
    ]

    config.endpoints = [
      ...(config.endpoints || []),
      {
        path: '/instagram/list',
        method: 'get',
        handler: async req => {
          if (req.user) {
            const { before, after } = req.query
            const endpoint = `https://graph.instagram.com/me/media?fields=id,media_url,permalink,media_type,caption&access_token=${
              process.env.INSTAGRAM_ACCESS_TOKEN
            }&limit=6${before ? `&before=${before}` : ''}${after ? `&after=${after}` : ''}`

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
          } else {
            return new Response(JSON.stringify({ message: 'You are not logged in' }), {
              status: 401,
            })
          }
        },
      },
      {
        path: '/instagram/children',
        method: 'get',
        handler: async req => {
          const { media_id } = req.query
          if (req.user) {
            const { before, after } = req.query
            const endpoint = `https://graph.instagram.com/${media_id}/children?fields=id,media_type,media_url,timestamp&access_token=${
              process.env.INSTAGRAM_ACCESS_TOKEN
            }&limit=6${before ? `&before=${before}` : ''}${after ? `&after=${after}` : ''}`

            const response = await axios.get(endpoint).then(res => res.data)
            return new Response(JSON.stringify(response.data), {
              status: 200,
            })
          } else {
            return new Response(JSON.stringify({ message: 'You are not logged in' }), {
              status: 401,
            })
          }
        },
      },
      // Add additional endpoints here
    ]

    config.globals = [
      ...(config.globals || []),
      // Add additional globals here
    ]

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
