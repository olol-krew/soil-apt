import { DateTime } from 'luxon'

export default function isToday(date: DateTime) {
  const today = DateTime.now().setZone('Europe/Paris')
  return date.day === today.day
    && date.month === today.month
    && date.year === today.year
}