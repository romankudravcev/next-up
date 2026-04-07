"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Wheel from "../components/Wheel";
import CreateActivityDialog from "../components/CreateActivityDialog";
import Confetti from "../components/Confetti";
import QuestionDialog from "../components/QuestionDialog";
import WheelDialog from "../components/WheelDialog";
import AnimatedTitle from "../components/AnimatedTitle";
import { Button } from "@/components/ui/button";
import { Trash, Eye, LogOut, Share2 } from "lucide-react";

type Activity = {
  id: string;
  name: string;
  location: string;
  weather: string;
  duration: string;
  type: string[];
  hidden?: boolean;
};

export default function Home() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [filtered, setFiltered] = useState<Activity[] | null>(null);
  const [wheelDialogOpen, setWheelDialogOpen] = useState(false);
  const [user, setUser] = useState<any | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteLoading, setInviteLoading] = useState(false);

  async function fetchUser() {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data);
    } catch (e) {
      setUser(null);
    }
  }

  async function load() {
    try {
      const res = await fetch("/api/activities");
      const data = await res.json();
      setActivities(data);
    } catch (e) {
      console.error(e);
    }
  }

  useEffect(() => {
    fetchUser();
    load();
  }, []);

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email and password required");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
      if (!res.ok) {
        toast.error('Invalid email or password');
        setLoginLoading(false);
        return;
      }
      const j = await res.json();
      setUser(j.user);
      setShowLogin(false);
      setEmail("");
      setPassword("");
      await load();
      toast.success(`Welcome back, ${j.user.name || j.user.email}!`);
    } catch (e) {
      console.error(e);
      toast.error('Login error');
    } finally {
      setLoginLoading(false);
    }
  }

  function LogoutBtn() {
    return (
      <Button onClick={doLogout} className="ml-2">Logout</Button>
    );
  }

  async function doLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setActivities([]);
      toast.success('Logged out successfully');
    } catch (e) {
      console.error(e);
      toast.error('Logout failed');
    }
  }

  async function doInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) {
      toast.error('Email required');
      return;
    }
    setInviteLoading(true);
    try {
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, invitedById: user.id }),
      });
      if (!res.ok) {
        toast.error('Failed to create invite');
        setInviteLoading(false);
        return;
      }
      const { token } = await res.json();
      const inviteUrl = `${window.location.origin}?invite=${token}`;
      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invite link copied to clipboard!');
      setInviteEmail("");
      setShowInvite(false);
    } catch (e) {
      console.error(e);
      toast.error('Error creating invite');
    } finally {
      setInviteLoading(false);
    }
  }

  async function deleteActivity(id: string) {
    try {
      const res = await fetch('/api/activities', {
        method: 'DELETE',
        body: JSON.stringify({ id }),
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        toast.error('Failed to delete activity');
        return;
      }
      await load();
      toast.success('Activity deleted');
    } catch (e) {
      console.error(e);
      toast.error('Delete error');
    }
  }

  async function onFinish(a: Activity) {
    if (a.hidden) {
      try {
        await fetch("/api/activities", {
          method: "PATCH",
          body: JSON.stringify({ id: a.id, hidden: false }),
          headers: { "Content-Type": "application/json" },
        });
        await load();
      } catch (e) {
        console.error(e);
      }
    }
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
    toast.success(`You picked: ${a.name}!`, { duration: 5000 });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {user ? (
          <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <AnimatedTitle text={`Willkommen ${user.name ?? user.email.split("@")[0]}`} />
              <div className="flex gap-2">
                {user.role === "admin" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowInvite(true)}
                    className="gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Invite
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={doLogout} className="gap-2">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center px-4">
              <div className="flex gap-3 flex-wrap justify-center">
                <Button onClick={() => setDialogOpen(true)} size="lg">
                  Was machen wir heute
                </Button>
                <CreateActivityDialog
                  onCreated={() => {
                    load();
                    toast.success("Activity created!");
                  }}
                />
              </div>

              <div className="w-full mt-8">
                <h4 className="text-lg font-semibold mb-4">
                  Aktivitäten ({activities.length})
                </h4>
                <ul className="space-y-3 max-h-96 overflow-auto pr-2">
                  {activities.length === 0 ? (
                    <li className="text-center text-muted-foreground py-6">
                      Keine Aktivitäten verfügbar
                    </li>
                  ) : (
                    activities.map((a) => (
                      <li
                        key={a.id}
                        className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-4 rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex-1">
                          <div className="font-semibold text-sm">
                            {a.hidden ? "❓ Mystery Activity" : a.name}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {a.location} • {a.duration} •{" "}
                            {Array.isArray(a.type) ? a.type.join(", ") : a.type}
                          </div>
                        </div>
                        <div className="flex gap-1 items-center">
                          <Button
                            aria-label="Preview"
                            variant="ghost"
                            size="sm"
                            onClick={() => toast.info(a.name)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            aria-label="Delete"
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => deleteActivity(a.id)}
                          >
                            <Trash className="w-4 h-4" />
                          </Button>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 dark:bg-slate-900/90 rounded-2xl shadow-2xl p-8 text-center">
            <AnimatedTitle text="Next Up" />
            <p className="mt-4 text-lg text-muted-foreground">
              Find cool new activities with your friends!
            </p>
            <div className="mt-8 flex justify-center">
              <Button size="lg" onClick={() => setShowLogin(true)}>
                Login
              </Button>
            </div>
          </div>
        )}

        <Confetti play={showConfetti} />

        {/* Login Modal */}
        {showLogin && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8">
              <h2 className="text-2xl font-bold mb-6">Login</h2>
              <form onSubmit={doLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowLogin(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loginLoading}>
                    {loginLoading ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Invite Modal */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md p-8">
              <h2 className="text-2xl font-bold mb-6">Invite User</h2>
              <form onSubmit={doInvite} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Email to invite
                  </label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email to invite"
                    className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowInvite(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={inviteLoading}>
                    {inviteLoading ? "Creating..." : "Create Invite"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <QuestionDialog
          open={dialogOpen}
          activities={activities}
          onClose={() => setDialogOpen(false)}
          onComplete={(list) => {
            setFiltered(list);
            setWheelDialogOpen(true);
            setDialogOpen(false);
          }}
        />

        <WheelDialog
          open={wheelDialogOpen}
          onOpenChange={(v) => setWheelDialogOpen(v)}
          activities={filtered ?? activities}
          onFinish={onFinish}
        />
      </div>
    </div>
  );
}
