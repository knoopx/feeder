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
import { $auto, $string, parse } from "../support/parsing"
import { ErrorMessage } from "../components/ErrorMessage"
import { AutoTextArea } from "../components/AutoTextArea"

function deepInspect(results) {
  if (!Array.isArray(results)) results = [results]
  return results.map((x, i) => {
    if (x instanceof Error) {
      return <ErrorMessage key={i} error={x} />
    }
    return <Inspector key={i} data={x} />
  })
}

const parseResult = (selector, context) => {
  try {
    return printResult(parse(selector)(context))
  } catch (e) {
    return <ErrorMessage error={e} />
  }
}

const printResult = (results) => {
  return <div className="rounded">{deepInspect(results)}</div>
}

export const FieldPreview: React.FC<{
  name: string
  source: Instance<typeof Source>
}> = observer(({ name, source: { selectors, activeElement } }) => {
  try {
    if (name == "item") return <div>{deepInspect(activeElement)}</div>

    return (
      <div className="space-y-1">
        {parseResult(selectors[name], activeElement)}
        {parseResult(selectors[name], activeElement)}
      </div>
    )
  } catch (e) {
    return <ErrorMessage error={e} />
  }
})

const DescriptionPreview: React.FC<{
  source: Instance<typeof Source>
}> = observer(({ source: { selectors, activeElement } }) => {
  try {
    const result = parse(selectors.description)(activeElement)
    return (
      <div className="space-y-1">
        {printResult(result)}
        <div
          className="prose flex-auto overflow-y-auto p-2 bg-white rounded text-sm"
          dangerouslySetInnerHTML={{
            __html: safeProcessor.processSync($auto(result) ?? "").value,
            // __html: $auto(result),
          }}
        />
      </div>
    )
  } catch (e) {
    return <ErrorMessage error={e} />
  }
})

export const SourceEditPanel: React.FC<{
  source: Instance<typeof Source>
}> = observer(({ source, ...props }) => (
  <Panel
    {...props}
    icon={<MdEdit size="1.5rem" />}
    header={<Heading>Edit Source</Heading>}
    contentClass="space-y-8 px-8 py-8 bg-gray-50"
  >
    <div className="space-y-2">
      <div className="flex flex-grow space-x-4">
        <Field
          title="Type"
          className="flex-none w-[12ch]"
          contentClass="flow-col space-y-2"
        >
          <Select
            value={source.kind}
            onChange={(e) => {
              source.update({ kind: e.target.value })
            }}
          >
            <option value="json">JSON</option>
            <option value="html">HTML</option>
            <option value="xml">XML</option>
          </Select>
        </Field>
        <Field
          title="Title"
          className="flex-none w-[35ch]"
          contentClass="flow-col space-y-2"
        >
          <Input
            value={source.title}
            onChange={(e) => {
              source.update({ title: e.target.value })
            }}
          />
        </Field>
        <Field title="Base URL" contentClass="flow-col space-y-2">
          <Input
            value={source.baseURL || ""}
            onChange={(e) => {
              source.update({ baseURL: e.target.value })
            }}
          />
        </Field>
      </div>
      <Field title="Source URLs" contentClass="flow-col space-y-2">
        <AutoTextArea
          value={source.hrefs.join("\n")}
          onChange={(e) => {
            source.update({ hrefs: e.target.value.split("\n") })
          }}
        />
      </Field>
    </div>

    <div className="space-y-2">
      <div className="space-y-2">
        <Field title="Item" contentClass="flow-col space-y-2">
          <Input
            className="font-mono text-sm"
            value={source.selectors.item}
            onChange={(e) => {
              source.selectors.update({ item: e.target.value })
            }}
          />
          <FieldPreview name="item" source={source} />
        </Field>
        <Field
          title="Link"
          className="space-y-1"
          contentClass="flow-col space-y-2"
        >
          <Input
            className="font-mono text-sm"
            value={source.selectors.href}
            onChange={(e) => {
              source.selectors.update({ href: e.target.value })
            }}
          />
          <FieldPreview name="href" source={source} />
        </Field>
        <Field title="Title" contentClass="flow-col space-y-2">
          <Input
            className="font-mono text-sm"
            value={source.selectors.title}
            onChange={(e) => {
              source.selectors.update({ title: e.target.value })
            }}
          />
          <FieldPreview name="title" source={source} />
        </Field>
        <Field title="Description" contentClass="flow-col space-y-2">
          <Input
            className="font-mono text-sm"
            value={source.selectors.description}
            onChange={(e) => {
              source.selectors.update({
                description: e.target.value,
              })
            }}
          />
          <DescriptionPreview source={source} />
        </Field>
        <Field title="Published At" contentClass="flow-col space-y-2">
          <Input
            className="font-mono text-sm"
            value={source.selectors.publishedAt}
            onChange={(e) => {
              source.selectors.update({
                publishedAt: e.target.value,
              })
            }}
          />
          <FieldPreview name="publishedAt" source={source} />
        </Field>
        <Field title="Author" contentClass="flow-col space-y-2">
          <Input
            className="font-mono text-sm"
            value={source.selectors.author}
            onChange={(e) => {
              source.selectors.update({ author: e.target.value })
            }}
          />
          <FieldPreview name="author" source={source} />
        </Field>
        <Field title="Image" contentClass="flow-col space-y-2">
          <Input
            className="font-mono text-sm"
            value={source.selectors.image}
            onChange={(e) => {
              source.selectors.update({ image: e.target.value })
            }}
          />
          <FieldPreview name="image" source={source} />
        </Field>
      </div>
    </div>
  </Panel>
))
