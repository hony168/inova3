import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import axios from 'axios';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
// import './assets/css/theme-green/index.css'; // 浅绿色主题
import Print from 'vue-print-nb';
import './assets/css/icon.css';
import './components/common/directives';
import 'babel-polyfill';
import Blob from './excel/Blob.js';
import './utils/directives.js';
// import VueWebsocket from "vue-websocket";
// Vue.use(VueWebsocket,'ws://127.0.0.1');
// 
// import VueSocketIO from 'vue-socket.io'

// import SocketIO from 'socket.io-client'

// Vue.use(new VueSocketIO({

//    // 生产环境需要切换成false
//   debug: true,

//   // 连接的后端地址  
//   connection: SocketIO('http://120.79.23.144:8080'),

// }))
import Export2Excel from './excel/Export2Excel.js';
Vue.config.productionTip = false;
Vue.use(ElementUI, {
    size: 'small'
});

Vue.use(Print);
Vue.prototype.$axios = axios;
//使用钩子函数对路由进行权限跳转
router.beforeEach((to, from, next) => {
    
    document.title = `${to.meta.title} | LYCC-manage-system`;
    const role = sessionStorage.getItem('admin_name');
    if (!role && to.path !== '/login') {
        next('/login');
    } else if (to.meta.permission) {
        
        // 如果是管理员权限则可进入，这里只是简单的模拟管理员权限而已
        sessionStorage.getItem('userPower').indexOf(to.meta.permission)<0 ? next() : next('/403');
    } else {
        // 简单的判断IE10及以下不进入富文本编辑器，该组件不兼容
        if (navigator.userAgent.indexOf('MSIE') > -1 && to.path === '/editor') {
            Vue.prototype.$alert('vue-quill-editor组件不兼容IE10及以下浏览器，请使用更高版本的浏览器查看', '浏览器不兼容通知', {
                confirmButtonText: '确定'
            });
        } else {
            next();
        }
    }
});

new Vue({
    router,
    render: h => h(App)
}).$mount('#app');
