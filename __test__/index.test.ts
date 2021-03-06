import * as Koa from 'koa'
import * as Router from 'koa-router'
import * as supertest from 'supertest'
import { register } from 'prom-client'
import { setupProm, Config, defaultStatusNormalizer } from '../src'

// https://github.com/visionmedia/supertest/issues/520
afterAll((done: any) => setImmediate(done))

const sleep = (n: number) => new Promise((r) => setTimeout(r, n))

const createApp = (cfg?: Config) => {
  const app = new Koa()
  setupProm(app, cfg)

  const r = new Router()

  r.get('/', (ctx) => {
    ctx.status = (ctx.query.status && parseInt(ctx.query.status)) || 200
    ctx.body = {
      code: ctx.query.code || 0,
      data: 'test',
    }
  })

  r.get('/test', (ctx) => {
    ctx.status = (ctx.query.status && parseInt(ctx.query.status)) || 200
    ctx.body = {
      code: ctx.query.code || 0,
      data: 'test',
    }
  })

  app.use(r.routes())
  app.use(r.allowedMethods())

  return app
}

const clear = () => register.clear()

const createRequest = (app: ReturnType<typeof createApp>) => {
  const server = app.listen()
  return {
    request: supertest(server),
    server,
  }
}

it('default config should work well', async () => {
  const app = createApp()
  const { request, server } = createRequest(app)

  await request.get('/')
  await request.get('/?status=300')
  await request.get('/?status=400')

  // await sleep(4000)

  const res = await request.get('/metrics')
  expect(res.status).toBe(200)
  // test collect default metrics
  expect(res.text).toMatch(/process_cpu_user_seconds_total/)
  expect(res.text).toMatch(/TYPE http_request_duration_ms histogram/)
  expect(res.text).toMatch(/normalizedStatus="2xx"/)
  expect(res.text).toMatch(/normalizedStatus="3xx"/)
  expect(res.text).toMatch(/normalizedStatus="4xx"/)
  server.close()
  clear()
})

it('custom config should work well', async () => {
  const config: Config = {
    metricsPath: '/customMetrics',
    collectDefaultMetrics: false,
    requestDurationUseHistogram: false,
    defaultLabels: {
      app: 'test',
    },
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

it('statusNormalizer should work well', async () => {
  const config: Config = {
    statusNormalizer: (ctx) => {
      if (
        ctx.status === 200 &&
        typeof ctx.body === 'object' &&
        ctx.body.hasOwnProperty('code')
      ) {
        return ctx.body.code === 0 ? '2xx' : '4xx'
      }
      return defaultStatusNormalizer(ctx)
    },
  }

  const app = createApp(config)
  const { request, server } = createRequest(app)

  await request.get('/?code=1')
  const res = await request.get('/metrics')
  expect(res.text).toMatch(/normalizedStatus="4xx"/)
  expect(res.text).not.toMatch(/normalizedStatus="2xx"/)
  server.close()

  await request.get('/test?status=500')
  const res1 = await request.get('/metrics')
  expect(res1.text).toMatch(/normalizedStatus="5xx"/)

  server.close()
  clear()
})
