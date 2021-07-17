<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 销售管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button type="danger" icon="el-icon-delete" class="handle-del mr10" @click="delAllSelection">批量删除</el-button>
                <el-input v-model="q" placeholder="请输入单据号、客户名称" class="handle-input mr10"></el-input>
                <el-date-picker v-model="value1" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="mr10"></el-date-picker>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="success" icon="el-icon-plus" @click="SOAdd">增加销售订单</el-button>
                <!-- <el-button icon="el-icon-printer" @click="handleSearch">打印</el-button>
                <el-button icon="el-icon-upload2" @click="handleSearch">导出</el-button>
                <el-button icon="el-icon-check" @click="handleSearch">审核</el-button>
                <el-button icon="el-icon-close" @click="handleSearch">驳回</el-button> -->
            </div>
            <el-table :data="tableData" border style="font-size:10px" stripe class="table" ref="multipleTable" header-cell-class-name="table-header"  @cell-click="showSOInfo" @selection-change="handleSelectionChange" height="63vh">
                <el-table-column type="selection" width="50" align="center"></el-table-column>                
                <el-table-column prop="billDate" width="120" label="单据日期" sortable></el-table-column>
                <el-table-column prop="billEndDate" width="120" label="交货日期" sortable></el-table-column>
                <el-table-column prop="billNo" width="180" label="单据编号" sortable :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="contactName" label="客户" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="salesName" width="80" label="销售员" :show-overflow-tooltip="true" align="center"></el-table-column>
                <el-table-column prop="totalAmount" width="120" label="销售金额" align="right">                    
                     <template slot-scope="scope">
                        {{scope.row.totalAmount | formatDecimal}}
                    </template>
                </el-table-column>
                <el-table-column prop="totalQty" width="80"  label="数量" align="right">
                     <template slot-scope="scope">
                        {{scope.row.totalQty | formatDecimal}}
                    </template>
                </el-table-column>
                
                <el-table-column prop="rpAmount" width="100"  label="已收款" align="right">
                     <template slot-scope="scope">
                        {{scope.row.rpAmount | formatDecimal}}
                    </template>                    
                </el-table-column>
                <el-table-column prop="hxStateCode" width="100"  label="收款状态" align="right">
                     <template slot-scope="scope">
                        {{scope.row.hxStateCode | payState}}
                    </template>                    
                </el-table-column>
                <el-table-column prop="userName" width="70"  label="制单人" ></el-table-column>
                <el-table-column prop="checkName" width="70"  label="审核人" ></el-table-column>
                <el-table-column label="状态" align="center" width="80" >
                    <template slot-scope="scope">
                        {{scope.row.billStatus | formatState}}
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" :show-overflow-tooltip="true"></el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 订单详情弹出框 -->
        <el-dialog title="销售订单详细信息" align='center' :visible.sync="showVisible" top="2vh" width="70vw">
            <el-form :inline="true" ref="showInfoform" :model="showInfoform" :rules="rules" >               
                <el-row style="border:1px solid #000;text-align:left;">
                    <el-row style="border:1px solid #00000045;margin:10px 10px 0 10px;">
                        <el-row style="border-bottom:1px solid #00000045;">
                            <el-col :span ="8" class="list_unit" style="margin-left:20px;">单据编号：{{showInfoform.billNo}}</el-col>
                            <el-col :span ="4" class="list_unit" >销售员：{{showInfoform.salesName}}</el-col>
                            <el-col :span ="4" class="list_unit">单据日期：{{showInfoform.billDate}}</el-col>
                            <el-col :span ="4" class="list_unit">交货日期：{{showInfoform.billEndDate}}</el-col>
                        </el-row>
                        <el-row>
                            <el-col :span ="8" class="list_unit" style="margin-left:20px;">客　户：{{showInfoform.contactName}}</el-col>
                            <el-col :span ="6" class="list_unit" >联系人：{{showInfoform.udf01}} | 联系方式：{{showInfoform.udf02}}</el-col>
                            <el-col :span ="9" class="list_unit">地址：{{showInfoform.udf03}}</el-col>
                        </el-row>                         
                    </el-row>
                    <el-table :data="orderData" border style="font-size:10px" stripe class="table" ref="multipleTable" header-cell-class-name="table-header" @selection-change="handleSelectionChange" height="63vh">
                        <el-table-column type="selection" v-if="showInfoform.billStatus==7||showInfoform.billStatus==8" width="50" align="center"></el-table-column>     
                        <el-table-column prop="number" label="商品编号" width="100" :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column prop="name" width="180" label="商品名称" :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column prop="categoryName" width="180" label="类别" :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column prop="locationName" width="80" label="仓库" :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column prop="unitName" width="70" label="单位"></el-table-column>
                        <el-table-column prop="qty" width="80"  label="需求数量" align="right">
                             <template slot-scope="scope">
                                {{scope.row.qty | formatDecimal}}
                            </template>
                        </el-table-column>
                        <el-table-column prop="inventQty" width="80"  label="当前库存" align="right">
                             <template slot-scope="scope">
                                {{scope.row.inventQty | formatDecimal}}
                            </template>
                        </el-table-column>
                        <el-table-column prop="salePrice" width="100" label="商品单价" sortable align="right">                    
                             <template slot-scope="scope">
                                {{scope.row.salePrice | formatDecimal}}
                            </template>
                        </el-table-column>
                        <el-table-column prop="qty" width="80" label="金额" sortable align="right">                    
                             <template slot-scope="scope">
                                {{scope.row.qty*scope.row.salePrice | formatDecimal}}
                            </template>
                        </el-table-column> 
                        <el-table-column prop="client" label="备注" :show-overflow-tooltip="true"></el-table-column>
                    </el-table>
                </el-row>
                <el-row type="flex" style="font-size:10px;padding:15px 0 0 5px;" v-if="showInfoform.billStatus==8">
                  <el-col :span="10">
                    <el-form-item label="物流公司名称" prop="expressName"  >
                        <el-input v-model="showInfoform.expressName"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="10">
                        <el-form-item label="物流单号" prop="expressNum"  >
                            <el-input v-model="showInfoform.expressNum"></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row v-else>
                    <el-col :span ="3" class="list_unit" align="left">客户承担费用:{{showInfoform.customerFree}}</el-col>
                    <el-col :span ="3" class="list_unit">应收款：{{showInfoform.totalAmount}}</el-col>
                    <el-col :span ="3" class="list_unit">欠款：{{showInfoform.totalAmount - showInfoform.rpAmount}}</el-col>
                    <el-col :span ="3" class="list_unit">制单人:{{showInfoform.userName}}</el-col>
                    <el-col :span ="3" class="list_unit">查看销售附件</el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="success" v-if="showInfoform.billStatus==9" @click="eidtOrderState(showInfoform.id,10)">客户签收</el-button>
                <el-button type="success" v-if="showInfoform.billStatus==8" @click="shipments('showInfoform',showInfoform.billStatus,showInfoform.id,9)">打包发货</el-button>
                <el-button type="success" v-if="showInfoform.billStatus==7" @click="createLLOrder(showInfoform.id,8)">出库</el-button>
                <el-button type="success" v-if="showInfoform.billStatus==1" @click="eidtOrderState(showInfoform.id,2)">审核通过</el-button>
                <el-button type="danger" v-if="showInfoform.billStatus<3"  @click="eidtOrderState(showInfoform.id,1)">驳 回</el-button>
                <el-button @click="showVisible = false">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { selectOrders,batchDelOrders,seaBillGodds,eidtOrderState } from '../../api/orders';
import { getPDBilleARingNumGodds,editXSOrderexpressInfo } from '../../api/goods';
export default {
    name: 'basetable',
    data() {
        return {
            drawer: false,
            q:'',
            value1:'',
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            showVisible: false,
            showInfoform:{},
            tableData: [],
            orderData: [],
            multipleSelection: [],
            delList: [],
            pageTotal: 0,
            rules: {
                expressName: [
                    { required: true, message: '请填写物流公司名称', trigger: 'blur' }
                ],
                expressNum: [
                    { required: true, message: '请填写物流单号', trigger: 'blur' }
                ]
            },
        };
    },
    created() {
        this.getData();
    },
    filters: {
        formatDecimal(num, decimal=2) {
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
        payState(val) {
            // 0未付款 1部分付款 
            if (val == 2) {
                return '全部付款';
            } else if(val == 1){
                return '部分付款';
            }else{
                return '未付款';
            }           
        },
        formatState(value) {
             //1为订单生成，2为审核，3为驳回，4确认生产，5生产完成…… 
            let rec='';
            switch (value) {
                case 1:
                    rec = "待审核";
                    break;
                case 2:
                    rec = "审核成功";
                     break;
                case 3:
                    rec = "驳回";
                     break;
                case 4:
                    rec = "确认生产";
                     break;
                case 5:
                    rec = "生产完成";
                     break;
                case 6:
                    rec = "核对物料";
                     break;
                case 7:
                    rec = "成品入库";
                     break;
                case 8:
                    rec = "申请出库";
                     break;
                     break;
                case 9:
                    rec = "成品出库";
                     break;
            }             
            return rec
        }
    },   
    methods: {        
        // 获取 easy-mock 的模拟数据
        getData() {
            let self = this;
            selectOrders({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                transType:150601,
                billStatusArr:10000,
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.tableData = res.rec;
                    self.pageTotal = res.total || 0;
                } else if(res.code == "-100"){
                    // self.$message.warning('登录超时');
                    // sessionStorage.removeItem('admin_name');
                    // self.$router.push('/login');
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },

        // 展示订单详细信息
        showSOInfo(row,column,event,cell){
            let self = this;
            if(column.label !="操作" && column.label !="复选框"){
                self.showVisible = true;
                self.showInfoform =row;
                seaBillGodds({  
                    pageIndex: self.pageIndex,
                    pageSize: self.pageSize,
                    orderBillNo:row.billNo,
                }).then(res => { 
                    if(res.code == "00"){
                        self.orderData = res.rec;
                        self.pageTotal = res.total || 0;
                    } else if(res.code == "-100"){
                        // self.$message.warning('登录超时');
                        // sessionStorage.removeItem('admin_name');
                        // self.$router.push('/login');
                    }else {
                        self.$message.error('暂无数据');
                        return false;
                    }
                }).catch(function(err) {
                    self.$message.error('请求失败，请检查刚绝是否正常。');
                    return false;
                });
            }
            
        },
        categoryIdChange(value) {
            let self = this;
            self.categoryId = value[value.length-1];
        },
               
        // 增加销售订单
        SOAdd() {
            let self = this;
            self.$router.push({path:'/soAdd'});    
        },
               
        // 触发搜索按钮
        handleSearch() {            
            let self = this;
            self.pageIndex= 1;
            self.getData();
        },
        // 删除操作
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    this.$message.success('删除成功');
                    this.tableData.splice(index, 1);
                })
                .catch(() => {});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        delAllSelection() {
            const self = this;
            length = self.multipleSelection.length;
            let str = '';
            var idArr = [];
            self.delList = self.delList.concat(self.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += self.multipleSelection[i].billNo + ' ';
                idArr[idArr.length] = self.multipleSelection[i].id;
            }
            if(!str){
                self.$message.warning('请勾选需要删除的选项！');
            }else{
                batchDelOrders({
                    'idArr':idArr
                }).then(res => {
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
        // 订单审核
        eidtOrderState(id,billStatus) {
            const self = this;
            self.showVisible = false;
            const length = self.multipleSelection.length;
            const dataArr = self.multipleSelection;
            let turnoverAddData =[];
            eidtOrderState({
                'id':id,
                // 'checkName':sessionStorage.getItem('admin_name'),
                'billStatus':billStatus
            }).then(res => {
                if(res.code == "00"){
                    self.getData();                        
                    self.$message.success('操作成功');
                }else {
                    self.$message.error('未通过');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('数据处理失败，请检查数据是否正确。');                            
                return false;
            });
        },
        // 订单审核
        eidtOrderState(id,billStatus) {
            const self = this;
            self.showVisible = false;
            const length = self.multipleSelection.length;
            const dataArr = self.multipleSelection;
            let turnoverAddData =[];
            if(billStatus==8){
                if(length<1){
                    self.$message.error('请勾选需要处理的物料！');
                    return false;
                }else{
                    self.$refs[formName].validate((valid) => {
                        if (valid) {                            
                            eidtOrderState({
                                'id':id,
                                // 'checkName':sessionStorage.getItem('admin_name'),
                                'billStatus':billStatus
                            }).then(res => {
                                if(res.code == "00"){
                                    self.getData();                        
                                    self.$message.success('操作成功');
                                }else {
                                    self.$message.error('未通过');
                                    return false;
                                }
                            }).catch(function(err) {
                                self.$message.error('数据处理失败，请检查数据是否正确。');                            
                                return false;
                            });
                        } else {
                            console.log('error submit!!');
                            return false;
                        }
                    });
                }
            }else{
                eidtOrderState({
                    'id':id,
                    // 'checkName':sessionStorage.getItem('admin_name'),
                    'billStatus':billStatus
                }).then(res => {
                    if(res.code == "00"){
                        self.getData();                        
                        self.$message.success('操作成功');
                    }else {
                        self.$message.error('未通过');
                        return false;
                    }
                }).catch(function(err) {
                    self.$message.error('数据处理失败，请检查数据是否正确。');                            
                    return false;
                });
            }
        },
        // 生成领料单
        createLLOrder(id,billStatus) {
            const self = this;
            const length = self.multipleSelection.length;
            const dataArr = self.multipleSelection;
            let turnoverAddData =[];
            if(length<1){
                self.$message.error('请勾选需要申请的物料！');
                return false;
            }else{
                console.log(self.multipleSelection);
                for (let i = 0; i < length; i++) {
                    if(dataArr[i]['qty']>0&&dataArr[i]['inventQty']>0){
                        let CKqty = 0;
                        if((dataArr[i]['qty'] - dataArr[i]['inventQty'])<0){
                            CKqty = dataArr[i]['qty'];
                        }else{
                            CKqty = dataArr[i]['inventQty'];
                        }
                        let onegoods = { 
                            'qty':dataArr[i]['qty'], 
                            'ARNum':0,
                            'ARingNum':0,
                            'CKqty':CKqty,
                            'inventQty':dataArr[i]['inventQty'],
                            'invId':dataArr[i]['invId']
                        }
                        turnoverAddData[i]= onegoods;
                    }else{
                        continue;
                    }
                }
                if(turnoverAddData.length<1){
                    self.$message.warning('无可领物料！');
                    return false;
                }


                getPDBilleARingNumGodds({
                    'domains':turnoverAddData,
                    'pdBillNoID':self.showInfoform.id,
                    'CKBillNo':self.randomNumber('ck'),
                    'CKApplyName':sessionStorage.getItem('admin_name'),
                    'billStatus':billStatus
                }).then(res => {
                    if(res.code == "00") {
                        self.$message.success('出库申请成功！');
                    }else{
                        self.$message.warning('当前库存无料可领');
                        return false;
                    }
                    self.eidtOrderState(id,billStatus);
                    self.getData();
                }).catch(function(err) {
                    self.$message.error('数据处理失败，请检查数据是否正确。');                            
                    return false;
                });      
            }

            self.showVisible = false;
        }, 
         // 打包发货
        shipments(formName,nowBillStatus,id,billStatus) {
            const self = this;
            const length = self.multipleSelection.length;
            const dataArr = self.multipleSelection;
            if(nowBillStatus==8){
                if(length<1){
                    self.$message.error('请勾选需要处理的物料！');
                    return false;
                }else{
                    self.$refs[formName].validate((valid) => { 
                        if (valid) { 
                            let goodsData = [];
                            let goodsDBListData = [];
                            for (let i = 0; i < length; i++) {   
                                var PDid='';
                                let onegoods = { 
                                    'id':self.multipleSelection[i].buyID, 
                                    'state':laterState, //商品状态为发货
                                    'expressName':self.showInfoform.expressName,
                                    'expressNum':self.showInfoform.expressNum
                                }
                                goodsData[i]= onegoods; 

                                let oneDBgoods = {
                                    'l_goodsID':self.multipleSelection[i].goodsID,
                                    'l_inOrderID':self.multipleSelection[i].CGID,
                                    'operationTime':new Date().getTime(),
                                    'l_qty':self.multipleSelection[i].qty,
                                    'ioName':sessionStorage.getItem('admin_name'),
                                    'pieceQty':self.multipleSelection[i].pieceQty

                                }
                                goodsDBListData[i]= oneDBgoods; 
                            }
                            
                            self.showVisible = false;
                            editCGOrderexpressInfo({                        
                                'CGID':CGID,                      
                                'CGtransType':CGtransType,       
                                'state':beforeState,                      
                                'goodsData':goodsData,                      
                                'goodsDBListData':goodsDBListData
                            }).then(res => {
                                if(res.code == "00"){
                                    self.getData(self.tabIndex);                        
                                    self.$message.success('操作成功');
                                }else {
                                    self.$message.error('操作失败');
                                    return false;
                                }
                            }).catch(function(err) {
                                self.$message.error('数据处理失败，请检查数据是否正确。');                            
                                return false;
                            });
                        
                        }else{
                            return false;
                        }
                    });
                }
            }else{
                return false;
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
