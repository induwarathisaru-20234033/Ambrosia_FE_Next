import { Skeleton } from "primereact/skeleton";

interface TableSkeletonProps {
  /** Number of body rows to render. Default: 8 */
  rows?: number;
  /** Number of columns to render. Default: 6 */
  columns?: number;
}

export default function TableSkeleton({
  rows = 8,
  columns = 6,
}: Readonly<TableSkeletonProps>) {
  return (
    <div className="w-full overflow-hidden rounded-lg border border-gray-200">
      {/* Header row */}
      <div
        className="grid gap-4 bg-gray-50 px-4 py-3 border-b border-gray-200"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton
            key={`header-col-${colIndex}`}
            height="1rem"
            width="70%"
            className="rounded"
          />
        ))}
      </div>

      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={`skeleton-row-${rowIndex}`}
          className={`grid gap-4 px-4 py-3 border-b border-gray-100 last:border-0 ${
            rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50/50"
          }`}
          style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`body-row-${rowIndex}-col-${colIndex}`}
              height="0.875rem"
              width={colIndex === columns - 1 ? "90%" : "80%"}
              className="rounded"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
