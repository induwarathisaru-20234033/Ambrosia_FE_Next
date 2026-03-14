import { Skeleton } from "primereact/skeleton";

export default function ServiceHoursAndRulesSkeleton() {
  return (
    <div className="flex flex-col items-start text-left gap-8 max-w-7xl">
      {/* Title Skeleton */}
      <Skeleton width="30%" height="2.5rem" className="mb-4" />

      <div className="flex flex-col gap-8 w-full">
        {/* Service Logic Card Skeleton */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <Skeleton width="20%" height="1.5rem" className="mb-6" />
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Skeleton width="80%" height="1rem" className="mb-2" />
              <Skeleton width="100%" height="2.5rem" className="mt-2" />
            </div>
            <div>
              <Skeleton width="80%" height="1rem" className="mb-2" />
              <Skeleton width="100%" height="2.5rem" className="mt-2" />
            </div>
            <div>
              <Skeleton width="80%" height="1rem" className="mb-2" />
              <Skeleton width="100%" height="2.5rem" className="mt-2" />
            </div>
          </div>
        </div>

        {/* Opening Hours Card Skeleton */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 w-full">
          <Skeleton width="25%" height="1.5rem" className="mb-6" />

          {/* Day rows skeleton */}
          {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day, dayIndex) => (
            <div
              key={`day-skeleton-${day}`}
              className="mb-6 pb-6 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-4 mb-4">
                <Skeleton width="150px" height="1rem" />
                <Skeleton width="60px" height="1.5rem" borderRadius="full" />
              </div>

              {/* Time slots skeleton for this day */}
              <div className="flex flex-col gap-3 ml-8">
                {['slot1', 'slot2'].map((slot) => (
                  <div key={`slot-${day}-${slot}`} className="flex gap-3 items-end">
                    <div className="flex-1">
                      <Skeleton
                        width="80px"
                        height="0.875rem"
                        className="mb-2"
                      />
                      <Skeleton width="100%" height="2.5rem" />
                    </div>
                    <div className="flex-1">
                      <Skeleton
                        width="80px"
                        height="0.875rem"
                        className="mb-2"
                      />
                      <Skeleton width="100%" height="2.5rem" />
                    </div>
                    <Skeleton width="40px" height="2.5rem" />
                  </div>
                ))}
                <Skeleton width="100px" height="2rem" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Button Skeleton */}
      <div className="flex justify-end gap-4">
        <Skeleton width="200px" height="2.5rem" borderRadius="0.75rem" />
      </div>
    </div>
  );
}
