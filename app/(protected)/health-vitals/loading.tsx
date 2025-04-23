import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardContent } from "@/components/ui/card"

export default function HealthVitalsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-9" />
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <Skeleton className="h-3 w-24 mt-1" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-2">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-3 w-32 mt-1" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center">
                        <Skeleton className="h-4 w-16 mr-1" />
                        <Skeleton className="h-2 w-16 rounded-full" />
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Skeleton className="h-7 w-28" />
                        <Skeleton className="h-7 w-28" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
