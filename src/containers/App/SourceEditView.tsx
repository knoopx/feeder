import { inject, observer } from "mobx-react"
import { Input, Select } from "../../components"
import { Field } from "../../components/Field"
import { Panel } from "../../components/Panel"
import { ItemList } from "../../containers/App/SplitModeColumn/ItemList"

export const SourceEditView = inject("store")(
  observer(({ store }) => {
    const { activeSource } = store

    return (
      <div className="flex flex-auto">
        <Panel header="Preview" className={"space-y-2 flex-col"} panelClassName="w-[60ch]">
          <div className="flex flex-auto overflow-auto">
            {activeSource.parsedItems.length > 0 ? (
              <ItemList items={activeSource.parsedItems} extended={true} />
            ) : (
              <div className="flex flex-auto items-center justify-center text-gray-600">
                Nothing to show
              </div>
            )}
          </div>
        </Panel>
        <Panel header="Edit Source" className={"space-y-2 flex-col px-8 py-8"} panelClassName="flex-auto">
          <Field title="Title">
            <Input
              value={activeSource.title}
              onChange={(e) => {
                activeSource.update({ title: e.target.value })
              }}
            />
          </Field>
          <Field title="Type">
            <Select
              value={activeSource.kind}
              onChange={(e) => {
                activeSource.update({ kind: e.target.value })
              }}
            >
              <option value="feed">Feed</option>
              <option value="json">JSON</option>
              <option value="html">HTML</option>
              <option value="xml">XML</option>
            </Select>
          </Field>
          <Field title="URL">
            <Input
              value={activeSource.href}
              onChange={(e) => {
                activeSource.update({ href: e.target.value })
              }}
            />
          </Field>
          {activeSource.kind !== "feed" && (
            <>
              <Field title="Item">
                <Input
                  value={activeSource.selectors.item}
                  onChange={(e) => {
                    activeSource.selectors.update({ item: e.target.value })
                  }}
                />
              </Field>
              <Field title="Title">
                <Input
                  value={activeSource.selectors.title}
                  onChange={(e) => {
                    activeSource.selectors.update({ title: e.target.value })
                  }}
                />
              </Field>
              <Field title="Description">
                <Input
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
                  value={activeSource.selectors.author}
                  onChange={(e) => {
                    activeSource.selectors.update({ author: e.target.value })
                  }}
                />
              </Field>
              <Field title="Link">
                <Input
                  value={activeSource.selectors.link}
                  onChange={(e) => {
                    activeSource.selectors.update({ link: e.target.value })
                  }}
                />
              </Field>
            </>
          )}
        </Panel>
      </div>
    )
  }),
)
