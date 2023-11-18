import { Input, Select } from "../components"
import { Field } from "../components/Field"
import { Panel } from "../components/Panel"
import { Heading } from "./Heading"
import { safeProcessor } from "../support/processor"
import { MdEdit } from "react-icons/md"
import { Instance } from "mobx-state-tree"
import { Inspector } from "react-inspector"
import { Source } from "./Source"
import { observer } from "mobx-react"
import { PropsWithChildren } from "react"
import { autoValue, parse } from "../support/parsing"

function deepInspect(results) {
  if (!Array.isArray(results)) results = [results]
  return results.map((x, i) => {
    if (x instanceof Error) {
      return <pre className="text-red-500 text-sm italic">{x.message}</pre>
    }
    return <Inspector key={i} data={x} />
  })
}

export const FieldPreview: React.FC<{
  name: string
  activeIndex: number
  activeSource: Instance<typeof Source>
}> = observer(({ name, activeSource, activeIndex }) => {
  try {
    const item = parse(activeSource.selectors.item)(activeSource.document)[
      activeIndex
    ]
    if (name == "item") return deepInspect(item)

    return (
      <>
        {deepInspect(parse(activeSource.selectors[name])(item))}
        {deepInspect(autoValue(parse(activeSource.selectors[name])(item)))}
      </>
    )
  } catch (e) {
    return <pre className="text-red-500 text-sm italic">{e.message}</pre>
  }
})

const DescriptionPreview: React.FC<{
  activeSource: Instance<typeof Source>
}> = ({ activeSource }) => (
  <div
    className="Preview flex-auto overflow-y-auto p-8"
    dangerouslySetInnerHTML={{
      __html: safeProcessor.processSync(activeSource.activeItem?.description)
        .value,
    }}
  />
)

export const SourceEditPanel: React.FC<{
  activeSource: Instance<typeof Source> & PropsWithChildren<Panel>
}> = observer(({ activeSource, ...props }) => (
  <Panel
    {...props}
    icon={<MdEdit size="1.5rem" />}
    header={<Heading>Edit Source</Heading>}
    contentClass="space-y-8 px-8 py-8"
  >
    <div className="space-y-2">
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
    </div>

    <div className="space-y-2">
      <div className="space-y-2">
        <Field title="Item">
          <Input
            className="font-mono text-sm"
            value={activeSource.selectors.item}
            onChange={(e) => {
              activeSource.selectors.update({ item: e.target.value })
            }}
          />
          <FieldPreview
            activeIndex={activeSource.activeIndex}
            name="item"
            activeSource={activeSource}
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
          <FieldPreview
            activeIndex={activeSource.activeIndex}
            name="href"
            activeSource={activeSource}
          />
        </Field>
        <Field title="Title">
          <Input
            className="font-mono text-sm"
            value={activeSource.selectors.title}
            onChange={(e) => {
              activeSource.selectors.update({ title: e.target.value })
            }}
          />
          <FieldPreview
            activeIndex={activeSource.activeIndex}
            name="title"
            activeSource={activeSource}
          />
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
          <DescriptionPreview activeSource={activeSource} />
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
            activeIndex={activeSource.activeIndex}
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
          <FieldPreview
            activeIndex={activeSource.activeIndex}
            name="author"
            activeSource={activeSource}
          />
        </Field>
        <Field title="Image">
          <Input
            className="font-mono text-sm"
            value={activeSource.selectors.image}
            onChange={(e) => {
              activeSource.selectors.update({ image: e.target.value })
            }}
          />
          <FieldPreview
            activeIndex={activeSource.activeIndex}
            name="image"
            activeSource={activeSource}
          />
        </Field>
      </div>
    </div>
    {/* <InspectorTable activeSource={activeSource} props={props} /> */}
  </Panel>
))
