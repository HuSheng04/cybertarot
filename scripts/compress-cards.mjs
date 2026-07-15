/**
 * CyberTarot — 卡牌图片批量压缩脚本
 *
 * 扫描 public/assets/cards/ 下所有 .png，输出为 .webp
 * - 普通卡牌：major_00_fool.png → major_00.webp（提取前缀）
 * - 牌背：card_back.png → card_back.webp
 *
 * 分辨率：512×700px | 自适应质量（保证 ≤248KB）
 */

import { readdirSync, statSync, existsSync, unlinkSync, renameSync } from 'fs'
import { join, parse } from 'path'
import sharp from 'sharp'

const CARDS_DIR = join(process.cwd(), 'public', 'assets', 'cards')
const WIDTH = 512
const HEIGHT = 700
const MAX_BYTES = 248 * 1024
const START_QUALITY = 80
const MIN_QUALITY = 25

function extractIdPrefix(filename) {
  if (filename === 'card_back.png') return 'card_back'
  const match = filename.match(/^(\w+_\d+)_.+\.png$/)
  if (match) return match[1]
  return parse(filename).name
}

async function compressWithBudget(inputPath, outputPath, label) {
  let q = START_QUALITY

  while (q >= MIN_QUALITY) {
    const tmp = outputPath + '.tmp'
    try { unlinkSync(tmp) } catch {}
    await sharp(inputPath)
      .resize(WIDTH, HEIGHT, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: q })
      .toFile(tmp)

    const bytes = statSync(tmp).size
    if (bytes <= MAX_BYTES) {
      renameSync(tmp, outputPath)
      console.log(`  ✓ ${label} → ${Math.round(bytes / 1024)}KB${q < START_QUALITY ? ` (q${q})` : ''}`)
      return
    }
    unlinkSync(tmp)
    q -= 5
  }

  // 兜底：最低质量
  await sharp(inputPath)
    .resize(WIDTH, HEIGHT, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: MIN_QUALITY })
    .toFile(outputPath)
  const bytes = statSync(outputPath).size
  const over = Math.max(0, Math.round((bytes - MAX_BYTES) / 1024))
  console.log(`  ⚠ ${label} → ${Math.round(bytes / 1024)}KB (q${MIN_QUALITY}${over ? `, 超限 ${over}KB` : ''})`)
}

async function main() {
  if (!existsSync(CARDS_DIR)) {
    console.error(`[compress-cards] 错误: 目录不存在 — ${CARDS_DIR}`)
    process.exit(1)
  }

  const files = readdirSync(CARDS_DIR).filter((f) => f.endsWith('.png'))
  console.log(`[compress-cards] 发现 ${files.length} 张 PNG，开始压缩 (目标 ≤${Math.round(MAX_BYTES / 1024)}KB)...`)

  let success = 0, skipped = 0

  for (const file of files) {
    const inputPath = join(CARDS_DIR, file)
    const idPrefix = extractIdPrefix(file)
    const outputName = `${idPrefix}.webp`
    const outputPath = join(CARDS_DIR, outputName)

    if (existsSync(outputPath)) {
      const inMtime = statSync(inputPath).mtimeMs
      const outMtime = statSync(outputPath).mtimeMs
      if (outMtime >= inMtime) { skipped++; continue }
    }

    try {
      await compressWithBudget(inputPath, outputPath, `${file} → ${outputName}`)
      success++
    } catch (err) {
      console.error(`  ✗ ${file} 压缩失败:`, err.message)
    }
  }

  const allWebp = readdirSync(CARDS_DIR).filter((f) => f.endsWith('.webp'))
  let overCount = 0, totalBytes = 0
  for (const w of allWebp) {
    const st = statSync(join(CARDS_DIR, w))
    totalBytes += st.size
    if (st.size > MAX_BYTES) {
      overCount++
      console.error(`  ✗ ${w}: ${Math.round(st.size / 1024)}KB > ${Math.round(MAX_BYTES / 1024)}KB`)
    }
  }
  const avgKb = Math.round(totalBytes / allWebp.length / 1024)

  console.log(`\n[compress-cards] 完成！新增 ${success} 张，跳过 ${skipped} 张`)
  console.log(`[compress-cards] 共 ${allWebp.length} 个 .webp，平均 ${avgKb}KB，超限 ${overCount} 张`)
  if (overCount > 0) process.exit(1)
}

main().catch((err) => {
  console.error('[compress-cards] 脚本异常:', err)
  process.exit(1)
})
