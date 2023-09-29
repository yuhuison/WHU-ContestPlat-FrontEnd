//该文件是整个项目的入口

// 引入vue
import Vue from 'vue';
// 引入app组件，它是整个组件的父组件
import App from './App.vue';
// 引入路由
import router from './router';
// 引入store实例对象
import store from './store';
// 按需求引入Element组件库
import element from './element/index';
// 引入md5
import md5 from 'js-md5';

// 应用md5
Vue.prototype.$md5 = md5;
// 应用 element
Vue.use(element);

// 完整引入Element组件库和样式
// import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';
// 应用ElementUI
// Vue.use(ElementUI);

//引入fontawesome图标
import '@fortawesome/fontawesome-free/css/all.css'

// 关闭Vue生产提示
Vue.config.productionTip = false;

// 创建vue实例对象---vm
new Vue({
  store,
  router,
  // 生成app节点，通过js渲染真实dom
  render: h => h(App)
}).$mount('#app');// 手动挂载app组件到dom中