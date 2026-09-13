import { lazy } from 'react';

import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import { ProtectedRoute } from './ProtectedRoute';

const TicketList = Loadable(lazy(() => import('views/tickets/TicketList')));
const TicketCreate = Loadable(lazy(() => import('views/tickets/TicketCreate')));
const TicketView = Loadable(lazy(() => import('views/tickets/TicketView')));

const protectedPage = (element) => <ProtectedRoute>{element}</ProtectedRoute>;

const MainRoutes = {
  path: '/',
  element: protectedPage(<MainLayout />),
  children: [
    {
      index: true,
      element: <TicketList />
    },
    {
      path: 'tickets',
      element: <TicketList />
    },
    {
      path: 'tickets/create',
      element: <TicketCreate />
    },
    {
      path: 'tickets/:id/edit',
      element: <TicketCreate />
    },
    {
      path: 'tickets/:id',
      element: <TicketView />
    }
  ]
};

export default MainRoutes;
