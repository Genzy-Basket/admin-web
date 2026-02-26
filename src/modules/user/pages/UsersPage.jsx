import React, { useEffect, useCallback } from "react";
import { useState } from "react";
import { PageContainer, SectionHeader } from "../../../components/shared";
import { useUsers } from "../context/UserContext";
import { usePageMeta } from "../../../context/PageHeaderContext";
import UserCard from "../components/UserCard";
import UserModal from "../components/UserModal";

const UsersPage = () => {
  const { users, loading, fetchUsers } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);

  const handleRefresh = useCallback(async () => {
    await fetchUsers({}, true);
  }, [fetchUsers]);

  usePageMeta({ title: "Users", onRefresh: handleRefresh });

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <PageContainer>
      <h1 className="hidden sm:block text-3xl font-black text-slate-800 mb-8">
        Users
      </h1>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <UserCard
              key={user._id}
              user={user}
              onEdit={(u) => setSelectedUser(u)}
            />
          ))}
        </div>
      )}

      <UserModal
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </PageContainer>
  );
};

export default UsersPage;
