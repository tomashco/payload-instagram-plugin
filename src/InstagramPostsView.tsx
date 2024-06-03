'use server'
import React from 'react'

import { DefaultTemplate } from '@payloadcms/ui/templates/Default'
// import { RootPage, generatePageMetadata } from '@payloadcms/next/views'
import { AdminViewComponent } from 'payload/types'
import InstagramPostsClient from './components/InstagramPostsClient'

const CustomDefaultView: AdminViewComponent = ({ initPageResult, params, searchParams }) => {
  return (
    <DefaultTemplate
      payload={initPageResult.req.payload}
      config={initPageResult.req.payload.config}
      i18n={initPageResult.req.i18n}
      visibleEntities={initPageResult.visibleEntities}
    >
      <InstagramPostsClient />
    </DefaultTemplate>
  )
}

export default CustomDefaultView
