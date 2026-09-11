import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import { ProtectedRoute } from './ProtectedRoute';

// dashboard routing
const DashboardDefault = Loadable(
  lazy(() => import('views/dashboard/Default'))
);

// utilities routing
const UtilsTypography = Loadable(
  lazy(() => import('views/utilities/Typography'))
);

const UtilsColor = Loadable(
  lazy(() => import('views/utilities/Color'))
);

const UtilsShadow = Loadable(
  lazy(() => import('views/utilities/Shadow'))
);

// tickets
const TicketList = Loadable(
  lazy(() => import('views/tickets/TicketList'))
);

const TicketCreate = Loadable(
  lazy(() => import('views/tickets/TicketCreate'))
);

const TicketView = Loadable(
  lazy(() => import('views/tickets/TicketView'))
);


// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [

    // Dashboard
    {
      path: '/',
      element: (
        <ProtectedRoute>
          <DashboardDefault />
        </ProtectedRoute>
      )
    },

    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: (
            <ProtectedRoute>
              <DashboardDefault />
            </ProtectedRoute>
          )
        }
      ]
    },

    // Utilities
    {
      path: 'typography',
      element: (
        <ProtectedRoute>
          <UtilsTypography />
        </ProtectedRoute>
      )
    },

    {
      path: 'color',
      element: (
        <ProtectedRoute>
          <UtilsColor />
        </ProtectedRoute>
      )
    },

    {
      path: 'shadow',
      element: (
        <ProtectedRoute>
          <UtilsShadow />
        </ProtectedRoute>
      )
    },

    // Tickets
    {
      path: 'tickets',
      element: (
        <ProtectedRoute>
          <TicketList />
        </ProtectedRoute>
      )
    },

    {
      path: 'tickets/create',
      element: (
        <ProtectedRoute>
          <TicketCreate />
        </ProtectedRoute>
      )
    },

    // Visualizar chamado
    {
      path: 'tickets/:id',
      element: (
        <ProtectedRoute>
          <TicketView />
        </ProtectedRoute>
      )
    }
  ]
};

export default MainRoutes;