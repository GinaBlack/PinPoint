import { Bell, Check, Trash2, Info, AlertTriangle, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

export default function NotificationsPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const { notifications, markNotificationAsRead } = useStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "warning": return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case "error": return <XCircle className="w-5 h-5 text-destructive" />;
      default: return <Info className="w-5 h-5 text-primary" />;
    }
  };

  const sortedNotifications = [...notifications].sort((a, b) => b.createdAt - a.createdAt);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-4xl font-semibold">{t("Notifications", "Notifications")}</h1>
        <p className="text-muted-foreground mt-1">{t("Stay updated with your account activity.", "Restez informé de l'activité de votre compte.")}</p>
      </header>

      <div className="rounded-3xl border border-border bg-card overflow-hidden">
        {sortedNotifications.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Bell className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>{t("No notifications yet.", "Aucune notification pour l'instant.")}</p>
          </div>
        ) : (
          <ul className="divide-y divide-border/60">
            {sortedNotifications.map((n) => (
              <li 
                key={n.id} 
                className={`p-5 flex gap-4 transition-colors ${!n.read ? "bg-primary/5" : "hover:bg-muted/30"}`}
                onClick={() => markNotificationAsRead(n.id)}
              >
                <div className="shrink-0 mt-1">
                  {getIcon(n.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className={`font-semibold text-sm ${!n.read ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</h3>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
                </div>
                {!n.read && (
                  <div className="shrink-0 self-center">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
