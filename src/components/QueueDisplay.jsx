import React from "react";
import { Database } from "lucide-react";
import {
  Card,
  Button,
  SectionHeader,
  EmptyState,
  StatusIndicator,
  ProgressBar,
} from "./shared";

/**
 * Display component for ingredient processing queue
 * @param {Array} queue - Array of queue items
 * @param {Object} queueStats - Queue statistics
 * @param {Object} uploadProgress - Upload progress by task ID
 * @param {Function} onRetry - Callback for retry (task)
 * @param {Function} onClearCompleted - Callback to clear completed tasks
 * @param {number} maxSize - Maximum queue size
 */
const QueueDisplay = ({
  queue = [],
  queueStats = {},
  uploadProgress = {},
  onRetry,
  onClearCompleted,
  maxSize = 50,
}) => {
  const statusVariants = {
    error: "error",
    processing: "processing",
    completed: "success",
    pending: "pending",
  };

  const statusColors = {
    error: {
      bg: "bg-rose-50",
      border: "border-rose-200",
      text: "text-rose-600",
    },
    processing: {
      bg: "bg-indigo-50",
      border: "border-indigo-200",
      text: "text-indigo-600",
    },
    completed: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-600",
    },
    pending: {
      bg: "bg-white",
      border: "border-slate-200",
      text: "text-slate-400",
    },
  };

  return (
    <Card padding="none" rounded="2xl">
      <div className="p-4 sm:p-6 border-b border-slate-200">
        <SectionHeader
          title={`Processing Queue (${queue.length}/${maxSize})`}
          size="sm"
          uppercase
          action={
            <div className="flex items-center gap-3">
              {/* Stats */}
              {queue.length > 0 && (
                <div className="hidden sm:flex items-center gap-3 text-xs font-bold">
                  {queueStats.pending > 0 && (
                    <span className="text-slate-500">
                      ⏳ {queueStats.pending}
                    </span>
                  )}
                  {queueStats.processing > 0 && (
                    <span className="text-indigo-600">
                      ⚡ {queueStats.processing}
                    </span>
                  )}
                  {queueStats.completed > 0 && (
                    <span className="text-green-600">
                      ✓ {queueStats.completed}
                    </span>
                  )}
                  {queueStats.error > 0 && (
                    <span className="text-red-600">✕ {queueStats.error}</span>
                  )}
                </div>
              )}
              <Button
                variant="ghost"
                size="xs"
                onClick={onClearCompleted}
                disabled={!queue.some((t) => t.status === "completed")}
              >
                <span className="hidden sm:inline">CLEAR COMPLETED</span>
                <span className="sm:hidden">CLEAR</span>
              </Button>
            </div>
          }
        />
      </div>

      <div className="p-3 sm:p-4 space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
        {queue.length === 0 ? (
          <EmptyState
            icon={Database}
            title="Queue is empty"
            description="Add items to start processing"
          />
        ) : (
          queue.map((task) => {
            const colors = statusColors[task.status];

            return (
              <Card
                key={task.id}
                padding="md"
                rounded="lg"
                className={`${colors.bg} ${colors.border}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <StatusIndicator
                      status={statusVariants[task.status]}
                      size="md"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="font-black text-slate-800 text-xs sm:text-sm truncate">
                        {task.payload.name}
                      </p>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 truncate">
                        {task.payload.priceConfigs.length} price config(s) •{" "}
                        {task.payload.category}
                      </p>

                      {task.status === "processing" &&
                        uploadProgress[task.id] !== undefined && (
                          <ProgressBar
                            progress={uploadProgress[task.id]}
                            variant="secondary"
                            size="sm"
                            className="mt-2"
                          />
                        )}

                      <p
                        className={`text-[9px] sm:text-[10px] font-bold uppercase mt-1 ${colors.text}`}
                      >
                        {task.message}
                      </p>
                    </div>
                  </div>

                  {task.status === "error" && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onRetry(task)}
                      className="shrink-0"
                    >
                      RETRY
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default QueueDisplay;
