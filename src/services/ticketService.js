import api from 'utils/api';

/**
 * Obter lista de tickets do usuário autenticado
 * @returns {Promise<Array>} Lista de tickets
 */
export const getTickets = async () => {
  const response = await api.get('/api/tickets');
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