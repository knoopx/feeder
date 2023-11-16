import { PropsWithChildren, useRef } from "react"
import { productName } from "../../package.json"
import { GiTribalGear } from "react-icons/gi"
import {
  MdRefresh,
  MdFileDownload,
  MdModeEdit,
  MdAddCircle,
} from "react-icons/md"
import { Panel, HeaderButton, Spinner } from "../components"
import { inject, observer, useLocalStore } from "mobx-react"

import { AddSourcePopover } from "../components/AddSourcePopover"
import { SourceList } from "./SourceList"
import { Heading } from "./Heading"
import { Instance } from "mobx-state-tree"
import { Store } from "../models/Store"

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

      const state = useLocalStore(() => ({
        isPopoverOpen: false,
        value: "",
      }))

      const onRefresh = () => {
        store.fetchSources()
      }

      const onAdd = () => {
        state.isPopoverOpen = true
      }

      // const onImport = async () => {
      //   const { filePaths } = await dialog.showOpenDialog({
      //     filters: [
      //       {
      //         name: "OPML",
      //         extensions: ["opml"],
      //       },
      //     ],
      //   })
      //   filePaths.forEach((path) => {
      //     try {
      //       store.importOPML(path)
      //     } catch (err) {
      //       alert(err)
      //     }
      //   })
      // }

      return (
        <Panel
          {...props}
          className={["relative", className]}
          icon={<GiTribalGear size="2rem" />}
          header={
            <div className="flex flex-auto items-center justify-between">
              <Heading>{productName}</Heading>
              <div className="flex divide-pink-500 divide-x">
                <HeaderButton ref={ref} className="px-2" onClick={onAdd}>
                  <MdAddCircle size="1.25rem" />
                </HeaderButton>
                {state.isPopoverOpen && (
                  <AddSourcePopover
                    className="px-2"
                    referenceElement={ref}
                    onDismiss={() => {
                      state.isPopoverOpen = false
                    }}
                  />
                )}
                {/* <HeaderButton className="px-2" onClick={onImport}> */}
                {/* <MdFileDownload size="1.25rem" />
                </HeaderButton> */}

                <HeaderButton
                  className={[
                    "px-2",
                    {
                      "text-white": store.isEditing,
                    },
                  ]}
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
