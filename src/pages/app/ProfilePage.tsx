import { useState } from "react";
import { User, Mail, Shield, Calendar, Edit2, Camera, MapPin, Globe, Moon, Sun, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/lib/store";
import { useI18n } from "@/lib/i18n";
import { useTheme } from "@/lib/theme";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";

export default function ProfilePage() {
  const { lang, setLang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const { user, updateProfile, addresses } = useStore();
  const { theme, toggle: toggleTheme } = useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");

  if (!user) return null;

  const handleSave = () => {
    updateProfile({ name, bio });
    setIsEditing(false);
    toast.success(t("Profile updated successfully", "Profil mis à jour avec succès"));
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const makeMeAdmin = async () => {
    try {
      const { doc, updateDoc } = await import("firebase/firestore");
      const { db } = await import("@/lib/firebase");
      await updateDoc(doc(db, "users", user.id), { role: "admin" });
      toast.success(t("You are now an Admin! Refresh the page.", "Vous êtes maintenant Admin ! Actualisez la page."));
    } catch (err) {
      toast.error("Failed to promote account");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold">{t("My Profile", "Mon Profil")}</h1>
          <p className="text-muted-foreground mt-1">{t("Manage your account details and public identity.", "Gérez les détails de votre compte et votre identité publique.")}</p>
        </div>
        <Button
          variant={isEditing ? "ghost" : "outline"}
          onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
          className="rounded-full"
        >
          {isEditing ? t("Cancel", "Annuler") : <><Edit2 className="w-4 h-4 mr-2" /> {t("Edit Profile", "Modifier")}</>}
        </Button>
      </header>

      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        {/* Profile Card */}
        <aside className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-6 flex flex-col items-center text-center shadow-sm">
            <div className="relative group">
              <Avatar className="w-32 h-32 border-4 border-background shadow-elegant">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="text-3xl bg-primary/10 text-primary">{initials}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="w-6 h-6 text-white" />
                </button>
              )}
            </div>
            
            <h2 className="mt-4 text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            
            <div className="mt-6 w-full pt-6 border-t border-border/60 flex justify-around">
              <div>
                <p className="text-xl font-bold">{addresses.length}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t("Pins", "Épingles")}</p>
              </div>
              <div className="w-px h-8 bg-border/60" />
              <div>
                <p className="text-xl font-bold capitalize">{user.plan}</p>
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">{t("Plan", "Forfait")}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4 space-y-4 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="capitalize">{user.role} Account</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </aside>

        {/* Details Area */}
        <main className="space-y-6">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t("Personal Information", "Informations personnelles")}
            </h3>

            <div className="space-y-6">
              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">{t("Full Name", "Nom complet")}</label>
                {isEditing ? (
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl" />
                ) : (
                  <p className="font-medium text-lg">{user.name}</p>
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-lg">{user.email}</p>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">{t("Verified", "Vérifié")}</span>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium text-muted-foreground">Bio</label>
                {isEditing ? (
                  <Textarea 
                    value={bio} 
                    onChange={(e) => setBio(e.target.value)} 
                    placeholder={t("Tell us a bit about yourself...", "Parlez-nous un peu de vous...")}
                    className="min-h-[120px] rounded-xl"
                  />
                ) : (
                  <p className="text-muted-foreground leading-relaxed">
                    {user.bio || t("No bio added yet.", "Aucune biographie ajoutée.")}
                  </p>
                )}
              </div>

              {isEditing && (
                <div className="pt-4">
                  <Button onClick={handleSave} className="rounded-full px-8 bg-primary shadow-pin">
                    {t("Save Changes", "Enregistrer")}
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Settings Section */}
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              {t("App Settings", "Paramètres de l'application")}
            </h3>
            
            <div className="space-y-4">
              {/* Theme Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/50 shadow-sm">
                    {theme === "dark" ? <Moon className="w-5 h-5 text-blue-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t("Dark Mode", "Mode sombre")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t("Switch between light and dark appearance.", "Basculez entre l'apparence claire et sombre.")}</p>
                  </div>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
              </div>

              {/* Language Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-background flex items-center justify-center border border-border/50 shadow-sm">
                    <Languages className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t("Language", "Langue")}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{lang === "en" ? "English (selected)" : "Français (sélectionné)"}</p>
                  </div>
                </div>
                <div className="flex bg-background border border-border/50 rounded-xl p-1 shadow-sm">
                  <button 
                    onClick={() => setLang("en")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === "en" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLang("fr")}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${lang === "fr" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    FR
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              {t("Public Visibility", "Visibilité publique")}
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              {t("Control how your profile appears to others when they open your shared links.", "Contrôlez comment votre profil apparaît aux autres lorsqu'ils ouvrent vos liens partagés.")}
            </p>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/40">
              <div>
                <p className="font-medium text-sm">{t("Show profile on share pages", "Afficher le profil sur les pages de partage")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("Allows people to see your name and bio.", "Permet aux gens de voir votre nom et votre biographie.")}</p>
              </div>
              <Switch checked={true} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
'ils ouvrent vos liens partagés.")}
            </p>
            <div className="flex items-center justify-between p-4 rounded-2xl bg-muted/50 border border-border/40">
              <div>
                <p className="font-medium text-sm">{t("Show profile on share pages", "Afficher le profil sur les pages de partage")}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t("Allows people to see your name and bio.", "Permet aux gens de voir votre nom et votre biographie.")}</p>
              </div>
              <Switch checked={true} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
