import { Context } from 'koa'

export type Status = '2xx' | '3xx' | '4xx' | '5xx'

export type RouteNormalizer = (route: string) => string
export type StatusNormalizer = <T extends Context = Context>(ctx: T) => Status

export interface Config {
  metricsPath?: string
  collectDefaultMetrics?: boolean
  defaultLabels?: Record<string, string>
  statusNormalizer?: StatusNormalizer
  requestDurationUseHistogram?: boolean
}

export const defaultStatusNormalizer: StatusNormalizer = ctx => {
  const status = ctx.status

  if (status >= 200 && status < 300) {
    return '2xx'
  }

  if (status >= 300 && status < 400) {
    return '3xx'
  }

  if (status >= 400 && status < 500) {
    return '4xx'
  }

  return '5xx'
}

export const defaultConfig: Config = {
  metricsPath: '/metrics',
  collectDefaultMetrics: true,
  statusNormalizer: defaultStatusNormalizer,
  requestDurationUseHistogram: true
}

export const mergeDefault = (c?: Config): Config => {
  return {
    ...defaultConfig,
    ...c
  }
}
