<script>
  import Sidebar from '../components/Sidebar.vue'
  export default {
    components: {
      Sidebar
    },
    data() {
      return {
        clients: [],
        orders: [],
        clientId: null
      }
    },
    beforeMount() {
      const url = `${import.meta.env.VITE_PWA_WORKER}/api/query-clients`
      fetch(url).then(response => {
        if (response.status === 200) { return response.json() } 
        return null
      }).then(response => {
        if (response) {
          this.clients = response.documents
        }
      })
    },
    methods: {
      formatDate(date) {
        return new Date(date).toLocaleString('es-ES', {
          'dateStyle': 'full',
          'timeStyle': 'short'
        })
      },
      counterbalance(order) {
        return order.price + order.fees - order.balance
      },
      queryOrders() {
        this.orders.splice(0, this.orders.length)
        if (this.clientId) {
          const url = `${import.meta.env.VITE_PWA_WORKER}/api/query-orders`
          fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application-json' },
            body: JSON.stringify({ clientId: this.clientId })
          }).then(response => {
            if (response.status === 200) { return response.json() } 
            return null
          }).then(response => {
            if (response) {
              this.orders.push(...response.documents)
            }
          })
        }
      }
    }
  }
</script>

<template>
  <v-app>
    <v-navigation-drawer temporary v-model="sidebarToggle" location="left">
      <Sidebar @toggleOff="sidebarToggle=false"/>
    </v-navigation-drawer>
    <v-app-bar extension-height="32" color="secondary">
      <v-app-bar-nav-icon @click="sidebarToggle=!sidebarToggle"/>
      <v-app-bar-title>Florería Dalila</v-app-bar-title>
    </v-app-bar>
    <v-main>
      <v-expansion-panels
        variant="accordion"
        v-model="clientId"
        @update:modelValue="queryOrders()"
        v-for="client in clients"
      >
        <v-expansion-panel :value="client._id">
          <v-expansion-panel-title>{{client.name}}</v-expansion-panel-title>
          <v-expansion-panel-text>
            <h4>Teléfono: {{ client.phone }}</h4>
            <h4>Red social: {{ client.socials }}</h4>
            <v-list density="compact" v-for="order in orders">
              <v-list-item>
                <h4>{{ formatDate(order.date_delivery) }}</h4>
                <h4 :class="{ 'green': order.clientAccepted }">
                  <v-icon :icon="order.clientAccepted ? 'mdi-check' : 'mdi-close'"/>
                  Cliente aceptó
                </h4>
                <h4 :class="{ 'green': counterbalance(order) <= 0 }">
                  <v-icon :icon="counterbalance(order) <= 0 ? 'mdi-check' : 'mdi-close'"/>
                  Cliente debe {{ counterbalance(order) }}
                </h4>
                <h4 :class="{ 'green': order.delivered }">
                  <v-icon :icon="order.delivered ? 'mdi-check' : 'mdi-close'"/>
                  Entregado
                </h4>
              </v-list-item>
              <v-divider/>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-main>
  </v-app>
</template>

<style scoped>
.green {
  color: green;
}
</style>