import { useEffect, useState } from "react";

export type LinkType = "anonymous" | "alias" | "message";
export type LinkStatus = "active" | "disabled";

export type AddressType = "personal" | "homeaddress" | "business";

export type Address = {
  id: string;
  label: string;          // "Home", "Shop", "Maman Bamenda"
  type: AddressType;
  businessName?: string;
  lat: number;
  lng: number;
  notes?: string;
  photos?: string[];      // Array to store multiple photos (e.g., data URLs or URLs)
  isBusiness?: boolean;
  alias?: string;         // public alias slug, unique-ish
  isPublic?: boolean;
  createdAt: number;
};

export const PLAN_LIMITS = {
  free: { 
    personal: 1, 
    home: 0, 
    business: 0, 
    anonymousLinks: 10, 
    aliasLinks: 0,
    features: [] as string[]
  },
  plus: { 
    personal: 1, 
    home: 0, 
    business: 0, 
    anonymousLinks: 15, 
    aliasLinks: 7,
    features: [] as string[]
  },
  pro: { 
    personal: 2, 
    home: 1, 
    business: 0, 
    anonymousLinks: Infinity, 
    aliasLinks: 20,
    features: ["photos", "notes"]
  },
  business: { 
    personal: 2, 
    home: 1, 
    business: 1, 
    anonymousLinks: Infinity, 
    aliasLinks: Infinity,
    features: ["photos", "notes", "public_profile"]
  },
  premium: { 
    personal: 2, 
    home: 1, 
    business: 1, 
    anonymousLinks: Infinity, 
    aliasLinks: Infinity,
    features: ["photos", "notes", "public_profile", "analytics"]
  },
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

export type Plan = "free" | "plus" | "pro" | "business" | "premium";

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  createdAt: number;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  plan: Plan;
  bio?: string;
  avatar?: string;
  createdAt: number;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  bonusAliasLinks?: number;
};

export type ChatMessage = {
  id: string;
  linkId: string;
  sender: "agent" | "user";
  text: string;
  timestamp: number;
};

const KEYS = {
  addresses: "pp.addresses",
  links: "pp.links",
  saved: "pp.savedLinks",
  onboarded: "pp.onboarded",
  user: "pp.user",
  users: "pp.users", // For mock registration
  messages: "pp.messages",
  notifications: "pp.notifications",
};

function seedNotifications(): Notification[] {
  return [
    {
      id: uid(),
      title: "Welcome to PinPoint!",
      message: "Thank you for joining our platform. Start by dropping your first pin.",
      type: "success",
      read: false,
      createdAt: Date.now() - 1000 * 3600,
    },
    {
      id: uid(),
      title: "New Feature: Message Links",
      message: "You can now chat directly with delivery agents using special message links.",
      type: "info",
      read: true,
      createdAt: Date.now() - 1000 * 3600 * 24,
    }
  ];
}

function seedUsers() {
  const users = read<{ email: string; password: string; user: User }[]>(KEYS.users, []);
  if (users.length === 0) {
    const demoUser: User = {
      id: "demo-user",
      email: "demo@pinpoint.app",
      name: "Demo User",
      role: "user",
      plan: "free",
      createdAt: Date.now(),
    };
    write(KEYS.users, [{ email: "demo@pinpoint.app", password: "password123", user: demoUser }]);
  }
}

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
  seedUsers();
  const [addresses, setAddresses] = useState<Address[]>(() => read<Address[]>(KEYS.addresses, []));
  const [links, setLinks] = useState<ShareLink[]>(() => read<ShareLink[]>(KEYS.links, []));
  const [saved, setSaved] = useState<SavedLink[]>(() => read<SavedLink[]>(KEYS.saved, seedSaved()));
  const [user, setUser] = useState<User | null>(() => read<User | null>(KEYS.user, null));
  const [onboarded, setOnboardedState] = useState<boolean>(() => read<boolean>(KEYS.onboarded, false));
  const [messages, setMessages] = useState<ChatMessage[]>(() => read<ChatMessage[]>(KEYS.messages, []));
  const [notifications, setNotifications] = useState<Notification[]>(() => read<Notification[]>(KEYS.notifications, seedNotifications()));

  useEffect(() => {
    const sync = () => {
      setAddresses(read<Address[]>(KEYS.addresses, []));
      setLinks(read<ShareLink[]>(KEYS.links, []));
      setSaved(read<SavedLink[]>(KEYS.saved, seedSaved()));
      setUser(read<User | null>(KEYS.user, null));
      setOnboardedState(read<boolean>(KEYS.onboarded, false));
      setMessages(read<ChatMessage[]>(KEYS.messages, []));
      setNotifications(read<Notification[]>(KEYS.notifications, seedNotifications()));
    };
    // sync(); // No longer needed as first sync, only for events
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
    user,
    onboarded,
    messages,
    notifications,

    markNotificationAsRead(id: string) {
      const all = read<Notification[]>(KEYS.notifications, seedNotifications()).map(n => 
        n.id === id ? { ...n, read: true } : n
      );
      write(KEYS.notifications, all);
    },

    updateUserPlan(plan: Plan) {
      const currentUser = read<User | null>(KEYS.user, null);
      if (currentUser) {
        const updated = { ...currentUser, plan };
        write(KEYS.user, updated);
        // Also update in users list
        const users = read<{ email: string; password: string; user: User }[]>(KEYS.users, []);
        const updatedUsers = users.map(u => u.user.id === updated.id ? { ...u, user: updated } : u);
        write(KEYS.users, updatedUsers);
      }
    },

    updateProfile(patch: Partial<Pick<User, "name" | "bio" | "avatar">>) {
      const currentUser = read<User | null>(KEYS.user, null);
      if (currentUser) {
        const updated = { ...currentUser, ...patch };
        write(KEYS.user, updated);
        // Also update in users list
        const users = read<{ email: string; password: string; user: User }[]>(KEYS.users, []);
        const updatedUsers = users.map(u => u.user.id === updated.id ? { ...u, user: updated } : u);
        write(KEYS.users, updatedUsers);
      }
    },

    addMessage(msg: Omit<ChatMessage, "id" | "timestamp">) {
      const next: ChatMessage = { ...msg, id: uid(), timestamp: Date.now() };
      const all = [...read<ChatMessage[]>(KEYS.messages, []), next];
      write(KEYS.messages, all);
      return next;
    },

    login(email: string, password: string): { success: boolean; error?: string } {
      const users = read<{ email: string; password: string; user: User }[]>(KEYS.users, []);
      const found = users.find((u) => u.email === email && u.password === password);
      if (found) {
        write(KEYS.user, found.user);
        return { success: true };
      }
      return { success: false, error: "Invalid email or password" };
    },

    register(name: string, email: string, password: string, refCode?: string): { success: boolean; error?: string } {
      const users = read<{ email: string; password: string; user: User }[]>(KEYS.users, []);
      if (users.find((u) => u.email === email)) {
        return { success: false, error: "Email already exists" };
      }

      const myCode = uid().slice(0, 6).toUpperCase();
      let referredBy: string | undefined;

      if (refCode) {
        const referrer = users.find(u => u.user.referralCode === refCode);
        if (referrer) {
          referredBy = referrer.user.id;
          referrer.user.referralCount = (referrer.user.referralCount || 0) + 1;
          referrer.user.bonusAliasLinks = (referrer.user.bonusAliasLinks || 0) + 10;
        }
      }

      const newUser: User = {
        id: uid(),
        email,
        name,
        role: email.endsWith("@admin.com") ? "admin" : "user",
        plan: "free",
        createdAt: Date.now(),
        referralCode: myCode,
        referredBy,
        referralCount: 0,
        bonusAliasLinks: 0
      };
      write(KEYS.users, [...users, { email, password, user: newUser }]);
      write(KEYS.user, newUser);
      return { success: true };
    },

    logout() {
      write(KEYS.user, null);
    },

    addAddress(a: Omit<Address, "id" | "createdAt">): { success: boolean; data?: Address; error?: string } {
      const all = read<Address[]>(KEYS.addresses, []);
      const currentUser = read<User | null>(KEYS.user, null);
      const plan = currentUser?.plan || "free";
      const limits = PLAN_LIMITS[plan];
      
      const type = a.type; // "personal" | "homeaddress" | "business"
      const typeKey = type === "homeaddress" ? "home" : type;
      
      const count = all.filter(addr => addr.type === type).length;
      const limit = (limits as any)[typeKey];

      if (count >= limit) {
        return { success: false, error: `Limit reached: Your plan allows only ${limit} ${type} addresses.` };
      }

      const next: Address = { ...a, id: uid(), createdAt: Date.now() };
      write(KEYS.addresses, [...all, next]);
      return { success: true, data: next };
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

    addLink(l: Omit<ShareLink, "id" | "createdAt">): { success: boolean; data?: ShareLink; error?: string } {
      const all = read<ShareLink[]>(KEYS.links, []);
      const currentUser = read<User | null>(KEYS.user, null);
      const plan = currentUser?.plan || "free";
      const limits = PLAN_LIMITS[plan];
      const bonus = currentUser?.bonusAliasLinks || 0;

      const type = l.type; 
      const lastMonth = Date.now() - 30 * 24 * 3600 * 1000;

      if (type === "anonymous") {
        const count = all.filter(link => link.type === "anonymous" && link.createdAt > lastMonth).length;
        if (count >= limits.anonymousLinks) {
          return { success: false, error: `Limit reached: Your plan allows only ${limits.anonymousLinks} anonymous links per month.` };
        }
      } else if (type === "alias") {
        const count = all.filter(link => link.type === "alias" && link.createdAt > lastMonth).length;
        const totalLimit = limits.aliasLinks + bonus;
        if (count >= totalLimit) {
          return { success: false, error: `Limit reached: Your plan allows only ${totalLimit} alias links per month.` };
        }
      }

      const next: ShareLink = { ...l, id: uid(), createdAt: Date.now() };
      write(KEYS.links, [...all, next]);
      return { success: true, data: next };
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