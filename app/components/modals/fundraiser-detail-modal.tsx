"use client";

import * as React from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { Fundraiser, DonateRequest } from "@/app/services.tsx/api-client";
import { useFundraiser, useDonateToFundraiser } from "@/app/hooks/use-fundraiser-query";
import { Loading } from "../ui/loading";
import { ErrorState } from "../ui/error-state";
import Image from "next/image";
import { EyeIcon, TrashIcon } from "../ui/icons";
import { SlidingPanel } from "../ui/sliding-panel";
import { useAuthStore } from "@/app/store";
import { PaymentButton } from "../payment/PaymentButton";

interface FundraiserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fundraiserId: string;
  onEdit: (fundraiser: Fundraiser) => void;
  onDelete: (fundraiser: Fundraiser) => void;
  canEdit?: boolean;
}

export const FundraiserDetailModal: React.FC<FundraiserDetailModalProps> = ({
  isOpen,
  onClose,
  fundraiserId,
  onEdit,
  onDelete,
  canEdit = false,
}) => {
  const { data: fundraiser, isLoading, error } = useFundraiser(fundraiserId);
  const { user } = useAuthStore();
  const donateMutation = useDonateToFundraiser();
  const [isDonatePanelOpen, setIsDonatePanelOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(0);
  const [message, setMessage] = React.useState("");
  const [anonymous, setAnonymous] = React.useState(false);
  const [donateError, setDonateError] = React.useState<string | null>(null);

  const formattedDonationAmount = React.useMemo(
    () => (amount > 0 ? amount.toFixed(2) : "0.00"),
    [amount]
  );

  const handleDonate = async () => {
    if (!fundraiser || !user?.id || amount <= 0) return;
    
    setDonateError(null);
    try {
      const donateData: DonateRequest = {
        donorId: user.id,
        amount,
        message: message.trim() || undefined,
        anonymous,
      };
      await donateMutation.mutateAsync({
        id: fundraiser.id,
        data: donateData,
      });
      setIsDonatePanelOpen(false);
      setAmount(0);
      setMessage("");
      setAnonymous(false);
    } catch (error) {
      setDonateError(
        error instanceof Error ? error.message : "Donation failed"
      );
    }
  };

  if (!isOpen) return null;

  const raised = fundraiser?.totalRaised || fundraiser?.raised || 0;
  const progress = fundraiser
    ? Math.min((raised / fundraiser.goal) * 100, 100)
    : 0;
  const daysRemaining = fundraiser
    ? Math.ceil(
        (new Date(fundraiser.deadlineAt).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Fundraiser Details"
      size="lg"
      footer={
        <div className="flex items-center gap-3 w-full justify-end">
          {fundraiser && user?.id && fundraiser.ownerId !== user.id && fundraiser.status === "active" && (
            <Button
              variant="default"
              onClick={() => setIsDonatePanelOpen(true)}
            >
              Donate
            </Button>
          )}
          {canEdit && fundraiser && (
            <>
              {/* <Button
                variant="default"
                onClick={() => {
                  onEdit(fundraiser);
                  onClose();
                }}
              >
                Edit
              </Button> */}
              <Button
              variant="default"
              onClick={() => setIsDonatePanelOpen(true)}
            >
              Donate
            </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(fundraiser);
                  onClose();
                }}
                icon={<TrashIcon />}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      }
    >
      {isLoading ? (
        <div className="py-8">
          <Loading size="md" text="Loading fundraiser details..." />
        </div>
      ) : error ? (
        <ErrorState
          message={error.message || "Failed to load fundraiser details"}
          onRetry={() => window.location.reload()}
        />
      ) : fundraiser ? (
        <div className="space-y-6">
          {/* Image */}
          {fundraiser.media && fundraiser.media.length > 0 && (
            <div className="w-full h-64 bg-[#171717] rounded-[16px] overflow-hidden">
              <Image
                src={fundraiser.media[0].url}
                alt={fundraiser.title}
                width={800}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title and Summary */}
          <div>
            <h2 className="text-white/95 text-2xl font-medium mb-2">
              {fundraiser.title}
            </h2>
            <p className="text-[#A3A3A3] text-sm">{fundraiser.summary}</p>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[#A3A3A3] text-sm">Progress</span>
              <span className="text-white/95 text-sm font-medium">
                {progress.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#262626] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#335CFF] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-white/95 text-lg font-medium">
                ${raised.toLocaleString()} raised
              </span>
              <span className="text-[#A3A3A3] text-sm">
                of ${fundraiser.goal.toLocaleString()} goal
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-white/95 text-sm font-medium mb-2">
              Description
            </h3>
            <p className="text-[#A3A3A3] text-sm leading-relaxed">
              {fundraiser.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[#A3A3A3] text-xs">Category</span>
              <p className="text-white/95 text-sm font-medium">
                {fundraiser.category?.title || "Uncategorized"}
              </p>
            </div>
            <div>
              <span className="text-[#A3A3A3] text-xs">Status</span>
              <p className="text-white/95 text-sm font-medium capitalize">
                {fundraiser.status}
              </p>
            </div>
            <div>
              <span className="text-[#A3A3A3] text-xs">Owner</span>
              <p className="text-white/95 text-sm font-medium font-mono">
                {fundraiser.owner?.walletAddress?.slice(0, 8)}...
                {fundraiser.owner?.walletAddress?.slice(-6)}
              </p>
            </div>
            <div>
              <span className="text-[#A3A3A3] text-xs">Deadline</span>
              <p className="text-white/95 text-sm font-medium">
                {daysRemaining > 0
                  ? `${daysRemaining} days left`
                  : "Expired"}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon />
              <span className="text-[#A3A3A3] text-xs">
                {fundraiser.views} views
              </span>
            </div>
          </div>

          {/* Tags */}
          {fundraiser.tags && fundraiser.tags.length > 0 && (
            <div>
              <span className="text-[#A3A3A3] text-xs mb-2 block">Tags</span>
              <div className="flex flex-wrap gap-2">
                {fundraiser.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-[#262626] text-[#A3A3A3] text-xs rounded-[6px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Media Gallery */}
          {fundraiser.media && fundraiser.media.length > 1 && (
            <div>
              <span className="text-[#A3A3A3] text-xs mb-2 block">
                Additional Media
              </span>
              <div className="grid grid-cols-3 gap-2">
                {fundraiser.media.slice(1).map((media, index) => (
                  <div
                    key={index}
                    className="aspect-video bg-[#171717] rounded-[10px] overflow-hidden"
                  >
                    <Image
                      src={media.url}
                      alt={`${fundraiser.title} - ${index + 2}`}
                      width={200}
                      height={150}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Donate Panel */}
      <SlidingPanel
        isOpen={isDonatePanelOpen}
        onClose={() => {
          setIsDonatePanelOpen(false);
          setDonateError(null);
          setAmount(0);
          setMessage("");
        }}
        title="Donate to Fundraiser"
      >
        {fundraiser && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white/95 text-lg font-medium mb-2">
                {fundraiser.title}
              </h3>
              <p className="text-[#A3A3A3] text-sm">
                Goal: ${fundraiser.goal.toLocaleString()}
              </p>
            </div>

            <div>
              <label className="block text-white/95 text-sm font-medium mb-2">
                Donation Amount *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 outline-none focus:border-[#333] transition-colors"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-white/95 text-sm font-medium mb-2">
                Message (Optional)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="w-full rounded-[10px] px-3 py-2 border border-[#262626] bg-[#171717] text-white/95 placeholder:text-[#7b7b7b] outline-none focus:border-[#333] transition-colors resize-none"
                placeholder="Leave a message of support..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={anonymous}
                onChange={(e) => setAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border border-[#262626] bg-[#171717] appearance-none checked:bg-[#7D52F4] checked:border-[#7D52F4] cursor-pointer"
              />
              <label htmlFor="anonymous" className="text-[#A3A3A3] text-sm cursor-pointer">
                Donate anonymously
              </label>
            </div>

            {donateError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-[10px] p-3">
                <p className="text-red-400 text-sm">{donateError}</p>
              </div>
            )}

            {donateMutation.isPending && (
              <p className="text-[#A3A3A3] text-xs text-center">
                Finalizing your donation...
              </p>
            )}

            {user?.id ? (
              amount > 0 ? (
                <PaymentButton
                  endpoint="/api/payment"
                  amount={`$${formattedDonationAmount}`}
                  description={`Donate to ${fundraiser.title}`}
                  onSuccess={async () => {
                    await handleDonate();
                  }}
                  onError={(message) => setDonateError(message)}
                />
              ) : (
                <Button className="w-full" >
                  Enter an amount to pay.
                </Button>
              )
            ) : (
              <p className="text-[#A3A3A3] text-sm text-center">
                Sign in to donate.
              </p>
            )}
          </div>
        )}
      </SlidingPanel>
    </Modal>
  );
};

export default FundraiserDetailModal;

