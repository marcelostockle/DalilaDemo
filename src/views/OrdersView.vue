<script>
  import OrderCard from '../components/OrderCard.vue'
  import Sidebar from '../components/Sidebar.vue'
  export default {
    props: {
      history: {
        type: Boolean,
        default: false
      }
    },
    components: {
      OrderCard,
      Sidebar
    },
    data() {
      return {
        sidebarToggle: false,
        orders: [],
        loading: true,
        displayFilters: false,
        filters: {
          date: {
            active: false,
            daysOffset: 0
          },
          accepted: {
            active: false,
            value: true
          },
          paid: {
            active: false,
            value: true
          }
        }
      }
    },
    computed: {
      tryFilters() {
        return this.orders.map(order => {
          const paid = order.balance >= order.price + order.fees
          const targetDate = new Date()
          targetDate.setHours(0, 1)
          targetDate.setDate(targetDate.getDate() + this.filters.date.daysOffset)
          const dateDiff = new Date(order.date_delivery) - targetDate
          if (
            this.filters.accepted.active && 
            order.clientAccepted !== this.filters.accepted.value
          ) { return false }
          if (
            this.filters.paid.active && 
            paid !== this.filters.paid.value
          ) { return false }
          if (
            this.filters.date.active &&
            (dateDiff < 0 || dateDiff >= 86400000)
          ) { return false }
          return true
        })
      }
    },
    beforeMount() {
      // fetch open orders
      const url = `${import.meta.env.VITE_PWA_WORKER}/api/query-orders`
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application-json' },
        body: JSON.stringify({
          'delivered': this.history,
          'sort': this.history ? -1 : 1
        })
      }).then(response => {
        if (response.status === 200) {
          return response.json()
        } 
        return null
      }).then(response => {
        if (response) {
          this.orders = response.documents
          this.loading = false
        }
      })
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
      <v-spacer/>
      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-filter</v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-list>
            <v-list-item>
              <v-switch
                v-model="filters.accepted.active"
                color="purple"
                label="Cliente aceptó"
                hide-details
              ></v-switch>
            </v-list-item>
            <v-list-item v-if="filters.accepted.active">
              <v-radio-group 
                inline
                v-model="filters.accepted.value"
              >
                <v-radio label="Sí" :value="true"/>
                <v-radio label="No" :value="false"/>
              </v-radio-group>
            </v-list-item>
            <v-list-item>
              <v-switch
                v-model="filters.paid.active"
                color="purple"
                label="Pagado"
                hide-details
              ></v-switch>
            </v-list-item>
            <v-list-item v-if="filters.paid.active">
              <v-radio-group 
                inline
                v-model="filters.paid.value"
              >
                <v-radio label="Sí" :value="true"/>
                <v-radio label="No" :value="false"/>
              </v-radio-group>
            </v-list-item>
            <v-list-item>
              <v-switch
                v-model="filters.date.active"
                color="purple"
                label="Fecha"
                hide-details
              ></v-switch>
            </v-list-item>
            <v-list-item v-if="filters.date.active">
              <span>
                Hoy +
                <input type="number" v-model="filters.date.daysOffset"/> 
                días
              </span>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </v-app-bar>
    <v-main style="background-color:khaki;">
      <h3 v-if="loading">Cargando...</h3>
      <div class="space-vertical" v-for="(order, ind) in orders" v-else>
        <OrderCard :orderData="order" v-if="tryFilters[ind]"/>
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
input {
  width: 2rem;
  text-align: center;
  font-weight: 800;
}
span {
  display: flex;
  flex-direction: row;
  align-items: center;
}
.space-vertical {
  margin-block: 1rem;
}
</style>