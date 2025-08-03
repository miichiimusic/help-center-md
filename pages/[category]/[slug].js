// pages/[category]/[slug].js
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { useEffect } from 'react';
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
    .replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/g,(_, code) =>`<div class="code-block-wrapper"><button class="copy-button">Copy</button><pre><code>${code}</code></pre></div>`)
    .replace(/<a href="(http[^"]+)"([^>]*)>/g, '<a href="$1"$2 target="_blank" rel="noopener noreferrer">')

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

// Copy-to-clipboard script
  useEffect(() => {
    const buttons = document.querySelectorAll('.copy-button');
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const code = btn.nextElementSibling.querySelector('code').innerText;
        navigator.clipboard.writeText(code).then(() => {
          btn.innerText = 'Copied!';
          setTimeout(() => (btn.innerText = 'Copy'), 1500);
        });
      });
    });
  }, []);

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