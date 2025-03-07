import React, { useState } from "react";
import {
  User,
  Mail,
  Building,
  Calendar,
  MoreVertical,
  Plus,
} from "lucide-react";
import { User as UserType } from "../../src/types/index";
import { useUsers } from "../../src/hooks/useUsers";

interface TeamManagementProps {
  members: UserType[];
  onAssign: (userId: string) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}

export function TeamManagement({
  members,
  onAssign,
  onRemove,
}: TeamManagementProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [loading, setLoading] = useState(false);

  // Get all users from API
  const { users, loading: usersLoading, error: usersError } = useUsers();

  // Get available users (not already in team)
  const availableUsers =
    users?.filter((user) => !members.find((member) => member.id === user.id)) ||
    [];

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    try {
      setLoading(true);
      await onAssign(selectedUserId);
      setShowAddMember(false);
      setSelectedUserId("");
    } catch (err) {
      console.error("Error adding team member:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this team member?")) return;

    try {
      setLoading(true);
      await onRemove(userId);
    } catch (err) {
      console.error("Error removing team member:", err);
    } finally {
      setLoading(false);
    }
  };

  if (usersLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading users...
          </p>
        </div>
      </div>
    );
  }

  if (usersError) {
    return (
      <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
        <p className="text-sm text-red-700 dark:text-red-400">{usersError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Team Members</h2>
        <button
          onClick={() => setShowAddMember(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-primary-500 dark:hover:bg-primary-600"
        >
          <Plus className="h-5 w-5" />
          Add Member
        </button>
      </div>

      {showAddMember && (
        <div className="rounded-lg border border-gray-200 p-4 dark:border-dark-700">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label
                htmlFor="user"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Select Team Member
              </label>
              <select
                id="user"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-dark-700 dark:bg-dark-800 dark:focus:border-primary-400"
              >
                <option value="">Select a user...</option>
                {availableUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.department})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddMember}
                disabled={!selectedUserId || loading}
                className="inline-flex items-center rounded-lg bg-primary-600 px-4 py-2 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-primary-500 dark:hover:bg-primary-600"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Adding...
                  </>
                ) : (
                  "Add Member"
                )}
              </button>
              <button
                onClick={() => {
                  setShowAddMember(false);
                  setSelectedUserId("");
                }}
                className="rounded-lg px-4 py-2 text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-dark-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div
            key={member.id}
            className="relative rounded-lg bg-white p-6 shadow-sm transition-shadow hover:shadow-md dark:bg-dark-800"
          >
            <div className="absolute right-4 top-4">
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-red-500 dark:hover:bg-dark-700"
              >
                <MoreVertical className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-lg font-medium text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                {member.full_name[0]}
              </div>
              <div>
                <h3 className="font-medium">{member.full_name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {member.role}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Mail className="h-4 w-4" />
                <span>{member.email}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Building className="h-4 w-4" />
                <span>{member.department}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <Calendar className="h-4 w-4" />
                <span>
                  Leave Balance: {member.vacation_balance}d vacation,{" "}
                  {member.sick_balance}d sick
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between border-t pt-4 dark:border-dark-700">
              <button
                onClick={() => handleRemoveMember(member.id)}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Remove from Project
              </button>
              <button className="rounded-lg bg-gray-100 px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-200 dark:bg-dark-700 dark:text-gray-100 dark:hover:bg-dark-600">
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
