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
import {
  setupProm,
  Config,
  defaultStatusNormalizer
} from '@zcong/koa-prometheus'

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
| requestDurationUseHistogram | if requestDuration use Histogram of Summary | true                                                                                   | false            |

## License

MIT &copy; zcong1993
