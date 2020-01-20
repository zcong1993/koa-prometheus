export const hrtime2nano = (hrtime: [number, number]): number =>
  hrtime[0] * 1e9 + hrtime[1]

export const hrtime = () => hrtime2nano(process.hrtime())

export const nano2ms = (nano: number): number => nano / 1e6
