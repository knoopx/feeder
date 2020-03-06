import React, { useRef } from "react"
import { remote } from "electron"
import {
  MdRefresh,
  MdFileDownload,
  MdModeEdit,
  MdAddCircle,
  MdSignalWifiOff,
} from "react-icons/md"
import { useOnline } from "hooks"
import { Header, HeaderButton, TitleBarControls, Spinner } from "components"
import { inject, observer, useLocalStore } from "mobx-react"

import { AddSourcePopover } from "./AddSourcePopover"
import { SourceList } from "./SourceList"

export const SourceListColumn = inject("store")(
  observer(({ store, className, ...props }) => {
    const isOnline = useOnline()

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
      const { filePaths } = await remote.dialog.showOpenDialog(
        remote.getCurrentWindow(),
        {
          filters: [
            {
              name: "OPML",
              extensions: ["opml"],
            },
          ],
        },
      )
      filePaths.forEach((path) => {
        try {
          store.importOPML(path)
        } catch (err) {
          alert(err)
        }
      })
    }

    return (
      <div className={["relative", className]} {...props}>
        <Header className="border-pink-700 border-r">
          <div className="flex flex-auto items-center">
            <TitleBarControls />
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

              {isOnline ? (
                <HeaderButton onClick={onRefresh}>
                  <MdRefresh size="1.25rem" />
                </HeaderButton>
              ) : (
                <MdSignalWifiOff className="text-pink-600" />
              )}
            </div>
          </div>
        </Header>

        <div className="flex flex-auto flex-col overflow-hidden border-r">
          <SourceList editMode={state.isEditing} />
        </div>

        {store.pending.length > 0 && (
          <div className="absolute inset-0 top-auto flex items-center m-2 px-4 py-1 rounded shadow bg-gray-800 text-shadow text-sm text-white font-medium">
            <Spinner size="1rem" className="mr-2" />
            <div>Fetching...</div>
            <div className="ml-auto italic">
              {Math.round(store.progress * 100)}%
            </div>
          </div>
        )}
      </div>
    )
  }),
)
