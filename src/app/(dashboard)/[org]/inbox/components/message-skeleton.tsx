/**
 * Message Skeleton Component
 *
 * Skeleton loader para mensagens no chat
 */

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface MessageSkeletonProps {
  isOutbound?: boolean;
}

export function MessageSkeleton({ isOutbound = false }: MessageSkeletonProps) {
  return (
    <div
      className={cn('flex items-end gap-2', isOutbound && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-3 space-y-2',
          isOutbound ? 'bg-primary/20' : 'bg-muted'
        )}
      >
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  );
}

export function MessageListSkeleton() {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <MessageSkeleton isOutbound={false} />
      <MessageSkeleton isOutbound={true} />
      <MessageSkeleton isOutbound={false} />
    </div>
  );
}
