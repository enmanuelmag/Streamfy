export const Response = (status: number, message: string, data: unknown, code?: string) => {
  return {
    status,
    code,
    message,
    data,
  }
}
