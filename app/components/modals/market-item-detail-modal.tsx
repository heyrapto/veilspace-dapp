"use client";

import * as React from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { MarketItem, PurchaseRequest } from "@/app/services.tsx/api-client";
import { useMarketItem, usePurchaseMarketItem } from "@/app/hooks/use-market-query";
import { Loading } from "../ui/loading";
import { ErrorState } from "../ui/error-state";
import Image from "next/image";
import { EyeIcon, TrashIcon } from "../ui/icons";
import { SlidingPanel } from "../ui/sliding-panel";
import { useAuthStore } from "@/app/store";

interface MarketItemDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemId: string;
  onEdit: (item: MarketItem) => void;
  onDelete: (item: MarketItem) => void;
  canEdit?: boolean;
}

export const MarketItemDetailModal: React.FC<MarketItemDetailModalProps> = ({
  isOpen,
  onClose,
  itemId,
  onEdit,
  onDelete,
  canEdit = false,
}) => {
  const { data: item, isLoading, error } = useMarketItem(itemId);
  const { user } = useAuthStore();
  const purchaseMutation = usePurchaseMarketItem();
  const [isPurchasePanelOpen, setIsPurchasePanelOpen] = React.useState(false);
  const [quantity, setQuantity] = React.useState(1);
  const [purchaseError, setPurchaseError] = React.useState<string | null>(null);

  const handlePurchase = async () => {
    if (!item || !user?.id) return;
    
    setPurchaseError(null);
    try {
      const purchaseData: PurchaseRequest = {
        buyerId: user.id,
        quantity,
      };
      await purchaseMutation.mutateAsync({
        id: item.id,
        data: purchaseData,
      });
      setIsPurchasePanelOpen(false);
      onClose();
    } catch (error) {
      setPurchaseError(
        error instanceof Error ? error.message : "Purchase failed"
      );
    }
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Market Item Details"
      size="lg"
      footer={
        <div className="flex items-center gap-3 w-full justify-end">
          {item && user?.id && item.sellerId !== user.id && item.status === "active" && (
            <Button
              variant="default"
              onClick={() => setIsPurchasePanelOpen(true)}
              disabled={item.stock === 0}
            >
              Purchase
            </Button>
          )}
          {canEdit && item && (
            <>
              {/* <Button
                variant="default"
                onClick={() => {
                  onEdit(item);
                  onClose();
                }}
              >
                Edit
              </Button> */}
              <Button
              variant="default"
              onClick={() => setIsPurchasePanelOpen(true)}
              disabled={item.stock === 0}
            >
              Purchase
            </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  onDelete(item);
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
          <Loading size="md" text="Loading item details..." />
        </div>
      ) : error ? (
        <ErrorState
          message={error.message || "Failed to load item details"}
          onRetry={() => window.location.reload()}
        />
      ) : item ? (
        <div className="space-y-6">
          {/* Image */}
          {item.media && item.media.length > 0 && (
            <div className="w-full h-64 bg-[#171717] rounded-[16px] overflow-hidden">
              <Image
                src={item.media[0].url}
                alt={item.title}
                width={800}
                height={400}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title and Price */}
          <div>
            <h2 className="text-white/95 text-2xl font-medium mb-2">
              {item.title}
            </h2>
            <div className="flex items-center gap-4">
              <div>
                <span className="text-[#A3A3A3] text-sm">Price</span>
                <p className="text-white/95 text-xl font-medium">
                  ${item.price} {item.currency}
                </p>
              </div>
              {item.stock !== undefined && (
                <div>
                  <span className="text-[#A3A3A3] text-sm">Stock</span>
                  <p className="text-white/95 text-lg font-medium">
                    {item.stock} available
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-white/95 text-sm font-medium mb-2">
              Description
            </h3>
            <p className="text-[#A3A3A3] text-sm leading-relaxed">
              {item.description}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[#A3A3A3] text-xs">Category</span>
              <p className="text-white/95 text-sm font-medium">
                {item.category?.title || "Uncategorized"}
              </p>
            </div>
            <div>
              <span className="text-[#A3A3A3] text-xs">Status</span>
              <p className="text-white/95 text-sm font-medium capitalize">
                {item.status}
              </p>
            </div>
            <div>
              <span className="text-[#A3A3A3] text-xs">Seller</span>
              <p className="text-white/95 text-sm font-medium font-mono">
                {item.seller?.walletAddress?.slice(0, 8)}...
                {item.seller?.walletAddress?.slice(-6)}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <EyeIcon />
              <span className="text-[#A3A3A3] text-xs">{item.views} views</span>
            </div>
          </div>

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div>
              <span className="text-[#A3A3A3] text-xs mb-2 block">Tags</span>
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag, index) => (
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
          {item.media && item.media.length > 1 && (
            <div>
              <span className="text-[#A3A3A3] text-xs mb-2 block">
                Additional Media
              </span>
              <div className="grid grid-cols-3 gap-2">
                {item.media.slice(1).map((media, index) => (
                  <div
                    key={index}
                    className="aspect-video bg-[#171717] rounded-[10px] overflow-hidden"
                  >
                    <Image
                      src={media.url}
                      alt={`${item.title} - ${index + 2}`}
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

      {/* Purchase Panel */}
      <SlidingPanel
        isOpen={isPurchasePanelOpen}
        onClose={() => {
          setIsPurchasePanelOpen(false);
          setPurchaseError(null);
        }}
        title="Purchase Item"
      >
        {item && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white/95 text-lg font-medium mb-2">
                {item.title}
              </h3>
              <p className="text-[#A3A3A3] text-sm">
                ${item.price} {item.currency} each
              </p>
            </div>

            <div>
              <label className="block text-white/95 text-sm font-medium mb-2">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                max={item.stock}
                value={quantity}
                onChange={(e) =>
                  setQuantity(Math.max(1, Math.min(item.stock || 1, parseInt(e.target.value) || 1)))
                }
                className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 outline-none focus:border-[#333] transition-colors"
              />
              <p className="text-[#A3A3A3] text-xs mt-1">
                {item.stock} available
              </p>
            </div>

            <div className="bg-[#262626] rounded-[10px] p-4 border border-[#333]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#A3A3A3] text-sm">Subtotal</span>
                <span className="text-white/95 text-sm">
                  ${(item.price * quantity).toFixed(2)} {item.currency}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/95 font-medium">Total</span>
                <span className="text-white/95 text-lg font-medium">
                  ${(item.price * quantity).toFixed(2)} {item.currency}
                </span>
              </div>
            </div>

            {purchaseError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-[10px] p-3">
                <p className="text-red-400 text-sm">{purchaseError}</p>
              </div>
            )}

            <Button
              onClick={handlePurchase}
              isLoading={purchaseMutation.isPending}
              loadingText="Processing..."
              className="w-full"
              disabled={!user?.id || item.stock === 0}
            >
              Confirm Purchase
            </Button>
          </div>
        )}
      </SlidingPanel>
    </Modal>
  );
};

export default MarketItemDetailModal;

