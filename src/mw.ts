import { register } from 'prom-client'
import { hrtime, nano2ms } from './util'
import { Config } from './config'
import { createHttpRequestCounter, createRequestDuration } from './prom'

export const promMw = (c: Config) => {
  if (c.defaultLabels) {
    register.setDefaultLabels(c.defaultLabels)
  }

  const requestCounter = createHttpRequestCounter()
  const requestDurationSummary = createRequestDuration(
    c.requestDurationUseHistogram
  )

  return async (ctx: any, next: any) => {
    if (ctx.path === c.metricsPath) {
      await next()
      return
    }
    ctx.startTime = hrtime()
    try {
      await next()
    } finally {
      const dur = nano2ms(hrtime() - ctx.startTime)

      const { method, status, _matchedRoute } = ctx
      const route = _matchedRoute || '__no_matched'

      const labels: Record<string, string> = {
        route,
        method,
        status,
        normalizedStatus: c.statusNormalizer(ctx)
      }

      requestCounter.inc(labels, 1)
      requestDurationSummary.observe(labels, dur)
    }
  }
}
