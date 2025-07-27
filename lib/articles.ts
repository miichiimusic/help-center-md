// lib/articles.ts
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface ArticleMeta {
  title: string
  slug: string
  category: string
  description: string
  date: string
  author: string
  image?: string
  featured?: boolean
}

export function getAllArticles(): ArticleMeta[] {
  const categoriesDir = path.join(process.cwd(), 'articles')
  const categories = fs.readdirSync(categoriesDir)
  const articles: ArticleMeta[] = []

  categories.forEach((category) => {
    const categoryPath = path.join(categoriesDir, category)
    const filenames = fs.readdirSync(categoryPath)

    filenames.forEach((filename) => {
      const filePath = path.join(categoryPath, filename)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(fileContent)

      if (data.title && data.slug && data.category) {
        articles.push({
          title: data.title,
          slug: data.slug,
          category: data.category,
          description: data.description || '',
          date: data.date || '',
          author: data.author || '',
          image: data.image || '',
          featured: data.featured || false,
        })
      }
    })
  })

  return articles
}