import * as Application from 'koa'
import { Config, mergeDefault } from './config'
import { promMw } from './mw'
import { createMetricsHandler, setupDefaultMetrics } from './prom'

export const setupProm = (app: Application, config?: Config) => {
  const c = mergeDefault(config)

  app.use(promMw(c))

  const handler = createMetricsHandler()

  app.use(async (ctx, next) => {
    if (ctx.path !== c.metricsPath) {
      await next()
      return
    }
    await handler(ctx)
  })

  if (c.collectDefaultMetrics) {
    return setupDefaultMetrics()
  }
}
