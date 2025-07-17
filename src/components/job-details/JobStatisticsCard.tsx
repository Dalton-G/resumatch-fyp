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
        <div className="font-dm-serif text-2xl mb-2">Job Statistic</div>
        <div className="flex flex-col gap-2 text-lg">
          <div className="flex justify-between">
            Views: <span>{views}</span>
          </div>
          <div className="flex justify-between">
            Applications: <span>{applications}</span>
          </div>
          <div className="flex justify-between">
            Posted: <span>{new Date(posted).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            Updated: <span>{new Date(updated).toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
