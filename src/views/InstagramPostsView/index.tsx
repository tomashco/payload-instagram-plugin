'use server'
import React from 'react'

import {DefaultTemplate} from '@payloadcms/next/templates'
import InstagramPostsClient from '../../components/InstagramPostsClient'
import {AdminViewComponent, PayloadServerReactComponent} from 'payload'

const CustomDefaultView: PayloadServerReactComponent<AdminViewComponent> = ({initPageResult, params, searchParams}) => {
  return (
    <DefaultTemplate
      payload={initPageResult.req.payload}
      config={initPageResult.req.payload.config}
      i18n={initPageResult.req.i18n}
      visibleEntities={initPageResult.visibleEntities}
    >
      <InstagramPostsClient/>
    </DefaultTemplate>
  )
}

export default CustomDefaultView
