'use client'

import type {PayloadClientReactComponent, SanitizedConfig} from 'payload'

import {useConfig} from '@payloadcms/ui'
import Link from 'next/link.js'

import React from 'react'

const baseClass = 'after-nav-links'

export const AfterNavLinks: PayloadClientReactComponent<SanitizedConfig['admin']['components']['afterNavLinks'][0]> = () => {
  const {
    config: {
      routes: {admin: adminRoute},
    }
  } = useConfig()

  return (
    <div
      className={baseClass}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'calc(var(--base) / 4)',
      }}
    >
      <h4 className="nav__link" style={{margin: 0}}>
        <Link href={`${adminRoute}/instagram-posts-view`} style={{textDecoration: 'none'}}>
          Instagram Posts
        </Link>
      </h4>
    </div>
  )
}
