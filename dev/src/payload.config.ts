import path from 'path'
import Users from './collections/Users'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { instagramPlugin } from '../../src'
import { devUser } from '../../test/utils/credentials'
import sharp from 'sharp'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET || '',
  admin: {
    autoLogin: {
      email: devUser.email,
      password: devUser.password,
    },
    user: Users.slug,
  },
  editor: lexicalEditor({}),
  collections: [Users],
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  plugins: [instagramPlugin({ enabled: true })],
  db: mongooseAdapter({
    url: 'mongodb://127.0.0.1/payloadtests',
  }),
  sharp,
  onInit: async payload => {
    await payload.create({
      collection: 'users',
      data: {
        email: devUser.email,
        password: devUser.password,
      },
    })
    if (process.env.USE_ACCESS_TOKEN)
      await payload.updateGlobal({
        slug: 'apikeys',
        data: {
          refreshToken: process.env.USE_ACCESS_TOKEN,
          updatedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        context: {
          bypass: true,
        },
      })
  },
})
