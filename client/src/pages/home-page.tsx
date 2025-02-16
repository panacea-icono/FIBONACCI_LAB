import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { MessageSquare, BarChart2, LogOut } from "lucide-react";
import { StatsCard } from "@/components/dashboard/stats-card";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold">Social Media Assistant</h1>
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              Welcome, {user?.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Messages"
            value="128"
            description="Messages analyzed this month"
            icon={MessageSquare}
          />
          <StatsCard
            title="Average Sentiment"
            value="4.2"
            description="Out of 5 stars"
            icon={BarChart2}
          />
          <StatsCard
            title="Improvement Rate"
            value="67%"
            description="Based on AI suggestions"
            icon={BarChart2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              <Link href="/chat">
                <Button className="w-full" size="lg">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Start New Chat
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
