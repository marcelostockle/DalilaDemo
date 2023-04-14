<script>
  import StyledButton from '../components/StyledButton.vue'
  import Sidebar from '../components/Sidebar.vue'
  export default {
    components: {
      StyledButton,
      Sidebar
    },
    data() {
      return {
        sidebarToggle: false,
        orderName: '',
        orderDetail: '',
        price: 25000,
        fees: 0,
        dateDelivery: new Date(),
        dateonly: false,
        formLink: '',
        invalid: false,
        loading: false
      }
    },
    methods: {
      handleSubmit() {
        this.invalid = false
        this.loading = true
        if (this.dateonly) {
          this.dateDelivery.setHours(1, 0, 0, 0)
        }
        const url = `${import.meta.env.VITE_PWA_WORKER}/api/create-order`
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application-json' },
          body: JSON.stringify({
            title: this.orderName,
            comment: this.orderDetail,
            price: parseInt(this.price),
            fees: parseInt(this.fees),
            date_delivery: new Date(this.dateDelivery)
          })
        }).then(response => {
          if (response.status === 201) {
            return response.json()
          } else {
            this.invalid = true
            return null
          }
        }).then(response => {
          this.loading = false
          if (response) {
            this.formLink = `${import.meta.env.VITE_FORM_URL}/?order-id=${response.insertedId}`
            navigator.clipboard.writeText(this.formLink)
          }
        })
      },
      priceIncrement(positive) {
        const newval = this.price + (positive ? 1000 : -1000)
        if (newval >= 0) {
          this.price = newval
        }
      },
      feesIncrement(positive) {
        const newval = this.fees + (positive ? 1000 : -1000)
        if (newval >= 0) {
          this.fees = newval
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
    <v-main style="background-color:khaki;">
      <div class="view-top">
        <p>Nombre del pedido</p>
        <input v-model="orderName"/>
        <p>Detalle del pedido</p>
        <input v-model="orderDetail"/>
        <p>Precio</p>
        <input type="number" v-model="price" min="0" step="1000"/>
        <span class="num-input">
          <StyledButton class="num-input-btn bold" @click="priceIncrement(false)">-</StyledButton>
          <StyledButton class="num-input-btn bold" @click="priceIncrement(true)">+</StyledButton>
        </span>
        <p>Costo de envío</p>
        <input type="number" v-model="fees" min="0" step="1000"/>
        <span class="num-input">
          <StyledButton class="num-input-btn bold" @click="feesIncrement(false)">-</StyledButton>
          <StyledButton class="num-input-btn bold" @click="feesIncrement(true)">+</StyledButton>
        </span>
        <v-switch
          v-model="dateonly"
          label="Solo fecha"
          color="purple"
          density="comfortable"
        />
        <v-date-picker
          class="push-down center"
          :mode="dateonly ? 'date' : 'dateTime'"
          :minute-increment="30"
          is-dark
          locale="es-ES"
          :first-day-of-week="2"
          v-model="dateDelivery"
        />
        <v-alert class="push-down" type="success" v-show="formLink">
          Un enlace ha sido compartido a su portapapeles.
          Comparta este enlace con el ciente.
        </v-alert>
        <StyledButton class="push-down bold" @click="handleSubmit">
          {{ loading ? 'Cargando...' : 'Publicar' }}
        </StyledButton>
      </div>
    </v-main>
  </v-app>
  <v-snackbar :timeout="2000" v-model="invalid">
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
input {
  border-radius: 8px;
  text-align: center;
  background-color: white;
  border-style: solid;
  width: inherit;
  max-width: inherit;
}
.view-top {
  width: 300px;
  max-width: 60vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 3rem auto;
}
.num-input {
  display:flex;
  flex-direction: row;
  justify-content: space-between;
  margin-top: 0.2rem;
  width: inherit;
  max-width: inherit;
}
.num-input-btn {
  background-color: gray;
  padding-block: 1px;
  border-radius: 6px;
  width: inherit;
  margin-inline: 0.1rem;
}
.push-down {
  margin-top: 2rem;
}
.center {
  margin-inline: auto;
}
.bold {
  font-weight: bold;
}
</style>