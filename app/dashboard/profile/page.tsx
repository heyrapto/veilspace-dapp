"use client";

import * as React from "react";
import { useAccount } from "wagmi";
import { useAuthStore } from "@/app/store";
import { Loading } from "../../components/ui/loading";
import { ErrorState } from "../../components/ui/error-state";
import { Button } from "../../components/ui/button";
import { Modal } from "../../components/ui/modal";
import { ProfileIcon } from "../../components/ui/icons";
import Image from "next/image";

export default function ProfilePage() {
  const { address } = useAccount();
  const { user, isLoading, error, getCurrentUser, updateProfile } = useAuthStore();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    handle: "",
    avatar: "",
    bio: "",
  });
  const [updateError, setUpdateError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (address && !user) {
      getCurrentUser(address);
    } else if (user) {
      setFormData({
        handle: user.handle || "",
        avatar: user.avatar || "",
        bio: user.bio || "",
      });
    }
  }, [address, user, getCurrentUser]);

  const handleUpdate = async () => {
    if (!address) return;
    
    setUpdateError(null);
    try {
      await updateProfile({
        walletAddress: address,
        ...formData,
      });
      setIsEditModalOpen(false);
    } catch (error) {
      setUpdateError(
        error instanceof Error ? error.message : "Update failed"
      );
    }
  };

  if (isLoading && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading size="lg" text="Loading profile..." />
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <ErrorState
          message={error}
          onRetry={() => address && getCurrentUser(address)}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center">
          <p className="text-white/95 text-lg mb-4">Please connect your wallet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-[44px] py-[52px]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[56px] leading-[64px] font-serif text-white/95 mb-2">
            Profile
          </h1>
          <p className="text-base text-white/95">
            Manage your profile information
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-[#262626] p-1 rounded-[20px] border border-[#262626]">
          <div className="bg-[#171717] rounded-[16px] p-8">
            <div className="flex items-start gap-6 mb-6">
              {/* Avatar */}
              <div className="relative">
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.handle || "Profile"}
                    width={120}
                    height={120}
                    className="w-[120px] h-[120px] rounded-full object-cover border-2 border-[#262626]"
                  />
                ) : (
                  <div className="w-[120px] h-[120px] rounded-full bg-[#7D52F4] flex items-center justify-center border-2 border-[#262626]">
                    <ProfileIcon />
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h2 className="text-white/95 text-2xl font-medium mb-2">
                  {user.handle || "Anonymous User"}
                </h2>
                <p className="text-[#A3A3A3] text-sm font-mono mb-4">
                  {user.walletAddress}
                </p>
                {user.bio && (
                  <p className="text-[#A3A3A3] text-sm leading-relaxed">
                    {user.bio}
                  </p>
                )}
              </div>

              <Button onClick={() => setIsEditModalOpen(true)}>
                Edit Profile
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#262626]">
              <div>
                <span className="text-[#A3A3A3] text-xs block mb-1">
                  Member Since
                </span>
                <p className="text-white/95 text-sm font-medium">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-[#A3A3A3] text-xs block mb-1">
                  Last Updated
                </span>
                <p className="text-white/95 text-sm font-medium">
                  {new Date(user.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setUpdateError(null);
          if (user) {
            setFormData({
              handle: user.handle || "",
              avatar: user.avatar || "",
              bio: user.bio || "",
            });
          }
        }}
        title="Edit Profile"
        size="md"
        footer={
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="ghostly"
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              isLoading={isLoading}
              loadingText="Updating..."
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {updateError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-[10px] p-3">
              <p className="text-red-400 text-sm">{updateError}</p>
            </div>
          )}

          <div>
            <label className="block text-white/95 text-sm font-medium mb-2">
              Handle
            </label>
            <input
              type="text"
              value={formData.handle}
              onChange={(e) =>
                setFormData({ ...formData, handle: e.target.value })
              }
              className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 placeholder:text-[#7b7b7b] outline-none focus:border-[#333] transition-colors"
              placeholder="Your username"
            />
          </div>

          <div>
            <label className="block text-white/95 text-sm font-medium mb-2">
              Avatar URL
            </label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) =>
                setFormData({ ...formData, avatar: e.target.value })
              }
              className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 placeholder:text-[#7b7b7b] outline-none focus:border-[#333] transition-colors"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          <div>
            <label className="block text-white/95 text-sm font-medium mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={4}
              className="w-full rounded-[10px] px-3 py-2 border border-[#262626] bg-[#171717] text-white/95 placeholder:text-[#7b7b7b] outline-none focus:border-[#333] transition-colors resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

