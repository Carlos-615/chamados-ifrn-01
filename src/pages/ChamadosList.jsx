import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { formatDateBR } from "../utils/formatters";

export function ChamadosList() {
  const [chamados, setChamados] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [locais, setLocais] = useState([]);
  const [prioridades, setPrioridades] = useState([]);

  // Filtros
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [tipo, setTipo] = useState("");
  const [local, setLocal] = useState("");
  const [prioridade, setPrioridade] = useState("");

  // Estados da tela
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Carrega opções dos selects
  useEffect(() => {
    async function carregarOpcoes() {
      try {
        const [resTipos, resLocais, resPrioridades] = await Promise.all([
          api.get("/tipos"),
          api.get("/locais"),
          api.get("/prioridades"),
        ]);
        setTipos(resTipos.data);
        setLocais(resLocais.data);
        setPrioridades(resPrioridades.data);
      } catch (err) {
        console.error("Erro ao carregar opções dos filtros:", err);
      }
    }
    carregarOpcoes();
  }, []);

  // Carrega os chamados com filtros
  async function carregarChamados() {
    try {
      setCarregando(true);
      setErro(null);

      const params = {};
      if (busca) params.busca = busca;
      if (status) params.status = status;
      if (tipo) params.tipo = tipo;
      if (local) params.local = local;
      if (prioridade) params.prioridade = prioridade;

      const response = await api.get("/chamados", { params });
      setChamados(response.data);
    } catch (err) {
      console.error(err);
      setErro("Não foi possível carregar. Verifique sua chave.");
      setChamados([]);
    } finally {
      setCarregando(false);
    }
  }

  // Atualiza a listagem ao alterar qualquer filtro
  useEffect(() => {
    carregarChamados();
  }, [busca, status, tipo, local, prioridade]);

  return (
    <div className="space-y-6">
      {/* Topo da lista: Título e Botão + Abrir chamado */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Chamados</h1>
        <Link
          to="/novo"
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          + Abrir chamado
        </Link>
      </div>

      {/* Barra de Busca e Filtros conforme o desenho do professor */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm space-y-3">
        {/* Campo de Busca */}
        <input
          type="text"
          placeholder="Buscar por título ou descrição..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />

        {/* Linha com os 4 Selects */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value="">Status ▾</option>
            <option value="aberto">aberto</option>
            <option value="em andamento">em andamento</option>
            <option value="resolvido">resolvido</option>
          </select>

          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value="">Tipo ▾</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <select
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value="">Local ▾</option>
            {locais.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>

          <select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
          >
            <option value="">Prioridade ▾</option>
            {prioridades.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Estados da tela: Carregando, Erro, Lista vazia ou Lista de cards */}
      {carregando && (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
          Carregando chamados...
        </div>
      )}

      {erro && (
        <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center text-red-700">
          <p className="font-semibold">{erro}</p>
        </div>
      )}

      {!carregando && !erro && chamados.length === 0 && (
        <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
          Nenhum chamado encontrado.
        </div>
      )}

      {!carregando && !erro && chamados.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chamados.map((c) => (
            <Link
              key={c.id}
              to={`/chamado/${c.id}`}
              className="bg-white p-4 rounded-lg border border-gray-200 hover:border-emerald-500 shadow-sm transition block"
            >
              <div className="flex items-center justify-between mb-2">
                <StatusBadge status={c.status} />
                <PriorityBadge prioridade={c.prioridade} />
              </div>

              <h2 className="text-lg font-bold text-gray-800 line-clamp-1">
                {c.titulo}
              </h2>

              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                {c.descricao || "Sem descrição."}
              </p>

              <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{c.local} • {c.tipo}</span>
                <span>{formatDateBR(c.data_abertura)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
