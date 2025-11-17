import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, FileText, Heading, Image } from 'lucide-react'

export default function SortableLeaf({ leaf, isSelected, onSelect }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: leaf.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const getIcon = () => {
    switch (leaf.leafableType) {
      case 'page':
        return <FileText size={16} />
      case 'section':
        return <Heading size={16} />
      case 'picture':
        return <Image size={16} />
      default:
        return null
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-3 rounded border cursor-pointer transition-colors ${
        isSelected ? 'ring-2' : ''
      }`}
      onClick={onSelect}
      {...attributes}
    >
      <div {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical size={16} style={{ color: 'var(--color-subtle-dark)' }} />
      </div>
      <div style={{ color: 'var(--color-subtle-dark)' }}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">{leaf.title}</p>
        <p className="text-xs" style={{ color: 'var(--color-subtle-dark)' }}>
          {leaf.leafableType}
        </p>
      </div>
    </div>
  )
}
