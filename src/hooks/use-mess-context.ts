import { useState, useEffect } from "react";

interface MessContextData {
  messId: string;
  messName: string;
  messCode: string;
  userId: string;
  memberId: string | null;
  userRole: string; // ADMIN | MODERATOR | MEMBER
  isMessAdmin: boolean;
  isMessModerator: boolean;
  canManage: boolean;
}

export function useMessContext() {
  const [messContext, setMessContext] = useState<MessContextData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMessContext() {
      try {
        const res = await fetch("/api/mess/context");
        if (res.ok) {
          const data = await res.json();
          setMessContext(data);
        }
      } catch (error) {
        console.error("Failed to fetch mess context:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMessContext();
  }, []);

  return { messContext, loading };
}
