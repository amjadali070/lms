import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuthStore } from "../store/authStore";
import { Shield, Mail, Plus, X } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  sectorId: string;
}

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "password123",
    role: "student",
  });
  const currentUser = useAuthStore((state) => state.user);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/users", newUser);
      setShowModal(false);
      setNewUser({
        name: "",
        email: "",
        password: "password123",
        role: "student",
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create user");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (currentUser?.role !== "admin") {
    return (
      <div className="p-6 text-center text-red-500">
        Access Denied. Admins only.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Sector Users</h1>
          <p className="text-gray-600 mt-1">
            Manage system personnel and user accounts.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 shadow-sm"
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Name
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Email
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Role
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium text-primary">
                        {user.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Mail size={14} className="text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="p-4">
                    <div
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium capitalize
                      ${
                        user.role === "admin"
                          ? "bg-red-100 text-red-700"
                          : user.role === "instructor"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {user.role === "admin" && <Shield size={12} />}
                      {user.role}
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => navigate(`/users/${user._id}`)}
                      className="text-secondary hover:text-primary text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              aria-label="Close add user modal"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold text-primary mb-4">
              Add Sector User
            </h2>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="new-user-name"
                >
                  Full Name
                </label>
                <input
                  id="new-user-name"
                  type="text"
                  required
                  value={newUser.name}
                  onChange={(e) =>
                    setNewUser({ ...newUser, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-secondary focus:border-secondary"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="new-user-email"
                >
                  Email Address
                </label>
                <input
                  id="new-user-email"
                  type="email"
                  required
                  value={newUser.email}
                  onChange={(e) =>
                    setNewUser({ ...newUser, email: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-secondary focus:border-secondary"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="new-user-role"
                >
                  Role
                </label>
                <select
                  id="new-user-role"
                  value={newUser.role}
                  onChange={(e) =>
                    setNewUser({ ...newUser, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-secondary focus:border-secondary"
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Administrator</option>
                </select>
              </div>
              <p className="text-xs text-gray-500 italic mb-4">
                Default password is 'password123'
              </p>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-secondary text-white font-medium py-2 rounded-lg transition-colors"
              >
                Create User
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
