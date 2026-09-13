import { IconHeadset } from '@tabler/icons-react';

const tickets = {
  id: 'tickets-group',
  title: 'Atendimento',
  type: 'group',
  children: [
    {
      id: 'tickets-list',
      title: 'Chamados',
      type: 'item',
      url: '/tickets',
      icon: IconHeadset,
      breadcrumbs: true
    }
  ]
};

export default tickets;
