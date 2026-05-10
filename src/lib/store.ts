import { useEffect, useState } from "react";

export type LinkType = "anonymous" | "alias" | "message";
export type LinkStatus = "active" | "disabled";

export type Address = {
  id: string;
  label: string;          // "Home", "Shop", "Maman Bamenda"
  lat: number;
  lng: number;
  notes?: string;
  photo?: string;         // data URL
  isBusiness?: boolean;
  alias?: string;         // public alias slug, unique-ish
  isPublic?: boolean;
  createdAt: number;
};

export type ShareLink = {
  id: string;
  addressId: string;
  type: LinkType;
  alias?: string;         // mirrors address alias when type=alias
  expiresAt?: number;     // anonymous: 24h
  createdAt: number;
};

export type SavedLink = {
  id: string;
  url: string;
  name: string;           // sender label or "Anonymous"
  type: LinkType;
  receivedAt: number;
  // resolved snapshot (optional)
  addressSnapshot?: { lat: number; lng: number; label: string };
  status: LinkStatus;
  disabledReason?: string;
};

const KEYS = {
  addresses: "pp.addresses",
  links: "pp.links",
  saved: "pp.savedLinks",
  onboarded: "pp.onboarded",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new CustomEvent("pp:store", { detail: { key } }));
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}

/* ---------- React hook ---------- */

export function useStore() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [saved, setSaved] = useState<SavedLink[]>([]);

  useEffect(() => {
    const sync = () => {
      setAddresses(read<Address[]>(KEYS.addresses, []));
      setLinks(read<ShareLink[]>(KEYS.links, []));
      setSaved(read<SavedLink[]>(KEYS.saved, seedSaved()));
    };
    sync();
    const onStore = () => sync();
    window.addEventListener("pp:store", onStore);
    window.addEventListener("storage", onStore);
    return () => {
      window.removeEventListener("pp:store", onStore);
      window.removeEventListener("storage", onStore);
    };
  }, []);

  return {
    addresses,
    links,
    saved,

    addAddress(a: Omit<Address, "id" | "createdAt">) {
      const next: Address = { ...a, id: uid(), createdAt: Date.now() };
      const all = [...read<Address[]>(KEYS.addresses, []), next];
      write(KEYS.addresses, all);
      return next;
    },
    updateAddress(id: string, patch: Partial<Address>) {
      const all = read<Address[]>(KEYS.addresses, []).map((a) =>
        a.id === id ? { ...a, ...patch } : a
      );
      write(KEYS.addresses, all);
    },
    deleteAddress(id: string) {
      write(
        KEYS.addresses,
        read<Address[]>(KEYS.addresses, []).filter((a) => a.id !== id),
      );
      // disable any links referencing it
      const updatedLinks = read<ShareLink[]>(KEYS.links, []).filter(
        (l) => l.addressId !== id,
      );
      write(KEYS.links, updatedLinks);
    },

    addLink(l: Omit<ShareLink, "id" | "createdAt">) {
      const next: ShareLink = { ...l, id: uid(), createdAt: Date.now() };
      const all = [...read<ShareLink[]>(KEYS.links, []), next];
      write(KEYS.links, all);
      return next;
    },
    deleteLink(id: string) {
      write(
        KEYS.links,
        read<ShareLink[]>(KEYS.links, []).filter((l) => l.id !== id),
      );
    },

    addSaved(s: Omit<SavedLink, "id" | "receivedAt">) {
      const next: SavedLink = { ...s, id: uid(), receivedAt: Date.now() };
      const all = [next, ...read<SavedLink[]>(KEYS.saved, [])];
      write(KEYS.saved, all);
      return next;
    },
    refreshSaved() {
      // re-evaluate status: anonymous expired -> disabled
      const all = read<SavedLink[]>(KEYS.saved, []).map((s) => {
        if (s.type === "anonymous" && s.receivedAt + 24 * 3600 * 1000 < Date.now()) {
          return { ...s, status: "disabled" as const, disabledReason: "Expired (24h)" };
        }
        return s;
      });
      write(KEYS.saved, all);
    },
    deleteSaved(id: string) {
      write(
        KEYS.saved,
        read<SavedLink[]>(KEYS.saved, []).filter((s) => s.id !== id),
      );
    },
  };
}

/* ---------- public alias lookup ---------- */

export function findByAlias(alias: string): Address | null {
  const all = read<Address[]>(KEYS.addresses, []);
  const a = all.find(
    (x) => x.isPublic && x.alias && x.alias.toLowerCase() === alias.toLowerCase(),
  );
  return a ?? null;
}

export function searchPublic(query: string): Address[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return read<Address[]>(KEYS.addresses, []).filter(
    (a) =>
      a.isPublic &&
      ((a.alias && a.alias.toLowerCase().includes(q)) ||
        a.label.toLowerCase().includes(q)),
  );
}

export function isOnboarded() {
  return read<boolean>(KEYS.onboarded, false);
}
export function setOnboarded(v: boolean) {
  write(KEYS.onboarded, v);
}

/* ---------- demo seed for Saved Links ---------- */

function seedSaved(): SavedLink[] {
  const now = Date.now();
  return [
    {
      id: uid(),
      url: "pinpoint.app/@ChezMarie",
      name: "Marie N.",
      type: "alias",
      receivedAt: now - 1000 * 3600 * 6,
      status: "active",
      addressSnapshot: { lat: 4.0511, lng: 9.7679, label: "Chez Marie, Douala" },
    },
    {
      id: uid(),
      url: "pinpoint.app/p/3kx91",
      name: "Anonymous",
      type: "anonymous",
      receivedAt: now - 1000 * 3600 * 30,
      status: "disabled",
      disabledReason: "Expired (24h)",
    },
    {
      id: uid(),
      url: "pinpoint.app/m/family",
      name: "Maman — Bamenda",
      type: "message",
      receivedAt: now - 1000 * 3600 * 24 * 8,
      status: "active",
      addressSnapshot: { lat: 5.9631, lng: 10.1591, label: "Bamenda — family house" },
    },
  ];
}