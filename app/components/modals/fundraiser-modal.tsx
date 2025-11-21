"use client";

import * as React from "react";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import {
  Fundraiser,
  CreateFundraiserRequest,
  UpdateFundraiserRequest,
  Media,
} from "@/app/services.tsx/api-client";
import { useCategories } from "@/app/hooks/use-categories-query";
import { useAuthStore } from "@/app/store";

interface FundraiserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateFundraiserRequest | UpdateFundraiserRequest) => Promise<void>;
  fundraiser?: Fundraiser | null;
  isLoading?: boolean;
}

export const FundraiserModal: React.FC<FundraiserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  fundraiser,
  isLoading = false,
}) => {
  const { user } = useAuthStore();
  const { data: categories } = useCategories("fundraiser");
  const [formData, setFormData] = React.useState({
    title: fundraiser?.title || "",
    summary: fundraiser?.summary || "",
    description: fundraiser?.description || "",
    goal: fundraiser?.goal || 0,
    deadlineAt: fundraiser?.deadlineAt
      ? new Date(fundraiser.deadlineAt).toISOString().slice(0, 16)
      : "",
    categoryId: fundraiser?.categoryId || "",
    tags: fundraiser?.tags?.join(", ") || "",
    media: fundraiser?.media || [] as Media[],
  });
  const [mediaUrl, setMediaUrl] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    if (fundraiser) {
      setFormData({
        title: fundraiser.title,
        summary: fundraiser.summary,
        description: fundraiser.description,
        goal: fundraiser.goal,
        deadlineAt: new Date(fundraiser.deadlineAt).toISOString().slice(0, 16),
        categoryId: fundraiser.categoryId,
        tags: fundraiser.tags?.join(", ") || "",
        media: fundraiser.media || [],
      });
    } else {
      setFormData({
        title: "",
        summary: "",
        description: "",
        goal: 0,
        deadlineAt: "",
        categoryId: "",
        tags: "",
        media: [],
      });
    }
    setMediaUrl("");
    setErrors({});
  }, [fundraiser, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.summary.trim()) {
      newErrors.summary = "Summary is required";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (formData.goal <= 0) {
      newErrors.goal = "Goal must be greater than 0";
    }
    if (!formData.deadlineAt) {
      newErrors.deadlineAt = "Deadline is required";
    } else if (new Date(formData.deadlineAt) <= new Date()) {
      newErrors.deadlineAt = "Deadline must be in the future";
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

    const submitData: CreateFundraiserRequest | UpdateFundraiserRequest = {
      ...(fundraiser ? {} : { ownerId: user!.id }),
      categoryId: formData.categoryId,
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      description: formData.description.trim(),
      goal: formData.goal,
      deadlineAt: new Date(formData.deadlineAt).toISOString(),
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
      title={fundraiser ? "Edit Fundraiser" : "Create Fundraiser"}
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
            loadingText={fundraiser ? "Updating..." : "Creating..."}
            className="flex-1"
          >
            {fundraiser ? "Update" : "Create"}
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
            placeholder="Enter fundraiser title"
          />
          {errors.title && (
            <p className="text-red-400 text-xs mt-1">{errors.title}</p>
          )}
        </div>

        <div>
          <label className="block text-white/95 text-sm font-medium mb-2">
            Summary *
          </label>
          <input
            type="text"
            value={formData.summary}
            onChange={(e) =>
              setFormData({ ...formData, summary: e.target.value })
            }
            className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 placeholder:text-[#7b7b7b] outline-none focus:border-[#333] transition-colors"
            placeholder="Short summary of the fundraiser"
          />
          {errors.summary && (
            <p className="text-red-400 text-xs mt-1">{errors.summary}</p>
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
            placeholder="Enter detailed description"
          />
          {errors.description && (
            <p className="text-red-400 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/95 text-sm font-medium mb-2">
              Goal Amount *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.goal}
              onChange={(e) =>
                setFormData({ ...formData, goal: parseFloat(e.target.value) || 0 })
              }
              className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 placeholder:text-[#7b7b7b] outline-none focus:border-[#333] transition-colors"
              placeholder="0.00"
            />
            {errors.goal && (
              <p className="text-red-400 text-xs mt-1">{errors.goal}</p>
            )}
          </div>

          <div>
            <label className="block text-white/95 text-sm font-medium mb-2">
              Deadline *
            </label>
            <input
              type="datetime-local"
              value={formData.deadlineAt}
              onChange={(e) =>
                setFormData({ ...formData, deadlineAt: e.target.value })
              }
              className="w-full h-10 rounded-[10px] px-3 border border-[#262626] bg-[#171717] text-white/95 outline-none focus:border-[#333] transition-colors"
            />
            {errors.deadlineAt && (
              <p className="text-red-400 text-xs mt-1">{errors.deadlineAt}</p>
            )}
          </div>
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

export default FundraiserModal;

