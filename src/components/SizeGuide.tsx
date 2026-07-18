import { useEffect, useState } from 'react'
import { AnimatePresence, m } from 'framer-motion'
import useLocale from '../hooks/useLocale'

const ROWS = [
  { size: 'S', chest: '96–100', waist: '76–80', hips: '96–100' },
  { size: 'M', chest: '100–104', waist: '80–84', hips: '100–104' },
  { size: 'L', chest: '104–110', waist: '84–90', hips: '104–110' },
  { size: 'XL', chest: '110–116', waist: '90–96', hips: '110–116' },
]

export default function SizeGuide() {
  const { t } = useLocale()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] uppercase tracking-widest text-mist border-b border-mist/40 pb-0.5 hover:text-paper transition-colors cursor-pointer"
      >
        {t('sizeGuide.button')}
      </button>
      <AnimatePresence>
        {open && (
          <m.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setOpen(false)}
            role="dialog" aria-modal="true" aria-label={t('sizeGuide.title')}
          >
            <div className="bg-coal border border-white/15 p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h3 className="font-display uppercase tracking-widest">{t('sizeGuide.title')}</h3>
                <button onClick={() => setOpen(false)} aria-label={t('sizeGuide.close')} className="text-mist hover:text-paper cursor-pointer">✕</button>
              </div>
              <table className="mt-5 w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-mist text-left">
                    <th className="pb-2 font-normal">{t('sizeGuide.size')}</th>
                    <th className="pb-2 font-normal">{t('sizeGuide.chest')}</th>
                    <th className="pb-2 font-normal">{t('sizeGuide.waist')}</th>
                    <th className="pb-2 font-normal">{t('sizeGuide.hips')}</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map(row => (
                    <tr key={row.size} className="border-t border-white/10">
                      <td className="py-2 font-display">{row.size}</td>
                      <td className="py-2 text-paper/80">{row.chest}</td>
                      <td className="py-2 text-paper/80">{row.waist}</td>
                      <td className="py-2 text-paper/80">{row.hips}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
