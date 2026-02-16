import React, { useEffect, useState } from "react";
import { PageContainer, SectionHeader } from "../../../components/shared";
import { useUsers } from "../context/UserContext";
import UserCard from "../components/UserCard";
import UserModal from "../components/UserModal";

const UsersPage = () => {
  const { users, loading, fetchUsers } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <PageContainer>
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
