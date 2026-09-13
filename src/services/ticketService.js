import api from 'utils/api';

/**
 * Obter lista de tickets do usuário autenticado
 * @returns {Promise<Array>} Lista de tickets
 */

export const getTickets = async (page = 0, size = 10) => {
  const response = await api.get(`/api/tickets?page=${page}&size=${size}`);
  return response;
};

/**
 * Obter detalhes de um ticket específico
 * @param {number} id - ID do ticket
 * @returns {Promise<Object>} Dados do ticket
 */
export const getTicketById = async (id) => {
  const response = await api.get(`/api/tickets/${id}`);
  return response;
};


export const changeTicketStatus = async (id, status, reason) => {
  return api.patch(`/api/tickets/${id}/status`, { status, reason });
};

export const changeTicketPriority = async (id, priority) => {
  return api.patch(`/api/tickets/${id}/priority`, { priority });
};

/**
 * Criar novo ticket
 * @param {Object} ticketData - Dados do ticket
 * @param {string} ticketData.title - Título do ticket
 * @param {string} ticketData.description - Descrição do ticket
 * @param {string} ticketData.priority - Prioridade (ALTA, MÉDIA, BAIXA)
 * @param {string} ticketData.category - Categoria do ticket
 * @param {number} ticketData.departmentId - ID do departamento
 * @returns {Promise<Object>} Dados do ticket criado
 */
export const createTicket = async (ticketData) => {
    console.log('========== CREATE TICKET ==========');
    console.log('URL: /api/tickets');
    console.log('DATA:', ticketData);

    try {
        const response = await api.post('/api/tickets', ticketData);

        console.log('CREATE TICKET RESPONSE:', response);

        return response;
    } catch (error) {
        console.error('========== CREATE TICKET ERROR ==========');
        console.error('STATUS:', error?.response?.status);
        console.error('DATA:', error?.response?.data);
        console.error('ERROR:', error);

        throw error;
    }
};

export const updateTicket = async (id, ticketData) => {
  return api.put(`/api/tickets/${id}`, ticketData);
};

export const getTicketComments = async (ticketId) => {
  return api.get(`/api/tickets/${ticketId}/comments`);
};

export const addTicketComment = async (ticketId, content) => {
  return api.post(`/api/tickets/${ticketId}/comments`, { content });
};
