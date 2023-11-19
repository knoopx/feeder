import "uno.css"
import "./global.css"

import { StrictMode } from "react"
import { Provider } from "mobx-react"
import { debounce } from "lodash"
import { onAction, onSnapshot } from "mobx-state-tree"
import { createRoot } from "react-dom/client"

import { Store } from "./models/Store"
import { Shell } from "./app/Shell"

import hotkeys from "hotkeys-js"

hotkeys.filter = () => true // By default hotkeys are not enabled for INPUT SELECT TEXTAREA elements

const store = Store.create(
  localStorage.store ? JSON.parse(localStorage.store) : {},
)

const root = createRoot(document.getElementById("root"))
root.render(
  <StrictMode>
    <Provider store={store}>
      <Shell />
    </Provider>
  </StrictMode>,
)

onSnapshot(
  store,
  debounce((snapshot) => {
    localStorage.store = JSON.stringify(snapshot)
  }, 1000),
)

onAction(store, ({ name, path, args }) => {
  console.log(name, path, args)
})
