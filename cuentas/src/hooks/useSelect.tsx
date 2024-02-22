import { useEffect, useState } from "react"

export const useSelect = (item) => {
  const [selected, setSelected] = useState(item)

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
