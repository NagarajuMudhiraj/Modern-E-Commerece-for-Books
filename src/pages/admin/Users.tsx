import { useState, useEffect } from 'react';
import api from '../../services/api';
import { User as UserType } from '../../types';
import { motion } from 'motion/react';
import { Search, User, Mail, Phone, Calendar, Shield, Loader2 } from 'lucide-react';

export default function AdminUsers() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleUpdate = async (id: number, role: string) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role });
      fetchUsers();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (e) {
        console.error(e);
      }
    }
  };

  const filteredUsers = users.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-indigo-950 dark:text-white mb-2">User Management</h1>
          <p className="text-stone-500 dark:text-stone-400">View and manage registered users.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input 
            type="text" 
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-12 pr-4 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none w-full transition-all dark:text-white placeholder-stone-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredUsers.map((user) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-stone-900 p-6 rounded-3xl shadow-sm border border-stone-100 dark:border-stone-800"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="font-bold text-indigo-950 dark:text-white">{user.name}</div>
                <div className={`text-[10px] font-bold uppercase tracking-widest ${user.role === 'ADMIN' ? 'text-indigo-600 dark:text-indigo-400' : 'text-stone-400 dark:text-stone-500'}`}>
                  {user.role}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400">
                <Mail className="w-4 h-4" /> {user.email}
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-500 dark:text-stone-400">
                <Phone className="w-4 h-4" /> {user.phone || 'No phone provided'}
              </div>
              <div className="flex items-center gap-3 text-sm text-stone-400 dark:text-stone-500">
                <Calendar className="w-4 h-4" /> Joined {new Date((user as any).created_at).toLocaleDateString()}
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-stone-50 dark:border-stone-800 flex justify-between items-center">
              <select 
                value={user.role}
                onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-stone-50 dark:bg-stone-800 border-none rounded-lg outline-none cursor-pointer"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <button 
                onClick={() => handleDeleteUser(user.id)}
                className="text-xs font-bold text-red-600 hover:underline"
              >
                Delete User
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
