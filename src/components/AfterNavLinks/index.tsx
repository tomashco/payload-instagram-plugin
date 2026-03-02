'use client'

import { useConfig } from '@payloadcms/ui'
import Link from 'next/link.js'

import React from 'react'

const baseClass = 'after-nav-links'

export const AfterNavLinks: React.FC = () => {
  const { config } = useConfig()
  const adminRoute = config.routes.admin

  return (
    <div
      className={baseClass}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'calc(var(--base) / 4)',
      }}
    >
      <h4 className="nav__link" style={{ margin: 0 }}>
        <Link href={`${adminRoute}/instagram-posts-view`} style={{ textDecoration: 'none' }}>
          Instagram Posts
        </Link>
      </h4>
    </div>
  )
}
