"use client";

import * as React from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import {
  MarketItem,
  CreateMarketItemRequest,
  UpdateMarketItemRequest,
  Media,
} from "@/app/services.tsx/api-client";
import { useCategories } from "@/app/hooks/use-categories-query";
import { useAuthStore } from "@/app/store";

interface MarketItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateMarketItemRequest | UpdateMarketItemRequest) => Promise<void>;
  item?: MarketItem | null;
  isLoading?: boolean;
}

export const MarketItemModal: React.FC<MarketItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  item,
  isLoading = false,
}) => {
  const { user } = useAuthStore();
  const { data: categories } = useCategories("market");
  const [formData, setFormData] = React.useState({
    title: item?.title || "",
    description: item?.description || "",
    price: item?.price || 0,
    currency: item?.currency || "USD",
    stock: item?.stock || 1,
    categoryId: item?.categoryId || "",
    tags: item?.tags?.join(", ") || "",
    media: item?.media || [] as Media[],
  });
  const [mediaUrl, setMediaUrl] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        price: item.price,
        currency: item.currency,
        stock: item.stock,
        categoryId: item.categoryId,
        tags: item.tags?.join(", ") || "",
        media: item.media || [],
      });
    } else {
      setFormData({
        title: "",
        description: "",
        price: 0,
        currency: "USD",
        stock: 1,
        categoryId: "",
        tags: "",
        media: [],
      });
    }
    setMediaUrl("");
    setErrors({});
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }
    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required";
    }
    if (!user?.id) {
      newErrors.general = "You must be authenticated";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const tags = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const submitData: CreateMarketItemRequest | UpdateMarketItemRequest = {
      ...(item ? {} : { sellerId: user!.id }),
      categoryId: formData.categoryId,
      title: formData.title.trim(),
      description: formData.description.trim(),
      price: formData.price,
      currency: formData.currency,
      stock: formData.stock,
      tags,
      media: formData.media,
    };

    await onSubmit(submitData);
  };

  const addMedia = () => {
    if (mediaUrl.trim()) {
      const newMedia: Media = {
        url: mediaUrl.trim(),
        type: mediaUrl.match(/\.(mp4|webm|ogg)$/i) ? "video" : "image",
        order: formData.media.length,
      };
      setFormData({
        ...formData,
        media: [...formData.media, newMedia],
      });
      setMediaUrl("");
    }
  };

  const removeMedia = (index: number) => {
    setFormData({
      ...formData,
      media: formData.media.filter((_, i) => i !== index),
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? "Edit Market Item" : "Create Market Item"}
      size="lg"
      footer={
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="ghostly"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            isLoading={isLoading}
            loadingText={item ? "Updating..." : "Creating..."}
            className="flex-1"
          >
            {item ? "Update" : "Create"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-[10px] p-3">
            <p className="text-red-400 text-sm">{errors.general}</p>
          </div>
        )}

        <div>
          <label className="block text-white/95 text-sm font-medium mb-2">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 placeholder:text-[#7b7b7b] outline-none focus:border-[#333] transition-colors"
            placeholder="Enter item title"
          />
          {errors.title && (
            <p className="text-red-400 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-white/95 text-sm font-medium mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
            className="w-full rounded-[10px] px-3 py-2 border border-[#262626] bg-[#171717] text-white/95 placeholder:text-[#7b7b7b] outline-none focus:border-[#333] transition-colors resize-none"
            placeholder="Enter item description"
          />
          {errors.description && (
            <p className="text-red-400 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/95 text-sm font-medium mb-2">
              Price *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
              }
              className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 placeholder:text-[#7b7b7b] outline-none focus:border-[#333] transition-colors"
              placeholder="0.00"
            />
            {errors.price && (
              <p className="text-red-400 text-xs mt-1">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-white/95 text-sm font-medium mb-2">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData({ ...formData, currency: e.target.value })
              }
              className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 outline-none focus:border-[#333] transition-colors"
            >
              <option value="USD">USD</option>
              <option value="USDC">USDC</option>
              <option value="SOL">SOL</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/95 text-sm font-medium mb-2">
              Stock
            </label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
              }
              className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 placeholder:text-[#7b7b7b] outline-none focus:border-[#333] transition-colors"
            />
          </div>

          <div>
            <label className="block text-white/95 text-sm font-medium mb-2">
              Category *
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 outline-none focus:border-[#333] transition-colors"
            >
              <option value="">Select a category</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-400 text-xs mt-1">{errors.categoryId}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-white/95 text-sm font-medium mb-2">
            Tags (comma-separated)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) =>
              setFormData({ ...formData, tags: e.target.value })
            }
            className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 placeholder:text-[#7b7b7b] outline-none focus:border-[#333] transition-colors"
            placeholder="tag1, tag2, tag3"
          />
        </div>

        <div>
          <label className="block text-white/95 text-sm font-medium mb-2">
            Media URLs
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMedia();
                }
              }}
              className="flex-1 h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 placeholder:text-[#7b7b7b] outline-none focus:border-[#333] transition-colors"
              placeholder="https://example.com/image.jpg"
            />
            <Button type="button" onClick={addMedia} variant="default">
              Add
            </Button>
          </div>
          {formData.media.length > 0 && (
            <div className="space-y-2">
              {formData.media.map((media, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-[#262626] rounded-[10px] p-2 border border-[#333]"
                >
                  <span className="text-[#A3A3A3] text-xs truncate flex-1">
                    {media.url}
                  </span>
                  <Button
                    type="button"
                    variant="ghostly"
                    onClick={() => removeMedia(index)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default MarketItemModal;

