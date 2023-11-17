import { Popover, Spinner } from "."
import { inject, observer, useLocalStore } from "mobx-react"
import { MdError } from "react-icons/md"

export const AddSourcePopover = inject("store")(
  observer(({ store, onDismiss, ...props }) => {
    const state = useLocalStore(() => ({
      value: "",
      isLoading: false,
      error: false,
      get httpPrefixed() {
        if (state.value.startsWith("http")) {
          return state.value
        }
        return `https://${state.value}`
      },
      update(props) {
        Object.assign(state, props)
      },
    }))

    const onSubmit = (e) => {
      e.preventDefault()
      store.addSource({
        title: "New Source",
        href: state.httpPrefixed,
      })
    }
    return (
      <Popover
        placement="bottom"
        className="p-1"
        onDismiss={onDismiss}
        {...props}
      >
        <form className="flex items-center" onSubmit={onSubmit}>
          {state.isLoading && <Spinner className="mx-2" size="1rem" />}
          <input
            autoFocus
            className="outline-none px-2 py-1 border rounded"
            value={state.value}
            placeholder="http://example.com"
            onChange={(e) => {
              state.value = e.target.value
            }}
          />
          {state.error && (
            <span className="mx-2 text-red-600" title={state.error.message}>
              <MdError size="1.25rem" />
            </span>
          )}
        </form>
      </Popover>
    )
  }),
)
