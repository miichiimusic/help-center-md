// pages/index.tsx
import React, { useState, useRef, useEffect } from 'react'
import type { NextPage, GetStaticProps } from 'next'
import Link from 'next/link'
import { Search, Folder, Globe, Users, Info, X } from 'lucide-react'
import {getAllArticles, getAllCategories, Article, Category,} from '@/lib/getArticles'

interface HomePageProps {
  articles: Article[]
  categories: Category[]
}

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const articles = getAllArticles()
  const categories = getAllCategories()
  return { props: { articles, categories } }
}

const HomePage: NextPage<HomePageProps> = ({ articles, categories }) => {
  const [query, setQuery] = useState('')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  // Suggestions based on the query
  const suggestions = query
    ? articles.filter((a) =>
        a.title.toLowerCase().includes(query.toLowerCase())
      )
    : []

  // Always show featured articles
  const popular = articles.filter((a) => a.featured)

  const getCategoryIcon = (slug: string) => {
    switch (slug) {
      case 'getting-started':
        return <Folder size={24} />
      case 'public-content':
        return <Globe size={24} />
      case 'team-management':
        return <Users size={24} />
      case 'common-errors':
        return <Info size={24} />
      default:
        return <Folder size={24} />
    }
  }

  const openSearch = () => setShowSearchModal(true)
  const closeSearch = () => {
    setShowSearchModal(false)
    setQuery('')
  }

  // Close on Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!showSearchModal) return
    const onClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeSearch()
      }
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [showSearchModal])

  return (
    <>
      <main className="homepage-container">
        <h1>How can we help you today?</h1>

        {/* Trigger Search Modal */}
        <div className="search-box" onClick={openSearch}>
          <Search size={16} />
          <input placeholder="Search articles…" readOnly />
          <span className="key-hint">⌘K</span>
        </div>

        <p className="contact-text">
          You can also contact us via <a href="#">Discord</a> and <a href="#">X</a>.
        </p>

        <h2 className="section-title">Popular Articles</h2>
        <div className="popular-articles">
          {popular.map((a) => (
            <Link
              href={`/${a.category}/${a.slug}`}
              key={a.slug}
              className="popular-article"
            >
              <span>{a.title}</span>
              <span className="arrow">→</span>
            </Link>
          ))}
        </div>

        <h2 className="section-title">Browse Categories</h2>
        <div className="category-grid">
          {categories.map((cat) => {
   // derive a title-cased display name from the slug
   const displayName = cat.slug
     .split('-')
     .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
     .join(' ')

   return (
     <Link href={`/${cat.slug}`} key={cat.slug} className="category-card">
       <div className="icon-wrapper">{getCategoryIcon(cat.slug)}</div>
       <strong className="category-title">{displayName}</strong>
       <p className="category-description">{cat.description}</p>
     </Link>
   )
 })}
        </div>
      </main>

      {/* Search Modal */}
      {showSearchModal && (
        <div className="search-modal-overlay">
          <div className="search-modal" ref={modalRef}>
            {/* Close button above input */}
            <button
              type="button"
              className="modal-close"
              onClick={closeSearch}
              aria-label="Close search"
            >
              <X size={20} />
            </button>

            <div className="search-input-wrapper">
              <input
                className="search-modal-input"
                placeholder="Type to search…"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <ul className="search-results">
              {suggestions.length > 0 ? (
                suggestions.map((a) => (
                  <li key={a.slug}>
                    <Link href={`/${a.category}/${a.slug}`}>
                      {a.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="no-results">No articles found.</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}

export default HomePage