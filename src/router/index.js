import { createRouter, createWebHistory } from 'vue-router'
import OrdersView from '../views/OrdersView.vue'
import NewOrderView from '../views/NewOrderView.vue'
import NewExpenseView from '../views/NewExpenseView.vue'
import ClientsView from '../views/ClientsView.vue'
import BalanceView from '../views/BalanceView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Nuevo pedido',
      component: NewOrderView,
      props: {
        hidden: false
      }
    },
    {
      path: '/upcoming-orders',
      name: 'Pedidos',
      component: OrdersView,
      props: {
        hidden: false,
        history: false
      }
    },
    {
      path: '/orders-history',
      name: 'Entregados',
      component: OrdersView,
      props: {
        hidden: false,
        history: true
      }
    },
    {
      path: '/new-expense',
      name: 'Nuevo gasto',
      component: NewExpenseView,
      props: {
        hidden: false
      }
    },
    {
      path: '/clients',
      name: 'Clientes',
      component: ClientsView,
      props: {
        hidden: false
      }
    },
    {
      path: '/balance',
      name: 'Flujos',
      component: BalanceView,
      props: {
        hidden: false
      }
    },
  ]
})

export default router
