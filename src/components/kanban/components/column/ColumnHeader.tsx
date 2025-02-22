
interface ColumnHeaderProps {
  title: string
  cardCount: number
}

export function ColumnHeader({ title, cardCount }: ColumnHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-secondary/20 pb-2">
      <h2 className="text-lg font-semibold text-secondary">{title}</h2>
      <span className="rounded-full bg-secondary/10 px-2 py-1 text-xs font-medium text-secondary">
        {cardCount}
      </span>
    </div>
  )
}
