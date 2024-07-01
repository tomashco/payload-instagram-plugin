import type { Page } from '@playwright/test'

import { expect, test } from '@playwright/test'
import * as path from 'path'
import { fileURLToPath } from 'url'

import { getAdminRoutes, initPageConsoleErrorCatch } from '../utils/helpers.js'
import { AdminUrlUtil } from '../utils/helpers/adminUrlUtil.js'
import { initPayloadE2ENoConfig } from '../utils/helpers/initPayloadE2ENoConfig.js'
import { TEST_TIMEOUT_LONG } from '../playwright.config.js'
import { wait } from 'payload/utilities'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

test.describe('Admin Panel instagram posts', () => {
  let page: Page
  let url: AdminUrlUtil
  let serverUrl: string
  let adminRoute: string

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(TEST_TIMEOUT_LONG)

    const { payload: _payload, serverURL } = await initPayloadE2ENoConfig({ dirname })
    url = new AdminUrlUtil(serverURL, 'instagram-posts')
    serverUrl = serverURL

    const context = await browser.newContext()
    page = await context.newPage()

    initPageConsoleErrorCatch(page)

    const {
      routes: { admin },
    } = getAdminRoutes({})
    adminRoute = admin

    await page.goto(`${serverUrl}${adminRoute}/login`)

    await page.waitForURL(`${serverUrl}${adminRoute}`)
  })

  test('Check that Instagram Posts Custom View exist', async () => {
    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Status: Instagram Post successfully created.')

      await dialog.accept()
    })

    await page.goto(`${serverUrl}${adminRoute}/instagram-posts-view`)

    await page.click('#instagramCard-0 > div:nth-child(1) > button:nth-child(1)')
  })
})
