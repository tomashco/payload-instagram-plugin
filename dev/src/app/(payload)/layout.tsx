/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import React from 'react'
import configPromise from '@payload-config'
import { RootLayout, handleServerFunctions } from '@payloadcms/next/layouts'

import { importMap } from './admin/importMap.js'

import '@payloadcms/next/css'
import './custom.scss'

type Args = {
  children: React.ReactNode
}

const serverFunction = handleServerFunctions({
  config: configPromise,
  importMap,
})

const Layout = ({ children }: Args) => (
  <RootLayout config={configPromise} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
