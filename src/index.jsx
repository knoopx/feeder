import hotkeys from "hotkeys-js"
import { Provider } from "mobx-react"
import { debounce } from "lodash"
import { onSnapshot } from "mobx-state-tree"
import { createRoot } from "react-dom/client"

import "./index.css"

import { Store } from "./models/Store"
import { Shell } from "./app/Shell"

// By default hotkeys are not enabled for INPUT SELECT TEXTAREA elements
hotkeys.filter = () => true

const store = Store.create(
  localStorage.store ? JSON.parse(localStorage.store) : {},
)

const root = createRoot(document.getElementById("root"))
root.render(
  <Provider store={store}>
    <Shell />
  </Provider>,
)

onSnapshot(
  store,
  debounce((snapshot) => {
    localStorage.store = JSON.stringify(snapshot)
  }, 1000),
)
