// src/components/shared/DeleteConfirmModal.jsx
import React from "react";
import { AlertTriangle, X } from "lucide-react";
import { Button } from "./index";

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemImage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
              <AlertTriangle size={24} />
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"
            >
              <X size={20} />
            </button>
          </div>

          <h3 className="text-xl font-black text-slate-900 mb-2">
            Delete Product?
          </h3>
          <p className="text-slate-500 text-sm mb-6 leading-relaxed">
            Are you sure you want to delete{" "}
            <span className="font-bold text-slate-800">"{itemName}"</span>? This
            action is permanent and will remove all pricing variants and
            inventory data.
          </p>

          {itemImage && (
            <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100 mb-6">
              <img
                src={itemImage}
                alt={itemName}
                className="w-12 h-12 rounded-lg object-cover shadow-sm"
              />
              <span className="text-xs font-bold text-slate-600 truncate">
                {itemName}
              </span>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              fullWidth
              onClick={onClose}
              className="text-slate-600"
            >
              Cancel
            </Button>
            <Button
              variant="dark"
              fullWidth
              onClick={onConfirm}
              className="bg-rose-600 hover:bg-rose-700 shadow-lg shadow-rose-100"
            >
              Yes, Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
