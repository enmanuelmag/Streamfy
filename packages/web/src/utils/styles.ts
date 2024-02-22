/* eslint-disable @typescript-eslint/no-explicit-any */
export const $ = (...classes: any[]) => classes.filter(Boolean).join(' ')
