import React, { forwardRef, useRef } from "react"
import electron from "electron"
import {
  MdRefresh,
  MdFileDownload,
  MdModeEdit,
  MdAddCircle,
} from "react-icons/md"
import { Header, HeaderButton } from "components"
import { inject, observer, useLocalStore } from "mobx-react"

import { AddSourcePopover } from "./AddSourcePopover"
import { SourceList } from "./SourceList"

export const SourceListColumn = inject("store")(
  observer(({ store, ...props }) => {
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

    const onToggleEdit = () => {
      state.isEditing = !state.isEditing
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
            <HeaderButton ref={ref} className="mr-2" onClick={onAdd}>
              <MdAddCircle size="1.25rem" />
            </HeaderButton>
            {state.isPopoverOpen && (
              <AddSourcePopover
                referenceElement={ref}
                onDismiss={() => {
                  state.isPopoverOpen = false
                }}
              />
            )}
            <HeaderButton
              className="mr-4 pr-4 border-pink-500 border-r"
              onClick={onImport}
            >
              <MdFileDownload size="1.25rem" />
            </HeaderButton>

            <HeaderButton
              className={[
                "mr-4 pr-4 border-pink-500 border-r",
                {
                  "text-white": state.isEditing,
                },
              ]}
              onClick={onToggleEdit}
            >
              <MdModeEdit size="1.25rem" />
            </HeaderButton>

            <HeaderButton onClick={onRefresh}>
              <MdRefresh size="1.25rem" />
            </HeaderButton>
          </div>
        </Header>

        <div className="flex flex-auto flex-col overflow-hidden border-r">
          <SourceList editMode={state.isEditing} />
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
