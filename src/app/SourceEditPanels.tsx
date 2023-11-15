import { inject, observer } from "mobx-react"
import { Input, Select } from "../components"
import { Field } from "../components/Field"
import { Panel } from "../components/Panel"
import { ItemList } from "./ItemList"
import { useEffect } from "react"
import { Inspector } from "react-inspector"
import { EmptyPlaceholder } from "../components/EmptyPlaceholder"
import { Heading } from "./Heading"
import { Store } from "../models/Store"
import { Instance } from "mobx-state-tree"
import { ErrorBoundary } from "../components/ErrorBoundary"
import { safeProcessor } from "../support/processor"
import Source from "./Source"

const FieldPreview: React.FC<{
  name: string
  activeSource: Instance<typeof Source>
}> = ({ name, activeSource }) => {
  const item = activeSource.lastItems[0] ?? {}
  return <Inspector data={item[name]} />

  // return <code className="text-xs truncate">{JSON.stringify(item[name])}</code>
}

const InspectorTable: React.FC<{
  activeSource: unknown
  props: string[]
}> = ({ activeSource, props }) => (
  <table>
    <thead>
      <tr>
        {props.map((key) => (
          <th key={key} className="border">
            {key}
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {activeSource.lastItems.map((item) => (
        <tr key={item.href}>
          {props.map((key) => (
            <td key={key} className="border max-w-[20ch] truncate">
              <Inspector data={item[key]} />
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
)

export const SourceEditPanels = inject("store")(
  observer(({ store }: { store?: Instance<typeof Store> }) => {
    const { activeSource } = store

    const props = [
      "href",
      "title",
      "description",
      "author",
      "publishedAt",
      "image",
    ]

    useEffect(() => {
      activeSource.fetch(true)
    }, [activeSource])

    return (
      <>
        <Panel
          header={<Heading>Source Preview</Heading>}
          className="flex-none w-[60ch]"
          contentClass="flow-col overflow-hidden divide-y-2"
        >
          {activeSource.lastItems.length > 0 ? (
            <ErrorBoundary>
              <ItemList
                className="flex-none overflow-y-auto h-96"
                items={activeSource.lastItems}
                extended
              />
              <div
                className="Preview flex-auto overflow-y-auto p-8"
                dangerouslySetInnerHTML={{
                  __html: safeProcessor.processSync(
                    activeSource.lastItems[0].description,
                  ).value,
                }}
              />
            </ErrorBoundary>
          ) : (
            <EmptyPlaceholder />
          )}
        </Panel>
        <Panel
          header={<Heading>Edit Source</Heading>}
          contentClass={" space-y-8 px-8 py-8"}
        >
          <div className="space-y-2">
            <Heading>General</Heading>
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
                className="font-mono text-sm"
                value={activeSource.href}
                onChange={(e) => {
                  activeSource.update({ href: e.target.value })
                }}
              />
            </Field>
          </div>

          <div className="space-y-2">
            <Heading>Selectors</Heading>
            <div className="grid grid-cols-[60ch,auto] bg-muted p-4 rounded-md overflow-hidden">
              <div className="space-y-2">
                <Field title="Item">
                  <Input
                    className="font-mono text-sm"
                    value={activeSource.selectors.item}
                    onChange={(e) => {
                      activeSource.selectors.update({ item: e.target.value })
                    }}
                  />
                </Field>
                <Field title="Link" className="space-y-1">
                  <Input
                    className="font-mono text-sm"
                    value={activeSource.selectors.href}
                    onChange={(e) => {
                      activeSource.selectors.update({ href: e.target.value })
                    }}
                  />
                  <FieldPreview name="href" activeSource={activeSource} />
                </Field>
                <Field title="Title">
                  <Input
                    className="font-mono text-sm"
                    value={activeSource.selectors.title}
                    onChange={(e) => {
                      activeSource.selectors.update({ title: e.target.value })
                    }}
                  />
                  <FieldPreview name="title" activeSource={activeSource} />
                </Field>
                <Field title="Description">
                  <Input
                    className="font-mono text-sm"
                    value={activeSource.selectors.description}
                    onChange={(e) => {
                      activeSource.selectors.update({
                        description: e.target.value,
                      })
                    }}
                  />
                  <FieldPreview
                    name="description"
                    activeSource={activeSource}
                  />
                </Field>
                <Field title="Published At">
                  <Input
                    className="font-mono text-sm"
                    value={activeSource.selectors.publishedAt}
                    onChange={(e) => {
                      activeSource.selectors.update({
                        publishedAt: e.target.value,
                      })
                    }}
                  />
                  <FieldPreview
                    name="publishedAt"
                    activeSource={activeSource}
                  />
                </Field>
                <Field title="Author">
                  <Input
                    className="font-mono text-sm"
                    value={activeSource.selectors.author}
                    onChange={(e) => {
                      activeSource.selectors.update({ author: e.target.value })
                    }}
                  />
                  <FieldPreview name="author" activeSource={activeSource} />
                </Field>
                <Field title="Image">
                  <Input
                    className="font-mono text-sm"
                    value={activeSource.selectors.image}
                    onChange={(e) => {
                      activeSource.selectors.update({ image: e.target.value })
                    }}
                  />
                  <FieldPreview name="image" activeSource={activeSource} />
                </Field>
              </div>
              <div className="p-6 overflow-auto">
                <div className="bg-white rounded-md p-4">
                  {activeSource.kind === "html" ? (
                    activeSource.document && (
                      <iframe
                        src={
                          "data:text/html," +
                          encodeURIComponent(
                            activeSource.document.documentElement.outerHTML,
                          )
                        }
                      />
                    )
                  ) : (
                    <Inspector data={activeSource.preview} expandLevel={3} />
                    // <pre className="">
                    //   {activeSource.preview.documentElement.outerHTML}
                    // </pre>
                  )}
                </div>
              </div>
            </div>
            {/* <Inspector
              table
              className="w-full"
              data={Object.fromEntries(
                activeSource.lastItems.map((i) => [i.href, i]),
              )}
              columns={["title", "description", "author", "publishedAt"]}
            /> */}
            {/* <InspectorTable activeSource={activeSource} props={props} /> */}
          </div>
        </Panel>
      </>
    )
  }),
)
