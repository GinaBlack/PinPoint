import { useEffect, useState } from "react";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  onSnapshot, 
  query, 
  where, 
  addDoc, 
  deleteDoc, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  writeBatch
} from "firebase/firestore";
import { db, auth as firebaseAuth } from "./firebase";
import { onAuthStateChanged, type User as FirebaseUser, signOut } from "firebase/auth";

export type LinkType = "anonymous" | "alias" | "message";
export type LinkStatus = "active" | "disabled";

export type AddressType = "personal" | "homeaddress" | "business";

export type Address = {
  id: string;
  userId: string;
  label: string;          
  type: AddressType;
  businessName?: string;
  lat: number;
  lng: number;
  notes?: string;
  photos?: string[];      
  isBusiness?: boolean;
  alias?: string;         
  isPublic?: boolean;
  createdAt: number;
};

export const PLAN_LIMITS = {
  free: { 
    personal: 1, 
    home: 0, 
    business: 0, 
    anonymousLinks: Infinity, 
    aliasLinks: 0,
    features: [] as string[]
  },
  plus: { 
    personal: 1, 
    home: 0, 
    business: 0, 
    anonymousLinks: Infinity, 
    aliasLinks: Infinity,
    features: ["alias"]
  },
  pro: { 
    personal: 1, 
    home: 1, 
    business: 0, 
    anonymousLinks: Infinity, 
    aliasLinks: Infinity,
    features: ["alias", "photos", "notes"]
  },
  business: { 
    personal: 1, 
    home: 1, 
    business: 1, 
    anonymousLinks: Infinity, 
    aliasLinks: Infinity,
    features: ["alias", "photos", "notes", "qr_download", "public_profile"]
  },
  premium: { 
    personal: 1, 
    home: 1, 
    business: 2, 
    anonymousLinks: Infinity, 
    aliasLinks: Infinity,
    features: ["alias", "photos", "notes", "qr_download", "public_profile", "analytics"]
  },
};

export type ShareLink = {
  id: string;
  userId: string;
  addressId: string;
  type: LinkType;
  alias?: string;         
  expiresAt?: number;     
  createdAt: number;
};

export type SavedLink = {
  id: string;
  url: string;
  name: string;           
  type: LinkType;
  receivedAt: number;
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
  bonusAnonymousLinks?: number;
  isVerified: boolean;
  isOnboarded?: boolean;
};

export type ChatMessage = {
  id: string;
  linkId: string;
  sender: "agent" | "user";
  text: string;
  timestamp: number;
};

export type DeliveryStatus = "pending" | "in_transit" | "delivered" | "failed";

export type Delivery = {
  id: string;
  businessId: string;
  driverId: string; // The person who clicked the link
  linkId: string;   // The share link used
  status: DeliveryStatus;
  startTime: number;
  endTime?: number;
  lat?: number;     // Driver location at completion
  lng?: number;     // Driver location at completion
};

export type AnalyticsEvent = {
  id: string;
  type: "search" | "click";
  targetId: string; // addressId or linkId
  ownerId: string;  // businessId
  timestamp: number;
};

/* ---------- Utilities ---------- */
function clean(obj: any) {
  const next = { ...obj };
  Object.keys(next).forEach(key => next[key] === undefined && delete next[key]);
  return next;
}

/* ---------- React hook ---------- */

export function useStore() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [saved, setSaved] = useState<SavedLink[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [onboarded, setOnboardedState] = useState<boolean>(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [planLimits, setPlanLimits] = useState<typeof PLAN_LIMITS>(PLAN_LIMITS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to Plan Limits
    const unsubLimits = onSnapshot(doc(db, "config", "plan_limits"), (snap) => {
      if (snap.exists()) {
        setPlanLimits(snap.data() as typeof PLAN_LIMITS);
      }
    });

    const unsubAuth = onAuthStateChanged(firebaseAuth, (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setAddresses([]);
        setLinks([]);
        setSaved([]);
        setNotifications([]);
        setMessages([]);
        setDeliveries([]);
        setEvents([]);
        setOnboardedState(false);
        setLoading(false);
        return;
      }

      // Listen to User doc
      const unsubUser = onSnapshot(doc(db, "users", fbUser.uid), 
        (snap) => {
          if (snap.exists()) {
            const userData = snap.data() as User;
            setUser(userData);
            setOnboardedState(!!userData.isOnboarded);
          } else {
            setUser(null);
          }
          setLoading(false);
        },
        (err) => {
          console.error("Error listening to user doc:", err);
          setLoading(false);
        }
      );

      // Listen to Addresses
      const qAddresses = query(collection(db, "addresses"), where("userId", "==", fbUser.uid));
      const unsubAddresses = onSnapshot(qAddresses, 
        (snap) => {
          setAddresses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Address)));
        },
        (err) => console.error("Error listening to addresses:", err)
      );

      // Listen to Links
      const qLinks = query(collection(db, "links"), where("userId", "==", fbUser.uid));
      const unsubLinks = onSnapshot(qLinks, 
        (snap) => {
          setLinks(snap.docs.map(d => ({ id: d.id, ...d.data() } as ShareLink)));
        },
        (err) => console.error("Error listening to links:", err)
      );

      // Listen to Saved Links
      const unsubSaved = onSnapshot(collection(db, "users", fbUser.uid, "saved_links"), 
        (snap) => {
          setSaved(snap.docs.map(d => ({ id: d.id, ...d.data() } as SavedLink)).sort((a,b) => b.receivedAt - a.receivedAt));
        },
        (err) => console.error("Error listening to saved links:", err)
      );

      // Listen to Notifications
      const unsubNotifs = onSnapshot(collection(db, "users", fbUser.uid, "notifications"), 
        (snap) => {
          setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification)).sort((a,b) => b.createdAt - a.createdAt));
        },
        (err) => console.error("Error listening to notifications:", err)
      );

      // Listen to Messages
      const unsubMessages = onSnapshot(collection(db, "messages"), 
        (snap) => {
          setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)).sort((a,b) => a.timestamp - b.timestamp));
        },
        (err) => console.error("Error listening to messages:", err)
      );

      // Listen to Deliveries
      const qDeliveries = query(collection(db, "deliveries"), where("businessId", "==", fbUser.uid));
      const unsubDeliveries = onSnapshot(qDeliveries, 
        (snap) => {
          setDeliveries(snap.docs.map(d => ({ id: d.id, ...d.data() } as Delivery)));
        },
        (err) => console.error("Error listening to deliveries:", err)
      );

      // Listen to Analytics Events
      const qEvents = query(collection(db, "analytics_events"), where("ownerId", "==", fbUser.uid));
      const unsubEvents = onSnapshot(qEvents, 
        (snap) => {
          setEvents(snap.docs.map(d => ({ id: d.id, ...d.data() } as AnalyticsEvent)));
        },
        (err) => console.error("Error listening to analytics events:", err)
      );

      return () => {
        unsubUser();
        unsubAddresses();
        unsubLinks();
        unsubSaved();
        unsubNotifs();
        unsubMessages();
        unsubDeliveries();
        unsubEvents();
      };
    });

    return () => {
      unsubLimits();
      unsubAuth();
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
    deliveries,
    events,
    planLimits,
    loading,

    async recordEvent(type: "search" | "click", targetId: string, ownerId: string) {
      await addDoc(collection(db, "analytics_events"), {
        type,
        targetId,
        ownerId,
        timestamp: Date.now()
      });
    },

    async markNotificationAsRead(id: string) {
      if (!user) return;
      await updateDoc(doc(db, "users", user.id, "notifications", id), { read: true });
    },

    async updateUserPlan(plan: Plan) {
      if (!user) return;
      await updateDoc(doc(db, "users", user.id), { plan });
    },

    async updateProfile(patch: Partial<Pick<User, "name" | "bio" | "avatar" | "isOnboarded">>) {
      if (!user) return;
      await updateDoc(doc(db, "users", user.id), clean(patch));
    },

    async addMessage(msg: Omit<ChatMessage, "id" | "timestamp">) {
      const docRef = await addDoc(collection(db, "messages"), {
        ...msg,
        timestamp: Date.now()
      });
      return { id: docRef.id, ...msg, timestamp: Date.now() };
    },

    async logout() {
      await signOut(firebaseAuth);
    },

    async syncUser(email: string, name?: string) {
      const fbUser = firebaseAuth.currentUser;
      if (!fbUser) return null;

      const userDoc = await getDoc(doc(db, "users", fbUser.uid));
      if (!userDoc.exists()) {
        const newUser: User = {
          id: fbUser.uid,
          email,
          name: name || email.split('@')[0],
          role: "user",
          plan: "free",
          createdAt: Date.now(),
          referralCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
          referralCount: 0,
          bonusAnonymousLinks: 0,
          isVerified: true, // If syncing from Firebase, assume verified or handled by Firebase Auth
          isOnboarded: false
        };
        await setDoc(doc(db, "users", fbUser.uid), clean(newUser));
        
        // Seed initial notifications
        await addDoc(collection(db, "users", fbUser.uid, "notifications"), clean({
          title: "Welcome to PinPoint!",
          message: "Thank you for joining our platform. Start by dropping your first pin.",
          type: "success",
          read: false,
          createdAt: Date.now(),
        }));

        return newUser;
      }
      return userDoc.data() as User;
    },

    async addAddress(a: Omit<Address, "id" | "createdAt" | "userId">): Promise<{ success: boolean; data?: Address; error?: string }> {
      if (!user) return { success: false, error: "Not logged in" };
      
      const limits = planLimits[user.plan];
      const typeKey = a.type === "homeaddress" ? "home" : a.type;
      const count = addresses.filter(addr => addr.type === a.type).length;
      const limit = (limits as any)[typeKey];

      if (count >= limit) {
        return { success: false, error: `Limit reached: Your plan allows only ${limit} ${a.type} addresses.` };
      }

      const nextData = { 
        ...a, 
        userId: user.id, 
        createdAt: Date.now() 
      };
      const docRef = await addDoc(collection(db, "addresses"), clean(nextData));
      return { success: true, data: { id: docRef.id, ...nextData } as Address };
    },

    async updateAddress(id: string, patch: Partial<Address>) {
      await updateDoc(doc(db, "addresses", id), clean(patch));
    },

    async deleteAddress(id: string) {
      await deleteDoc(doc(db, "addresses", id));
      // Optionally delete associated links
      const associatedLinks = links.filter(l => l.addressId === id);
      const batch = writeBatch(db);
      associatedLinks.forEach(l => {
        batch.delete(doc(db, "links", l.id));
      });
      await batch.commit();
    },

    async addLink(l: Omit<ShareLink, "id" | "createdAt" | "userId">): Promise<{ success: boolean; data?: ShareLink; error?: string }> {
      if (!user) return { success: false, error: "Not logged in" };

      const limits = planLimits[user.plan];
      const bonus = user.bonusAnonymousLinks || 0;
      const lastMonth = Date.now() - 30 * 24 * 3600 * 1000;

      if (l.type === "anonymous") {
        const count = links.filter(link => link.type === "anonymous" && link.createdAt > lastMonth).length;
        const totalLimit = limits.anonymousLinks + bonus;
        if (count >= totalLimit) {
          return { success: false, error: `Limit reached: Your plan allows only ${totalLimit} anonymous links per month.` };
        }
      } else if (l.type === "alias") {
        const count = links.filter(link => link.type === "alias" && link.createdAt > lastMonth).length;
        if (count >= limits.aliasLinks) {
          return { success: false, error: `Limit reached: Your plan allows only ${limits.aliasLinks} alias links per month.` };
        }
      }

      const nextData = {
        ...l,
        userId: user.id,
        createdAt: Date.now()
      };
      const docRef = await addDoc(collection(db, "links"), clean(nextData));
      return { success: true, data: { id: docRef.id, ...nextData } as ShareLink };
    },

    async deleteLink(id: string) {
      await deleteDoc(doc(db, "links", id));
    },

    async addSaved(s: Omit<SavedLink, "id" | "receivedAt">) {
      if (!user) return;
      const nextData = { ...s, receivedAt: Date.now() };
      const docRef = await addDoc(collection(db, "users", user.id, "saved_links"), nextData);
      return { id: docRef.id, ...nextData };
    },

    async deleteSaved(id: string) {
      if (!user) return;
      await deleteDoc(doc(db, "users", user.id, "saved_links", id));
    },

    async startDelivery(linkId: string, businessId: string): Promise<string> {
      const fbUser = firebaseAuth.currentUser;
      const nextData = {
        businessId,
        linkId,
        driverId: fbUser?.uid || "anonymous_driver",
        status: "in_transit" as DeliveryStatus,
        startTime: Date.now(),
        createdAt: serverTimestamp()
      };
      const docRef = await addDoc(collection(db, "deliveries"), nextData);
      return docRef.id;
    },

    async updateDeliveryStatus(id: string, status: DeliveryStatus, location?: { lat: number; lng: number }) {
      const patch: any = { status };
      if (status === "delivered" || status === "failed") {
        patch.endTime = Date.now();
        if (location) {
          patch.lat = location.lat;
          patch.lng = location.lng;
        }
      }
      await updateDoc(doc(db, "deliveries", id), patch);
    },

    async getBusinessDeliveries(businessId: string): Promise<Delivery[]> {
      const q = query(collection(db, "deliveries"), where("businessId", "==", businessId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Delivery));
    },

    async updatePlanLimits(newLimits: typeof PLAN_LIMITS) {
      if (user?.role !== "admin") throw new Error("Unauthorized");
      await setDoc(doc(db, "config", "plan_limits"), newLimits);
    },

    async adminUpdateUser(userId: string, patch: Partial<User>) {
      if (user?.role !== "admin") throw new Error("Unauthorized");
      await updateDoc(doc(db, "users", userId), clean(patch));
    },

    // Admin helpers
    async getAllUsers(): Promise<User[]> {
      if (user?.role !== "admin") throw new Error("Unauthorized");
      const snap = await getDocs(collection(db, "users"));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as User));
    },

    async getSystemStats() {
      if (user?.role !== "admin") throw new Error("Unauthorized");
      const usersSnap = await getDocs(collection(db, "users"));
      const addressesSnap = await getDocs(collection(db, "addresses"));
      const linksSnap = await getDocs(collection(db, "links"));
      
      const users = usersSnap.docs.map(d => d.data() as User);

      return {
        totalUsers: usersSnap.size,
        totalAddresses: addressesSnap.size,
        totalLinks: linksSnap.size,
        planDistribution: users.reduce((acc, u) => {
          acc[u.plan] = (acc[u.plan] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    },
  };
}

/* ---------- public alias lookup ---------- */
export async function findByAlias(alias: string): Promise<Address | null> {
  const q = query(
    collection(db, "addresses"), 
    where("isPublic", "==", true), 
    where("alias", "==", alias)
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() } as Address;
}

export async function searchPublic(searchQuery: string): Promise<Address[]> {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return [];
  
  const snap = await getDocs(query(collection(db, "addresses"), where("isPublic", "==", true)));
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() } as Address))
    .filter(a => 
      (a.alias && a.alias.toLowerCase().includes(q)) || 
      a.label.toLowerCase().includes(q)
    );
}
