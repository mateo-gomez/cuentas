import { useEffect, useState } from "react"

export const useSelect = <T,>(item: T) => {
  const [selected, setSelected] = useState<T>(item)

  useEffect(() => {
    if (item) {
      setSelected(item)
    }
  }, [item])

  return {
    selected,
    setSelected,
  }
}
