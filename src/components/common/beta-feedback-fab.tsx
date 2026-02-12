"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquareHeart } from "lucide-react";
import { getOrCreateAdminChatRoom } from "@/app/(main)/chat/admin/actions";
import { useToast } from "@/components/ui/toaster";
import { useAuth } from "@/hooks/use-auth";

export function BetaFeedbackFab() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const { toast } = useToast();
    const [isOpening, setIsOpening] = useState(false);

    // Hide on chat detail pages, login, profile views, invite pages
    if (
        pathname.startsWith("/chat/") ||
        pathname === "/login" ||
        pathname.startsWith("/m/") ||
        pathname.startsWith("/invite/") ||
        !user
    ) {
        return null;
    }

    const handleClick = async () => {
        setIsOpening(true);
        try {
            const result = await getOrCreateAdminChatRoom();
            if (result.error) {
                toast({
                    title: "오류",
                    description: result.error,
                    variant: "destructive",
                });
                return;
            }
            if (result.roomId) {
                router.push(`/chat/${result.roomId}`);
            }
        } finally {
            setIsOpening(false);
        }
    };

    return (
        <button
            onClick={handleClick}
            disabled={isOpening}
            className="fixed bottom-24 right-4 z-50 flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-pink-500 py-3 pl-4 pr-5 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 disabled:opacity-60"
            aria-label="베타 피드백"
        >
            {isOpening ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
                <>
                    <MessageSquareHeart className="h-5 w-5" />
                    <span className="text-sm font-semibold">피드백</span>
                </>
            )}
        </button>
    );
}
