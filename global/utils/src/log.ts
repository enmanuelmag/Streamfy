/* eslint-disable @typescript-eslint/no-explicit-any */
class LoggerImpl {
  private getPrefix() {
    return {
      text: '%c[STREAMFY]',
      css: 'color:#ef9234;',
    }
  }

  private print(type: LogType, text: string[], extraCSS: string[], objects?: object[]): void {
    const prefix = this.getPrefix()
    const texts: string[] = []
    const _objects: any[] = []

    text.forEach((t) => {
      if (typeof t === 'string') {
        texts.push(t)
      } else {
        _objects.push(t)
      }
    })

    console[type](
      prefix.text + ' ' + texts.join(' '),
      prefix.css,
      ...extraCSS,
      ...(objects ?? []),
      ..._objects,
    )
  }

  debug(...text: any[]): void {
    this.print('debug', ['%c[DEBUG]%c', ...text], ['color:#32c8e6;', 'color:grey'])
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  debugWithObjects(text: any[], objects: any[]): void {
    this.print('debug', ['%c[DEBUG]%c', ...text], ['color:#32c8e6;', 'color:grey'], objects)
  }

  info(...text: any[]): void {
    this.print('info', ['%c[INFO]%c', ...text], ['color:#3cf051;', 'color:reset;'])
  }

  warn(...text: any[]): void {
    this.print('warn', ['%c[WARN]%c', ...text], ['color:#fac837;', 'color:reset;'])
  }

  error(...text: any[]): void {
    this.print('error', ['%c[ERROR]%c', ...text], ['color:#e63232;', 'color:reset;'])
  }
}

export const Logger = new LoggerImpl()

export type LogType = 'error' | 'warn' | 'debug' | 'info'
