/** 解析粘贴文本：支持换行 / 逗号 / 顿号 / 分号 / 制表符分隔 */
export function parseNames(text: string): string[] {
  return text
    .split(/[\n\r,，、;；\t]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}
