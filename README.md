# koa-prometheus

[![NPM version](https://img.shields.io/npm/v/@zcong/koa-prometheus.svg?style=flat)](https://npmjs.com/package/@zcong/koa-prometheus) [![NPM downloads](https://img.shields.io/npm/dm/@zcong/koa-prometheus.svg?style=flat)](https://npmjs.com/package/@zcong/koa-prometheus) [![CircleCI](https://circleci.com/gh/zcong1993/koa-prometheus/tree/master.svg?style=shield)](https://circleci.com/gh/zcong1993/koa-prometheus/tree/master) [![codecov](https://codecov.io/gh/zcong1993/koa-prometheus/branch/master/graph/badge.svg)](https://codecov.io/gh/zcong1993/koa-prometheus)

> koa prometheus middleware

## Install

```sh
$ yarn add @zcong/koa-prometheus
# npm
$ npm i @zcong/koa-prometheus --save
```

## Usage

```ts
import * as Koa from 'koa'
import { setupProm } from '@zcong/koa-prometheus'

const app = new Koa()

setupProm(app) // use default config
```

default metrics route is `/metrics`.

### Config

use custom config

```ts
setupProm(app, {
  // custom config here
})
```

| name                        | description                                 | default                                                                                | example          |
| --------------------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------- |
| metricsPath                 | export metrics route                        | /metrics                                                                               | /custom/route    |
| collectDefaultMetrics       | if collect default metrics                  | true                                                                                   | false            |
| defaultLabels               | global labels                               | {}                                                                                     | { app: 'myApp' } |
| statusNormalizer            | func for normalizing status code            | [config.ts](https://github.com/zcong1993/koa-prometheus/blob/master/src/config.ts#L16) |                  |
| requestDurationUseHistogram | if requestDuration use Histogram or Summary | true                                                                                   | false            |

## Prometheus query examples

### QPS over the last 5m

`sum(rate(http_requests_total{job=~"__your_job__", route=~".*"}[5m])) by (route)`

### Avarage request durations in ms over the last 5m

`avg(increase(http_request_duration_ms_sum{job=~"__your_job__", route=~".*"}[5m])/ increase(http_request_duration_ms_count{job=~"__your_job__", route=~".*"}[5m]) >0) by (route)`

### Non 200 status rate over the last 5m

`sum(irate(http_requests_total{status!~"200",job=~"__your_job__", route=~".*"}[5m])) BY (job, route, status) / IGNORING(status) GROUP_LEFT() sum(irate(http_requests_total{job=~"__your_job__", route=~".*"}[5m])) BY (job, route) * 100`

### 90th percentile of request durations over the last 5m

`histogram_quantile(0.90, sum(irate(http_request_duration_ms_bucket{job=~"__your_job__", route=~".*"}[5m])) by (route, le))`

## License

MIT &copy; zcong1993
