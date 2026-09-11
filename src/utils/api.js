const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Fila de requisições pendentes aguardando renovação de sessão
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

// Função auxiliar para extrair o valor do cookie XSRF-TOKEN enviado pelo Spring Security
function getCsrfToken() {
  const match = document.cookie.match(new RegExp('(^| )XSRF-TOKEN=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

// Monta a query string a partir de um objeto { chave: valor }, ignorando valores vazios/nulos
function buildQueryString(params) {
  if (!params || Object.keys(params).length === 0) return '';

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

async function request(endpoint, options = {}, isRetry = false) {
  const { params, ...restOptions } = options;

  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = `${API_URL}${path}${buildQueryString(params)}`;

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(restOptions.headers || {})
  };

  if (restOptions.body instanceof FormData) {
    delete defaultHeaders['Content-Type'];
  }

  // Anexa o cabeçalho X-XSRF-TOKEN para métodos mutativos (POST, PUT, DELETE, PATCH)
  const method = (restOptions.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(method)) {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      defaultHeaders['X-XSRF-TOKEN'] = csrfToken;
    }
  }

  // O cookie httpOnly (JWT) e o cookie XSRF-TOKEN são enviados via credentials: 'include'
  const config = {
    ...restOptions,
    credentials: 'include',
    headers: defaultHeaders
  };

  let response;
  try {
    response = await fetch(url, config);
  } catch (fetchError) {
    const error = new Error(`Erro de conexão: Servidor indisponível (${API_URL}).`);
    error.status = 503;
    error.response = { data: null };
    throw error;
  }

  const isAuthEndpoint = endpoint.includes('/api/auth/');
  const shouldTryRefresh = response.status === 401 && !isAuthEndpoint && !isRetry;

  if (shouldTryRefresh) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => request(endpoint, options, true));
    }

    isRefreshing = true;

    try {
      const refreshHeaders = {};
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        refreshHeaders['X-XSRF-TOKEN'] = csrfToken;
      }

      const refreshRes = await fetch(`${API_URL}/api/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: refreshHeaders
      });

      if (!refreshRes.ok) {
        throw new Error('Sessão expirada');
      }

      const userData = await refreshRes.json();

      // Guarda só dados de exibição, nunca o token — o cookie já cuida da autenticação
      localStorage.setItem(
        'user',
        JSON.stringify({
          email: userData.email,
          name: userData.name,
          role: userData.role
        })
      );

      processQueue(null);
      isRefreshing = false;

      return request(endpoint, options, true);
    } catch (refreshErr) {
      processQueue(refreshErr);
      isRefreshing = false;

      localStorage.removeItem('user');

      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      throw refreshErr;
    }
  }

  if (!response.ok) {
    if (response.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }

    let errorData = null;
    let errorMessage = `Erro HTTP ${response.status}`;

    try {
      const jsonData = await response.json();
      errorData = jsonData;
      if (jsonData.message) {
        errorMessage = jsonData.message;
      } else if (jsonData.error) {
        errorMessage = jsonData.error;
      } else if (typeof jsonData === 'string') {
        errorMessage = jsonData;
      }
    } catch {
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {}
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData;
    error.statusText = response.statusText;
    throw error;
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'POST', body: body instanceof FormData ? body : JSON.stringify(body) }),
  put: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PUT', body: body instanceof FormData ? body : JSON.stringify(body) }),
  patch: (endpoint, body, options) =>
    request(endpoint, { ...options, method: 'PATCH', body: body instanceof FormData ? body : JSON.stringify(body) }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' })
};

export default apiClient;