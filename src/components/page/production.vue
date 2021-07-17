<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 生产管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button type="danger" icon="el-icon-delete" class="handle-del mr10" @click="delAllSelection">批量删除</el-button>
                <el-input v-model="q" placeholder="请输入单据号、客户名称或备注" class="handle-input mr10"></el-input>
                <el-date-picker v-model="value1" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="mr10"></el-date-picker>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="primary" icon="el-icon-circle-plus" @click="handleSearch">增加生产订单</el-button>
                <!-- <el-button icon="el-icon-printer" @click="handleSearch">打印</el-button>
                <el-button icon="el-icon-upload2" @click="handleSearch">导出</el-button> -->
            </div>
            <!-- <el-tabs v-model="activeOrderName" @tab-click="handleOrderClick" style="padding:0 10px;">
                <el-tab-pane label="全部" name="10000"></el-tab-pane>
                <el-tab-pane label="待确认生产" name="2"></el-tab-pane>
                <el-tab-pane label="生产中" name="4"></el-tab-pane>
                <el-tab-pane label="生产完成(待品检)" name="5"></el-tab-pane>
                <el-tab-pane label="核对物料" name="6"></el-tab-pane>
            </el-tabs> -->
            <el-table :data="tableData" border style="font-size:10px" stripe class="table" ref="multipleTable" header-cell-class-name="table-header"  @cell-click="showSOInfo" @selection-change="handleSelectionChange" height="63vh">
                <el-table-column type="selection" width="50" align="center"></el-table-column>
               <!--  <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.billStatus==2" type="text" icon="el-icon-s-grid" @click="editTem(scope.$index, scope.row)">确认模板</el-button>
                        <el-button v-if="scope.row.billStatus!=2" type="text" icon="el-icon-sort" @click="turnoverFun(scope.row)">往返记录</el-button>
                        <el-button v-if="scope.row.billStatus!=2" type="text" icon="el-icon-edit" @click="getMaterialLog(scope.row)">领料记录</el-button>
                    </template>
                </el-table-column> -->
                <el-table-column prop="pdName" width="120" label="名称"></el-table-column>
                <el-table-column prop="pdBillNo" width="180" label="生产编号" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="pdContactName" label="客户" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="billDate" width="120" label="单据日期" sortable></el-table-column>
                <el-table-column prop="billEndDate" width="120" label="交货日期" sortable></el-table-column>
                <el-table-column prop="billStatus" width="80"  label="状态" align="center">
                     <template slot-scope="scope">
                        {{scope.row.billStatus | formatState}}
                    </template>
                </el-table-column>
                <el-table-column prop="userName" width="70"  label="制单人" ></el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 订单详情弹出框 -->
        <el-dialog title="生产订单详细信息" align='center' :visible.sync="showVisible" top="2vh" width="70vw">
            <el-form ref="showInfoform" :model="showInfoform" label-width="0px">                
                <el-row style="border:1px solid #000;text-align:left;">
                    <el-row style="border:1px solid #00000045;margin:10px 10px 0 10px;">
                        <el-row style="border-bottom:1px solid #00000045;">
                            <el-col :span ="6" class="list_unit" style="margin-left:20px;">单据编号：{{showInfoform.billNo}}</el-col>
                            <el-col :span ="9" class="list_unit" >销售员：{{showInfoform.salesName}} 　单据日期：{{showInfoform.billDate}} 交货日期：{{showInfoform.billEndDate}}</el-col>                            
                            <el-col :span ="8" class="list_unit">
                                <div style="float:left;width:100px;text-align:right">配料进度：</div>
                                <div  style="float:left;margin-top:6px;width:16vw;">
                                    <el-progress :text-inside="true" :stroke-width="26" :percentage="percentage"></el-progress></div>
                            </el-col>
                
                        </el-row>
                        <el-row>
                            <el-col :span ="8" class="list_unit" style="margin-left:20px;">客　户：{{showInfoform.contactName}}</el-col>
                            <el-col :span ="6" class="list_unit" >联系人：{{showInfoform.udf01}}　　联系方式：{{showInfoform.udf02}}</el-col>
                            <el-col :span ="9" class="list_unit">地址：{{showInfoform.udf03}}</el-col>
                        </el-row>                         
                    </el-row>
                    <el-table :data="domains" style="font-size:10px" class="table" ref="multipleTable" height="58vh" header-cell-class-name="table-header">
                        <!-- <el-table-column prop="num" width="60" label="操作" align="center" v-if="activeOrderName==3"> -->
                        <el-table-column prop="num" width="60" label="操作" align="center">
                            <template slot-scope="scope">
                                <el-button type="text" icon="el-icon-circle-plus-outline" @click="addMaterial"></el-button>
                                <el-button type="text" icon="el-icon-edit"  @click="editMaterial(scope.row)" ></el-button>
                            </template>
                        </el-table-column>
                        <el-table-column prop="number" width="100" :show-overflow-tooltip="true" label="物料编号"></el-table-column>
                        <el-table-column prop="name" label="物料名称" ></el-table-column>
                        <el-table-column prop="locationName" width="180" label="仓库" :show-overflow-tooltip="true"></el-table-column>                        
                        <el-table-column prop="unitName" width="50" label="单位" align="center"></el-table-column>
                        <el-table-column prop="qty" width="100"  label="要求数量" align="right">
                            <template slot-scope="scope">
                                {{scope.row.qty | formatDecimal}}
                            </template> 
                        </el-table-column>                 
                        <el-table-column v-if="showInfoform.billStatus<5" prop="inventQty" width="80"  label="当前库存" align="right">
                            <template slot-scope="scope">
                                {{scope.row.inventQty | formatDecimal}}
                            </template> 
                        </el-table-column>      
                        <el-table-column prop="qty" width="80"  label="领料数量" align="right">
                             <template slot-scope="scope">
                                <span>{{scope.row.ARNum | formatDecimal}}</span>
                            </template>
                        </el-table-column>           
                        <el-table-column v-if="showInfoform.billStatus==6" prop="qty" width="100"  label="实使用数量" align="right">
                            <template slot-scope="scope">
                                <el-input-number v-model="scope.row.realityQty" class="num_input2" :precision="3" :controls="false" placeholder="请输入数量" @blur = "checkQty"></el-input-number>
                            </template> 
                        </el-table-column>
                        <el-table-column  v-if="showInfoform.billStatus<5" prop="qty" width="120" sortable label="欠料数量" align="right">
                             <template slot-scope="scope">
                                <span v-if="scope.row.qty-scope.row.ARNum>0">{{scope.row.qty-scope.row.ARNum | formatDecimal}}</span>
                                <span v-else>0</span>
                            </template>
                        </el-table-column>     
                    </el-table>

                  
                </el-row>
                <el-row>
                    <el-col :span ="24" class="list_unit" align="left">备注:</el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button v-if="percentage>=100 && showInfoform.billStatus==6" type="success" @click="submitOrderCom(showInfoform.id,7)">商品核对完成</el-button>
                <el-button v-if="percentage>=100 && showInfoform.billStatus==5" type="success" @click="submitOrderCom(showInfoform.id,6)">合格</el-button>
                <el-button v-if="percentage>=100 && showInfoform.billStatus==4" type="success" @click="submitOrderCom(showInfoform.id,5)">生产完成</el-button>
                <el-button v-if="percentage<=100 && showInfoform.billStatus<5" type="primary" @click="submitOrderReview(showInfoform.id)">保存订单</el-button>
                <el-button v-if="percentage<=100 && showInfoform.billStatus<5"  type="primary" @click="addMaterial">新增商品</el-button>
                <el-button v-if="percentage<100" type="primary" @click="getMaterial">领料</el-button>
                <el-button @click="showVisible = false">取 消</el-button>
            </span>
        </el-dialog>
        <!-- 生成领料单 -->
        <el-dialog title="" :visible.sync="getMaterialVisible" :before-close="handleClose">
            <el-table :data="turnoverAddData" style="font-size:10px" class="table" ref="multipleTable" height="58vh" header-cell-class-name="table-header"  @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" label="复选框" align="center"></el-table-column>
                <el-table-column prop="number" width="100" :show-overflow-tooltip="true" label="物料编号"></el-table-column>
                <el-table-column prop="name" label="物料名称" ></el-table-column>
                <el-table-column prop="CKqty" label="可领数量" width="80" align="center"></el-table-column>                                             
                <el-table-column prop="unitName" width="50" label="单位" align="center"></el-table-column>  
                <!-- <el-table-column prop="locationName" width="180" label="仓库" :show-overflow-tooltip="true"></el-table-column>                        -->
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="getMaterialVisible = false">取 消</el-button>
                <el-button type="success" @click="createLLOrder">生成领料单</el-button>
            </span>                  
        </el-dialog>

        <!-- 领料单列表 -->
        <el-dialog title="领料记录" :visible.sync="getMaterialOrderVisible">
            <el-table :data="getMaterialListData" :span-method="objectSpanMethod" border style="font-size:10px" class="table" ref="multipleTable" height="58vh" header-cell-class-name="table-header">
                <el-table-column prop="CKBillNo" width="180" :show-overflow-tooltip="true" label="领料单据编号"></el-table-column>
                <el-table-column prop="name" label="物料名称" ></el-table-column>
                <el-table-column prop="CKqty" label="已领取数量" width="100" align="center">
                    <template slot-scope="scope">
                        {{scope.row.haveOutboundQty | formatDecimal}}
                    </template>
                </el-table-column>  
                <el-table-column prop="CKqty" label="领取中数量" width="100" align="center">
                    <template slot-scope="scope">
                        {{scope.row.outboundQty | formatDecimal}}
                    </template>
                </el-table-column>  
                <el-table-column prop="CKqty" label="申请数量" width="80" align="center">
                    <template slot-scope="scope">
                        {{scope.row.CKqty | formatDecimal}}
                    </template>
                </el-table-column>                                              
                <el-table-column prop="unitName" width="50" label="单位" align="center"></el-table-column>  
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="getMaterialOrderVisible = false">取 消</el-button>
            </span>                  
        </el-dialog>

        <el-drawer title="选择商品"  :visible.sync="dialog" direction="ltr" custom-class="demo-drawer" size="65%" ref="drawer">   
            <SelectComTem :box="dialog" :domains="domains" @fuaddDomain="fuaddDomain"></SelectComTem>

        </el-drawer>
    </div>
</template>

<script>
import SelectComTem from './selectComTem.vue'
import { selectGoods,generateTree,addGoods,getCost,DelOrderGoods,bomTree,seaBomAllOneData,addPDGoods,turnoverLog,getMaterialLog,getPDBilleARingNumGodds } from '../../api/goods';
import { selectOrders,eidtOrderState,eidtOrderInfoState,eidtOrderBOMId,seaPDBillGodds,selecturnoverList} from '../../api/orders';
import { selectPdOrder} from '../../api/pd';

export default {
    components: {
        SelectComTem       
    },
    data() {
        return {
            drawer: false,
            turnoverAddData: [],
            turnoverListData: [],
            turnoverOthernData: [],
            domains: [],
            activeOrderName: '10000',
            activeName: 'all',
            q:'',
            percentage:0,
            value1:'',
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            TPageIndex: 1,
            TPageSize: 20,
            TPageTotal: 0,
            showVisible: false,            
            dialog: false,            
            turnoverVisible: false,   
            getMaterialVisible: false,
            getMaterialOrderVisible: false,
            showInfoform:{},
            tableData: [],
            BOMId:[],
            options: [],
            multipleSelection: [],
            delList: [],
            getMaterialListData: [],
            editVisible: false,
            pageTotal: 0,
            BOMform: {},
            column: {},
            turnoverFunform: {},
            turnoverFunRow: {},
            rules: {
                variateName: [{ required: true, message: '请选择往返事项', trigger: 'blur' }],
                variateQty: [{ required: true, message: '请填写数量', trigger: 'blur' }],
            },
            arr1:[]
        };
    },
    created() {        
        // 获取 生产订单数据
        this.getData();

        // 获取BOM分类数据
        this.getBOMTreeData();
    },
    filters: {
        formatDecimal(num, decimal=2) {
            num?num = num.toString(): num = '0';
            var index = num.indexOf('.'); 
            if (index !== -1) {
                num = num.substring(0, decimal + index + 1)
            } else {
                num = num.substring(0)
            }
            return parseFloat(num).toFixed(decimal)
        },
        formatState(value) {
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
                case 9:
                    rec = "成品出库";
                     break;
                case 10:
                    rec = "客户签收";
                     break;
            }             
            return rec
        },
        formatTurnover(value) {
            let rec='';
            switch (value) {
                case 'add':
                    rec = "增加";
                    break;
                case 'subtract':
                    rec = "减少";
                     break;
                case 'cancellation':
                    rec = "报费";
                     break;
                case 'other':
                    rec = "其他";
                     break;
            }             
            return rec
        }
    },   
    methods: {
        // 获取 生产订单数据
        getData() {
            let self = this;
            selectPdOrder({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                // transType:150601,
                // billStatusArr:self.activeOrderName,
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
        fuaddDomain(data) {
            const self = this;          
            self.dialog = false; 
            self.domains = data; 
        },
        // 订单物料提交审核
        submitOrderReview(BillID){
            let self = this;
            let goodsData = [];
            if(self.domains.length<1){
                self.$message.error('无物料！');
                return false;
            }else{
                for (let i = 0; i < self.domains.length; i++) {   
                    var PDid=0;
                    self.domains[i].PDid?PDid=self.domains[i].PDid:PDid;
                    let onegoods = { 
                        'PDid':PDid, 
                        'BillID':BillID,
                        'invId':self.domains[i].id,
                        'contactID':self.domains[i].contactID,                        
                        'qty':self.domains[i].qty,
                        'producerName':sessionStorage['admin_name'],
                        'inventQty':self.domains[i].inventQty,
                        'ARNum':self.domains[i].ARNum,
                        'isDelete':0
                    }
                    goodsData[i]= onegoods; 
                }
            }
            addPDGoods({  
                goodsData:goodsData
            }).then(res => { 
                self.showVisible = false;
                self.$message.warning('提交成功');
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
            

        },
        // 完成生产订单提交
        submitOrderCom(id,billStatus) {
            const self = this;
            let goodsData = [];
            let orderCPData = [];
            self.showVisible = false;
            let dataObj={
                'id':id,
                'billStatus':billStatus
            };
            if(self.showInfoform.billStatus==5 || self.showInfoform.billStatus==6){

                if(self.domains.length<1){
                    self.$message.error('无物料！');
                    return false;
                }else{
                    for (let i = 0; i < self.domains.length; i++) {   
                        let realityQty = 0;
                        self.showInfoform.billStatus==6?realityQty=self.domains[i].realityQty:realityQty=self.domains[i].qty;
                        let onegoods = { 
                            'PDid':self.domains[i].PDid, 
                            'BillID':self.domains[i].BillID,
                            'producerName':sessionStorage['admin_name'],
                            'invId':self.domains[i].id,
                            'qty':self.domains[i].qty,
                            'ARNum':self.domains[i].ARNum,
                            'ARingNum':self.domains[i].ARingNum,
                            'realityQty':realityQty,
                            'isDelete':0
                        }
                        goodsData[i]= onegoods; 
                    }
                }
                dataObj.goodsData=goodsData;
                if(self.showInfoform.billStatus==6){
                    dataObj.CGbillNo= self.randomNumber('CP'); 
                    dataObj.userName= sessionStorage['admin_name']; 
                    dataObj.orderBillNo= self.showInfoform.billNo; 
                }
            }
            eidtOrderInfoState(dataObj).then(res => {
                if(res.code == "00"){
                    self.getData();                        
                    self.$message.success('审核通过');
                }else {
                    self.$message.error('未通过');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('数据处理失败，请检查数据是否正确。');                            
                return false;
            });
        },
        // 获取BOM分类数据
        getBOMTreeData() {
            let self = this;
            bomTree({ 
                transType:150601,
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.options = res.tree;                
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
        showSOInfo(row,column){
            let self = this;
            self.showInfoform = row;
            self.column = column; 

              
            if(column.label !="操作" && column.label !="复选框"){
                if(row.billStatus<4){
                    self.$message.warning('请先绑定绑定BOM模板');
                    return false; 
                } 
                self.showVisible = true;
                seaPDBillGodds({  
                    pageIndex: self.pageIndex,
                    pageSize: self.pageSize,
                    BillID:self.showInfoform.id,
                    billStatusArr:[2,3,4],
                    q:self.q
                }).then(res => { 
                    if(res.code == "00"){
                        self.domains = res.rec;
                        self.percentage = res.percentage;
                    } else {
                        self.$message.error('暂无数据');
                        return false;
                    }
                }).catch(function(err) {
                    self.$message.error('请求失败，请检查刚绝是否正常。');
                    return false;
                });
            }
            self.column =  {} ;         
        },
        categoryIdChange(value) {
            let self = this;
            self.categoryId = value[value.length-1];
        },
          
        addMaterial(){
            let self = this;
            self.dialog = true;
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
            }).then(() => {
                this.$message.success('删除成功');
                this.tableData.splice(index, 1);
            }).catch(() => {});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        delAllSelection() {
            const length = this.multipleSelection.length;
            let str = '';
            this.delList = this.delList.concat(this.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += this.multipleSelection[i].name + ' ';
            }
            this.$message.error(`删除了${str}`);
            this.multipleSelection = [];
        },
        // 商品往返记录
        turnoverFun(row){
            this.turnoverFunRow = row;
            this.goodsTurnoverlog(this.activeName);
        },
        //选项卡
        handleOrderClick(tab) {
            this.activeOrderName = tab.name;            
            this.getData(this.activeOrderName);
        },
        //选项卡
        handleClick(tab) {
            this.activeName = tab.name;            
            this.goodsTurnoverlog(tab.name);
        },
        // //物料往返记录
        goodsTurnoverlog(val) {
            const self = this;
            selecturnoverList({
                'WHBillID':self.turnoverFunRow.id,
                'variateName':self.activeName,
                'TPageIndex':self.TPageIndex,
                'TPageSize':self.TPageSize,
                'CKApplyName':sessionStorage.getItem('admin_name')
            }).then(res => {
                if(res.code == "00"){
                    if(res.total<1){
                        self.$message.warning('当前无料往返记录');
                    }else{                        
                        self.turnoverVisible = true; 
                    }
                    self.turnoverListData = res.rec;
                    self.TPageTotal = res.total || 0;
                }else{
                    self.$message.warning('当前库存无料可领');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('数据处理失败，请检查数据是否正确。');                            
                return false;
            });
        },
        // 领料
        getMaterial(){
            const self = this;
            let goodsData = [];
            let dataArr = self.domains;
            let length = self.domains.length;
            self.turnoverAddData = [];
            if(length<1){
                self.$message.error('无物料！');
                return false;
            }else{
                for (let i = 0; i < length; i++) {
                    if(dataArr[i]['qty']>dataArr[i]['ARNum']&&dataArr[i]['inventQty']>0){
                        if((dataArr[i]['qty']-dataArr[i]['ARNum']-dataArr[i]['inventQty'])<0){
                            dataArr[i].CKqty = dataArr[i]['qty']-dataArr[i]['ARNum'];
                        }else{
                            dataArr[i].CKqty = dataArr[i]['inventQty'];
                        } 
                        self.turnoverAddData.push(dataArr[i]);
                    }else{
                        continue;
                    }
                }
                if(self.turnoverAddData.length<1){
                    self.$message.warning('无可领物料！');
                    return false;
                }
                self.getMaterialVisible = true;   
                
            }

        },
        // 生成领料单
        createLLOrder(){
            const self = this;
            const length = self.multipleSelection.length;
            if(length<1){
                self.$message.error('请勾选需要申请的物料！');
                return false;
            }else{
                getPDBilleARingNumGodds({
                    'domains':self.turnoverAddData,
                    'pdBillNoID':self.showInfoform.id,
                    'CKBillNo':self.randomNumber('ck'),
                    'CKApplyName':sessionStorage.getItem('admin_name')
                }).then(res => {
                    if(res.code == "00") {
                        self.$message.success('物料申请成功！');
                    }else{
                        self.$message.warning('当前库存无料可领');
                        return false;
                    }

                    self.showSOInfo(self.showInfoform,self.column);
                }).catch(function(err) {
                    self.$message.error('数据处理失败，请检查数据是否正确。');                            
                    return false;
                });
                self.getMaterialVisible = false;   
                self.multipleSelection=[];     
                self.turnoverAddData=[];        
            }
        },

        objectSpanMethod({ row, column, rowIndex, columnIndex }) {
            if (columnIndex === 0) {
                let _row = this.arr1[rowIndex];
                let _col = this.arr1[rowIndex] > 0 ? 1 : 0;
                return {
                    rowspan: _row,
                    colspan: _col
                };
            }
        }, 
        setdates(arr) {
            var obj = {},k, arr1 = [];
            for(var i = 0, len = arr.length; i < len; i++) {
                k = arr[i].CKBillNo;
                obj[k]?obj[k]++:obj[k] = 1;
            }
            //保存结果{el-'元素'，count-出现次数}
            for(var o in obj) {
                for(let i=0;i<obj[o];i++){
                    i===0?this.arr1.push(obj[o]):this.arr1.push(0);
                }
            }
        },
        //领料记录
        getMaterialLog(row){
            const self = this;
            getMaterialLog({
                'pdBillNoID':row.id
            }).then(res => {
                if(res.code == "00"){    
                    self.getMaterialOrderVisible = true;
                    self.getMaterialListData = res.rec;
                    self.setdates(res.rec);                             
                }else  {
                    self.$message.warning('无领料记录');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('数据处理失败，请检查数据是否正确。');                            
                return false;
            });
        },
        handleClose(done) {
            let self = this;
            self.getMaterialVisible = false; 
            self.turnoverAddData = [];
        },
         //   根据当前时间和随机数生成流水号
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
        // 编辑操作
        editMaterial(row) {
            this.turnoverFunform = row;
            this.editVisible = true;
        },
    
        // 分页导航
        handlePageChange(val) {
            let self = this;
            self.pageIndex = val;
            self.getData();
        },
        
        // 分页导航
        turnoverHandlePageChange(val) {
            let self = this;
            self.TPageIndex = val;
            self.handleClick(self.activeName);
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
.el-table__expanded-cell[class*=cell] {
    padding:0px 0 50px 0;
}

#turnoverFunform .el-input-number .el-input__inner {
    text-align: left;
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
.num_input{
    width: 15vw;
}
.num_input2{
    width: 90px;
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
