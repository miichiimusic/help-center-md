import { unified } from 'unified'
import parse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import rehypeWrapTables from './rehypeWrapTables'

export async function parseMarkdown(markdownContent: string): Promise<string> {
  const result = await unified()
    .use(parse)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeWrapTables) // custom plugin
    .use(rehypeStringify)
    .process(markdownContent)

  return result.toString()
}