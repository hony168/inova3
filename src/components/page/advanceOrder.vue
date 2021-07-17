<template>
    <div class="table" v-loading="loading" element-loading-text="数据处理中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-s-grid">{{title}}</i> 
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container" id="container" v-if="userPower.indexOf('2999')<0" >
            <div class="handle-box">         
                <el-button v-if="userPower.indexOf('2001')>-1" type="danger" icon="el-icon-delete" class="handle-del mr10"  @click="delAllSelection">批量作废</el-button>   
                <el-select v-model="advance_state" placeholder="订单状态" class="handle-input mr10">
                     <el-option v-for="typeArr in orderStateData" :key="typeArr.order_state_id" :label="typeArr.order_state_name" :value="typeArr.order_state_id"></el-option>
                </el-select>
                <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="primary" icon="el-icon-circle-plus" v-if="userPower.indexOf('2000')>-1" @click="handleADD">增加订单</el-button>
            </div>
            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header" @selection-change="handleSelectionChange" v-if="userPower.indexOf('2999')<0">
                <el-table-column type="selection" width="60" label="复选框" align="center"></el-table-column>
                <el-table-column prop="advance_id" label="订单号" width="180"></el-table-column>
                <el-table-column prop="advance_name" label="订单名称" ></el-table-column>
                <el-table-column prop="order_state_name" label="订单状态" align="center" width="100"></el-table-column>
                <el-table-column prop="advance_creator" label="创建人" align="center" width="180"></el-table-column>
                <el-table-column prop="advance_create_time" label="创建时间" width="160"></el-table-column>               
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-setting" v-if="scope.row.order_state_id<2 && userPower.indexOf('2002')>-1" Orders_audit @click="viewOrder(scope.row)">清单管理</el-button>
                        <el-button type="text" icon="el-icon-search" v-if="userPower.indexOf('2005')>-1" @click="showPartInfo(scope.row)">查看清单</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 增加订单弹出框 -->
        <el-dialog :before-close="partClose" :visible.sync="addVisible" width="40vw">
            <el-form :model="ADDform" :rules="rules" id = "ADDform" ref="ADDform" label-width="100px" class="demo-ruleForm">

                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 订单信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b">
                            <el-form-item label="订单名称：" prop="advance_name">
                                <el-input v-model="ADDform.advance_name" placeholder="请输入名称"></el-input>
                            </el-form-item>   
                        </el-col>   
                    </el-row>
                </el-row>
            </el-form>                
                <div style="text-align:right;padding-top:20px;">
                    <el-button type="primary" @click="AddOrder('ADDform')">立即创建</el-button>
                    <el-button @click="resetAddPart('ADDform')">重置</el-button>
                </div>
        </el-dialog>

        <!-- 数据展示弹出框 -->
        <el-dialog :visible.sync="showVisible" width="60vw">
            <div class="advance_name_title">{{showInfoform.advance_name}}清单物料信息</div>
            <!-- <el-table :data="orderGoodsData" border class="table" :summary-method="getSummaries" show-summary ref="multipleTable" header-cell-class-name="table-header"   @cell-click="showPartInfo" @selection-change="handleSelectionChange"> -->
            <el-table :data="orderGoodsData" v-if="showInfoform.order_state_id<3"  border class="table" show-summary ref="multipleTable" header-cell-class-name="table-header" @cell-click="showPartInfo" @selection-change="handleSelectionChange">                
                <el-table-column prop="goods_id" label="物料ID" ></el-table-column>
                <el-table-column prop="part_name" label="物料名称" ></el-table-column>                
                <el-table-column prop="part_code" label="物料编号"></el-table-column>
                <el-table-column prop="goods_state_name" label="状态" ></el-table-column>
                <el-table-column prop="row" label="参考价格">
                     <template scope="scope">
                        {{scope.row.goods_num*scope.row.goods_cost |formtCost}}
                     </template>
                </el-table-column>
                <el-table-column prop="goods_num" label="需求数量" ></el-table-column>
                
                <el-table-column prop="good_remark" label="备注" ></el-table-column>
            </el-table>

            <el-table v-else :data="orderGoodsConData" border class="table" ref="multipleTable" header-cell-class-name="table-header" @cell-click="showPartInfo" @selection-change="handleSelectionChange">                
                <el-table-column  prop="goods_con_id" label="物料ID" ></el-table-column>
                <el-table-column prop="part_name" label="物料名称" ></el-table-column>                
                <el-table-column prop="part_code" label="物料编号"></el-table-column>
                <el-table-column prop="goods_state_name" label="状态" ></el-table-column>
                <el-table-column prop="goods_con_cost" label="价格" >                    
                     <template scope="scope">
                        {{scope.row.goods_con_cost |formtCost}}
                     </template> 
                </el-table-column>
                <el-table-column prop="logistics_num" label="物流单号" ></el-table-column>
                
                <el-table-column prop="good_remark" label="备注" ></el-table-column>
            </el-table>
            <div style="padding:20px 10px 0px;10px;" v-if="userPower.indexOf('2004')>-1">
                审核意见:<br />
                <el-input type="textarea" :autosize="{ minRows: 2, maxRows: 4}" placeholder="请输入内容" v-model="audit_content"></el-input>
            </div>
             <div slot="footer" class="dialog-footer" v-if="userPower.indexOf('2006')>-1">
                <!-- <el-button type="success" @click="audit(1)">通过审核</el-button> -->
                <el-button v-if="showInfoform.advance_state_id<3" type="success" @click="audit(1)">通过审核</el-button>
                <el-button v-if="showInfoform.advance_state_id<3" type="danger" @click="audit(0)">驳回审核</el-button>
                <el-button @click="showVisible = false">取 消</el-button>
            </div>
            <div class="block" style="padding:20px 10px 0px;10px;" v-if="userPower.indexOf('2004')>-1">
                <el-timeline>
                    <el-timeline-item v-for="item in auditData" placement="top">
                        <el-card>
                            <h4>{{item.audit_content}}</h4>
                            <p> {{item.audit_name}} => {{item.audit_time}}</p>
                        </el-card>
                    </el-timeline-item>
                </el-timeline>
            </div>
        </el-dialog>


        <el-drawer title="选择HS编码" :before-close="handleClose" :visible.sync="dialog" direction="ltr" custom-class="demo-drawer" size="75%" ref="drawer">      
            <div class="handle-box">
                <el-input v-model="hs_q" placeholder="物料HS编号" class="handle-input2 mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleHsSearch">搜索</el-button>
            </div>
            <div style="overflow:auto;height:88%;">
                <el-table :data="hsData" border class="table" height="100%" ref="multipleTable" header-cell-class-name="table-header" @selection-change="handleSelectionChange">
                    <el-table-column prop="hs_code" label="HS编码" width="120" align="center">
                         <template slot-scope="scope">
                            {{scope.row.hs_type_id}}-{{scope.row.hs_code}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="hs_element" label="申报要素"></el-table-column>
                    <el-table-column prop="hs_export_drawback" label="出口退税" align="center" width="50"></el-table-column>
                    <el-table-column prop="hs_export_tariffa" label="出口退税" align="center" width="50"></el-table-column>
                    <el-table-column prop="hs_export_added_value_tax" label="出口增值税" align="center" width="50"></el-table-column>
                    <el-table-column prop="hs_import_MFNtariff" label="普通进口税率" align="center" width="50"></el-table-column>
                    <el-table-column prop="hs_import_tariff" label="进口增值税" align="center" width="50"></el-table-column>
                    <el-table-column prop="hs_export_added_value_tax" label="最惠国进口税率" align="center" width="50"></el-table-column>
                    <el-table-column prop="hs_unit" label="单位" align="center" width="50"></el-table-column>  
                    <el-table-column prop="hs_supervise" label="监管条件" width="110"></el-table-column>     
                    <el-table-column prop="hs_quarantine" label="检疫条件" width="110"></el-table-column>   
                    <el-table-column label="操作" width="70" align="center">
                        <template slot-scope="scope">
                            <el-button type="text" icon="el-icon-finished" @click="conPart(scope.row)">确认</el-button>
                        </template>
                    </el-table-column>                
                </el-table>
            </div>
            <div style="padding-bottom:16px; position:absolute;bottom:0;background:#ffffff;text-align:right;width:100%;height:50px;">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>                   
            </div>
        </el-drawer>
    </div>
</template>

<script>
import qs from 'qs';
import { hsGet } from '../../api/index';
import { orders,addOrders,eidtOrder,getOrderState,batchDelorder,addAudit,Orders_audit} from '../../api/order';
import { selectGoods,selectConOrderGgoods} from '../../api/goods';
export default {
    name: 'basetable',
    data() {
        return {            
            userPower:[],
            tableData: [],
            orderStateData: [],
            hsData: [],
            advance_state: '',
            q: '',  
            hs_q: '',            
            ADDform: {},
            hsShowData : {},          
            dialog: false,
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            title:'',                    
            rules: {
                advance_name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 60, message: '长度在 1 到 60 个字符', trigger: 'blur' }
                ],
                part_inventory: [
                    { required: true, message: '请输入库存', trigger: 'change' }
                ],
                part_unit: [
                    { required: true, message: '请输入计量单位', trigger: 'blur' }
                ],                
                type_id: [
                    { required: true, message: '请选择类别', trigger: 'blur' }
                ]
            },
            loading: false,
            showInfoform:{},       
            multipleSelection: [],
            delList: [],
            addVisible: false,
            showVisible: false,
            batchAddDate: {},
            delDate: {},
            orderGoodsData:[],
            orderGoodsConData:[],
            auditData:[],
            audit_content:'',

        };
    },
    filters: {
        formtCost: function (value) {
            return parseFloat(value).toFixed(3); 
        }
    },
    created() {
        //获取物料数据
        this.getData();
        //获取物料分类数据
        this.getOrderStateData();
        //获取物料分类数据
        this.getHs();

        this.userPower = sessionStorage.getItem('userPower').split(',');
        this.title = this.$route.meta.title;

    },   
    methods: {
        AddOrder(formName) {
            let self = this;
            self.ADDform.token=sessionStorage.getItem('token');
            self.ADDform.user_id=sessionStorage.getItem('user_id');
            self.ADDform.advance_creator=sessionStorage.getItem('admin_name');  
            self.ADDform.userPowerNum=2000;          
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    addOrders(self.ADDform).then(res => {
                        if(res.code == "00"){
                            self.getData();
                            self.addVisible = false;
                            self.ADDform = {};
                            self.$message.success('增加成功');
                        } else if(res.code == "-1"){
                            self.$message.warning('登录超时');
                            sessionStorage.removeItem('admin_name');
                            self.$router.push('/login');
                        }else {
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
        },
        resetAddPart(formName) {
            this.ADDform= '';
            this.hsShowData = {};
            this.$refs[formName].resetFields();
        },

        // 获取物料数据
        getData() {
            let self = this;
            orders({  
                advance_state: self.advance_state,
                keyword: '',
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                userPowerNum:2003,
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.tableData = res.rec;
                    self.pageTotal = res.total || 0;
                } else if(res.code == "-100"){
                    self.$message.warning('登录超时');
                    sessionStorage.removeItem('admin_name');
                    self.$router.push('/login');
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },

        // 获取订单状态数据
        getOrderStateData() {
            let self = this;
            getOrderState({  
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                userPowerNum:100
            }).then(res => { 
                if(res.code == "00"){
                    self.orderStateData = res.rec;
                } else if(res.code == "-100"){
                    self.$message.warning('登录超时');
                    sessionStorage.removeItem('admin_name');
                    self.$router.push('/login');
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },

        // 获取物HS编码数据
        getHs() {
            let self = this;
            hsGet({  
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                userPowerNum:100,
                q:self.hs_q
            }).then(res => { 
                if(res.code == "00"){
                    self.hsData = res.rec;
                } else if(res.code == "-100"){
                    self.$message.warning('登录超时');
                    sessionStorage.removeItem('admin_name');
                    self.$router.push('/login');
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },
        conPart(row) {
            let self = this;
            self.ADDform.hs_type_id = row.hs_type_id;
            self.ADDform.hs_code = row.hs_code;
            self.hsShowData = row;
            self.dialog = false;             
        },
        partClose(done) {
            let self = this;     
            self.ADDform = {}; 
            self.hsShowData = {};
            self.addVisible = false;      
            done();          
        },
        handleClose(done) {
            // this.$confirm('需要关闭选择物料框吗？').then(_ => {               
            //     this.loading = false;                    
            //     done();                
            // })
            // .catch(_ => {});  
            this.loading = false;      
            done();          
        },        
        handleSelect(item) {
            let self =this;
        },   
        // 触发物料搜索按钮
        handleSearch() {
            let self = this;
            self.getData();
        }, 
        // 触发hs编码搜索按钮
        handleHsSearch() {
            let self = this;
            self.getHs();
        },        
        // 增加操作
        handleADD() {
            let self = this;
            self.addVisible = true;
        },        
        // 展示设备详细信息
        showPartInfo(row, column, cell, event){
            let self = this;

                self.showVisible = true;
            self.showInfoform =row;
            self.orderGoodsData=[];
            self.orderGoodsConData=[];
            //如果订单为确认订单
            if(row.advance_state_id>2){            
                self.getGoodsCOnData(row.advance_id); 
            }else{
                self.getadvanceData(row.advance_id);  
            }
            self.getAuditData(row.advance_id);            
        },
        getAuditData(advance_id_audit){
            let self = this;
            Orders_audit({  
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                advance_id_audit:self.showInfoform.advance_id, 
                userPowerNum:2005
            }).then(res => { 
                if(res.code == "00"){
                    self.auditData = res.rec;
                } else if(res.code == "-100"){
                    self.$message.warning('登录超时');
                    sessionStorage.removeItem('admin_name');
                    self.$router.push('/login');
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },        
        audit(orderState) {
            let self = this;
            if(!self.audit_content){
                self.$message.error('请填写审核意见');
                return false;
            }
            let state_id=0;
            orderState==1?state_id=3:state_id=1;
            self.showVisible = false;
            addAudit({  
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                audit_content:self.audit_content,
                audit_name:sessionStorage.getItem('admin_name'),
                advance_id:self.showInfoform.advance_id,
                advance_name:self.showInfoform.advance_name,
                advance_state_id:state_id,
                orderGoodsData:self.orderGoodsData,
                userPowerNum:2006
            }).then(res => { 
                if(res.code == "00"){
                    self.getData();
                } else if(res.code == "-100"){
                    self.$message.warning('登录超时');
                    sessionStorage.removeItem('admin_name');
                    self.$router.push('/login');
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
            self.audit_content = '';
        },
        // 获取订单物料数据
        getadvanceData(goods_lot_code) {
            let self = this;
            selectGoods({  
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                goods_lot_code:goods_lot_code,                
                userPowerNum:2005
            }).then(res => { 
                if(res.code == "00"){
                    self.orderGoodsData = res.rec;
                } else if(res.code == "-100"){
                    self.$message.warning('登录超时');
                    sessionStorage.removeItem('admin_name');
                    self.$router.push('/login');
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        }, 
        // 获取确认订单物料数据
        getGoodsCOnData(goods_lot_code) {
            let self = this;
            selectConOrderGgoods({  
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                goods_con_lot_code:goods_lot_code,
                userPowerNum:2005
            }).then(res => { 
                if(res.code == "00"){
                    self.orderGoodsConData = res.rec;
                } else if(res.code == "-100"){
                    self.$message.warning('登录超时');
                    sessionStorage.removeItem('admin_name');
                    self.$router.push('/login');
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },  
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },

        // 批量删除物料操作
        delAllSelection() {
            const self = this,
            length = self.multipleSelection.length;
            let str = '';
            var advance_id_arr = [];
            self.delList = self.delList.concat(self.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += self.multipleSelection[i].advance_name + ' ';
                advance_id_arr[advance_id_arr.length] = self.multipleSelection[i].advance_id;
            }
            if(!str){
                self.$message.warning('请勾选需要删除的选项！');
            }else{
                self.delDate.token = sessionStorage.getItem('token');
                self.delDate.user_id = sessionStorage.getItem('user_id');
                self.delDate.advance_id_arr=advance_id_arr;
                self.delDate.userPowerNum=2001;
                batchDelorder(self.delDate).then(res => {
                    if(res.code == "00"){
                        self.getData();
                        self.$message.error('删除了'+str);
                    } else if(res.code == "-1"){
                        self.$message.warning('登录超时');
                        sessionStorage.removeItem('admin_name');
                        self.$router.push('/login');
                    }else {
                        self.$message.error('暂无数据');
                        return false;
                    }
                }).catch(function(err) {
                    self.$message.error('数据处理失败，请检查数据是否正确。');                            
                    return false;
                });
                
            }
            self.multipleSelection = [];
        },
        // 编辑操作
        viewOrder(row) {
            let self=this;
            self.$router.push({path:'/protocol',query:row});          
        },
        // 分页导航
        handlePageChange(val) {
            let self = this;
            self.pageIndex = val;
            this.getData();
        }     

    },
    watch: {
        $route(){            
            this.getData(); 
        }
    }
};
</script>

<style>
#ADDform .el-input__inner , #editForm .el-input__inner{
    border: 0px;
}
#ADDform .el-form-item__label , #editForm .el-form-item__label{
    font-size: 12px;
    padding:6px 0 0 0;
    line-height: 20px;
}
#ADDform .el-form-item__error, #editForm  .el-form-item__error {
    padding-left:15px;
}
#container .el-upload--text{
    height: 32px;
    border:0px;
    text-align: left;
    display: inline;
}
#container .el-upload-list{
    display: none;
}
</style>
<style scoped>
.handle-box {
    margin-bottom: 20px;
}
.handle-select {
    width: 120px;
}
.handle-mac-type {
    width: 200px;
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
    width: 140px;
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
    .advance_name_title{
        height:60px;
        margin:-25px 0 5px 0;
        text-align:center;
        line-height:60px;
        font-size:22px;
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
