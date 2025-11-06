// pages/[category]/[slug].js
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeRaw from 'rehype-raw'
import rehypeStringify from 'rehype-stringify'
import Link from 'next/link'
import { useEffect } from 'react';
import { useRouter } from 'next/router'

export async function getStaticPaths() {
  const articlesDir = path.join(process.cwd(), 'articles')
  const categories = fs.readdirSync(articlesDir).filter(item => {
    const itemPath = path.join(articlesDir, item)
    return fs.statSync(itemPath).isDirectory() && !item.startsWith('.')
  })

  const paths = categories.flatMap((category) => {
    const files = fs.readdirSync(path.join(articlesDir, category)).filter(filename => 
      filename.endsWith('.md') && !filename.startsWith('.')
    )
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
  const filePath = path.join(process.cwd(), 'articles', category, `${slug}.md`)
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { content, data } = matter(fileContent)

  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeStringify)
    .process(content)

  let htmlContent = processed.toString()

  // Base path for static assets
  const basePath = '/help-center'
  
  htmlContent = htmlContent
    // Fix image paths to include basePath
    .replace(/<img([^>]*?)src="(\/[^"]+)"([^>]*?)>/g, (match, before, src, after) => {
      // Only prefix if it's a local path (starts with /) and doesn't already have basePath
      if (src.startsWith('/') && !src.startsWith(basePath)) {
        return `<img${before}src="${basePath}${src}"${after}>`
      }
      return match
    })
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

    // Email template generator script
    const generateEmailBtn = document.querySelector('.generate-email-btn[data-form-id="past-label"]');
    if (generateEmailBtn) {
      generateEmailBtn.addEventListener('click', () => {
        const labelManagerName = document.getElementById('label-manager-name-past').value.trim();
        const originalWriterName = document.getElementById('original-writer-name-past').value.trim();
        const remixName = document.getElementById('remix-name-past').value.trim();
        const yourName = document.getElementById('your-name-past').value.trim();
        const originalWriterPercentage = document.getElementById('original-writer-percentage-past').value.trim();
        const yourPercentage = document.getElementById('your-percentage-past').value.trim();

        // Validate required fields
        if (!labelManagerName || !originalWriterName || !remixName || !yourName || !originalWriterPercentage || !yourPercentage) {
          alert('Please fill in all fields before generating the email template.');
          return;
        }

        // Generate email template
        const emailTemplate = `Hi ${labelManagerName} and ${originalWriterName}, I hope you're doing well!

I wanted to reach out regarding ${remixName}. I'm currently signed as a writer with WAYU Publishing, who handle the administration of all my compositions, and I wanted to confirm how the composition (publishing) rights will be handled.

Since the remix introduced new creative and compositional elements, I believe it's fair for it to be registered as a separate composition based on the following ownership percentages:

${originalWriterName} (Original Artist): ${originalWriterPercentage}%

${yourName} (Remixer): ${yourPercentage}%

This doesn't affect ownership of the original composition or any master recording rights. It only applies to the publishing side of the remix itself.

I've attached a short amendment to outline this. Please take a look, and if everything looks good, feel free to sign and return it at your convenience.

Thank you, and please let me know if you have any questions!

Best,

${yourName}`;

        // Display the generated email in a code block
        const outputDiv = document.getElementById('email-output-past-label');
        const wrapper = document.createElement('div');
        wrapper.className = 'code-block-wrapper';
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'copy-button';
        copyBtn.textContent = 'Copy';
        
        const pre = document.createElement('pre');
        const code = document.createElement('code');
        code.textContent = emailTemplate;
        pre.appendChild(code);
        
        wrapper.appendChild(copyBtn);
        wrapper.appendChild(pre);
        
        outputDiv.innerHTML = '';
        outputDiv.appendChild(wrapper);
        outputDiv.style.display = 'block';

        // Add copy functionality to the new copy button
        copyBtn.addEventListener('click', () => {
          const codeText = code.textContent;
          navigator.clipboard.writeText(codeText).then(() => {
            copyBtn.textContent = 'Copied!';
            setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
          });
        });
      });
    }
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
            <img src={`/help-center/images/authors/${author.toLowerCase().replace(/\s+/g, '-')}.jpg`} alt={author} />
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