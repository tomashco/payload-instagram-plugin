import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

const InstagramPost: React.FC = async () => {
  const payload = await getPayload({ config: configPromise })
  const url = payload.getAdminURL()
  return <>
  <hr style={{backgroundColor: 'black', height: '1px', padding: 0}}/>
  <h1>Instagram Post!</h1>
  <div>The admin panel is running at: {url}</div>
  <hr style={{backgroundColor: 'black', height: '1px', padding: 0}}/>
  </>
}

export default InstagramPost
