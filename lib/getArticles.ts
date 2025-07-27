import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface Article {
  title: string
  slug: string
  category: string
  description?: string
  date?: string
  author?: string
  image?: string
  tags?: string[]
  featured?: boolean
}

export interface Category {
  name: string
  slug: string
  description?: string
}

const ARTICLES_DIR = path.join(process.cwd(), 'articles')

export function getAllArticles(): Article[] {
  const categories = fs.readdirSync(ARTICLES_DIR)

  const articles: Article[] = []

  for (const category of categories) {
    const categoryPath = path.join(ARTICLES_DIR, category)
    const files = fs.readdirSync(categoryPath)

    for (const file of files) {
      const filePath = path.join(categoryPath, file)
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data } = matter(fileContents)

      articles.push({
        title: data.title || file.replace(/\.md$/, ''),
        slug: file.replace(/\.md$/, ''),
        category,
        description: data.description || '',
        date: data.date || '',
        author: data.author || '',
        image: data.image || '',
        tags: data.tags || [],
        featured: data.featured || false,
      })
    }
  }

  return articles.sort((a, b) => (a.date && b.date ? b.date.localeCompare(a.date) : 0))
}

export function getAllCategories(): Category[] {
  const categories = fs.readdirSync(ARTICLES_DIR)

  return categories.map((category) => {
    const categoryPath = path.join(ARTICLES_DIR, category)
    const sampleFile = fs.readdirSync(categoryPath)[0]
    const filePath = path.join(categoryPath, sampleFile)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data } = matter(fileContents)

    return {
      name: category.charAt(0).toUpperCase() + category.slice(1),
      slug: category,
      description: data.categoryDescription || '',
    }
  })
}