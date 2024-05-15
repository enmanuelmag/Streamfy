import { notifications } from '@mantine/notifications'
import { UserAccessType } from '@global/types/src/discord'
import { isBefore, diffDays, format } from '@formkit/tempo'

import { CONTACT_EMAIL, NOTIFICATION_DAYS_ALERT } from '@src/constants/access'

export const validateUserAccess = (userAccess?: UserAccessType | null) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks

  if (!userAccess) {
    notifications.show({
      color: 'red',
      title: 'Error',
      message: 'El usuario no tiene acceso a la app',
    })
    return false
  }

  if (!userAccess.lastPayment || !userAccess.dueDate) {
    notifications.show({
      color: 'red',
      title: 'Error',
      message: 'El usuario no tiene un último pago registrado',
    })
    return false
  }

  const now = format(new Date(), 'YYYY-MM-DD', 'en')
  const dueDate = format(new Date(userAccess.dueDate), 'YYYY-MM-DD', 'en')

  if (isBefore(dueDate, now)) {
    notifications.show({
      color: 'red',
      title: 'Error',
      message: 'El usuario no tiene acceso a la app por falta de pago',
    })
    return false
  }

  const daysLeft = diffDays(dueDate, now)
  if (daysLeft <= NOTIFICATION_DAYS_ALERT) {
    notifications.show({
      id: 'access-alert',
      color: 'blue',
      title: 'Info',
      message: `Quedan ${daysLeft} días de acceso a la app, contactar a ${CONTACT_EMAIL} para renovar`,
    })
  }
  return true
}
