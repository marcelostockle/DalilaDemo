<script>
  import { RouterLink } from 'vue-router'
  import router from '../router'
  export default {
    emits: ['toggleOff'],
    methods: {
      toggleOff() {
        this.$emit('toggleOff')
      },
      getRoutes() {
        return router.getRoutes()
      }
    }
  }
</script>

<template>
  <v-list v-for="route in getRoutes()">
    <v-list-item>
      <RouterLink :to="route.path" @click="toggleOff" v-if="!route.props.default.hidden">
        {{route.name}}
      </RouterLink>
    </v-list-item>
  </v-list>
</template>

<style scoped>
a:hover {
  cursor:pointer;
}
</style>