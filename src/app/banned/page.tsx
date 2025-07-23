"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { pages } from "@/config/directory";
import { signOut } from "next-auth/react";
import { Shield, LogOut, Mail } from "lucide-react";

export default function BannedPage() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: pages.login });
  };

  return (
    <div className="min-h-screen bg-[var(--r-gray)] flex items-center justify-center p-4 font-libertinus">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-normal font-dm-serif text-[var(--r-black)]">
            Account Suspended
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 text-center">
          <div className="space-y-3">
            <p className="text-[var(--r-boldgray)] text-lg">
              Your account has been temporarily suspended due to a violation of
              our terms of service or community guidelines.
            </p>
            <p className="text-md text-[var(--r-boldgray)]">
              If you believe this is an error or would like to appeal this
              decision, please contact our support team.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={handleSignOut}
              className="w-full bg-[var(--r-blue)] hover:bg-[var(--r-blue)]/80"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() =>
                window.open("mailto:support@resumatch.com", "_blank")
              }
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>

          <div className="text-xs text-[var(--r-boldgray)] space-y-1">
            <p>
              For immediate assistance, please include your account email
              address in your support request.
            </p>
            <p>Our team typically responds within 24-48 hours.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
