import { useRef, useEffect, PropsWithoutRef } from "react"
import { observer } from "mobx-react"
import clsx from "clsx"
import { textarea } from "."

export const AutoTextArea = observer(
  ({
    value,
    className,
    onChange,
    maxRows = 8,
    ...rest
  }: PropsWithoutRef<HTMLTextAreaElement> & {
    maxRows?: number
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  }) => {
    const ref = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
      if (!ref.current) return
      ref.current.style.height = "0px"
      const { scrollHeight, clientHeight, offsetHeight } = ref.current
      const offset = offsetHeight - clientHeight
      ref.current.style.height = `min(${
        getComputedStyle(ref.current).lineHeight
      } * ${maxRows + 1}, ${scrollHeight + offset}px)`
    }, [value])

    return (
      <textarea
        className={clsx(textarea, className)}
        ref={ref}
        value={value ?? ""}
        spellCheck={false}
        onChange={onChange}
        {...rest}
      />
    )
  },
)
