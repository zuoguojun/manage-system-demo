import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            redirect: '/login'
        },
        {
            path: '/',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            children:[
                {
                    path: '/',
                    component: resolve => require(['../components/page/userManage.vue'], resolve)
                },
                {
                    path: '/userManage',
                    component: resolve => require(['../components/page/userManage.vue'], resolve)
                },
                {
                    path: '/roleManage',
                    component: resolve => require(['../components/page/roleManage.vue'], resolve)
                }
            ]
        },
        {
            path: '/login',
            component: resolve => require(['../components/page/Login.vue'], resolve)
        },
    ]
})
