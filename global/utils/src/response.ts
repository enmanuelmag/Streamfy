export const Response = (status: number, message: string, data: unknown) => {
  return {
    status,
    message,
    data,
  }
}
