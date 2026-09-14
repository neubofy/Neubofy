'use client';

import React, { useEffect, useState } from 'react';
import { getFirebaseDb, getFirebaseAuth } from '@/lib/firebase/firebase';
import { collection, query, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore';
import { sendStatusUpdateEmail } from '@/app/actions/emailActions';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';

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

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Admin Management State
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminUid, setNewAdminUid] = useState('');
  const [adminMgmtMessage, setAdminMgmtMessage] = useState('');

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const db = getFirebaseDb();
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);

      const loadedProfiles: DeveloperProfile[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedProfiles.push({
          id: doc.id,
          name: data.name || 'Unknown',
          category: data.category || 'None',
          status: data.status || 'pending',
          contacts: data.contacts || { email: 'None' },
          createdAt: data.createdAt || new Date().toISOString()
        });
      });

      setProfiles(loadedProfiles);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  // Filtering logic
  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch =
      profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.contacts.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter ? profile.category === categoryFilter : true;
    const matchesStatus = statusFilter ? profile.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const currentProfiles = filteredProfiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleStatusChange = async (profileId: string, newStatus: string, email: string, name: string) => {
    if (!window.confirm(`Are you sure you want to change ${name}'s status to ${newStatus}?`)) return;

    try {
      const db = getFirebaseDb();
      await updateDoc(doc(db, 'users', profileId), {
        status: newStatus,
        verified: newStatus === 'approved' // Example logic: only verified if approved
      });

      // Update local state instantly
      setProfiles(profiles.map(p => p.id === profileId ? { ...p, status: newStatus } : p));

      // Send email notification
      await sendStatusUpdateEmail({ email, name, status: newStatus });
      alert(`Status updated and email sent to ${email}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminMgmtMessage('');
    if (!newAdminUid || !newAdminEmail) return;

    try {
      const db = getFirebaseDb();
      // We assume the owner knows the UID of the user they want to make an admin.
      // In a real app, you might want to look this up via a Cloud Function.
      await setDoc(doc(db, 'admins', newAdminUid), {
        email: newAdminEmail,
        addedAt: new Date().toISOString()
      });
      setAdminMgmtMessage(`Successfully added ${newAdminEmail} as admin.`);
      setNewAdminUid('');
      setNewAdminEmail('');
    } catch (error: any) {
      console.error("Error adding admin:", error);
      setAdminMgmtMessage(error.message || "Failed to add admin.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(getFirebaseAuth());
      router.push('/admin/login');
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl relative z-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button variant="outline" onClick={handleLogout} className="gap-2">
          <LogOut size={16} /> Logout
        </Button>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-border/50">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h2 className="text-xl font-semibold">Developer Network</h2>

          <div className="flex flex-wrap gap-3 w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 bg-background/50 border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary flex-1 min-w-[200px]"
            />

            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
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
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-3 py-1.5 bg-background/50 border border-input rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="screening">Screening</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            <Button onClick={fetchProfiles} disabled={loading} variant="secondary" size="sm">
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-muted-foreground">Loading profiles...</div>
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
                {currentProfiles.map(profile => (
                  <tr key={profile.id} className="border-b border-border/10 hover:bg-background/30 transition-colors">
                    <td className="p-3 font-medium">{profile.name}</td>
                    <td className="p-3 text-muted-foreground">{profile.contacts.email}</td>
                    <td className="p-3">{profile.category}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        profile.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                        profile.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                        profile.status === 'screening' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {profile.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={profile.status}
                        onChange={(e) => handleStatusChange(profile.id, e.target.value, profile.contacts.email, profile.name)}
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
                     <td colSpan={5} className="p-6 text-center text-muted-foreground">No partners found.</td>
                   </tr>
                )}
              </tbody>
            </table>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <span className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredProfiles.length)} of {filteredProfiles.length} entries
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="glass-card p-6 rounded-2xl border border-border/50 mt-8">
        <h2 className="text-xl font-semibold mb-4">Admin Management</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Add new administrators by entering their Firebase Auth UID and Email.
        </p>

        {adminMgmtMessage && (
          <div className={`mb-4 p-3 text-sm rounded-lg ${adminMgmtMessage.includes('Success') ? 'bg-green-500/10 text-green-500' : 'bg-destructive/10 text-destructive'}`}>
            {adminMgmtMessage}
          </div>
        )}

        <form onSubmit={handleAddAdmin} className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="User UID"
            value={newAdminUid}
            onChange={(e) => setNewAdminUid(e.target.value)}
            required
            className="px-4 py-2 bg-background/50 border border-input rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary flex-1"
          />
          <input
            type="email"
            placeholder="User Email"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            required
            className="px-4 py-2 bg-background/50 border border-input rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary flex-1"
          />
          <Button type="submit" variant="secondary">Add Admin</Button>
        </form>
      </div>
    </div>
  );
}
