export default function rehypeWrapTables() {
  return (tree) => {
    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName === 'table') {
        const wrapper = {
          type: 'element',
          tagName: 'div',
          properties: { className: ['table-scroll'] },
          children: [node],
        };
        if (parent && Array.isArray(parent.children)) {
          parent.children[index] = wrapper;
        }
      }
    });
  };
}

import { visit } from 'unist-util-visit';