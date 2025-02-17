import type { Page } from '@playwright/test'

import { expect } from '@playwright/test'

import { devUser } from './credentials.js'
import { POLL_TOPASS_TIMEOUT } from '../playwright.config.js'
import { Config, defaults } from 'payload'
import { wait } from 'payload/utilities'

type FirstRegisterArgs = {
  customAdminRoutes?: Config['admin']['routes']
  customRoutes?: Config['routes']
  page: Page
  serverURL: string
}

type LoginArgs = {
  customAdminRoutes?: Config['admin']['routes']
  customRoutes?: Config['routes']
  data?: {
    email: string
    password: string
  }
  page: Page
  serverURL: string
}

export async function firstRegister(args: FirstRegisterArgs): Promise<void> {
  const { page, serverURL, customAdminRoutes, customRoutes } = args

  const {
    routes: { admin: adminRoute },
  } = getAdminRoutes({ customAdminRoutes, customRoutes })

  await page.goto(`${serverURL}${adminRoute}`)
  await page.fill('#field-email', devUser.email)
  await page.fill('#field-password', devUser.password)
  await page.fill('#field-confirm-password', devUser.password)
  await wait(500)
  await page.click('[type=submit]')
  await page.waitForURL(`${serverURL}${adminRoute}`)
}

export async function login(args: LoginArgs): Promise<void> {
  const { page, serverURL, data = devUser, customAdminRoutes, customRoutes } = args

  const {
    admin: {
      routes: { login: loginRoute, createFirstUser: createFirstUserRoute },
    },
    routes: { admin: adminRoute },
  } = getAdminRoutes({ customAdminRoutes, customRoutes })

  await page.goto(`${serverURL}${adminRoute}${loginRoute}`)
  await page.waitForURL(`${serverURL}${adminRoute}${loginRoute}`)
  await wait(500)
  await page.fill('#field-email', data.email)
  await page.fill('#field-password', data.password)
  await wait(500)
  await page.click('[type=submit]')
  await page.waitForURL(`${serverURL}${adminRoute}`)

  await expect(() => expect(page.url()).not.toContain(`${adminRoute}${loginRoute}`)).toPass({
    timeout: POLL_TOPASS_TIMEOUT,
  })

  await expect(() =>
    expect(page.url()).not.toContain(`${adminRoute}${createFirstUserRoute}`),
  ).toPass({
    timeout: POLL_TOPASS_TIMEOUT,
  })
}

export async function openNav(page: Page): Promise<void> {
  // check to see if the nav is already open and if not, open it
  // use the `--nav-open` modifier class to check if the nav is open
  // this will prevent clicking nav links that are bleeding off the screen
  if (await page.locator('.template-default.template-default--nav-open').isVisible()) return
  // playwright: get first element with .nav-toggler which is VISIBLE (not hidden), could be 2 elements with .nav-toggler on mobile and desktop but only one is visible
  await page.locator('.nav-toggler >> visible=true').click()
  await expect(page.locator('.template-default.template-default--nav-open')).toBeVisible()
}

/**
 * Throws an error when browser console error messages (with some exceptions) are thrown, thus resulting
 * in the e2e test failing.
 *
 * Useful to prevent the e2e test from passing when, for example, there are react missing key prop errors
 * @param page
 */
export function initPageConsoleErrorCatch(page: Page) {
  page.on('console', msg => {
    if (
      msg.type() === 'error' &&
      // Playwright is seemingly loading CJS files from React Select, but Next loads ESM.
      // This leads to classnames not matching. Ignore these God-awful errors
      // https://github.com/JedWatson/react-select/issues/3590
      !msg.text().includes('did not match. Server:') &&
      !msg.text().includes('the server responded with a status of') &&
      !msg.text().includes('Failed to fetch RSC payload for')
    ) {
      // "Failed to fetch RSC payload for" happens seemingly randomly. There are lots of issues in the next.js repository for this. Causes e2e tests to fail and flake. Will ignore for now
      // the the server responded with a status of error happens frequently. Will ignore it for now.
      // Most importantly, this should catch react errors.
      throw new Error(`Browser console error: ${msg.text()}`)
    }
  })
}

type AdminRoutes = Config['admin']['routes']

export function getAdminRoutes({
  customRoutes,
  customAdminRoutes,
}: {
  customAdminRoutes?: AdminRoutes
  customRoutes?: Config['routes']
}): {
  admin: {
    routes: AdminRoutes
  }
  routes: Config['routes']
} {
  let routes = defaults.routes
  let adminRoutes = defaults.admin.routes

  if (customAdminRoutes) {
    adminRoutes = {
      ...adminRoutes,
      ...customAdminRoutes,
    }
  }

  if (customRoutes) {
    routes = {
      ...routes,
      ...customRoutes,
    }
  }

  return {
    admin: {
      routes: adminRoutes,
    },
    routes,
  }
}
