import React from "react"
import { hot } from "react-hot-loader"

import { Container } from "semantic-ui-react"

import { MDXProvider } from "@mdx-js/react"
import Content from "./index.mdx"

import SyntaxHighlighter from "react-syntax-highlighter/dist/esm/default-highlight"

const components = {
  code: SyntaxHighlighter,
}
const App: React.SFC = () => (
  <Container text style={{ paddingTop: 16 }}>
    <MDXProvider components={components}>
      <Content />
    </MDXProvider>
  </Container>
)
export default hot(module)(App)
