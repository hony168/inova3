import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

export default new Router({
    mode: 'hash',
    routes: [
        {
            path: '/',
            redirect: '/Dashboard'
        },
        {
            path: '/',
            component: resolve => require(['../components/common/Home.vue'], resolve),
            meta: { title: '自述文件' },
            children: [
                {
                    path: '/Dashboard',
                    component: resolve => require(['../components/page/Dashboard.vue'], resolve),
                    meta: { title: '自述文件' }
                },{
                    path: '/so',
                    component: resolve => require(['../components/page/so.vue'], resolve),
                    meta: { title: '销售管理' }
                },{
                    path: '/soAdd',
                    component: resolve => require(['../components/page/soAdd.vue'], resolve),
                    meta: { title: '增加销售订单' }
                },{
                    path: '/pdManagement',
                    component: resolve => require(['../components/page/pdManagement.vue'], resolve),
                    meta: { title: '增加生产订单' }
                },{
                    path: '/bom',
                    component: resolve => require(['../components/page/bom.vue'], resolve),
                    meta: { title: 'BOM管理' }
                },{
                    path: '/buyOrder',
                    component: resolve => require(['../components/page/buyOrder.vue'], resolve),
                    meta: {  title: '生成采购订单'  }
                },{
                    path: '/cg',
                    component: resolve => require(['../components/page/CG.vue'], resolve),
                    meta: {  title: '采购管理'  }
                },{
                    path: '/afterSale',
                    component: resolve => require(['../components/page/afterSale.vue'], resolve),
                    meta: {  title: '售后管理'  }
                },{
                    path: '/pd',
                    component: resolve => require(['../components/page/pd.vue'], resolve),
                    meta: { title: '生产管理' }
                },{
                    path: '/production',
                    component: resolve => require(['../components/page/production.vue'], resolve),
                    meta: { title: '生产管理' }
                },{
                    path: '/inventory',
                    component: resolve => require(['../components/page/Inventory.vue'], resolve),
                    meta: { title: '库存管理' }
                },{
                    path: '/godown',
                    component: resolve => require(['../components/page/godown.vue'], resolve),
                    meta: { title: '入库管理' }
                },{
                    path: '/getMateriel',
                    component: resolve => require(['../components/page/getMateriel.vue'], resolve),
                    meta: { title: '领料单管理' }
                },{
                    path: '/takeOut',
                    component: resolve => require(['../components/page/takeOut.vue'], resolve),
                    meta: { title: '出库管理' }
                },{
                    path: '/parts',
                    component: resolve => require(['../components/page/parts.vue'], resolve),
                    meta: { title: '物料管理' }
                },{ 
                    path: '/unit',
                    component: resolve => require(['../components/page/unit.vue'], resolve),
                    meta: { title: '计量单位' }
                },{ 
                    path: '/contactManagement',
                    component: resolve => require(['../components/page/contactManagement.vue'], resolve),
                    meta: { title: '供应商管理' }
                },{
                    path: '/contactType',
                    component: resolve => require(['../components/page/contactType.vue'], resolve),
                    meta: { title: '供应商类别管理' }
                },{ 
                    path: '/clientManagement',
                    component: resolve => require(['../components/page/clientManagement.vue'], resolve),
                    meta: { title: '客户管理' }
                },{
                    path: '/clientType',
                    component: resolve => require(['../components/page/clientType.vue'], resolve),
                    meta: { title: '客户类别管理' }
                },{
                    path: '/productType',
                    component: resolve => require(['../components/page/productType.vue'], resolve),
                    meta: { title: '商品类别管理' }
                },{ 
                    path: '/locationManagement',
                    component: resolve => require(['../components/page/locationManagement.vue'], resolve),
                    meta: { title: '仓库管理' }
                },{  
                    path: '/product',
                    component: resolve => require(['../components/page/product.vue'], resolve),
                    meta: { 
                        title: '商品管理'
                    }
                },{
                    path: '/protocol',
                    component: resolve => require(['../components/page/Protocol.vue'], resolve),
                    meta: {
                        title: '订单详情', 
                        permission:2999 
                    }
                },{
                    path: '/advanceOrder',
                    component: resolve => require(['../components/page/advanceOrder.vue'], resolve),
                    meta: { title: '销售管理' }
                },{                    
                    path: '/materialType',
                    component: resolve => require(['../components/page/materialType.vue'], resolve),
                    meta: { title: '物料分类' }
                },{
                    path: '/userList',
                    component: resolve => require(['../components/page/userList.vue'], resolve),
                    meta: {
                        title: '会员列表' ,
                        permission:4999
                    }
                },{
                    path: '/Tabs',
                    component: resolve => require(['../components/page/Tabs.vue'], resolve),
                    meta: {
                        title: '会员列表' ,
                        permission:4999
                    }
                },{
                    path: '/403',
                    component: resolve => require(['../components/page/403.vue'], resolve),
                    meta: { title: '403' }
                },{
                    path: '/11',
                    component: resolve => require(['../components/page/selectComTem.vue'], resolve),
                    meta: { title: '403' }
                },{
                    // 404
                    path: '/404',
                    component: resolve => require(['../components/page/404.vue'], resolve),
                    meta: { title: '404' }
                },{
                    // 404
                    path: '/a',
                    component: resolve => require(['../components/page/text.vue'], resolve),
                    meta: { title: '404' }
                }
            ]
        },{
            path: '/login',
            component: resolve => require(['../components/page/Login.vue'], resolve),
            meta: { title: '登陆' }
        },{
            path: '/aa',
            component: resolve => require(['../components/page/DragDialog.vue'], resolve),
            meta: { title: '登陆' }
        },{
            path: '*',
            redirect: '/404'
        }
    ]
});
