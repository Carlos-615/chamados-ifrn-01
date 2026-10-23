import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { getTodayISODate } from "../utils/formatters";

export function ChamadoForm() {
  const { id } = useParams();
  const isEdicao = Boolean(id);
  const navigate = useNavigate();

  // Opções para preencher os selects vindos da API
  const [tipos, setTipos] = useState([]);
  const [locais, setLocais] = useState([]);
  const [prioridades, setPrioridades] = useState([]);

  // Campos do formulário
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState("");
  const [local, setLocal] = useState("");
  const [prioridade, setPrioridade] = useState("");
  const [dataAbertura, setDataAbertura] = useState(getTodayISODate());

  // Estados de controle
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [isResolvido, setIsResolvido] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  // Carrega opções e dados do chamado se for edição
  useEffect(() => {
    async function carregarDados() {
      try {
        setCarregando(true);
        setMensagemErro("");

        // 1. Carrega opções dos selects
        const [resTipos, resLocais, resPrioridades] = await Promise.all([
          api.get("/tipos"),
          api.get("/locais"),
          api.get("/prioridades"),
        ]);

        setTipos(resTipos.data);
        setLocais(resLocais.data);
        setPrioridades(resPrioridades.data);

        // 2. Se for edição, carrega o chamado existente
        if (isEdicao && id) {
          const resChamado = await api.get(`/chamados/${id}`);
          const chamado = resChamado.data;

          if (chamado.status === "resolvido") {
            setIsResolvido(true);
          }

          setTitulo(chamado.titulo || "");
          setDescricao(chamado.descricao || "");
          setTipo(chamado.tipo || resTipos.data[0] || "");
          setLocal(chamado.local || resLocais.data[0] || "");
          setPrioridade(chamado.prioridade || resPrioridades.data[0] || "");
          setDataAbertura(chamado.data_abertura || getTodayISODate());
        } else {
          // Valores padrão se for novo
          if (resTipos.data.length > 0) setTipo(resTipos.data[0]);
          if (resLocais.data.length > 0) setLocal(resLocais.data[0]);
          if (resPrioridades.data.length > 0) setPrioridade(resPrioridades.data[0]);
        }
      } catch (err) {
        console.error(err);
        setMensagemErro("Erro ao carregar dados do formulário.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDados();
  }, [id, isEdicao]);

  // Salvar chamado (POST para novo, PUT para editar)
  async function handleSubmit(e) {
    e.preventDefault();
    setMensagemErro("");
    setMensagemSucesso("");

    if (titulo.trim().length < 3) {
      setMensagemErro("O título deve ter pelo menos 3 caracteres.");
      return;
    }

    const dados = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      tipo,
      local,
      prioridade,
      data_abertura: dataAbertura,
    };

    try {
      setSalvando(true);
      if (isEdicao) {
        await api.put(`/chamados/${id}`, dados);
        setMensagemSucesso("Chamado atualizado com sucesso!");
        setTimeout(() => navigate(`/chamado/${id}`), 1000);
      } else {
        const res = await api.post("/chamados", dados);
        setMensagemSucesso("Chamado criado com sucesso!");
        setTimeout(() => navigate(`/chamado/${res.data.id}`), 1000);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.detail) {
        const d = err.response.data.detail;
        setMensagemErro(typeof d === "string" ? d : "Dados inválidos. Verifique os campos.");
      } else {
        setMensagemErro("Erro ao salvar o chamado.");
      }
    } finally {
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
        Carregando formulário...
      </div>
    );
  }

  // Regra do PDF: não permitir editar chamados resolvidos
  if (isEdicao && isResolvido) {
    return (
      <div className="bg-amber-50 p-6 rounded-lg border border-amber-200 text-center max-w-lg mx-auto">
        <h2 className="text-lg font-bold text-amber-800 mb-2">Chamado Resolvido</h2>
        <p className="text-sm text-amber-700 mb-4">
          Este chamado já foi resolvido e não pode mais ser editado.
        </p>
        <Link
          to={`/chamado/${id}`}
          className="text-emerald-700 underline font-medium text-sm"
        >
          ← Voltar para o detalhe do chamado
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <Link to="/" className="inline-block text-emerald-700 hover:underline font-medium text-sm">
        ← Voltar
      </Link>

      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100">
          {isEdicao ? "Editar chamado" : "Abrir chamado"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mensagem de erro */}
          {mensagemErro && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
              {mensagemErro}
            </div>
          )}

          {/* Mensagem de sucesso */}
          {mensagemSucesso && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded">
              {mensagemSucesso}
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Título
            </label>
            <input
              type="text"
              required
              minLength={3}
              maxLength={80}
              placeholder="Ex: Torneira vazando no banheiro"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              rows={3}
              maxLength={500}
              placeholder="Descreva o problema com mais detalhes..."
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          {/* Tipo e Local */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Tipo
              </label>
              <select
                required
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                {tipos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Local
              </label>
              <select
                required
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                {locais.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prioridade e Data de abertura */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Prioridade
              </label>
              <select
                required
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              >
                {prioridades.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Data de abertura
              </label>
              <input
                type="date"
                required
                value={dataAbertura}
                onChange={(e) => setDataAbertura(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm bg-white"
              />
            </div>
          </div>

          {/* Botões Salvar e Cancelar */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(isEdicao ? `/chamado/${id}` : "/")}
              className="px-4 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-5 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded cursor-pointer"
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
