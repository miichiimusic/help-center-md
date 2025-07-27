// pages/[category]/[slug].tsx
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { useRouter } from 'next/router'

export async function getStaticPaths() {
  const categories = fs.readdirSync(path.join('articles'))

  const paths = categories.flatMap((category) => {
    const files = fs.readdirSync(path.join('articles', category))
    return files.map((filename) => ({
      params: {
        category,
        slug: filename.replace('.md', ''),
      },
    }))
  })

  return {
    paths,
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const { category, slug } = params
  const filePath = path.join('articles', category, `${slug}.md`)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { content, data } = matter(fileContent)

  const processed = await remark()
    .use(remarkGfm)
    .use(html)
    .process(content)

  let htmlContent = processed.toString()

  htmlContent = htmlContent
    .replace(/<blockquote>\s*<p><strong>Tip:<\/strong>\s*(.*?)<\/p>\s*<\/blockquote>/gs, (_, text) => `<div class="tip-box">${text}</div>`)
    .replace(/<blockquote>\s*<p><strong>Note:<\/strong>\s*(.*?)<\/p>\s*<\/blockquote>/gs, (_, text) => `<div class="note-box">${text}</div>`)
    .replace(/<blockquote>\s*<p><strong>Warning:<\/strong>\s*(.*?)<\/p>\s*<\/blockquote>/gs, (_, text) => `<div class="warning-box">${text}</div>`)
    .replace(/<blockquote>\s*<p><strong>Alert:<\/strong>\s*(.*?)<\/p>\s*<\/blockquote>/gs, (_, text) => `<div class="alert-box">${text}</div>`)
    .replace(/<table>(.*?)<\/table>/gs,(_, tableBody) => `<div class="table-scroll"><table>${tableBody}</table></div>`)

  return {
    props: {
      title: data.title || null,
      description: data.description || '',
      date: data.date || '',
      author: data.author || '',
      content: htmlContent,
      category,
      slug,
    },
  }
}

export default function ArticlePage({ title, description, date, author, content, category, slug }) {
  // Format category name
  const categoryName = category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  return (
    <div className="container">
      {/* Breadcrumbs: Home › Category › Article */}
      <nav className="breadcrumbs">
        <Link href="/">Home</Link> ‹{' '}
        <Link href={`/${category}`} className="breadcrumb-link">{categoryName}</Link> ‹{' '}
        <span>{title}</span>
      </nav>

      {title && (
        <div className="article-header">
          <h1>{title}</h1>
          {description && <p className="description">{description}</p>}

          <div className="author-info">
            <img src={`/images/authors/${author.toLowerCase().replace(/\s+/g, '-')}.jpg`} alt={author} />
            <div className="author-meta">
              <span className="author-name">{author}</span>
              <span className="date">Last Updated {new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: '2-digit'
              })}</span>
            </div>
          </div>
        </div>
      )}
      <div className="markdown-body" dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  )
}