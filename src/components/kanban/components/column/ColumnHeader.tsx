
interface ColumnHeaderProps {
  title: string
  cardCount: number
}

export function ColumnHeader({ title, cardCount }: ColumnHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold">{title}</h2>
      <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium">
        {cardCount}
      </span>
    </div>
  )
}
