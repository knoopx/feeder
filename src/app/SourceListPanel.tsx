import { PropsWithChildren, useRef } from "react"
import { productName } from "../../package.json"
import { GiTribalGear } from "react-icons/gi"
import { MdRefresh, MdModeEdit, MdAddCircle } from "react-icons/md"
import { Panel, HeaderButton, Spinner } from "../components"
import { inject, observer } from "mobx-react"

import { SourceList } from "./SourceList"
import { Heading } from "./Heading"
import { Instance } from "mobx-state-tree"
import { Store } from "../models/Store"
import { digest } from "../support/util"
import clsx from "clsx"

export const SourceListPanel = inject("store")(
  observer(
    ({
      store,
      className,
      ...props
    }: {
      store?: Instance<typeof Store>
    } & PropsWithChildren<Panel>) => {
      const ref = useRef()

      const onRefresh = () => {
        store.fetchSources()
      }

      const onAdd = () => {
        store.addSource({
          id: digest(Date.now()),
          title: "New Source",
        })
      }

      return (
        <Panel
          id="source-list-panel"
          {...props}
          className={clsx("relative", className)}
          icon={<GiTribalGear size="2rem" />}
          header={
            <div className=":uno-panel-source-list: flow-row items-center justify-between">
              <Heading>{productName}</Heading>
              <div className="flex divide-pink-500 divide-x">
                <HeaderButton ref={ref} className="px-2" onClick={onAdd}>
                  <MdAddCircle size="1.25rem" />
                </HeaderButton>

                <HeaderButton
                  className={clsx("px-2", {
                    "text-white": store.isEditing,
                  })}
                  onClick={store.toggleEdit}
                >
                  <MdModeEdit size="1.25rem" />
                </HeaderButton>

                <HeaderButton className="px-2" onClick={onRefresh}>
                  <MdRefresh size="1.25rem" />
                </HeaderButton>
              </div>
            </div>
          }
        >
          <SourceList editMode={store.isEditing} />

          {store.pending.length > 0 && (
            <div className="absolute inset-0 top-auto flex items-center m-2 px-4 py-1 rounded shadow bg-gray-800 text-shadow text-sm text-white font-medium">
              <Spinner size="1rem" className="mr-2" />
              <div>Fetching...</div>
              <div className="ml-auto italic">
                {Math.round(store.progress * 100)}%
              </div>
            </div>
          )}
        </Panel>
      )
    },
  ),
)
