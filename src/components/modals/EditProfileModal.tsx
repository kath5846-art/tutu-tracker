import { useEffect, useState } from 'react'
import type { Rabbit } from '../../types'

interface Props {
  open: boolean
  rabbit: Rabbit
  onClose: () => void
  onSave: (patch: Partial<Rabbit>) => void
}

export function EditProfileModal({ open, rabbit, onClose, onSave }: Props) {
  const [name, setName] = useState('')
  const [ageLabel, setAgeLabel] = useState('')
  const [breed, setBreed] = useState('')
  const [weight, setWeight] = useState('')
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (open) {
      setName(rabbit.name)
      setAgeLabel(rabbit.ageLabel)
      setBreed(rabbit.breed)
      setWeight(rabbit.weight != null ? String(rabbit.weight) : '')
      setNotes(rabbit.notes)
    }
  }, [open, rabbit])

  if (!open) return null

  function handleSave() {
    if (!name.trim()) return
    const wRaw = weight
    let w: number | null = wRaw === '' ? null : Number(wRaw)
    if (w != null && Number.isNaN(w)) w = null
    onSave({
      name: name.trim(),
      ageLabel: ageLabel.trim(),
      breed: breed.trim(),
      weight: w,
      notes: notes.trim(),
    })
    onClose()
  }

  return (
    <div
      className="modal-backdrop open"
      role="dialog"
      aria-modal="true"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-sheet tall">
        <div className="modal-title">編輯資料</div>
        <div className="form-row">
          <label htmlFor="editName">名字</label>
          <input
            id="editName"
            type="text"
            maxLength={12}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="editAge">年齡／階段</label>
          <input
            id="editAge"
            type="text"
            maxLength={24}
            value={ageLabel}
            onChange={(e) => setAgeLabel(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="editBreed">品種</label>
          <input
            id="editBreed"
            type="text"
            maxLength={24}
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="editWeight">體重 (kg)</label>
          <input
            id="editWeight"
            type="number"
            step="0.1"
            min={0}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
        <div className="form-row">
          <label htmlFor="editNotes">觀察重點／備註</label>
          <textarea
            id="editNotes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <div className="modal-hint">儲存後會更新檔案、今日封面與切換晶片</div>
        <div className="modal-actions">
          <button type="button" className="btn-ghost" onClick={onClose}>
            取消
          </button>
          <button type="button" className="btn-solid" onClick={handleSave}>
            儲存
          </button>
        </div>
      </div>
    </div>
  )
}
