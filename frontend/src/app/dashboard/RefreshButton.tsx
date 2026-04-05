"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function RefreshButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    router.refresh();
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <Button variant="secondary" size="sm" onClick={handleRefresh} loading={loading}>
      <RefreshCw className="h-3.5 w-3.5" />
      Refresh
    </Button>
  );
}
