import { useMemo } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export function MathFormula({ tex, label }: { tex: string; label: string }) {
  const markup = useMemo(() => katex.renderToString('\\displaystyle ' + tex, { throwOnError: true, output: 'html', strict: 'error' }), [tex])
  // Только фиксированные формулы приложения; пользовательский ввод сюда не передаётся.
  return <span className="math-formula" role="math" aria-label={label} dangerouslySetInnerHTML={{ __html: markup }} />
}
