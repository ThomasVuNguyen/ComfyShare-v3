import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableLeaf from './SortableLeaf'

export default function LeavesList({ leaves, selectedLeaf, onSelectLeaf, onReorder }) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = leaves.findIndex(leaf => leaf.id === active.id)
      const newIndex = leaves.findIndex(leaf => leaf.id === over.id)
      const reordered = arrayMove(leaves, oldIndex, newIndex)
      onReorder(reordered)
    }
  }

  if (leaves.length === 0) {
    return (
      <div className="text-center py-8">
        <p style={{ color: 'var(--color-subtle-dark)' }}>
          No content yet. Add a page, section, or picture to get started.
        </p>
      </div>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={leaves.map(l => l.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {leaves.map((leaf) => (
            <SortableLeaf
              key={leaf.id}
              leaf={leaf}
              isSelected={selectedLeaf?.id === leaf.id}
              onSelect={() => onSelectLeaf(leaf)}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
