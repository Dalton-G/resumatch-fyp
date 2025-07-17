import { Card, CardContent } from "@/components/ui/card";
import React from "react";

export function NotFoundJob() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-24">
      <Card className="max-w-lg w-full">
        <CardContent className="p-12 flex flex-col items-center">
          <div className="text-3xl font-bold mb-4 text-red-600">
            Job Not Found
          </div>
          <div className="text-lg text-gray-600 mb-2 text-center">
            The job you are looking for does not exist or has been removed.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
