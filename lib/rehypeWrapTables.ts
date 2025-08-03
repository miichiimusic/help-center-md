import { visit } from 'unist-util-visit'
import type { Plugin } from 'unified'
import type { Element, Root } from 'hast'

const rehypeWrapTables: Plugin<[], Root> = () => {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'table' && parent && Array.isArray(parent.children)) {
        parent.children[index!] = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-scroll'] },
          children: [node],
        }
      }
    })
  }
}

export default rehypeWrapTables