import { pipeline as tranformers, Pipeline } from "@xenova/transformers"

function capitalize(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

let pipeline: Pipeline
type Output = {
  entity: string
  word: string
}

const punctuationModel = "ldenoue/distilbert-base-re-punctuate"
export async function repunctuate(text: string) {
  if (!pipeline) {
    pipeline = await tranformers("token-classification", punctuationModel, {
      quantized: true,
    })
  }

  let outputs = await pipeline(text, {
    ignore_labels: [],
  })

  const flattened: Output[] = []
  outputs.forEach((output: Output, i: number) => {
    if (flattened.length && output.word.startsWith("##")) {
      flattened[flattened.length - 1].word += output.word.slice(2)
      // } else if (output.entity.endsWith(".") && outputs[i + 1].word === ".") {
    } else if (output.word == "." && outputs[i - 1].entity.endsWith(".")) {
    } else if (output.word == "," && outputs[i - 1].entity.endsWith(",")) {
    } else {
      flattened.push(output)
    }
  })

  return flattened.reduce((acc, { entity, word }, i) => {
    let buffer = ""
    if (entity.startsWith("Upper")) {
      buffer = capitalize(word)
    } else if (entity.startsWith("lower")) {
      buffer = word.toLowerCase()
    } else if (entity.startsWith("UPPER")) {
      buffer = word.toLocaleUpperCase()
    }

    if (entity.endsWith(".")) {
      buffer += ". "
    } else if (entity.endsWith(",")) {
      buffer += ", "
    } else if (entity.endsWith("_")) {
      buffer += " "
    }

    return acc + buffer
  }, "")
}
