import { Panel } from "../components/Panel"
import { ItemList } from "../components/ItemList"
import { Inspector } from "react-inspector"
import { EmptyPlaceholder } from "../components/EmptyPlaceholder"
import { Heading } from "./Heading"
import { Instance } from "mobx-state-tree"
import { Source } from "./Source"
import { MdSearch } from "react-icons/md"
import { observer } from "mobx-react"
import { PropsWithChildren } from "react"
import { Item } from "../models/Item"

const DocumentIFrame: React.FC<{
  activeSource: Instance<typeof Source>
}> = observer(({ document }) => {
  if (!document) return null
  if (!document.documentElement) return null

  return (
    <iframe
      className="flex-auto w-full h-full"
      src={`data:text/html,${encodeURIComponent(
        document.documentElement.outerHTML,
      )}`}
    />
  )
})

const EditSourceItemList: React.FC<{
  source: Instance<typeof Source>
}> = ({ source }) => (
  <ItemList
    extended
    className="flex-auto overflow-y-auto"
    items={source.lastItems}
    activeItem={source.activeItem}
    onSelect={(item: Instance<typeof Item>) =>
      void source.update({
        activeIndex: source.lastItems.indexOf(item),
      })
    }
  />
)

export const SourcePreviewPanel: React.FC<{
  activeSource: Instance<typeof Source> & PropsWithChildren<Panel>
}> = observer(({ activeSource, ...props }) => (
  <Panel
    {...props}
    icon={<MdSearch size="1.5rem" />}
    header={<Heading>Source Preview</Heading>}
    contentClass="flex-none flow-col overflow-hidden divide-y"
  >
    <div className="flex-auto overflow-y-auto min-h-[50%]">
      {activeSource.kind === "html" ? (
        <DocumentIFrame key="preview" document={activeSource.preview} />
      ) : (
        <Inspector data={activeSource.preview} expandLevel={3} />
      )}
    </div>

    {activeSource.lastItems.length > 0 ? (
      <EditSourceItemList source={activeSource} />
    ) : (
      <EmptyPlaceholder />
    )}
  </Panel>
))
