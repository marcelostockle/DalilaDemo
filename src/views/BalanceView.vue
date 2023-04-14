<script>
  import Sidebar from '../components/Sidebar.vue';
  export default {
    components: {
      Sidebar
    },
    data() {
      return {
        orders: [],
        expenses: [],
        range: {
          start: new Date(),
          end: new Date()
        },
        income: "income",
        loading: true,
        sidebarToggle: false
      }
    },
    beforeMount() {
      // fetch open orders
      fetch(`${import.meta.env.VITE_PWA_WORKER}/api/query-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application-json' },
        body: JSON.stringify({
          'delivered': true,
          'sort': -1
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
      // fetch expenses
      fetch(`${import.meta.env.VITE_PWA_WORKER}/api/query-expenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application-json' },
        body: JSON.stringify({
          'sort': -1
        })
      }).then(response => {
        if (response.status === 200) {
          return response.json()
        } 
        return null
      }).then(response => {
        if (response) {
          this.expenses = response.documents
          this.loading = false
        }
      })

    },
    methods: {
      formatDate(str) {
        const date = new Date(str)
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'}
        return date.toLocaleDateString('es-ES', options)
      },
      counterbalance(order) {
        return order.price + order.fees - order.balance
      },
      withinRange(order) {
        const date = new Date(this.incomeBool ? order.date_delivery : order.date_created)
        const start = new Date(this.range.start)
        const end = new Date(this.range.end)
        start.setHours(0,1)
        end.setHours(23,59)
        return (date >= start && date <= end)
      }
    },
    computed: {
      incomeBool() {
        return this.income === 'income'
      },
      totalBalance() {
        return this.orders.reduce((accum, current) => {
          if (this.withinRange(current))
            return accum + current.balance
          return accum
        }, 0)
      },
      salesBalance() {
        return this.orders.reduce((accum, current) => {
          if (this.withinRange(current)) {
            if (current.balance < current.price) {
              return accum + current.balance
            }
            return accum + current.price
          }
          return accum
        }, 0)
      },
      feesBalance() {
        return this.orders.reduce((accum, current) => {
          if (this.withinRange(current)) {
            if (current.balance < current.price) {
              return accum
            }
            return accum + current.balance - current.price
          }
          return accum
        }, 0)
      },
      expensesBalance() {
        return this.expenses.reduce((accum, current) => {
          if (this.withinRange(current))
            return accum + current.price
          return accum
        }, 0)
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
      <v-spacer/>
      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-icon>mdi-filter</v-icon>
          </v-btn>
        </template>
        <v-date-picker
          v-model="range"
          is-range
          is-dark
          locale="es-ES"
          :first-day-of-week="2"
        />
      </v-menu>
    </v-app-bar>
    <v-main style="background-color:khaki;">
      <h3 v-if="loading">Cargando...</h3>
      <div v-else>
        <h3 v-if="incomeBool">Ingresos venta: ${{ salesBalance }}</h3>
        <h3 v-if="incomeBool">Ingresos transporte: ${{ feesBalance }}</h3>
        <h3 v-if="incomeBool">Ingresos total: ${{ totalBalance }}</h3>
        <h3 v-if="!incomeBool">Gastos total: ${{ expensesBalance }}</h3>
        <div class="radio">
          <input type="radio" id="income" value="income" v-model="income"/>
          <label for="income">Ingresos</label>
          <input type="radio" id="expenses" value="expenses" v-model="income"/>
          <label for="expenses">Gastos</label>
        </div>
        <v-card v-for="order in orders" class="vcard" v-if="incomeBool">
          <v-card-text v-if="withinRange(order)">
            <div class="flex-col">
              <h4 class="align-end" style="color:gray;">{{formatDate(order.date_delivery)}}</h4>
              <h4 class="align-end">{{ order.title }}</h4>
              <h4 :class="counterbalance(order) > 0 ? 'red': ''">
                ${{ order.balance }}
              </h4>
            </div>
          </v-card-text>
        </v-card>
        <v-card v-for="exp in expenses" class="vcard" v-else>
          <v-card-text v-if="withinRange(exp)">
            <div class="flex-col">
              <h4 class="align-end" style="color:gray;">{{formatDate(exp.date_created)}}</h4>
              <h4 class="align-end">{{ exp.provider }}</h4>
              <h4 class="align-end">{{ exp.category }}</h4>
              <h4>
                ${{ exp.price }}
              </h4>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </v-main>
  </v-app>
</template>

<style scoped>
h3 {
  font-weight: 700;
  text-align: end;
}
label {
  padding-inline: 0.8rem;
  font-weight: 500;
}
input[type='radio']{
  transform: scale(1.8);
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.red {
  color: red;
  text-decoration: underline;
}
.align-end {
  text-align:end;
}
.vcard {
  width: 100vw;
  max-width: 600px;
  margin-block: 2px;
}
.radio {
  display: flex;
  justify-content: center;
  margin-block: 0.5rem;
}
</style>