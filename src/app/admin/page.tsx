"use client";

import React, { useEffect, useState } from "react";
import { getFirebaseDb, getFirebaseAuth } from "@/lib/firebase/firebase";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  setDoc,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  where,
  orderBy,
} from "firebase/firestore";
import { sendStatusUpdateEmail } from "@/app/actions/emailActions";
import {
  grantAdminAccessByEmail,
  revokeAdminAccessByEmail,
} from "@/app/actions/adminActions";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";

interface DeveloperProfile {
  id: string;
  name: string;
  category: string;
  status: string;
  contacts: {
    email: string;
  };
  createdAt: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DeveloperProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [currentUserInfo, setCurrentUserInfo] = useState<{
    uid: string;
    email: string;
  } | null>(null);

  // Search and filter state
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [lastVisibleDocs, setLastVisibleDocs] = useState<
    QueryDocumentSnapshot<DocumentData, DocumentData>[]
  >([]);
  const [isLastPage, setIsLastPage] = useState(false);

  // Admin Management State
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [adminMgmtMessage, setAdminMgmtMessage] = useState("");
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [adminList, setAdminList] = useState<
    { uid: string; email: string; role: string }[]
  >([]);
  const [loadingAdmins, setLoadingAdmins] = useState(false);

  const fetchProfiles = async (page: number, reset: boolean = false) => {
    setLoading(true);
    setFetchError("");
    try {
      const db = getFirebaseDb();
      let q = query(collection(db, "users"));

      if (categoryFilter) {
        q = query(q, where("category", "==", categoryFilter));
      }
      if (statusFilter) {
        q = query(q, where("status", "==", statusFilter));
      }

      // Order is removed to prevent excluding documents missing createdAt and avoiding composite index requirements

      if (!reset && page > 1 && lastVisibleDocs[page - 2]) {
        q = query(q, startAfter(lastVisibleDocs[page - 2]));
      }

      q = query(q, limit(itemsPerPage));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        if (reset) setProfiles([]);
        setIsLastPage(true);
        setLoading(false);
        return;
      }

      setIsLastPage(querySnapshot.docs.length < itemsPerPage);

      if (reset) {
        setLastVisibleDocs([querySnapshot.docs[querySnapshot.docs.length - 1]]);
      } else {
        const newLastVisibleDocs = [...lastVisibleDocs];
        newLastVisibleDocs[page - 1] =
          querySnapshot.docs[querySnapshot.docs.length - 1];
        setLastVisibleDocs(newLastVisibleDocs);
      }

      const loadedProfiles: DeveloperProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedProfiles.push({
          id: doc.id,
          name: data.name || "Unknown",
          category: data.category || "None",
          status: data.status || "pending",
          contacts: data.contacts || { email: "None" },
          createdAt: data.createdAt || new Date().toISOString(),
        });
      });

      setProfiles(loadedProfiles);
    } catch (error: any) {
      console.error("Error fetching profiles:", error);
      if (error.code === "permission-denied") {
        setFetchError(
          "Permission denied. You must be an administrator to view this data.",
        );
      } else {
        setFetchError(error.message || "Failed to fetch profiles.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserInfo({ uid: user.uid, email: user.email || "Unknown" });
        setCurrentPage(1);
        fetchProfiles(1, true);
        fetchAdmins();
      } else {
        setCurrentUserInfo(null);
        setLoading(false);
        setFetchError("You must be logged in as an administrator.");
      }
    });

    return () => unsubscribe();
  }, [categoryFilter, statusFilter]);

  const fetchAdmins = async () => {
    setLoadingAdmins(true);
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, "admins"));
      const querySnapshot = await getDocs(q);

      const loadedAdmins: { uid: string; email: string; role: string }[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedAdmins.push({
          uid: doc.id,
          email: data.email || "Unknown",
          role: data.role || "admin", // Fallback for previously invited admins before role was enforced
        });
      });
      setAdminList(loadedAdmins);
    } catch (error) {
      console.error("Error fetching admins list:", error);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const currentProfiles = profiles;

  const handleStatusChange = async (
    profileId: string,
    newStatus: string,
    email: string,
    name: string,
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to change ${name}'s status to ${newStatus}?`,
      )
    )
      return;

    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, "users", profileId), {
        status: newStatus,
        verified: newStatus === "approved", // Example logic: only verified if approved
      });

      // Update local state instantly
      setProfiles(
        profiles.map((p) =>
          p.id === profileId ? { ...p, status: newStatus } : p,
        ),
      );

      // Send email notification
      const auth = getFirebaseAuth();
      const idToken = auth.currentUser
        ? await auth.currentUser.getIdToken()
        : "";
      await sendStatusUpdateEmail({ email, name, status: newStatus, idToken });
      alert(`Status updated and email sent to ${email}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMgmtMessage("");
    if (!newAdminEmail) return;

    setIsAddingAdmin(true);
    try {
      const auth = getFirebaseAuth();
      const idToken = auth.currentUser
        ? await auth.currentUser.getIdToken()
        : "";

      if (!idToken) {
        throw new Error("You are not authenticated.");
      }

      const result = await grantAdminAccessByEmail(newAdminEmail, idToken);

      if (result.success) {
        setAdminMgmtMessage(
          result.message || `Successfully invited ${newAdminEmail} as admin.`,
        );
        setNewAdminEmail("");
        fetchAdmins();
      } else {
        setAdminMgmtMessage(result.message || "Failed to add admin.");
      }
    } catch (error: any) {
      console.error("Error adding admin:", error);
      setAdminMgmtMessage(error.message || "Failed to add admin.");
    } finally {
      setIsAddingAdmin(false);
    }
  };

  const handleRevokeAdmin = async (email: string) => {
    if (
      !window.confirm(
        `Are you sure you want to revoke admin access for ${email}?`,
      )
    )
      return;

    setAdminMgmtMessage("");
    try {
      const auth = getFirebaseAuth();
      const idToken = auth.currentUser
        ? await auth.currentUser.getIdToken()
        : "";

      if (!idToken) {
        throw new Error("You are not authenticated.");
      }

      const result = await revokeAdminAccessByEmail(email, idToken);

      if (result.success) {
        setAdminMgmtMessage(
          result.message || `Successfully revoked admin access for ${email}.`,
        );
        fetchAdmins();
      } else {
        setAdminMgmtMessage(result.message || "Failed to revoke admin.");
      }
    } catch (error: any) {
      console.error("Error revoking admin:", error);
      setAdminMgmtMessage(error.message || "Failed to revoke admin.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getFirebaseAuth());
      router.push("/admin/login");
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl relative z-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/profile")}
          >
            Manage Profile
          </Button>
          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut size={16} /> Logout
          </Button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-border/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">Developer Network</h2>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-background/50 border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="">All Categories</option>
              <option value="AI Architect">AI Architect</option>
              <option value="Security Analyst">Security Analyst</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="DevOps & Cloud">DevOps & Cloud</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-background/50 border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="screening">Screening</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <Button
              onClick={() => fetchProfiles(1, true)}
              disabled={loading}
              variant="secondary"
              size="sm"
            >
              Refresh
            </Button>
          </div>
        </div>

        {fetchError && (
          <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg border border-destructive/20 text-sm">
            <p className="font-semibold mb-2">{fetchError}</p>
            {currentUserInfo && (
              <div className="mt-2 p-3 bg-black/20 rounded border border-destructive/10 font-mono text-xs">
                <p className="mb-1 text-muted-foreground/80">
                  Diagnostic Info (To add to Firestore 'admins' collection):
                </p>
                <p>
                  UID:{" "}
                  <span className="text-foreground">{currentUserInfo.uid}</span>
                </p>
                <p>
                  Email:{" "}
                  <span className="text-foreground">
                    {currentUserInfo.email}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">
            Loading profiles...
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-background/50">
                    <th className="p-3 font-medium">Name</th>
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Category</th>
                    <th className="p-3 font-medium">Status</th>
                    <th className="p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProfiles.map((profile) => (
                    <tr
                      key={profile.id}
                      className="border-b border-border/10 hover:bg-background/30 transition-colors"
                    >
                      <td className="p-3 font-medium">{profile.name}</td>
                      <td className="p-3 text-muted-foreground">
                        {profile.contacts.email}
                      </td>
                      <td className="p-3">{profile.category}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            profile.status === "approved"
                              ? "bg-green-500/20 text-green-400"
                              : profile.status === "rejected"
                                ? "bg-red-500/20 text-red-400"
                                : profile.status === "screening"
                                  ? "bg-yellow-500/20 text-yellow-400"
                                  : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {profile.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3">
                        <select
                          value={profile.status}
                          onChange={(e) =>
                            handleStatusChange(
                              profile.id,
                              e.target.value,
                              profile.contacts.email,
                              profile.name,
                            )
                          }
                          className="px-2 py-1 bg-background/50 border border-input rounded text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                        >
                          <option value="pending">Pending</option>
                          <option value="screening">Screening</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                  {currentProfiles.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-muted-foreground"
                      >
                        No partners found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-6">
              <span className="text-sm text-muted-foreground">
                Page {currentPage}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1 || loading}
                  onClick={() => {
                    const prevPage = currentPage - 1;
                    setCurrentPage(prevPage);
                    fetchProfiles(prevPage);
                  }}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isLastPage || loading}
                  onClick={() => {
                    const nextPage = currentPage + 1;
                    setCurrentPage(nextPage);
                    fetchProfiles(nextPage);
                  }}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="glass-card p-6 rounded-2xl border border-border/50 mt-8">
        <h2 className="text-xl font-semibold mb-4">Admin Management</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Invite new administrators by their email address. They can sign in
          with any compatible provider using this email.
        </p>

        {adminMgmtMessage && (
          <div
            className={`mb-4 p-3 text-sm rounded-lg ${adminMgmtMessage.includes("Success") ? "bg-green-500/10 text-green-500" : "bg-destructive/10 text-destructive"}`}
          >
            {adminMgmtMessage}
          </div>
        )}

        <form
          onSubmit={handleAddAdmin}
          className="flex flex-col md:flex-row gap-4"
        >
          <input
            type="email"
            placeholder="Administrator Email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            required
            className="px-4 py-2 bg-background/50 border border-input rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary flex-1"
          />
          <Button type="submit" variant="secondary" disabled={isAddingAdmin}>
            {isAddingAdmin ? "Inviting..." : "Invite Admin"}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/50">
          <h3 className="text-lg font-semibold mb-4">Current Administrators</h3>
          {loadingAdmins ? (
            <p className="text-sm text-muted-foreground">Loading admins...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border/50 bg-background/50">
                    <th className="p-3 font-medium">Email</th>
                    <th className="p-3 font-medium">Role</th>
                    <th className="p-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminList.map((admin) => (
                    <tr
                      key={admin.uid}
                      className="border-b border-border/10 hover:bg-background/30 transition-colors"
                    >
                      <td className="p-3 font-medium">{admin.email}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${admin.role === "superadmin" ? "bg-primary/20 text-primary" : "bg-blue-500/20 text-blue-400"}`}
                        >
                          {admin.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {/* Only the superadmin can revoke others, and cannot revoke themselves */}
                        {currentUserInfo?.email?.toLowerCase() ===
                          (
                            process.env.NEXT_PUBLIC_ADMIN_EMAIL || ""
                          ).toLowerCase() &&
                          admin.role !== "superadmin" && (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRevokeAdmin(admin.email)}
                              className="text-xs py-1 h-auto"
                            >
                              Revoke
                            </Button>
                          )}
                      </td>
                    </tr>
                  ))}
                  {adminList.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="p-3 text-center text-muted-foreground"
                      >
                        No administrators found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
