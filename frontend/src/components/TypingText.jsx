
import { useEffect, useState } from "react"

export default function TypingText({ content, speed = 15 }) {
  const [displayed, setDisplayed] = useState("")

  useEffect(() => {
    if (!content) {
      setDisplayed("");
      return;
    }
    let i = 0
    setDisplayed("")

    const interval = setInterval(() => {
      setDisplayed((prev) => prev + content.charAt(i))
      i++
      if (i >= content.length) clearInterval(interval)
    }, speed)

    return () => clearInterval(interval)
  }, [content, speed])

  return <>{displayed}</>
}
