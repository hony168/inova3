<template>
    <div class="sidebar">
        <el-menu class="sidebar-el-menu" :default-active="onRoutes" :collapse="collapse" background-color="#324157"
            text-color="#bfcbd9" active-text-color="#20a0ff" unique-opened router>
            <template v-for="item in items">
                <template v-if="item.subs">
                    <el-submenu :index="item.index" :key="item.index">
                        <template slot="title">
                            <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
                            <el-badge  :value="item.value" class="item" v-if="item.value>0"></el-badge>
                        </template>
                        <template v-for="subItem in item.subs">
                            <el-submenu v-if="subItem.subs" :index="subItem.index" :key="subItem.index">
                                <template slot="title">{{ subItem.title }}</template>
                                <el-menu-item v-for="(threeItem,i) in subItem.subs" :key="i" :index="threeItem.index">
                                    {{ threeItem.title }}
                                </el-menu-item>
                            </el-submenu>
                            <el-menu-item  class="aa" v-else :index="subItem.index" :key="subItem.index">
                                {{ subItem.title }}
                                <el-badge :value="item.value" class="item" v-if="subItem.value>0"></el-badge>
                            </el-menu-item>
                        </template>
                    </el-submenu>
                </template>
                <template v-else>
                    <el-menu-item :index="item.index" :key="item.index">
                        <i :class="item.icon"></i><span slot="title">{{ item.title }}</span>
                        <el-badge  :value="item.value" class="item" v-if="item.value>0"></el-badge>                       
                    </el-menu-item>
                </template>
            </template>
        </el-menu>
    </div>
</template>

<script>
    import bus from '../common/bus';
    export default {
        data() {
            return {
                collapse: false,
                userPower:[],
                items: [
                    {
                        icon: 'el-icon-s-home',
                        index: 'Dashboard',
                        title: '系统自述'   ,
                        value: 0                                            
                    }
                ]                
            }
        },
        computed:{
            onRoutes(){
                return this.$route.path.replace('/','');
            }
        },
        created(){
            // 通过 Event Bus 进行组件间通信，来折叠侧边栏
            bus.$on('collapse', msg => {
                this.collapse = msg;
            })

            this.userPower = sessionStorage.getItem('userPower').split(',');
            if(this.userPower.indexOf('5999')<0){
                this.items.push({     
                        icon: 'el-icon-s-order',
                        index: 'so',
                        title: '销售管理'   ,
                        value: 0                              
                    });
            }
            if(this.userPower.indexOf('12999')<0 || this.userPower.indexOf('3999')<0){
                let cgSubs =[];
                if(this.userPower.indexOf('12999')<0){
                    cgSubs.push({
                        index: 'buyOrder',
                        title: '生成采购订单'
                    });
                }
                if(this.userPower.indexOf('3999')<0){
                    cgSubs.push({
                        index: 'cg',
                        title: '采购管理'
                    });
                }
                this.items.push({
                    icon: 'el-icon-shopping-cart-full',
                    index: '2',
                    title: '采购管理',
                    value: 0,
                    subs: cgSubs                                     
                });
            }
            if(this.userPower.indexOf('2999')<0){
                let cksubs=[];

                if(this.userPower.indexOf('2002')>-1){
                    cksubs.push({
                        index: 'inventory',
                        title: '库存管理' 
                    });
                }
                if(this.userPower.indexOf('2000')>-1 || this.userPower.indexOf('2001')>-1){
                    cksubs.push({
                        index: 'godown',
                        title: '入库管理' ,
                        value: 0      
                    });
                }
                if(this.userPower.indexOf('2003')>-1 || this.userPower.indexOf('2004')>-1|| this.userPower.indexOf('2005')>-1|| this.userPower.indexOf('2006')>-1|| this.userPower.indexOf('2007')>-1|| this.userPower.indexOf('2008')>-1|| this.userPower.indexOf('2009')>-1|| this.userPower.indexOf('2010')>-1){
                    cksubs.push({
                        index: 'getMateriel',
                        title: '领料单管理' 
                    });
                }
                this.items.push({
                        icon: 'el-icon-office-building',
                        index: '3',
                        title: '仓管管理',
                        value: 0,  
                        subs:cksubs                                         
                    });
            }

            // if(this.userPower.indexOf('1999')<0){
            //     this.items.push({
            //             icon: 'el-icon-s-cooperation',
            //             index: 'production',
            //             title: '生产管理'  ,
            //             value: 0                                              
            //         });.vue
            // }
            if(this.userPower.indexOf('1999')<0){
                this.items.push({
                    icon: 'el-icon-s-cooperation',
                    index: 'pdManagement',
                    title: '生产管理'  ,
                    value: 0                                              
                });
                this.items.push({
                    icon: 'el-icon-phone-outline',
                    index: 'afterSale',
                    title: '售后管理'  ,
                    value: 0                                              
                });
            }

            // if(this.userPower.indexOf('1999')<0){
            //     this.items.push({
            //             icon: 'el-icon-money',
            //             index: 'parts',
            //             title: '资金管理'                                            
            //         });
            // }
            // if(this.userPower.indexOf('2999')<0){
            //     this.items.push({
            //             icon: 'el-icon-s-order',
            //             index: 'advanceOrder',
            //             title: '订单管理'                                            
            //         });
            // }
            // if(this.userPower.indexOf('3999')<0){
            //     this.items.push({
            //             icon: 'el-icon-odometer',
            //             index: 'advanceOrder',
            //             title: '报表管理'                                           
            //         });
            // }
            if(this.userPower.indexOf('4999')<0 || this.userPower.indexOf('1999')<0 || this.userPower.indexOf('7999')<0 || this.userPower.indexOf('8999')<0 || this.userPower.indexOf('9999')<0 || this.userPower.indexOf('6999')<0 || this.userPower.indexOf('10999')<0 || this.userPower.indexOf('11999')){
                let setSubs =[];
                if(this.userPower.indexOf('1999')<0 || this.userPower.indexOf('7999')<0 || this.userPower.indexOf('8999')<0 || this.userPower.indexOf('9999')<0){
                    let zcSubs =[];

                    if(this.userPower.indexOf('1999')<0){
                        zcSubs.push({
                            index: 'product',
                            title: '商品管理'
                        });
                    }
                    if(this.userPower.indexOf('7999')<0){
                        zcSubs.push({
                            index: 'contactManagement',
                            title: '供应商管理'
                        });
                    }
                    if(this.userPower.indexOf('8999')<0){
                        zcSubs.push({
                            index: 'clientManagement',
                            title: '客户管理'
                        });
                    }
                    if(this.userPower.indexOf('9999')<0){
                        zcSubs.push({
                            index: 'locationManagement',
                            title: '仓库管理'
                        });
                    }
                    setSubs.push({
                        index: '9-1',
                        title: '基础资料',
                        subs: zcSubs 
                        // subs: [{
                        //         index: 'bom',
                        //         title: 'BOM管理'
                        //     },{
                        //         index: 'markdown',
                        //         title: '职员管理'
                        //     },{
                        //         index: 'markdown',
                        //         title: '账户管理'
                        //     }
                        // ]                     
                    });
                        
                }
                
                if(this.userPower.indexOf('6999')<0 || this.userPower.indexOf('10999')<0 || this.userPower.indexOf('11999')<0){
                    let fzSubs =[];
                    if(this.userPower.indexOf('6999')<0){
                        fzSubs.push({
                            index: 'contactType',
                            title: '供应商类别'
                        });
                    }
                    if(this.userPower.indexOf('10999')<0){
                        fzSubs.push({
                            index: 'clientType',
                            title: '客户类别'
                        });
                    }
                    if(this.userPower.indexOf('11999')<0){
                        fzSubs.push({
                            index: 'unit',
                            title: '计量单位'
                        });
                    }
                    setSubs.push({
                        index: '9-2',
                        title: '辅助资料',
                        subs: fzSubs
                    });
                }
                if(this.userPower.indexOf('4999')<0){
                    setSubs.push({
                        index: '9-3',
                        title: '高级设置',
                        subs: [{
                            //     index: 'editor',
                            //     title: '系统参数'
                            // },{
                                index: 'userlist',
                                title: '权限设置'
                            // },{
                            //     index: 'markdown',
                            //     title: '操作日志'
                            }
                        ]
                    });
                }
                this.items.push({
                        icon: 'el-icon-setting',
                        index: '9',
                        title: '设置管理',
                        value: 0,
                        subs:setSubs                                                           
                    });
            }
        }
    }
</script>
<style>
.sidebar-el-menu .el-badge__content.is-fixed {
    position: absolute;
    top: 0;
    right: 20px;
    -webkit-transform: translateY(5%) translateX(100%);
    transform: translateY(5%) translateX(100%);
}.sidebar-el-menu .el-badge__content{
    font-size: 10px;
    line-height: 15px;
    height: 14px;
    padding-right: 7px;

}
.aa .el-badge__content.is-fixed {
    position: absolute;
    top: 0;
    right: 5px;
    -webkit-transform: translateY(50%) translateX(100%);
    transform: translateY(50%) translateX(100%);
}
.aa .el-badge__content{
    font-size: 10px;
    line-height: 15px;
    height: 13px;
    padding-right: 7px;

}

</style>
<style scoped>

    .sidebar{
        display: block;
        position: absolute;
        left: 0;
        top: 70px;
        bottom:0;
        overflow-y: scroll;
    }
    .sidebar::-webkit-scrollbar{
        width: 0;
    }
    .sidebar-el-menu:not(.el-menu--collapse){
        width: 200px;
    }
    .sidebar > ul {
        height:100%;
    }
    .item {
        position: fixed;
      margin-top: -15px;
      margin-left:  -6px;
    }
</style>
