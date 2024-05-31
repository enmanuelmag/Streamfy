import { useQuery } from '@tanstack/react-query'

import type { BingoUniqueExtendedType } from '@global/types/src/discord'

import { ErrorService } from '@global/utils'
import { DiscordRepo } from '@src/db'
import { Center, Container } from '@mantine/core'
import TableUnique from '@src/pages/private/bingoUnique/tableUnique'
import Loading from '@src/components/shared/Loading'
import React from 'react'

const BINGO_UNIQUE_KEY = 'bingoUnique'

const BingoPlay = () => {
  const [table, setTable] = React.useState<BingoUniqueExtendedType | null>(null)

  const bingoMutation = useQuery<BingoUniqueExtendedType, ErrorService>({
    queryKey: ['bingoUniquePlay'],
    queryFn: async () => {
      const tableStorage = loadTableStorage()
      if (!table && tableStorage) {
        return tableStorage
      }
      return await DiscordRepo.getBingoUnique(getIdFromURL(), 'no-needed')
    },
  })

  React.useEffect(() => {
    if (bingoMutation.data && !table) {
      saveTableStorage(bingoMutation.data)
      setTable(bingoMutation.data)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bingoMutation.data])

  return (
    <Container
      fluid
      className="cd-h-full cd-w-full !cd-px-[1rem] md:!cd-px-[3rem] lg:!cd-px-[6rem]"
    >
      <Center className="cd-w-full cd-h-full">
        <Loading
          loadingSize="lg"
          show={bingoMutation.isPending || bingoMutation.isLoading}
          text="Cargando bingo"
        />
        {table && (
          <TableUnique
            playing
            table={table}
            onUpdate={(tableSnap) => {
              saveTableStorage({
                ...table,
                predictions: tableSnap.predictions,
              })
              setTable({
                ...table,
                predictions: tableSnap.predictions,
              })
            }}
          />
        )}
      </Center>
    </Container>
  )

  function loadTableStorage() {
    const result = localStorage.getItem(BINGO_UNIQUE_KEY)
    if (result) {
      return JSON.parse(result) as BingoUniqueExtendedType
    }
    return null
  }

  function saveTableStorage(table: BingoUniqueExtendedType) {
    console.log('Saving table')
    localStorage.setItem(BINGO_UNIQUE_KEY, JSON.stringify(table))
  }

  function getIdFromURL() {
    const url = window.location.href
    const urlParts = url.split('/')
    return urlParts[urlParts.length - 1]
  }
}

export default BingoPlay
