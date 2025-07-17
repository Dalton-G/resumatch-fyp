import { Card, CardContent } from "@/components/ui/card";
import React from "react";

interface JobStatisticsCardProps {
  views: number;
  applications: number;
  posted: string | Date;
  updated: string | Date;
}

export function JobStatisticsCard({
  views,
  applications,
  posted,
  updated,
}: JobStatisticsCardProps) {
  return (
    <Card className="p-0">
      <CardContent className="p-6 flex flex-col gap-2">
        <div className="font-bold text-xl mb-2">Job Statistic</div>
        <div className="flex flex-col gap-1 text-lg">
          <div>
            Views: <span className="font-semibold">{views}</span>
          </div>
          <div>
            Applications: <span className="font-semibold">{applications}</span>
          </div>
          <div>
            Posted:{" "}
            <span className="font-semibold">
              {new Date(posted).toLocaleDateString()}
            </span>
          </div>
          <div>
            Updated:{" "}
            <span className="font-semibold">
              {new Date(updated).toLocaleDateString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
