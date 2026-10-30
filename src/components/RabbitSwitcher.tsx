import { MAX_RABBITS } from '../lib/constants'
import type { Rabbit } from '../types'

interface Props {
  rabbits: Rabbit[]
  activeId: string | null
  onSelect: (id: string) => void
  showAdd?: boolean
  onAdd?: () => void
  onLongPressRename?: (id: string) => void
  className?: string
  id?: string
}

export function RabbitSwitcher({
  rabbits,
  activeId,
  onSelect,
  showAdd,
  onAdd,
  onLongPressRename,
  className = '',
  id,
}: Props) {
  const full = rabbits.length >= MAX_RABBITS

  return (
    <div className={'rabbit-switcher ' + className} id={id} aria-label="切換兔子">
      {rabbits.map((r) => (
        <button
          key={r.id}
          type="button"
          className={'rabbit-chip' + (r.id === activeId ? ' active' : '')}
          onClick={(e) => {
            e.stopPropagation()
            onSelect(r.id)
          }}
          onContextMenu={(e) => {
            e.preventDefault()
            onSelect(r.id)
            onLongPressRename?.(r.id)
          }}
        >
          <span className="rabbit-chip-avatar">
            {r.avatar ? <img src={r.avatar} alt="" /> : '🐰'}
          </span>
          <span className="rabbit-chip-name">{r.name}</span>
        </button>
      ))}
      {showAdd && (
        <>
          <button
            type="button"
            className="rabbit-add-btn"
            disabled={full}
            title={full ? '已達上限 5 隻' : '新增兔子'}
            onClick={onAdd}
          >
            ＋
          </button>
          {full && <div className="rabbit-limit-note">已達上限 5 隻</div>}
        </>
      )}
    </div>
  )
}
