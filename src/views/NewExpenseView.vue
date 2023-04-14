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
        provider: '',
        category: '',
        price: 25000,
        invalid: false,
        loading: false,
        success: false
      }
    },
    methods: {
      handleSubmit() {
        this.invalid = false
        this.loading = true
        this.success = false
        const url = `${import.meta.env.VITE_PWA_WORKER}/api/create-expense`
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application-json' },
          body: JSON.stringify({
            category: this.category,
            provider: this.provider,
            price: parseInt(this.price)
          })
        }).then(response => {
          this.loading = false
          if (response.status === 201) {
            this.success = true
          } else {
            this.invalid = true
            return null
          }
        })
      },
      priceIncrement(positive) {
        const newval = this.price + (positive ? 1000 : -1000)
        if (newval >= 0) {
          this.price = newval
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
        <p>Proveedor</p>
        <input v-model="provider"/>
        <p>Categoría</p>
        <select v-model="category">
          <option value="" disabled selected>Click aquí...</option>
          <option value="Insumos">Insumos</option>
          <option value="Flores">Flores</option>
        </select>
        <p>Costo</p>
        <input type="number" v-model="price" min="0" step="1000"/>
        <span class="num-input">
          <StyledButton class="num-input-btn bold" @click="priceIncrement(false)">-</StyledButton>
          <StyledButton class="num-input-btn bold" @click="priceIncrement(true)">+</StyledButton>
        </span>
        <v-alert class="push-down" type="success" v-show="success">
          La operación ha sido exitosa.
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
input, select {
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
.bold {
  font-weight: bold;
}
</style>