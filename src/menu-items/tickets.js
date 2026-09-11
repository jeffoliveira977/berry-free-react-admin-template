import { IconHeadset } from '@tabler/icons-react'; // Ícones padrões do Berry Free

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
    },
  ]
};

export default tickets;