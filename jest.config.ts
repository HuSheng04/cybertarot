import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/__tests__'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  // 注意：setupFiles 在 test framework 安装前执行
  // @testing-library/jest-dom v6 需要运行在 framework 之后
  // 测试 DOM 组件时，在各测试文件中直接 import 该库
}

export default createJestConfig(config)
