import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import { ProtectedRoute } from './ProtectedRoute';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

const TicketList = Loadable(lazy(() => import('views/tickets/TicketList')));
const TicketCreate = Loadable(lazy(() => import('views/tickets/TicketCreate')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <ProtectedRoute><DashboardDefault /></ProtectedRoute>
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <ProtectedRoute><DashboardDefault /></ProtectedRoute>
        }
      ]
    },
    {
      path: 'typography',
      element: <ProtectedRoute><UtilsTypography /></ProtectedRoute>
    },
    {
      path: 'color',
      element: <ProtectedRoute><UtilsColor /></ProtectedRoute>
    },
    {
      path: 'shadow',
      element: <ProtectedRoute><UtilsShadow /></ProtectedRoute>
    },
    {
      path: 'tickets',
      element: <ProtectedRoute><TicketList /></ProtectedRoute>
    },
    {
      path: 'tickets/create',
      element: <ProtectedRoute><TicketCreate /></ProtectedRoute>
    }
  ]
};

export default MainRoutes;
