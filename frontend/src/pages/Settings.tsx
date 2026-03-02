import { useState } from "react";
import { User, Bell, Lock, Palette, Save } from "lucide-react";
import { useAuthStore } from "../store/authStore";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("account");
  const currentUser = useAuthStore((state) => state.user);

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="mb-8 border-b border-gray-100 pb-4">
        <h1 className="text-3xl font-bold text-primary">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account preferences and platform settings.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <TabButton
            active={activeTab === "account"}
            onClick={() => setActiveTab("account")}
            icon={User}
            label="Account Profile"
          />
          <TabButton
            active={activeTab === "notifications"}
            onClick={() => setActiveTab("notifications")}
            icon={Bell}
            label="Notifications"
          />
          <TabButton
            active={activeTab === "security"}
            onClick={() => setActiveTab("security")}
            icon={Lock}
            label="Security & Privacy"
          />
          <TabButton
            active={activeTab === "appearance"}
            onClick={() => setActiveTab("appearance")}
            icon={Palette}
            label="Appearance"
          />
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          {/* Account Tab */}
          {activeTab === "account" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-primary border-b border-gray-100 pb-4">
                Profile Information
              </h2>

              <div className="flex items-center gap-6">
                <div className="w-24 h-24 bg-accent rounded-full flex items-center justify-center text-primary text-3xl font-bold">
                  {currentUser?.name.charAt(0) || "U"}
                </div>
                <div>
                  <button className="bg-secondary hover:bg-primary text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors mb-2">
                    Upload New Avatar
                  </button>
                  <p className="text-xs text-gray-500">
                    JPG, GIF or PNG. Max size of 800K
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    htmlFor="user-name"
                  >
                    Full Name
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    defaultValue={currentUser?.name}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-secondary focus:border-secondary"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    htmlFor="user-email"
                  >
                    Email Address
                  </label>
                  <input
                    id="user-email"
                    type="email"
                    defaultValue={currentUser?.email}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-secondary focus:border-secondary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Role
                  </label>
                  <input
                    type="text"
                    defaultValue={currentUser?.role}
                    disabled
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 text-gray-500 capitalize"
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    htmlFor="user-timezone"
                  >
                    Timezone
                  </label>
                  <select
                    id="user-timezone"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-secondary focus:border-secondary"
                  >
                    <option>Eastern Standard Time (EST)</option>
                    <option>Pacific Standard Time (PST)</option>
                    <option>Coordinated Universal Time (UTC)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-primary border-b border-gray-100 pb-4">
                Notification Preferences
              </h2>

              <div className="space-y-4">
                <ToggleRow
                  label="Course Enrollments"
                  description="Get notified when you are enrolled in a new course."
                  defaultChecked={true}
                />
                <ToggleRow
                  label="Course Completions"
                  description="Receive a certificate email when completing a course."
                  defaultChecked={true}
                />
                <ToggleRow
                  label="Platform Announcements"
                  description="Updates regarding new platform features and downtime."
                  defaultChecked={false}
                />
                <ToggleRow
                  label="Weekly Progress Report"
                  description="Receive a weekly breakdown of learning activity."
                  defaultChecked={true}
                />
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-primary border-b border-gray-100 pb-4">
                Security Settings
              </h2>

              <div className="space-y-4">
                <div className="max-w-md">
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    htmlFor="current-password"
                  >
                    Current Password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-secondary focus:border-secondary"
                  />
                </div>
                <div className="max-w-md">
                  <label
                    className="block text-sm font-semibold text-gray-700 mb-2"
                    htmlFor="new-password"
                  >
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    className="w-full px-4 py-2 border rounded-lg focus:ring-secondary focus:border-secondary"
                  />
                </div>
                <div className="pt-4">
                  <button className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium transition-colors">
                    Update Password
                  </button>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 mt-6 mt-10">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-gray-800">
                      Two-Factor Authentication (2FA)
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Add an extra layer of security to your account.
                    </p>
                  </div>
                  <button className="border border-gray-300 hover:border-primary text-gray-700 px-4 py-2 rounded-lg font-medium">
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-primary border-b border-gray-100 pb-4">
                Theme & Appearance
              </h2>

              <div className="grid grid-cols-2 gap-6 max-w-lg">
                <div className="border-2 border-secondary rounded-xl p-4 cursor-pointer">
                  <div className="h-24 bg-gray-50 rounded-lg border border-gray-200 mb-3 flex items-center justify-center shadow-inner">
                    <Palette className="text-gray-400" />
                  </div>
                  <p className="text-center font-bold text-primary text-sm">
                    Light Mode
                  </p>
                </div>
                <div className="border-2 border-transparent hover:border-gray-200 rounded-xl p-4 cursor-pointer opacity-50 relative">
                  <div className="absolute top-2 right-2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded font-bold">
                    PRO
                  </div>
                  <div className="h-24 bg-gray-800 rounded-lg border border-gray-700 mb-3 flex items-center justify-center shadow-inner">
                    <Palette className="text-gray-500" />
                  </div>
                  <p className="text-center font-bold text-gray-500 text-sm">
                    Dark Mode
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Global Save Button at the bottom of the content area */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex justify-end">
            <button className="bg-secondary hover:bg-primary text-white px-6 py-2.5 rounded-lg font-bold transition-colors flex items-center gap-2 shadow-sm">
              <Save size={18} /> Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors text-left
      ${
        active
          ? "bg-secondary text-white shadow-sm"
          : "text-gray-600 hover:bg-gray-100"
      }`}
  >
    <Icon size={18} className={active ? "text-white" : "text-gray-400"} />
    {label}
  </button>
);

const ToggleRow = ({ label, description, defaultChecked }: any) => {
  const [checked, setChecked] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
      <div>
        <p className="font-bold text-gray-800">{label}</p>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>
      <button
        onClick={() => setChecked(!checked)}
        className={`w-12 h-6 rounded-full relative transition-colors ${checked ? "bg-green-500" : "bg-gray-300"}`}
      >
        <div
          className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${checked ? "translate-x-7" : "translate-x-1"}`}
        ></div>
      </button>
    </div>
  );
};

export default Settings;
