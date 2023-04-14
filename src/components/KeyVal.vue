<script>
  export default {
    props: {
      k: String,
      v: String
    }
  }
</script>
<template>
  <span>
    <p>{{ k }}</p>
    <b>{{ v }}<slot></slot></b>
  </span>
</template>

<style scoped>
span {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}
span p {
  white-space: nowrap;
  text-align: start;
}
span b {
  text-align: end;
}
</style>