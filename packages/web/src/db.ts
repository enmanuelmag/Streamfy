import FirebaseDataDS from '@api/impl/ds/FirebaseDataDS'
import DataRepositoryImpl from '@api/impl/repo/DataRepoImpl'

import ServerDiscordDS from '@api/impl/ds/ServerDiscordDS'
import DiscordRepoImpl from '@api/impl/repo/DiscordRepoImpl'

export const DataRepo = new DataRepositoryImpl(new FirebaseDataDS())

export const DiscordRepo = new DiscordRepoImpl(new ServerDiscordDS())
