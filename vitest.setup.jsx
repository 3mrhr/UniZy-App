import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Run cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock general Next.js parts if needed
vi.mock('next/image', () => ({
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />
  },
}))

vi.mock('next/link', () => ({
  default: ({ children, href }) => {
    return <a href={href}>{children}</a>
  },
}))
