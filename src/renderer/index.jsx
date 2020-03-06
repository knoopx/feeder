import React from "react"
import { render } from "react-dom"
import { Provider } from "mobx-react"
import { debounce } from "lodash"
import { onSnapshot } from "mobx-state-tree"
import hotkeys from "hotkeys-js"

import Store from "./models/Store"
import App from "./app"

// By default hotkeys are not enabled for INPUT SELECT TEXTAREA elements
hotkeys.filter = () => true

const store = Store.create(
  localStorage.store ? JSON.parse(localStorage.store) : {},
)

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById("root"),
)

onSnapshot(
  store,
  debounce((snapshot) => {
    localStorage.store = JSON.stringify(snapshot)
  }, 1000),
)
