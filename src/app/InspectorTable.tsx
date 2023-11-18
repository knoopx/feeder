import { Inspector } from "react-inspector";

const props = [
  "href",
  "title",
  "description",
  "author",
  "publishedAt",
  "image",
]

const InspectorTable: React.FC<{
  activeSource: unknown;
  props: string[];
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
);
