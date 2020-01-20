import * as Koa from 'koa'
import * as supertest from 'supertest'
import { register } from 'prom-client'
import { setUpProm, Config } from '../src'

// https://github.com/visionmedia/supertest/issues/520
afterAll((done: any) => setImmediate(done))

const setupRoute = (app: Koa, route: string) => {
  app.use(async (ctx, next) => {
    if (ctx.path !== route) {
      await next()
      return
    }

    ctx.body = {
      code: ctx.query.code || 0,
      data: 'test'
    }
  })
}

const createApp = (cfg?: Config) => {
  const app = new Koa()
  setUpProm(app, cfg)

  setupRoute(app, '/')
  setupRoute(app, '/test')

  return app
}

const clear = () => register.clear()

const createRequest = (app: ReturnType<typeof createApp>) => {
  const server = app.listen()
  return {
    request: supertest(server),
    server
  }
}

it('default config should work well', async () => {
  const app = createApp()
  const { request, server } = createRequest(app)

  const res = await request.get('/metrics')
  expect(res.status).toBe(200)
  // test collect default metrics
  expect(res.text).toMatch(/process_cpu_user_seconds_total/)
  server.close()
  clear()
})

it('custom config should work well', async () => {
  const config: Config = {
    metricsPath: '/customMetrics',
    collectDefaultMetrics: false,
    defaultLabels: {
      app: 'test'
    }
  }

  const app = createApp(config)
  const { request, server } = createRequest(app)

  await request.get('/')
  await request.get('/test')

  const res = await request.get('/customMetrics')

  expect(res.status).toBe(200)
  expect(res.text).not.toMatch(/process_cpu_user_seconds_total/)
  expect(res.text).toMatch(/TYPE http_request_duration_ms summary/)
  expect(res.text).toMatch(/app="test"/)

  server.close()
  clear()
})
