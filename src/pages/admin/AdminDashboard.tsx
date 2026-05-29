import { useStore, type User, type Plan } from "@/lib/store";
import { 
  Users, 
  MapPin, 
  Link2, 
  ShieldCheck, 
  UserPlus, 
  BarChart3, 
  Search,
  MoreVertical,
  ShieldAlert,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";

export default function AdminDashboard() {
  const store = useStore();
  const { user: currentUser } = store;
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.role === "admin") {
      Promise.all([
        store.getAllUsers(),
        store.getSystemStats()
      ]).then(([allUsers, allStats]) => {
        setUsers(allUsers);
        setStats(allStats);
        setLoading(false);
      });
    }
  }, [currentUser]);

  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/app/overview" replace />;
  }

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading dashboard data...</p>
      </div>
    );
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Total Addresses", value: stats.totalAddresses, icon: MapPin, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Links Created", value: stats.totalLinks, icon: Link2, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Admins", value: users.filter(u => u.role === "admin").length, icon: ShieldCheck, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col gap-1">
        <h1 className="font-display text-4xl font-semibold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Manage users and monitor system performance.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="rounded-3xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-2xl ${card.bg} flex items-center justify-center ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            <p className="font-display text-3xl font-bold mt-1 tabular-nums">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h3 className="text-lg font-semibold">User Management</h3>
            <div className="relative max-w-sm w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search users..." 
                className="pl-9 rounded-xl"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{u.name}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === "admin" ? "default" : "secondary"} className="capitalize">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {u.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.isVerified ? "outline" : "destructive"} className="text-[10px] h-5 px-1.5">
                        {u.isVerified ? "Verified" : "Unverified"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-xl">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            // Mock toggle role
                            store.updateProfile({ ...u, role: u.role === "admin" ? "user" : "admin" } as any);
                          }}>
                            {u.role === "admin" ? "Revoke admin" : "Make admin"}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete user
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* System Health / Analysis */}
        <div className="space-y-8">
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Plan Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(stats.planDistribution).map(([plan, count]) => {
                const percentage = (count / stats.totalUsers) * 100;
                return (
                  <div key={plan} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize font-medium">{plan}</span>
                      <span className="text-muted-foreground">{count} users ({Math.round(percentage)}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-orange-500" />
              Security Overview
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm">Verified Users</span>
                <span className="text-sm font-semibold">{users.filter(u => u.isVerified).length}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm">Anonymous Links active</span>
                <span className="text-sm font-semibold">{stats.totalLinks}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm">Public Addresses</span>
                <span className="text-sm font-semibold">
                  {store.addresses.filter(a => a.isPublic).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
