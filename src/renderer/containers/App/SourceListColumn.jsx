import React, { useRef } from "react"
import electron from "electron"
import {
  MdRefresh,
  MdFileDownload,
  MdViewList,
  MdViewStream,
  MdAddCircle,
} from "react-icons/md"
import { Header } from "components"
import { inject, observer, useLocalStore } from "mobx-react"
import classNames from "classnames"

import { AddSourcePopover } from "./AddSourcePopover"
import { SourceList } from "./SourceList"

export const SourceListColumn = inject("store")(
  observer(({ store, ...props }) => {
    const ref = useRef()

    const localStore = useLocalStore(() => ({
      isOpen: false,
      value: "",
    }))

    const onRefresh = () => {
      store.fetchSources()
    }

    const onAdd = () => {
      localStore.isOpen = true
    }

    const onImport = async () => {
      const { dialog } = electron.remote

      const { filePaths } = await dialog.showOpenDialog({
        filters: [
          {
            name: "OPML",
            extensions: ["opml"],
          },
        ],
      })
      filePaths.forEach((path) => {
        try {
          store.importOPML(path)
        } catch (err) {
          alert(err)
        }
      })
    }

    return (
      <div {...props}>
        <Header className="pl-20 border-pink-700 border-r">
          <div className="flex flex-auto items-center justify-end">
            <a
              ref={ref}
              className="cursor-pointer mr-2 text-pink-500"
              onClick={onAdd}
            >
              <MdAddCircle size="1.25rem" />
            </a>
            {localStore.isOpen && (
              <AddSourcePopover
                referenceElement={ref}
                onDismiss={() => {
                  localStore.isOpen = false
                }}
              />
            )}
            <a
              className="cursor-pointer mr-4 pr-4 border-pink-500 border-r text-pink-500"
              onClick={onImport}
            >
              <MdFileDownload size="1.25rem" />
            </a>

            <a className="cursor-pointer text-pink-500" onClick={onRefresh}>
              <MdRefresh size="1.25rem" />
            </a>
          </div>
        </Header>

        <div className="flex flex-auto flex-col overflow-hidden border-r">
          <SourceList />
        </div>
        {store.pending.length > 0 && (
          <div className="flex justify-between px-4 py-1 border-pink-800 bg-pink-700 text-shadow text-sm text-white font-medium">
            <div>Fetching...</div>
            <div className="italic">{store.pending.length} left</div>
          </div>
        )}
      </div>
    )
  }),
)
