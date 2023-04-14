<script>
  import { RouterView } from 'vue-router'
  export default { }
</script>

<template>
  <RouterView :key="$route.fullPath"/>
</template>

<style scoped>
div {
  display: grid;
  place-items: center;
  margin-top: 4rem;
}
input {
  background-color: white;
}
</style>
