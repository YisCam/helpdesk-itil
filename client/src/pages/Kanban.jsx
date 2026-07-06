import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';

const COLUMNAS = ['Abierto', 'En Progreso', 'Resuelto', 'Cerrado'];

const colorColumna = {
  Abierto:       'border-red-300 bg-red-50',
  'En Progreso': 'border-amber-300 bg-amber-50',
  Resuelto:      'border-green-300 bg-green-50',
  Cerrado:       'border-gray-300 bg-gray-50',
};

const colorHeader = {
  Abierto:       'text-red-700 bg-red-100',
  'En Progreso': 'text-amber-700 bg-amber-100',
  Resuelto:      'text-green-700 bg-green-100',
  Cerrado:       'text-gray-600 bg-gray-100',
};

const colorPrioridad = {
  Critica: 'bg-red-50 text-red-700',
  Alta:    'bg-amber-50 text-amber-700',
  Media:   'bg-blue-50 text-blue-700',
  Baja:    'bg-gray-100 text-gray-600',
};

function TicketCard({ ticket, overlay }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: ticket.id });
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const slug = usuario?.slug || 'aurogal';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white border border-gray-200 rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing
        ${overlay ? 'shadow-xl rotate-1 scale-105' : 'hover:shadow-md transition-shadow'}`}
      onClick={() => !overlay && navigate(`/${slug}/tickets/${ticket.id}`)}
    >
      <p className="text-xs text-gray-400 mb-1">{ticket.codigo}</p>
      <p className="text-sm font-medium text-gray-800 mb-2 leading-snug">{ticket.titulo}</p>
      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorPrioridad[ticket.prioridad]}`}>
          {ticket.prioridad}
        </span>
        {ticket.asignado_a_nombre && (
          <div className="w-6 h-6 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-xs font-bold">
            {ticket.asignado_a_nombre?.charAt(0)}
          </div>
        )}
      </div>
      {ticket.sla_limite && (
        <p className={`text-xs mt-2 ${new Date(ticket.sla_limite) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
          ⏱ {new Date(ticket.sla_limite).toLocaleDateString('es-PE')}
        </p>
      )}
    </div>
  );
}

function Columna({ estado, tickets }) {
  return (
    <div className={`flex flex-col rounded-xl border-2 ${colorColumna[estado]} min-h-[500px] w-72 flex-shrink-0`}>
      <div className={`flex items-center justify-between px-4 py-3 rounded-t-xl ${colorHeader[estado]}`}>
        <span className="text-sm font-semibold">{estado}</span>
        <span className="text-xs font-bold bg-white/50 px-2 py-0.5 rounded-full">{tickets.length}</span>
      </div>
      <div className="flex flex-col gap-2 p-3 flex-1">
        <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tickets.map(ticket => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </SortableContext>
        {tickets.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-xs text-gray-400">Sin tickets</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Kanban() {
  const [tickets, setTickets] = useState([]);
  const [activeTicket, setActiveTicket] = useState(null);
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const slug = usuario?.slug || 'aurogal';
  const puedeEditar = usuario?.rol === 'admin' || usuario?.rol === 'tecnico';

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const cargarTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Error al cargar tickets:', err);
    }
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  const getTicketsPorEstado = (estado) => tickets.filter(t => t.estado === estado);

  const findEstado = (ticketId) => tickets.find(t => t.id === ticketId)?.estado;

  const handleDragStart = (event) => {
    const ticket = tickets.find(t => t.id === event.active.id);
    setActiveTicket(ticket);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTicket(null);

    if (!over || !puedeEditar) return;

    const ticketId = active.id;
    const estadoOrigen = findEstado(ticketId);

    let estadoDestino = over.id;
    if (!COLUMNAS.includes(estadoDestino)) {
      estadoDestino = findEstado(estadoDestino);
    }

    if (!estadoDestino || estadoOrigen === estadoDestino) return;

    setTickets(prev => prev.map(t =>
      t.id === ticketId ? { ...t, estado: estadoDestino } : t
    ));

    try {
      await api.patch(`/tickets/${ticketId}/estado`, { estado: estadoDestino });
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      cargarTickets();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header titulo="Kanban" />
        <div className="flex-1 overflow-x-auto p-6">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div className="flex gap-4 h-full">
              {COLUMNAS.map(estado => (
                <Columna
                  key={estado}
                  estado={estado}
                  tickets={getTicketsPorEstado(estado)}
                />
              ))}
            </div>
            <DragOverlay>
              {activeTicket && <TicketCard ticket={activeTicket} overlay />}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
}

export default Kanban;