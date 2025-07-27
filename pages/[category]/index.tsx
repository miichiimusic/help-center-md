// pages/[category]/index.tsx
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import Link from 'next/link'
import { GetStaticPaths, GetStaticProps, NextPage } from 'next'
import {
  getAllCategories,
  Category
} from '@/lib/getArticles'

interface ArticleItem {
  title: string
  slug: string
}

interface CategoryPageProps {
  categorySlug: string
  categoryName: string
  categoryDescription: string
  articles: ArticleItem[]
}

export const getStaticPaths: GetStaticPaths = async () => {
  const categories = fs.readdirSync(path.join(process.cwd(), 'articles'))
  return {
    paths: categories.map((slug) => ({ params: { category: slug } })),
    fallback: false,
  }
}

export const getStaticProps: GetStaticProps<CategoryPageProps> = async ({ params }) => {
  const categorySlug = params!.category as string

  // pick up name & description from getAllCategories
  const allCats: Category[] = getAllCategories()
  const meta = allCats.find((c) => c.slug === categorySlug) || {
    name: categorySlug,
    slug: categorySlug,
    description: '',
  }

  const folder = path.join(process.cwd(), 'articles', categorySlug)
  // read all filenames, but skip any that start with an underscore
  const files = fs
    .readdirSync(folder)
    .filter((filename) => !filename.startsWith('_') && filename.endsWith('.md'))

  const articles = files.map((file) => {
    const source = fs.readFileSync(path.join(folder, file), 'utf-8')
    const { data } = matter(source)
    return {
      title: data.title || file.replace('.md', ''),
      slug: file.replace('.md', ''),
    }
  })

  return {
    props: {
      categorySlug,
      categoryName: meta.name,
      categoryDescription: meta.description,
      articles,
    },
  }
}

const CategoryPage: NextPage<CategoryPageProps> = ({
  categorySlug,
  categoryName,
  categoryDescription,
  articles,
}) => {
  return (
    <div className="container category-container">
      {/* Breadcrumbs: Home › Category */}
      <nav className="breadcrumbs">
        <Link href="/">Home</Link> ‹{' '}
        <span>{categoryName}</span>
      </nav>

      <div className="category-grid-container">
        {/* Left column */}
        <div>
          <h1>{categoryName}</h1>
          {categoryDescription && (
            <p className="category-description">{categoryDescription}</p>
          )}
        </div>

        {/* Right column */}
        <div className="articles-card">
          {articles.map((a) => (
            <Link
              href={`/${categorySlug}/${a.slug}`}
              key={a.slug}
              className="article-link"
            >
              <span>{a.title}</span>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CategoryPage