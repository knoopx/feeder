import { useCallback, useState, useEffect, useRef } from "react"
import PopperJS from "popper.js"

export function usePopper(opts) {
  const { referenceElement, popperNode, arrowNode } = opts
  const [state, setState] = useState({
    data: undefined,
    placement: undefined,
  })
  const popperInstance = useRef()

  const callbackFn = useCallback((data) => {
    const { placement } = data
    setState({ data, placement })
    return data
  }, [])

  useEffect(() => {
    // A placement difference in state means popper determined a new placement
    // apart from the opts value. By the time the popper element is rendered with
    // the new position Popper has already measured it, if the place change triggers
    // a size change it will result in a misaligned popper. So we schedule an update to be sure.
    if (popperInstance.current) {
      popperInstance.current.scheduleUpdate()
    }
  }, [state.placement])

  useEffect(() => {
    if (referenceElement.current && popperNode.current) {
      popperInstance.current = new PopperJS(
        referenceElement.current,
        popperNode.current,
        {
          placement: opts.placement,
          eventsEnabled: opts.eventsEnabled,
          positionFixed: opts.positionFixed,
          modifiers: {
            ...opts.modifiers,
            arrow: {
              ...(opts.modifiers && opts.modifiers.arrow),
              enabled: !!arrowNode.current,
              element: arrowNode.current,
            },
            applyStyle: { enabled: false },
            updateStateModifier: {
              enabled: true,
              order: 900,
              fn: callbackFn,
            },
          },
        },
      )
    }

    return () => {
      if (!popperInstance.current) return

      popperInstance.current.destroy()
      popperInstance.current = null
    }
  }, [
    popperNode.current,
    referenceElement.current,
    opts.positionFixed,
    opts.placement,
    opts.eventsEnabled,
  ])

  const style =
    !popperNode.current || !state.data
      ? {}
      : {
          position: state.data.offsets.popper.position,
          ...state.data.styles,
        }

  const arrowStyle =
    !arrowNode.current || !state.data ? {} : state.data.arrowStyles

  return {
    style,
    placement: state.placement,
    outOfBoundaries: state.data && state.data.hide,
    scheduleUpdate: popperInstance.current
      ? popperInstance.current.scheduleUpdate
      : () => {},
    arrowStyle,
  }
}
