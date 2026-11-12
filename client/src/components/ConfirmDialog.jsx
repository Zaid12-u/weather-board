import { useEffect, useId, useRef } from 'react'

/**
 * @param {{
 *   open: boolean,
 *   title: string,
 *   confirmLabel?: string,
 *   cancelLabel?: string,
 *   onConfirm: () => void,
 *   onCancel: () => void,
 * }} props
 */
export default function ConfirmDialog({
  open,
  title,
  confirmLabel = 'Remove',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  const titleId = useId()
  const dialogRef = useRef(null)
  const cancelRef = useRef(null)
  const previousFocusRef = useRef(null)
  const onCancelRef = useRef(onCancel)
  const onConfirmRef = useRef(onConfirm)

  useEffect(() => {
    onCancelRef.current = onCancel
    onConfirmRef.current = onConfirm
  })

  useEffect(() => {
    if (!open) return undefined

    previousFocusRef.current = document.activeElement
    const focusTimer = window.setTimeout(() => {
      cancelRef.current?.focus()
    }, 0)

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancelRef.current()
        return
      }

      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = dialogRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      )
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus()
      }
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/60"
        onClick={() => onCancelRef.current()}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative z-10 w-full max-w-sm rounded-lg border border-neutral-700 bg-neutral-900 p-5 shadow-xl"
      >
        <h2 id={titleId} className="text-base font-medium text-neutral-50 sm:text-lg">
          {title}
        </h2>
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={() => onCancelRef.current()}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-neutral-600 bg-neutral-800 px-4 text-sm text-neutral-100 hover:bg-neutral-700"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={() => onConfirmRef.current()}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border border-red-800 bg-red-950 px-4 text-sm text-red-100 hover:bg-red-900"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
