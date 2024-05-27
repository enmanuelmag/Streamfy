export const ErrorCodes = {
  //Get user
  ERROR_GETTING_USER: {
    code: 'ERROR_GETTING_USER',
    message: 'Error getting user from Discord',
  },
  ERROR_GETTING_GUILDS: {
    code: 'ERROR_GETTING_GUILDS',
    message: 'Error getting guilds from Discord',
  },
  ERROR_MAPPING_USER_DATA: {
    code: 'ERROR_MAPPING_USER_DATA',
    message: 'Error mapping user data',
  },
  ERROR_GETTING_ACCESS: {
    code: 'ERROR_GETTING_ACCESS',
    message: 'Error getting user access from database',
  },
  //Login with code
  ERROR_GET_DISCORD_CREDS: {
    code: 'ERROR_GET_DISCORD_CREDS',
    message: 'Error getting Discord credentials (token and access) from Discord',
  },
  //Get emojis
  ERROR_GETTING_EMOJIS: {
    code: 'ERROR_GETTING_EMOJIS',
    message: 'Error getting emojis from Discord',
  },
  //Get messages
  ERROR_GETTING_MESSAGES: {
    code: 'ERROR_GETTING_MESSAGES',
    message: 'Error getting messages from Discord',
  },
  //Get channels
  ERROR_GETTING_CHANNELS: {
    code: 'ERROR_GETTING_CHANNELS',
    message: 'Error getting channels from Discord',
  },
  //Credentials
  ERROR_CREDENTIALS_LOCAL_STORAGE: {
    code: 'ERROR_CREDENTIALS',
    message: 'Error getting credentials from local storage',
  },
  //Bingo
  ERROR_CREATING_BINGO_TABLE: {
    code: 'ERROR_CREATING_TABLE',
    message: 'Error creating bingo table',
  },
  ERROR_REQUESTING_BINGO_TABLE: {
    code: 'ERROR_REQUESTING_TABLE',
    message: 'Error requesting bingo table',
  },
  ERROR_TOKEN_USER: {
    code: 'ERROR_TOKEN_USER',
    message: 'Error getting user from token',
  },
}

export class ErrorService extends Error {
  code: string
  message: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
    this.message = message
  }

  static getMessageFromCode(code: string) {
    return ErrorCodes[code as keyof typeof ErrorCodes].message || 'Error desconocido'
  }
}
