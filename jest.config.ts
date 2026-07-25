import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  // 全局 setup: jest-dom 匹配器 + IntersectionObserver polyfill(framer-motion whileInView)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
}

export default createJestConfig(config)
