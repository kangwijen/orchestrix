import { useEffect, useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import api from '@/lib/api';
import { toast } from 'sonner';

interface AppLogsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  containerId: string | null;
}

export function AppLogs({ open, onOpenChange, containerId }: AppLogsProps) {
  const [logs, setLogs] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const logsRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!containerId || !open) return;

      try {
        setLoading(true);
        const response = await api.get(`/api/containers/logs/${containerId}`);
        setLogs(response.data.logs);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch logs');
        onOpenChange(false);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [containerId, open, onOpenChange]);

  useEffect(() => {
    if (logs && !loading && logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs, loading]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[90vh] w-[95vw] max-w-[1800px] flex-col p-2 sm:w-[90vw] sm:p-4 md:w-[85vw] md:p-6 lg:w-[80vw] xl:w-[75vw]">
        <DialogHeader className="mb-2">
          <DialogTitle>Container Logs</DialogTitle>
          <DialogDescription className="truncate">
            Viewing logs for container: {containerId}
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Loading logs...</p>
            </div>
          ) : (
            <pre
              ref={logsRef}
              className="h-full overflow-y-auto rounded-md bg-slate-950 p-2 font-mono text-xs leading-relaxed whitespace-pre-wrap sm:p-4 sm:text-sm md:p-6 md:text-base"
            >
              {logs || 'No logs available'}
            </pre>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
