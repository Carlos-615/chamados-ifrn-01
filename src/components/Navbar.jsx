import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export function Navbar() {
  const [aluno, setAluno] = useState(null);

  useEffect(() => {
    async function carregarAluno() {
      try {
        const response = await api.get("/eu");
        setAluno(response.data);
      } catch (error) {
        console.error("Erro ao buscar dados do aluno:", error);
      }
    }
    carregarAluno();
  }, []);

  return (
    <header className="bg-emerald-700 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <Link to="/" className="text-xl font-bold hover:opacity-90 flex items-center gap-2">
          <span>🛠️</span>
          <span>Sistema de Chamados - IFRN</span>
        </Link>
        <div className="text-sm font-medium bg-emerald-800/80 px-3 py-1.5 rounded-lg">
          {aluno ? (
            <span>Olá, <strong>{aluno.nome}</strong></span>
          ) : (
            <span>Carregando usuário...</span>
          )}
        </div>
      </div>
    </header>
  );
}
