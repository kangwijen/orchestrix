import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface AppInspectProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceId?: string | null;
  data: any;
  title?: string;
  description?: string;
  emptyMessage?: string;
}

export function AppInspect({
  open,
  onOpenChange,
  resourceId,
  data,
  title = 'Resource Inspection',
  description,
  emptyMessage = 'No data available',
}: AppInspectProps) {
  const resolvedDescription =
    description ||
    (resourceId
      ? `Detailed information for resource: ${resourceId}`
      : 'Detailed information about the selected resource');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[95vw] max-w-[1800px] flex-col p-2 sm:w-[90vw] sm:p-4 md:w-[85vw] md:p-6 lg:w-[80vw] xl:w-[75vw]">
        <DialogHeader className="mb-2">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="truncate">
            {resolvedDescription}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <pre className="h-full overflow-y-auto rounded-md bg-slate-950 p-2 font-mono text-xs leading-relaxed whitespace-pre-wrap sm:p-4 sm:text-sm md:p-6">
            {data ? JSON.stringify(data, null, 2) : emptyMessage}
          </pre>
        </div>
      </DialogContent>
    </Dialog>
  );
}

