"use client";

import * as React from "react";
import { Modal } from "./modal";
import { Button } from "./button";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
}

export const DeleteModal: React.FC<DeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading = false,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
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
            variant="destructive"
            onClick={onConfirm}
            isLoading={isLoading}
            loadingText="Deleting..."
            className="flex-1"
          >
            Delete
          </Button>
        </div>
      }
    >
      <div className="py-4">
        <p className="text-[#A3A3A3] text-sm mb-4">{description}</p>
        {itemName && (
          <div className="bg-[#262626] rounded-[10px] p-3 border border-[#333]">
            <p className="text-white/95 text-sm font-medium">{itemName}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DeleteModal;

