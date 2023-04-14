<script>
  export default {
    props: {
      orderData: Object
    },
    data() {
      return {
        title: this.orderData.title,
        comment: this.orderData.comment,
        price: this.orderData.price,
        fees: this.orderData.fees,
        balance: this.orderData.balance,
        date_delivery: this.orderData.date_delivery
      }
    },
    emits: ['ok', 'fail'],
    methods: {
      updateOrder() {
        const body = {
          title: this.title,
          comment: this.comment,
          price: parseInt(this.price),
          fees: parseInt(this.fees),
          balance: parseInt(this.balance),
          date_delivery: { "$date" : this.date_delivery}
        }
        const url = `${import.meta.env.VITE_PWA_WORKER}/api/update-order`
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application-json' },
          body: JSON.stringify({
            _id: this.orderData._id,
            ...body
          })
        }).then(response => {
          if (response.status === 200) {
            return response.json()
          } 
          return null
        }).then(response => {
          if (response && response.modifiedCount === 1) {
            this.$emit('ok')
          } else {
            this.$emit('fail')
          }
        }).catch(err => this.$emit('fail'))
      },
      deleteOrder() {
        const url = `${import.meta.env.VITE_PWA_WORKER}/api/delete-order`
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application-json' },
          body: JSON.stringify({
            orderId: this.orderData._id,
          })
        }).then(response => {
          if (response.status === 200) {
            return response.json()
          } 
          return null
        }).then(response => {
          if (response && response.deletedCount === 1) {
            this.$emit('ok')
          } else {
            this.$emit('fail')
          }
        }).catch(err => this.$emit('fail'))
      }
    }
  }
</script>

<template>
  <v-card class="form-top" variant="outlined">
    <v-text-field v-model="title" label="Nombre del pedido"/>
    <v-text-field v-model="comment" label="Detalle del pedido"/>
    <v-text-field v-model="price" label="Precio"/>
    <v-text-field v-model="fees" label="Tarifas"/>
    <v-text-field v-model="balance" label="Balance"/>
    <v-date-picker
      mode="dateTime"
      :minute-increment="30"
      is-dark
      locale="es-ES"
      :first-day-of-week="2"
      v-model="date_delivery"
    />
    <v-card-actions>
      <v-btn icon @click="deleteOrder">
        <v-icon icon="mdi-delete"/>
      </v-btn>
      <v-btn @click="updateOrder" variant="outlined">
        Actualizar
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.form-top {
  padding: 1rem;
}
</style>