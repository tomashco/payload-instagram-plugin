import React from 'react'

import type { AdminViewServerProps } from 'payload'

import { DefaultTemplate } from '@payloadcms/next/templates'
import InstagramPostsClient from '../../components/InstagramPostsClient'

const CustomDefaultView: React.FC<AdminViewServerProps> = ({ initPageResult }) => {
  return (
    <DefaultTemplate
      i18n={initPageResult.req.i18n}
      payload={initPageResult.req.payload}
      visibleEntities={initPageResult.visibleEntities}
    >
      <InstagramPostsClient />
    </DefaultTemplate>
  )
}

export default CustomDefaultView
