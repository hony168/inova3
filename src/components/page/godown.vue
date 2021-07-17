<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 入库管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="q" placeholder="请输入单据号、客户名称或备注" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button v-if="userPower.indexOf('2000')>-1" type="primary" icon="el-icon-plus" @click="addRKOrder">增加入库单</el-button>
            </div>
            <el-table :data="tableData" border style="font-size:10px" stripe ref="multipleTable" header-cell-class-name="table-header"  @cell-click="showSOInfo" height="58vh">
                <el-table-column width="50" align="center">
                    <template slot-scope="scope">
                    {{scope.$index+1}}
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" width="150" align="center" label="单据日期" sortable> </el-table-column>
                <el-table-column prop="putBillNo" label="单据编号" sortable :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="putUserName" width="120"  label="制单人" ></el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 增加入库订单弹出框 -->
        <el-dialog title="入库订单" align='center' id="box" :visible.sync="putShowVisible" top="10vh">
            <el-form id="addForm" :model="addForm" label-width="100px" class="demo-dynamic" :rules="rules" ref="addForm">
                <div style="margin:20px 5px 2px 12px;font-size:10px;line-height:20px;text-align:left;"><b>单据编号：</b>{{addForm.putBillNo}}</div>                
                <el-table :data="domains" border class="table" ref="multipleTable" header-cell-class-name="table-header" style="font-size:10px;min-height:60vh;" >
                    <el-table-column label="序号" type="index" width="50" align="center"></el-table-column>                     
                    <el-table-column width="60" align="center">
                        <template slot-scope="scope">
                            <el-button type="text" icon="el-icon-circle-plus-outline" @click="addMaterial"></el-button>
                            <el-button type="text" icon="el-icon-delete" @click="removeDomain(scope.row)"></el-button>
                        </template>
                    </el-table-column> 
                    <el-table-column prop="number" label="零件编号" width="120"></el-table-column>
                    <el-table-column prop="name" label="描述"></el-table-column>
                    <el-table-column prop="goods_num" label="数量(PCS)" width="120" align="center">
                        <template scope="scope">
                            <el-input-number v-model="scope.row.qty" :precision="3" :controls="false" :min="0.001" style="width:98%"></el-input-number>
                        </template>
                    </el-table-column>                          
                </el-table>
                <div class="pagination" style="padding-right:10px;">
                    <el-button  type="warning" @click="submitOrderReview('addForm')">提交订单</el-button>
                    <el-button @click="addMaterial">新增商品</el-button>
                </div>
            </el-form>
        </el-dialog>

        <!-- 订单详情弹出框 -->
        <el-dialog title="" align='center' :visible.sync="showVisible" top="2vh" width="70vw">
            <el-form :inline="true"  ref="showInfoform" :model="showInfoform"  :rules="rules" > 
                <div style="margin:0 0 14px 15px;text-align:left;font-size:12px;font-weight:bold;">
                单据编号：{{showInfoform.putBillNo}}　　　　单据日期：{{showInfoform.createTime}}　　　　制单人：{{showInfoform.putUserName}}
                </div>                 
                
                <el-table :data="orderData" border style="font-size:10px" class="table" ref="multipleTable" header-cell-class-name="table-header" height="63vh">
                    <el-table-column width="50" label="序号" align="center">
                        <template slot-scope="scope">
                            {{scope.$index+1}}
                        </template>
                    </el-table-column>                  
                    <el-table-column prop="number" label="商品编号" width="100" :show-overflow-tooltip="true"></el-table-column>
                    <el-table-column prop="name" label="商品名称" :show-overflow-tooltip="true"></el-table-column>
                    <el-table-column prop="categoryName" width="180" label="类别" :show-overflow-tooltip="true"></el-table-column>
                    <el-table-column prop="unitName" width="70" label="单位" align="center"></el-table-column>
                    <el-table-column prop="l_qty" width="80"  label="数量" align="right">
                         <template slot-scope="scope">
                            {{scope.row.l_qty | formatDecimal}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="inventQty" width="80"  label="当前库存" align="right">
                         <template slot-scope="scope">
                            {{scope.row.inventQty | formatDecimal}}
                        </template>
                    </el-table-column>                    
                </el-table>
                <div class="pagination">
                    <el-pagination background layout="total, prev, pager, next" :current-page="goodsPageIndex" :page-size="pageSize" :total="goodsPageTotal" @current-change="goodsHandlePageChange"></el-pagination>
                </div>
            </el-form>
        </el-dialog>

        <el-drawer title="选择商品"  :visible.sync="boxDialog" direction="ltr" custom-class="demo-drawer" size="65%" ref="drawer">   
            <SelectComTem :domains="domains" @fuaddDomain="fuaddDomain"></SelectComTem>
        </el-drawer>
    </div>
</template>

<script>
import qs from 'qs';
import SelectComTem from './selectComTem.vue';
import { seaRKBill,batchDelOrders,editCGBillstate,selectCGOrders } from '../../api/orders';
import { addRKOrderAndRKGoods,seaRKBillGodds,locationTree} from '../../api/goods';
export default {
    components: {
        SelectComTem       
    },
    name: 'basetable',
    data() {
        return {
            q:'',
            rules: {},
            pageIndex: 1,
            goodsPageIndex: 1,
            Selectable:'',
            pageSize: 20,
            pageTotal: 0,
            goodsPageTotal: 0,
            showVisible: false,
            putShowVisible: false,
            boxDialog: false,
            addForm:{},
            showInfoform:{},
            tableData: [],
            orderData: [],
            domains: [],
            multipleSelection: [],
            locationOptions: [],  
            userPower: []
        };
    },
    created() {
        this.getData();

        // 获取仓库数据
        this.getLocationData();
        // 获取用户权限
        this.userPower = sessionStorage.getItem('userPower').split(',');
    },
    filters: {
        formatDecimal(num, decimal=3) {
            num?num:num=0;
            num = num.toString();
            var index = num.indexOf('.');
            if (index !== -1) {
                num = num.substring(0, decimal + index + 1)
            } else {
                num = num.substring(0)
            }
            return parseFloat(num).toFixed(decimal)
        },
        formatTime(val) {           
            return val.substring(0,10);          
        }
    },   
    methods: {  
        // 获取仓库数据
        getLocationData() {
            let self = this;
            locationTree().then(res => { 
                if(res.code == "00"){
                    self.locationOptions = res.tree;
                } else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });            
        },   
        // 获取 easy-mock 的模拟数据
        getData() {
            let self = this;
            seaRKBill({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.tableData = res.rec;
                    self.pageTotal = res.total || 0;
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },
        fuaddDomain(data) {
            const self = this;              
            self.boxDialog = false;
            self.domains = data;       
        },
        addMaterial(){
            let self = this;
            self.boxDialog = true;
        },
        removeDomain(item) {  
            let self = this;
            var index = self.domains.indexOf(item);
            if (index !== -1) {
              self.domains.splice(index, 1);
            }
        },
        locationChange(value) {
            let self = this;
            self.addForm.locationId =value;
            for(var i in self.locationOptions) { 
                if(self.locationOptions[i].value == value) { 
                    self.addForm.locationName = self.locationOptions[i].label;
                    break; 
                } 
            }  
        },
        //根据当前时间和随机数生成流水号
        randomNumber(v) {
            let date = new Date();
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); // toJSON 的时区补偿
            var num = v+date.toJSON().substr(0, 19).replace(/[-T]|:/g, ''); 
            num +=(Math.round(Math.random() * 9 + 0)).toString(); 
            num +=(Math.round(Math.random() * 9 + 0)).toString(); 
            num +=(Math.round(Math.random() * 9 + 0)).toString(); 
            num +=(Math.round(Math.random() * 9 + 0)).toString(); 
            return num;
        },
        // 订单物料提交
        submitOrderReview(formName){
            let self = this;
            let putGoodsData = [];
            if(self.domains.length<1){
                self.$message.error('无商品！');
                return false;
            }else{
                console.log(self.domains)
                for (let i = 0; i < self.domains.length; i++) {   
                    let oneDBgoods = {
                        'l_goodsID':self.domains[i].id,
                        'l_qty':self.domains[i].qty,
                        'ioName':sessionStorage.getItem('admin_name'),
                        'pieceQty':self.domains[i].pieceQty
                    }    
                    putGoodsData[i]= oneDBgoods; 
                }        
                self.addForm.putUserName = sessionStorage.getItem('admin_name');
                self.addForm.putGoodsData = putGoodsData;
            }
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    addRKOrderAndRKGoods(self.addForm).then(res => { 
                        if(res.code == "00"){
                            self.getData();
                            self.$message.warning('提交成功');
                        } else {
                            self.$message.error('暂无数据');
                            return false;
                        }
                    }).catch(function(err) {
                        self.$message.error('请求失败，请检查刚绝是否正常。');
                        return false;
                    });
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
            self.domains = [];
            self.putShowVisible = false;

        }, 
        // 展示订单详细信息
        showSOInfo(row,column,event,cell){
            let self = this;
            if(column.label !="操作" && column.label !="复选框"){
                self.showVisible = true;
                self.showInfoform =row;
                seaRKBillGodds({  
                    pageIndex: self.goodsPageIndex,
                    pageSize: self.pageSize,
                    putID:row.putID,
                }).then(res => { 
                    if(res.code == "00"){
                        self.orderData = res.rec;
                        self.goodsPageTotal = res.total || 0;
                    } else {
                        self.$message.error('暂无数据');
                        return false;
                    }
                }).catch(function(err) {
                    self.$message.error('请求失败，请检查刚绝是否正常。');
                    return false;
                });
            }            
        }, 
        addRKOrder() {            
            let self = this;
            self.addForm.putBillNo = self.randomNumber('RK');
            self.putShowVisible= true;
        },    
        // 触发搜索按钮
        handleSearch() {            
            let self = this;
            self.pageIndex= 1;
            self.getData();
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        }, 
        checkSelectable(row) {
            let self = this;
            if(self.showInfoform.CGtransType==4){
                return row.state == 3;
            }else if(self.showInfoform.CGtransType==5){
                return row.state == 4;
            }else if(self.showInfoform.CGtransType==6){
                return row.state == 5;
            }else if(self.showInfoform.CGtransType==7){
                return row.state == 6;
            }
        },  
        // 分页导航
        handlePageChange(val) {
            let self = this;
            self.pageIndex = val;
            this.getData();
        },
        goodsHandlePageChange(val) {
            let self = this;
            self.gooodsPageIndex = val;
            seaRKBillGodds({  
                pageIndex:val,
                pageSize: self.pageSize,
                putID:self.showInfoform.putID,
            }).then(res => { 
                if(res.code == "00"){
                    self.orderData = res.rec;
                    self.goodsPageTotal = res.total || 0;
                } else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        }
    }
};
</script><style>
#box .el-dialog__header{
    padding-top:18px;
    margin-bottom: -25px;
}
#box .el-input--small .el-input__inner{
    /*width:100%;*/
}
#box .el-form-item__label{
    font-size: 10px;
    padding: 0;
}
</style>
<style scoped>
.handle-box {
    margin-bottom: 20px;
}

.handle-select {
    width: 120px;
}

.handle-input {
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
.batch_input{
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0; 
    cursor: pointer;
    height: 32px; 
    width: 125px;
}
.handle-input {
    width: 300px;
    display: inline-block;
}
.table {
    width: 100%;
    font-size: 14px;
}
.red {
    color: #ff0000;
}
.mr10 {
    margin-right: 10px;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
.table {
    width: calc(100% - 20px);
    margin: 0 10px; 
    font-size: 14px;
}

.handle-input {
    width: 20vw;
    display: inline-block;
}
.handle-input2 {
    width: 40%;
    display: inline-block;
}
.ml-35{
    margin-left: -35px;
}
.plr10{
    padding:0 10px; 
}

/*增加设备框样式 */
    .list_unit{
        min-height: 35px;
        font-size: 12px;
        overflow: hidden;
        line-height:40px;
    }

    .list_unit2{
        padding:6px 10px;
        height: 120px;
        overflow: hidden;
        font-size: 12px;
        line-height:20px;
    }
   

    .list_unit7{
        padding:6px 10px;
        height: 40px;
        overflow: hidden;
        font-size: 12px;
        line-height:20px;
    }
    .tab_title{
        border:1px solid #000;
        background: #409EFF32;
        height:30px;
        margin:2px;
        text-align:center;
        line-height:30px;
        font-size:14px;
        font-weight:bold;color:#111
    }
    .flexdiv{
        display: -webkit-flex; 
        flex-direction: column;
        justify-content: center;
    }
    .b_l{
        border-left:1px solid #000; 
    }
    .b_r{
        border-right:1px solid #000; 
    }
    .b_t{
        border-top:1px solid #000; 
    }
    .b_b{
        border-bottom:1px solid #000; 
    }
</style>
