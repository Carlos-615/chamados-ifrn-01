import React from "react";

export function ConfirmModal({ isOpen, mensagem, onConfirmar, onCancelar }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmação</h3>
        <p className="text-sm text-gray-600 mb-6">
          {mensagem || "Tem certeza que deseja excluir este chamado?"}
        </p>
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded cursor-pointer"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
