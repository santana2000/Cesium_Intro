import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import echarts from "echarts";
import './assets/icon/iconfont.css'
import 'gv-cesium-plugins/dist/extension.umd.js'


Vue.config.productionTip = false

// 引入cesium
var Cesium = require('cesium/Cesium');
var widgets= require('cesium/Widgets/widgets.css');
// import Cesium from 'cesium/Cesium' 新版本不再支持整体导入，可以按需导入，要想全部导入可以使用 import * as .. from 或者require( ) 
// import * as Cesium from "../node_modules/cesium/Source/Cesium.js"
// import widgets from 'cesium/Widgets/widgets.css'
// Vue.prototype.Cesium = Cesium;  //这里的cesium是一个包含了源码中各个对象的模块
// Vue.prototype.widgets = widgets;

// 引入eleui
Vue.use(ElementUI);

//引入echart
Vue.prototype.$echarts = echarts;

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
