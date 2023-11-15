import { inject, observer } from "mobx-react"
import { Input, Select } from "../components"
import { Field } from "../components/Field"
import { Panel } from "../components/Panel"
import { ItemList } from "./ItemList"
import { useEffect } from "react"
import { Inspector } from "react-inspector"
import { EmptyPlaceholder } from "../components/EmptyPlaceholder"
import { Heading } from "./Heading"

export const SourceEditPanels = inject("store")(
  observer(({ store }) => {
    const { activeSource } = store

    useEffect(() => {
      activeSource.fetch(true)
    }, [activeSource])

    return (
      <>
        <Panel
          header={<Heading>Source Preview</Heading>}
          className="flex-none w-[60ch]"
          contentClass="space-y-2 flow-col overflow-y-auto"
        >
          {activeSource.lastItems.length > 0 ? (
            <ItemList items={activeSource.lastItems} extended />
          ) : (
            <EmptyPlaceholder />
          )}
        </Panel>
        <Panel
          header={<Heading>Edit Source</Heading>}
          contentClass={"flow-col space-y-2 px-8 py-8"}
        >
          <div className="flow-row space-x-4">
            <Field title="Type" className="flex-none w-[8ch]">
              <Select
                value={activeSource.kind}
                onChange={(e) => {
                  activeSource.update({ kind: e.target.value })
                }}
              >
                <option value="json">JSON</option>
                <option value="html">HTML</option>
                <option value="xml">XML</option>
              </Select>
            </Field>
            <Field title="Title" className="flex-none w-[35ch]">
              <Input
                value={activeSource.title}
                onChange={(e) => {
                  activeSource.update({ title: e.target.value })
                }}
              />
            </Field>
            <Field title="Base URL">
              <Input
                value={activeSource.baseURL || ""}
                onChange={(e) => {
                  activeSource.update({ baseURL: e.target.value })
                }}
              />
            </Field>
          </div>

          <Field title="URL">
            <Input
              className="font-mono"
              value={activeSource.href}
              onChange={(e) => {
                activeSource.update({ href: e.target.value })
              }}
            />
          </Field>

          <Heading>Selectors</Heading>
          <div className="grid grid-cols-[60ch,auto] bg-muted p-4 rounded-md overflow-hidden">
            <div className="space-y-2">
              <Field title="Item">
                <Input
                  className="font-mono"
                  value={activeSource.selectors.item}
                  onChange={(e) => {
                    activeSource.selectors.update({ item: e.target.value })
                  }}
                />
              </Field>
              <Field title="Link">
                <Input
                  className="font-mono"
                  value={activeSource.selectors.href}
                  onChange={(e) => {
                    activeSource.selectors.update({ href: e.target.value })
                  }}
                />
              </Field>
              <Field title="Title">
                <Input
                  className="font-mono"
                  value={activeSource.selectors.title}
                  onChange={(e) => {
                    activeSource.selectors.update({ title: e.target.value })
                  }}
                />
              </Field>
              <Field title="Description">
                <Input
                  className="font-mono"
                  value={activeSource.selectors.description}
                  onChange={(e) => {
                    activeSource.selectors.update({
                      description: e.target.value,
                    })
                  }}
                />
              </Field>
              <Field title="Published At">
                <Input
                  className="font-mono"
                  value={activeSource.selectors.publishedAt}
                  onChange={(e) => {
                    activeSource.selectors.update({
                      publishedAt: e.target.value,
                    })
                  }}
                />
              </Field>
              <Field title="Author">
                <Input
                  className="font-mono"
                  value={activeSource.selectors.author}
                  onChange={(e) => {
                    activeSource.selectors.update({ author: e.target.value })
                  }}
                />
              </Field>
              <Field title="Image">
                <Input
                  className="font-mono"
                  value={activeSource.selectors.image}
                  onChange={(e) => {
                    activeSource.selectors.update({ image: e.target.value })
                  }}
                />
              </Field>
            </div>
            <div className="p-6 overflow-auto">
              <div className="bg-white rounded-md p-4">
                <Inspector data={activeSource.preview} expandLevel={5} />
              </div>
            </div>
          </div>
        </Panel>
      </>
    )
  }),
)
