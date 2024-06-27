import { buildConfig } from 'payload/config'
import path from 'path'
import Users from './collections/Users'
import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { instagramPlugin } from '../../src/index'
import { devUser } from '../../test/utils/credentials'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

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
    url: process.env.DATABASE_URI || '',
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
  },
})
