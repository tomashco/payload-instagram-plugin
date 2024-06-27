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

test.describe('Admin Panel', () => {
  let page: Page
  let url: AdminUrlUtil

  test.beforeAll(async ({ browser }, testInfo) => {
    testInfo.setTimeout(TEST_TIMEOUT_LONG)

    const { payload: _payload, serverURL } = await initPayloadE2ENoConfig({ dirname })
    url = new AdminUrlUtil(serverURL, 'instagram-posts')

    const context = await browser.newContext()
    page = await context.newPage()

    initPageConsoleErrorCatch(page)

    const {
      routes: { admin: adminRoute },
    } = getAdminRoutes({})

    await page.goto(`${serverURL}${adminRoute}/login`)

    await page.waitForURL(`${serverURL}${adminRoute}`)
  })

  test('Check that Instagram Posts Custom View exist', async () => {
    await page.goto('http://localhost:3000/admin/instagram-posts-view')

    page.on('dialog', async dialog => {
      expect(dialog.message()).toContain('Status: the token provided is not correct, try again')

      await dialog.accept()
    })

    await page.fill('#field-token', 'pippo')
    await page.click('#form-token')

    await wait(500)
  })
})
