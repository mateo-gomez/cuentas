import { DateRange } from "../../types/dateRange"
import { client } from "../helpers"

export const getDateRange = async (): Promise<DateRange> => {
  const {
    data: { start, end },
  } = await client.get<{ data: { start: string; end: string } }>(
    `/transactions/dates`,
  )

  const data = {
    start: new Date(start),
    end: new Date(end),
  }

  return data
}
