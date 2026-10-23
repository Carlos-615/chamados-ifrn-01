import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { StatusBadge } from "../components/StatusBadge";
import { PriorityBadge } from "../components/PriorityBadge";
import { ConfirmModal } from "../components/ConfirmModal";
import { formatDateBR } from "../utils/formatters";

export function ChamadoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [chamado, setChamado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  // Estados dos inputs da próxima etapa
  const [responsavel, setResponsavel] = useState("");
  const [solucao, setSolucao] = useState("");
  const [enviandoEtapa, setEnviandoEtapa] = useState(false);
  const [mensagemEtapa, setMensagemEtapa] = useState("");

  // Estado da confirmação de exclusão
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  // Busca dados do chamado
  async function carregarChamado() {
    try {
      setCarregando(true);
      setErro(null);
      const response = await api.get(`/chamados/${id}`);
      setChamado(response.data);
    } catch (err) {
      console.error(err);
      setErro("Não foi possível carregar o chamado.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarChamado();
  }, [id]);

  // Ação: Iniciar Atendimento (aberto -> em andamento)
  async function handleIniciar(e) {
    e.preventDefault();
    if (!responsavel.trim()) return;

    try {
      setEnviandoEtapa(true);
      setMensagemEtapa("");
      const response = await api.patch(`/chamados/${id}/iniciar`, {
        responsavel: responsavel.trim(),
      });
      setChamado(response.data);
      setResponsavel("");
      setMensagemEtapa("Atendimento iniciado com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao iniciar atendimento.");
    } finally {
      setEnviandoEtapa(false);
    }
  }

  // Ação: Resolver Chamado (em andamento -> resolvido)
  async function handleResolver(e) {
    e.preventDefault();
    if (!solucao.trim()) return;

    try {
      setEnviandoEtapa(true);
      setMensagemEtapa("");
      const response = await api.patch(`/chamados/${id}/resolver`, {
        solucao: solucao.trim(),
      });
      setChamado(response.data);
      setSolucao("");
      setMensagemEtapa("Chamado resolvido com sucesso!");
    } catch (err) {
      console.error(err);
      alert("Erro ao resolver chamado.");
    } finally {
      setEnviandoEtapa(false);
    }
  }

  // Ação: Excluir chamado com confirmação
  async function handleConfirmarExcluir() {
    try {
      await api.delete(`/chamados/${id}`);
      setModalExcluirAberto(false);
      navigate("/");
    } catch (err) {
      console.error(err);
      alert("Erro ao excluir chamado.");
      setModalExcluirAberto(false);
    }
  }

  if (carregando) {
    return (
      <div className="bg-white p-8 rounded-lg border border-gray-200 text-center text-gray-500">
        Carregando chamado...
      </div>
    );
  }

  if (erro || !chamado) {
    return (
      <div className="bg-red-50 p-6 rounded-lg border border-red-200 text-center">
        <p className="text-red-700 font-semibold mb-3">{erro || "Chamado não encontrado."}</p>
        <Link to="/" className="text-emerald-700 underline text-sm">
          ← Voltar para a lista
        </Link>
      </div>
    );
  }

  const resolvido = chamado.status === "resolvido";

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      {/* Botão Voltar */}
      <Link to="/" className="inline-block text-emerald-700 hover:underline font-medium text-sm">
        ← Voltar
      </Link>

      {/* Caixa de detalhes */}
      <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
        {/* Badges de status e prioridade */}
        <div className="flex items-center gap-2">
          <StatusBadge status={chamado.status} />
          <PriorityBadge prioridade={chamado.prioridade} />
        </div>

        <h1 className="text-2xl font-bold text-gray-900">{chamado.titulo}</h1>

        {/* Campos de texto conforme o modelo */}
        <div className="space-y-2 text-sm text-gray-700 pt-2 border-t border-gray-100">
          <p>
            <strong>Descrição:</strong> {chamado.descricao || "Sem descrição"}
          </p>
          <p>
            <strong>Tipo:</strong> {chamado.tipo}
          </p>
          <p>
            <strong>Local:</strong> {chamado.local}
          </p>
          <p>
            <strong>Aberto em:</strong> {formatDateBR(chamado.data_abertura)}
          </p>
          <p>
            <strong>Responsável:</strong> {chamado.responsavel || "Nenhum responsável ainda"}
          </p>
          <p>
            <strong>Solução:</strong> {chamado.solucao || "Nenhuma solução registrada"}
          </p>
          {chamado.data_resolucao && (
            <p>
              <strong>Data de resolução:</strong> {formatDateBR(chamado.data_resolucao)}
            </p>
          )}
        </div>

        {/* Botões Editar e Excluir */}
        <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
          {!resolvido ? (
            <Link
              to={`/editar/${chamado.id}`}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded transition"
            >
              Editar
            </Link>
          ) : (
            <span className="text-xs text-gray-400 italic">
              Chamados resolvidos não podem ser editados.
            </span>
          )}

          <button
            type="button"
            onClick={() => setModalExcluirAberto(true)}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium rounded transition cursor-pointer"
          >
            Excluir
          </button>
        </div>

        {/* Bloco: Próxima etapa (mostra apenas a que vale para o status atual) */}
        <div className="mt-6 pt-4 border-t border-gray-200 bg-gray-50 p-4 rounded-lg">
          <h2 className="text-sm font-bold text-gray-800 mb-1">Próxima etapa</h2>
          <p className="text-xs text-gray-500 mb-3">
            aberto: iniciar atendimento · em andamento: resolver
          </p>

          {mensagemEtapa && (
            <p className="text-xs font-semibold text-emerald-700 mb-2">{mensagemEtapa}</p>
          )}

          {/* Se status === 'aberto' -> formulário para Iniciar Atendimento */}
          {chamado.status === "aberto" && (
            <form onSubmit={handleIniciar} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                required
                placeholder="Nome do Responsável..."
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded bg-white"
              />
              <button
                type="submit"
                disabled={enviandoEtapa}
                className="px-4 py-2 text-sm bg-amber-600 hover:bg-amber-700 text-white font-medium rounded transition"
              >
                {enviandoEtapa ? "Iniciando..." : "Iniciar Atendimento"}
              </button>
            </form>
          )}

          {/* Se status === 'em andamento' -> formulário para Resolver Chamado */}
          {chamado.status === "em andamento" && (
            <form onSubmit={handleResolver} className="space-y-2">
              <textarea
                required
                rows={2}
                placeholder="Descreva a Solução..."
                value={solucao}
                onChange={(e) => setSolucao(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded bg-white"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={enviandoEtapa}
                  className="px-4 py-2 text-sm bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded transition"
                >
                  {enviandoEtapa ? "Salvando..." : "Resolver Chamado"}
                </button>
              </div>
            </form>
          )}

          {/* Se status === 'resolvido' -> aviso de que não há etapas pendentes */}
          {chamado.status === "resolvido" && (
            <p className="text-xs text-emerald-800 font-medium">
              ✅ Chamado finalizado e resolvido.
            </p>
          )}
        </div>
      </div>

      {/* Modal de confirmação antes de excluir */}
      <ConfirmModal
        isOpen={modalExcluirAberto}
        mensagem="Tem certeza que deseja excluir este chamado?"
        onConfirmar={handleConfirmarExcluir}
        onCancelar={() => setModalExcluirAberto(false)}
      />
    </div>
  );
}
