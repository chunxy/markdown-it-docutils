/* eslint-disable jest/valid-title */
import MarkdownIt from "markdown-it"
import docutils_plugin from "../src"
import readFixtures from "./readFixtures"

describe("Parses directives", () => {
  readFixtures("directives").forEach(([name, text, expected]) => {
    const mdit = MarkdownIt().use(docutils_plugin)
    const rendered = mdit.render(text)
    it(name, () => expect(rendered.trim()).toEqual((expected || "").trim()))
  })
  readFixtures("directives.images").forEach(([name, text, expected]) => {
    const mdit = MarkdownIt().use(docutils_plugin)
    const rendered = mdit.render(text)
    it(name, () => expect(rendered.trim()).toEqual((expected || "").trim()))
  })
})
