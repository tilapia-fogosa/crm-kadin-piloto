
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { activities } from "./utils/activityUtils"

interface ActivitySelectorProps {
  selectedActivity: string | null
  onActivitySelect: (activityId: string) => void
}

export function ActivitySelector({ selectedActivity, onActivitySelect }: ActivitySelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="font-semibold mb-2">Nova Atividade</h3>
      <div className="flex flex-col gap-2">
        {activities.map((activity) => (
          <Button
            key={activity.id}
            variant="outline"
            className={cn(
              "justify-start gap-2",
              selectedActivity === activity.id && "bg-primary/10"
            )}
            onClick={() => onActivitySelect(activity.id)}
          >
            <span className="flex items-center justify-center bg-primary text-primary-foreground font-medium rounded min-w-[2rem] h-6 text-xs">
              {activity.badge}
            </span>
            {activity.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
