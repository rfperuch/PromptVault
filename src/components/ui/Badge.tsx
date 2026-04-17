import { cn } from '@/lib/utils';

export function Badge({ className, style, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset',
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </span>
  );
}

export function CategoryBadge({ name, color }: { name: string; color: string }) {
  return (
    <Badge
      style={{
        backgroundColor: `${color}15`,
        color: color,
        borderColor: `${color}30`,
      }}
      className="border ring-0"
    >
      {name}
    </Badge>
  );
}
