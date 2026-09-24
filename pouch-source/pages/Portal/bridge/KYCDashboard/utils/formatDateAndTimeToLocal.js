import { format, parseISO } from 'date-fns'

const formatDateAndTimeToLocal = (isoDate) => {
  let date = parseISO(isoDate)
  return format(date, 'MM/dd/yyyy hh:mm:ss a')
}

export default formatDateAndTimeToLocal
