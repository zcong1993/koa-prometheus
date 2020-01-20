import { Counter, Summary, register, collectDefaultMetrics } from 'prom-client'

export const createHttpRequestCounter = () => {
  return new Counter({
    name: 'http_requests_total',
    help: 'Counter for total requests received',
    labelNames: ['route', 'method', 'status', 'normalizedStatus']
  })
}

export const createRequestDuration = () => {
  return new Summary({
    name: `http_request_duration_ms`,
    help: 'Duration of HTTP requests in ms',
    labelNames: ['route', 'method', 'status', 'normalizedStatus']
  })
}

export const createMetricsHandler: () => (ctx: any) => Promise<void> = () => {
  return async (ctx: any) => {
    ctx.set('Content-Type', register.contentType)
    ctx.body = register.metrics()
  }
}

export const setupDefaultMetrics = (): ReturnType<typeof setInterval> => {
  return collectDefaultMetrics()
}
