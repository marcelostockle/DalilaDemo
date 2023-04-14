<script>
  import KeyVal from './KeyVal.vue'
  import OrderEditForm from './OrderEditForm.vue'
  export default {
    components: {
      KeyVal,
      OrderEditForm
    },
    props: {
      orderData: Object
    },
    data() {
      return {
        order: {...this.orderData},
        extraBalance: this.orderData.price + this.orderData.fees - this.orderData.balance,
        client: null,
        editToggle: false,
        updateFailed: false,
        loading: false
      }
    },
    methods: {
      formatDate(date) {
        const auxDate = new Date(date)
        if (auxDate.getHours() === 1) {
          return auxDate.toLocaleDateString('es-ES', {'dateStyle': 'full'})
        }
        return auxDate.toLocaleString('es-ES', {
          'dateStyle': 'full',
          'timeStyle': 'short'
        })
      },
      linkToClipboard() {
        const formLink = `${import.meta.env.VITE_FORM_URL}/?order-id=${this.order._id}`
        navigator.clipboard.writeText(formLink)
      },
      updateOrder(options) {
        this.loading = false
        this.updateFailed = false
        const url = `${import.meta.env.VITE_PWA_WORKER}/api/update-order`
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application-json' },
          body: JSON.stringify({
            _id: this.order._id,
            ...options
          })
        }).then(response => {
          if (response.status === 200) {
            return response.json()
          } 
          return null
        }).then(response => {
          this.loading = false
          if (response && response.modifiedCount === 1) {
            this.order = { ...this.order, ...options}
          } else {
            this.updateFailed = true
          }
        }).catch(err => this.loading = false)
      }
    },
    computed: {
      counterbalance() {
        return this.order.price + this.order.fees - this.order.balance
      },
      googleMapsHref() {
        if (this.order.address) {
          const encoded = encodeURIComponent(this.order.address.replaceAll(' ', '+'))
          return `https://www.google.com/maps/search/?api=1&query=${encoded}`
        } 
        return ''       
      }
    },
    beforeMount() {
      const url = `${import.meta.env.VITE_PWA_WORKER}/api/query-client`
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application-json' },
        body: JSON.stringify({ clientId: this.order.clientId })
      }).then(response => {
        if (response.status === 200) { return response.json() } 
        return null
      }).then(response => {
        if (response) {
          this.client = response.document
        }
      })
    }
  }
</script>

<template>
  <v-card :loading="loading">
    <v-card-title>{{order.title}}</v-card-title>
    <v-card-subtitle>
      {{this.formatDate(order.date_delivery)}}
    </v-card-subtitle>
    <v-card-text class="flex-col">
      <span :class="{ 'green': order.clientAccepted }">
        <v-icon :icon="order.clientAccepted ? 'mdi-check' : 'mdi-close'"/>
        Cliente aceptó
      </span>
      <span :class="{ 'green': counterbalance <= 0 }">
        <v-icon :icon="counterbalance <= 0 ? 'mdi-check' : 'mdi-close'"/>
        Cliente debe {{ counterbalance }}
      </span>
      <span :class="{ 'green': order.delivered }">
        <v-icon :icon="order.delivered ? 'mdi-check' : 'mdi-close'"/>
        Entregado
      </span>
      <hr/>
      <v-expansion-panels variant="accordion">
        <v-expansion-panel>
          <v-expansion-panel-title>Detalle del pedido</v-expansion-panel-title>
          <v-expansion-panel-text>
            <KeyVal k="Lleva tarjeta:" :v="order.letter ? 'Sí' : 'No'"/>
            <KeyVal k="Detalle:" :v="order.comment"/>
            <KeyVal k="Precio:" :v="order.price"/>
            <KeyVal k="Tarifa:" :v="order.fees"/>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-title>Cliente</v-expansion-panel-title>
          <v-expansion-panel-text v-if="client">
            <KeyVal k="Nombre:" :v="client.name"/>
            <KeyVal k="Teléfono:" :v="client.phone"/>
            <KeyVal k="Red social:" :v="client.socials"/>
          </v-expansion-panel-text>
          <v-expansion-panel-text v-else>
            Cliente no identificado
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel>
          <v-expansion-panel-title>Recibe</v-expansion-panel-title>
          <v-expansion-panel-text v-if="order.takeout">
            El cliente retira
          </v-expansion-panel-text>
          <v-expansion-panel-text v-else>
            <KeyVal k="Recibe:" :v="order.receives"/>
            <KeyVal k="Teléfono:" :v="order.phoneReceives"/>
            <a :href="googleMapsHref" target="_blank">
              <KeyVal k="Dirección:" :v="order.address"/>
            </a>
            <KeyVal k="Detalle dirección:" :v="order.addressComment"/>
          </v-expansion-panel-text>
        </v-expansion-panel>
        <v-expansion-panel v-if="order.letter">
          <v-expansion-panel-title>Tarjeta</v-expansion-panel-title>
          <v-expansion-panel-text>
            {{ order.letter }}
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <hr/>
      <span class="flex-end">
        <input v-model="extraBalance"/>
        <v-btn
          @click="updateOrder({
            balance: Number.parseInt(order.balance) + Number.parseInt(extraBalance)
          })"
          variant="outlined"
          :disabled="loading"
        >Añadir monto</v-btn>
      </span>
      <OrderEditForm
        :orderData="orderData"
        @ok="this.$router.go(0)"
        @fail="editToggle = !editToggle"
        v-if="editToggle"
      />
    </v-card-text>
    <v-card-actions class="order-actions">
      <v-btn icon @click="editToggle = !editToggle">
        <v-icon icon="mdi-pencil"/>
      </v-btn>
      <v-btn @click="linkToClipboard" variant="outlined">
        Copiar enlace
      </v-btn>
      <v-btn @click="updateOrder({delivered: true})" variant="outlined">
        Entregado
      </v-btn>
    </v-card-actions>
  </v-card>
  <v-snackbar :timeout="2000" v-model="updateFailed">
    Hubo un problema con la operación
    <template v-slot:actions>
      <v-btn
        icon
        color="pink"
        @click="invalid = false"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </template>
  </v-snackbar>
</template>

<style scoped>
span p {
  text-align: start;
}
span b {
  text-align: end;
}
span {
  display: flex;
  flex-direction: row;
}
input {
  text-align: center;
  width: 6rem;
  font-weight: 300;
}
hr {
  opacity: 0;
  margin-block: 0.5rem;
}
.flex-col {
  display: flex;
  flex-direction: column;
}
.flex-end {
  display: flex;
  justify-content: flex-end;
}
.green {
  color: green;
}
.order-actions {
  justify-content: flex-end;
  padding-inline: 16px;
}
</style>