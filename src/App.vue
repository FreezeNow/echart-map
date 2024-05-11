<template>
  <div id="app">
    <city />
    <china />
  </div>
</template>

<script>
import china from './components/china';
import city from './components/city';
export default {
  name: 'App',
  components: {
    china,
    city,
  },
  data() {
    return {};
  },
  mounted() {},

  methods: {},
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#map {
  background-color: rgb(0, 174, 255);
}
</style>
