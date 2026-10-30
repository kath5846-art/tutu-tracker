import { useEffect, useRef } from 'react'
import { nextDefaultName } from '../../lib/trackerUtils'
import type { Rabbit } from '../../types'

interface Props {
  open: boolean
  mode: 'add' | 'rename'
  rabbits: Rabbit[]
  initialName: string
  onClose: () => void
  onConfirm: (name: string) => void
}

export function NameModal({ open, mode, rabbits, initialName, onClose, onConfirm }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 50)
    }
  }, [open, initialName])

  if (!open) return null

  return (
    <div className="modal-backdrop open" role="dialog" aria-modal="true" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-title">{mode === 'add' ? '新增兔子' : '改名'}</div>
        <label htmlFor="nameModalInput">名字</label>
        <input
          ref={inputRef}
          type="text"
          id="nameModalInput"
          maxLength={12}
          defaultValue={initialName}
          placeholder="例如：小白"
          onKeyDown={(e) => {
            if (e.key === 'Enter') onConfirm(inputRef.current?.value ?? '')
            if (e.key === 'Escape') onClose()
          }}
        />
        <div className="modal-hint">
          {mode === 'add'
            ? `目前 ${rabbits.length}／5 隻 · 預設名「${nextDefaultName(rabbits)}」`
            : '長按晶片也可改名'}
        </div>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            取消
          </button>
          <button
            type="button"
            className="btn-solid"
            onClick={() => onConfirm(inputRef.current?.value ?? '')}
          >
            確定
          </button>
        </div>
      </div>
    </div>
  )
}
