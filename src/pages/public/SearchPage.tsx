import { Link } from "react-router-dom";
import { useState } from "react";
import { Search as SearchIcon, MapPin, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchPublic, type Address } from "@/lib/store";
import { useI18n } from "@/lib/i18n";

function SearchPage() {
  const { lang } = useI18n();
  const t = (en: string, fr: string) => (lang === "fr" ? fr : en);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Address[]>([]);
  const [searched, setSearched] = useState(false);

  const store = useStore();

  const run = async (val: string) => {
    setQ(val);
    if (!val.trim()) {
      setSearched(false);
      setResults([]);
      return;
    }
    setSearched(true);
    const res = await searchPublic(val);
    setResults(res);

    // Record analytics for each result found
    res.forEach(a => {
      store.recordEvent("search", a.id, a.userId);
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight text-center">
          {t("Find a public address", "Trouvez une adresse publique")}
        </h1>
        <p className="text-muted-foreground text-center mt-3">
          {t("Type an alias like ChezMarie or a shop name.", "Tapez un alias comme ChezMarie ou un nom de boutique.")}
        </p>

        <div className="mt-8 relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            autoFocus
            value={q}
            onChange={(e) => run(e.target.value)}
            placeholder="@ChezMarie"
            className="h-14 pl-12 text-base rounded-2xl shadow-elegant"
          />
        </div>

        <div className="mt-6">
          {!searched && <Hint t={t} />}
          {searched && results.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              {t("No public address matched.", "Aucune adresse publique trouvée.")}
            </div>
          )}
          <ul className="space-y-2">
            {results.map((a) => (
              <li key={a.id}>
                <Link
                  to={`/a/${a.alias ?? a.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:shadow-elegant transition-all"
                >
                  <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-primary text-primary-foreground"><MapPin className="w-5 h-5" /></span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate flex items-center gap-2">
                      {a.label}
                      {a.isBusiness && <Building2 className="w-3.5 h-3.5 text-accent-foreground" />}
                    </p>
                    <p className="text-xs text-primary truncate">pin-point-zeta.vercel.app/@{a.alias}</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Hint({ t }: { t: (a: string, b: string) => string }) {
  return (
    <div className="text-center text-sm text-muted-foreground py-6">
      {t("Only addresses marked “public” by their owner are searchable.", "Seules les adresses marquées « publiques » apparaissent.")}
    </div>
  );
}

export default SearchPage;