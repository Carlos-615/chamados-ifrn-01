import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar.jsx";
import { ChamadosList } from "./pages/ChamadosList.jsx";
import { ChamadoDetail } from "./pages/ChamadoDetail.jsx";
import { ChamadoForm } from "./pages/ChamadoForm.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
        {/* Top Navbar showing student name from GET /eu, system name, and key status */}
        <Navbar />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <Routes>
            <Route path="/" element={<ChamadosList />} />
            <Route path="/novo" element={<ChamadoForm />} />
            <Route path="/editar/:id" element={<ChamadoForm />} />
            <Route path="/chamado/:id" element={<ChamadoDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="mt-auto border-t border-slate-200 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500 space-y-1">
            <p className="font-semibold text-slate-700">
              Instituto Federal de Educação, Ciência e Tecnologia do Rio Grande do Norte (IFRN)
            </p>
            <p>
              Campus Pau dos Ferros · Técnico Integrado em Informática · Programação para Internet
            </p>
            <p className="text-[11px] text-slate-400">
              Sistema de Chamados de Manutenção · API: api-chamados.jefersonqueiroga.com.br
            </p>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
