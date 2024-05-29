import type { Config, Plugin } from 'payload/config'

import { onInitExtension } from './onInitExtension'
import type { PluginTypes } from './types'
import AfterDashboard from './components/AfterDashboard'
import newCollection from './newCollection'
import axios from 'axios'

type PluginType = (pluginOptions: PluginTypes) => Plugin

export const samplePlugin =
  (pluginOptions: PluginTypes): Plugin =>
  incomingConfig => {
    let config = { ...incomingConfig }

    config.admin = {
      ...(config.admin || {}),

      // Add additional admin config here

      components: {
        ...(config.admin?.components || {}),
        // Add additional admin components here
        afterDashboard: [...(config.admin?.components?.afterDashboard || []), AfterDashboard],
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
      newCollection, // delete this line to remove the example collection
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
