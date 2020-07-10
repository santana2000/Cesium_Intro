<template>
  <div id="app">
    <div class="header">
        <router-link to="/eleui" class="menu"><el-button >Ele-UI</el-button></router-link>&nbsp;
        <router-link to="/chart" class="menu"><el-button >E-chart</el-button></router-link>&nbsp;
        <router-link to="/v"  class="menu"><el-button >mapV</el-button></router-link>&nbsp;
        <router-link to="/map"   class="menu"><el-button >Map</el-button></router-link>
    </div>

    <div class="pagebody">
    <router-view/>

    </div>

  </div>
</template>

<script>
export default {
  name: 'app',
  components: {
  
  }
}
</script>

<style>
html,body{
      height: 100%;
      width: 100%;
      overflow: hidden;
    }
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  width: 100%;
  height: 100%;
}
.header{
  height: 10%;
  background-color: rgb(209, 209, 209);
  /* vertical-align:middle; */
  margin-bottom:10px;

}
.menu{
  display: inline-block;
  margin: 20px 20px 0 0;
}
.el-button{
  font-size: 156%;
  color: black;
}
.pagebody{
  margin: auto;
  height: 90%;

}
.cesium-widget-credits {
    display: none!important;
    visibility: hidden!important;
}
</style>
