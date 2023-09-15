import { DateTime } from 'luxon'

export default function isToday(date: DateTime) {
  const today = DateTime.now().setZone('Europe/Paris')
  return today.diff(date, 'hours').toObject().hours! < 24
}