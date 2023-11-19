import { types as t } from "mobx-state-tree"

const Provider = t.model("Provider", {
  name: t.string,
  patterns: t.array(t.string),
})

export const OEmbeds = t
  .model("OEmbeds", {
    endpoint: t.optional(t.string, "https://noembed.com"),
    // providers: t.array(Provider),
    // cache: t.optional(t.map(t.frozen()), {}),
  })
  .volatile((self) => ({
    providers: [],
    cache: new Map(),
  }))
  .views((self) => ({
    isSupported(url: string) {
      return self.providers.some((provider) => {
        return provider.patterns.some((pattern: string) => {
          return new RegExp(pattern).test(url)
        })
      })
    },
  }))
  .actions((self) => ({
    afterCreate() {
      this.refreshProviders()
    },
    updateCache(url: string, data: any) {
      self.cache.set(url, data)
    },
    async getEmbed(url: string) {
      if (self.cache.has(url)) {
        return self.cache.get(url)
      }
      const res = await fetch(`${self.endpoint}/embed?url=${url}`)
      const json = await res.json()
      if ("error" in json) {
        return null
      }

      this.updateCache(url, json)
      return json
    },
    async refreshProviders() {
      const res = await fetch(`${self.endpoint}/providers`)
      this.update({ providers: await res.json() })
    },
    update(props: Partial<typeof self>) {
      Object.assign(self, props)
    },
  }))
