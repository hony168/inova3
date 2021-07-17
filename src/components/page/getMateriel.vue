<template>
    <div>

        <!-- 打印模板 -->
        <div id="print" class="print" ref="print" style="width:2600px;font-size:10px;">
            <div style="width:843px;margin-left:-63px;transform:scale(.85); ">      
                <div style="text-align:center;line-height:28px;font-size:18px;font-family:'SimSun';font-weight:bold;margin:-15px 0 10px 0;">物料供应申请表</div>
                <el-row>
                    <el-col :span="18"><div class="list_dy_title"><b>TO：</b>{{showInfoform.toWhere}}</span></div></el-col>
                    <el-col :span="6"><div class="list_dy_title tr">编号：{{showInfoform.llBillNo}}</div></el-col>
                    <el-col :span="18"><div class="list_dy_title"><b>FR：</b>{{showInfoform.FR}}</span></div></el-col>
                    <el-col :span="6"><div class="list_dy_title tr">日期：{{showInfoform.createTime}}</div></el-col>
                </el-row>
                <div style="border:1px solid #000;">
                    <el-row style="border-bottom:1px solid #000;margin:0 0 2px 0">
                        <el-col :span="6" class="list_dy_title2">申请部门：{{showInfoform.proposerDep}}</el-col>
                        <el-col :span="6" class="list_dy_title2">申请人：{{showInfoform.llUserName}}</el-col> 
                        <el-col :span="6" class="list_dy_title2">审核人：{{showInfoform.chekName}}</el-col>
                        <el-col :span="6" class="list_dy_title2">审核日期：{{showInfoform.auditTime}}</el-col>
                    </el-row>
                    <el-row class="b_t b_b">
                        <div class="list_dy_unit2 fl tc b_r pt13 w25">序号</div>
                        <div class="list_dy_unit2 fl tc b_r pt13 w87">零件编号</div> 
                        <div class="list_dy_unit2 fl tc b_r pt13 w350">描述</div>
                        <div class="list_dy_unit2 fl tc b_r pt13 w200">申请用途（备注）</div> 
                        <div class="list_dy_unit2 fl tc w87">需求数量<br>(PCS)</div>
                    </el-row>
                    <el-row v-for="(item,index) in orderData" class="b_b">
                        <div class="list_dy_unit4 fl tc b_r w25">{{index+1}}</div>
                        <div class="list_dy_unit4 fl tc b_r w87">{{item.number}}</div> 
                        <div class="list_dy_unit4 fl tc b_r w350">{{item.name}}</div>
                        <div class="list_dy_unit4 fl tc b_r w200">{{item.goodsSeries}}</div> 
                        <div class="list_dy_unit4 fl tc w87">{{item.llQty | formatDecimal}}</div> 
                    </el-row>
                    <el-row style="border-top:1px solid #000;margin:2px 0 0 0">
                        <el-col :span="10" class="list_dy_title2">物料管理复查：</el-col>
                        <el-col :span="8" class="list_dy_title2">财务批核：</el-col> 
                        <el-col :span="6" class="list_dy_title2">仓管：</el-col> 
                    </el-row>
                </div>
            </div>
        </div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-tickets"></i> 领料单管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="q" placeholder="请输入单据号、客户名称或备注" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button v-if="userPower.indexOf('2003')>-1" type="primary" icon="el-icon-plus" @click="addLLOrder">增加领料单</el-button>
            </div>         
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="全部" name="0"></el-tab-pane>
                <el-tab-pane v-if="userPower.indexOf('2005')>-1 || userPower.indexOf('2006')>-1" label="待审核" name="1"></el-tab-pane>
                <el-tab-pane v-if="userPower.indexOf('2009')>-1 || userPower.indexOf('2010')>-1" label="审核通过" name="3"></el-tab-pane>
                <el-tab-pane v-if="userPower.indexOf('2011')>-1" label="驳回" name="2"></el-tab-pane>
                <el-tab-pane v-if="userPower.indexOf('2012')>-1" label="已存根" name="4"></el-tab-pane>
            </el-tabs>
            <el-table :data="tableData" border style="font-size:10px" stripe ref="multipleTable" header-cell-class-name="table-header"  @cell-click="showSOInfo" height="58vh">
                <el-table-column width="50" align="center">
                    <template slot-scope="scope">
                    {{scope.$index+1}}
                    </template>
                </el-table-column>
                <el-table-column v-if="userPower.indexOf('2004')>-1" width="100"  label="操作" align="right">
                    <template slot-scope="scope"  v-if="scope.row.orderType==4" >
                        <el-button type="text" icon="el-icon-search"  @click="seaCKGoods(scope.row)">出库记录</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" width="150" align="center" label="单据日期" sortable> </el-table-column>
                <el-table-column prop="llBillNo" label="单据编号" sortable :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="toWhere" label="TO" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="FR" label="FR" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="proposerDep" label="申请部门" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="orderType" width="120" label="订单状态" align="center">
                    <template slot-scope="scope">
                    {{scope.row.orderType | formatState}}
                    </template>
                </el-table-column>
                <el-table-column prop="llUserName" width="120" label="申请人" align="right"></el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 增加入库订单弹出框 -->
        <el-dialog title="填写领料订单" align='center' id="box" :visible.sync="putShowVisible" top="10vh">
            <el-form id="addForm" :model="addForm" label-width="100px" class="demo-dynamic" :rules="rules" ref="addForm">
                <el-row style="margin-left:-50px;">
                    <el-col :span="8">
                         <el-form-item label="To：" prop='toWhere'>
                            <el-input v-model="addForm.toWhere" placeholder="请输入" style="width: 100%;"></el-input>
                        </el-form-item> 
                    </el-col>
                    <el-col :span="8">
                         <el-form-item label="FR：" prop='FR'>
                            <el-input v-model="addForm.FR"  placeholder="请输入"style="width: 100%;"></el-input>
                        </el-form-item> 
                    </el-col>
                    <el-col :span="7">
                         <el-form-item label="申请部门：" prop='proposerDep'>
                            <el-input v-model="addForm.proposerDep"  placeholder="请输入申请部门" style="width: 100%;"></el-input>
                        </el-form-item> 
                    </el-col>
                </el-row> 
                               
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
                    <el-table-column prop="qty" label="数量(PCS)" width="120" align="center">
                        <template scope="scope">
                            <el-input-number v-model="scope.row.qty" :precision="2" :controls="false" :min="0.001" style="width:98%"></el-input-number>
                        </template>
                    </el-table-column>                          
                </el-table>
                <div class="pagination" style="padding-right:10px;">
                    <el-button  type="warning" @click="submitOrderReview('addForm')">提交申请</el-button>
                    <el-button @click="addMaterial">新增商品</el-button>
                    <el-button type="primary" icon="el-icon-upload2" class="iconfont icon-yunshangchuan" style=" position: absolute;">批量导入&nbsp;</el-button>
                    <input v-if="userPower.indexOf('12002')>-1" type="file" @change="importfxx(this)" class="batch_input" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                    <el-button v-if="userPower.indexOf('12003')>-1" type="primary" icon="el-icon-download" style="margin-left:-10px;" @click="exceldown('http://wms.lyccco.com/excel/ll.xlsx')">批量导入模块下载</el-button>
                </div>
            </el-form>
        </el-dialog>

        <!-- 订单详情弹出框 -->
        <el-dialog title="领料单信息" align='center' :visible.sync="showVisible" top="2vh" width="70vw">
            <el-form :inline="true"  ref="showInfoform" :model="showInfoform"  :rules="rules" > 
                <el-row>
                    <el-col :span="6"><div class="ll_title"><b>To：</b>{{showInfoform.toWhere}}</div> </el-col>
                    <el-col :span="6"><div class="ll_title"><b>编号：</b>{{showInfoform.llBillNo}}</div> </el-col>
                    <el-col :span="6"><div class="ll_title"><b>申请部门：</b>{{showInfoform.proposerDep}}</div> </el-col>
                    <el-col :span="6"><div class="ll_title"><b>申请人：</b>{{showInfoform.llUserName}}</div> </el-col>
                </el-row>
                <el-row>
                    <el-col :span="6"><div class="ll_title"><b>FR：</b>{{showInfoform.FR}}</div> </el-col>
                    <el-col :span="6"><div class="ll_title"><b>日期：</b>{{showInfoform.createTime}}</div> </el-col>
                    <el-col :span="6" v-if="showInfoform.chekName"><div class="ll_title"><b>审 核 人 ：</b>{{showInfoform.chekName}}</div> </el-col>
                    <el-col :span="6" v-if="showInfoform.auditTime"><div class="ll_title"><b>审核日期：</b>{{showInfoform.auditTime}}</div> </el-col>
                </el-row>               
                
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
                    <el-table-column prop="remark" width="70" label="仓储位置" align="center"></el-table-column>
                    <el-table-column prop="llQty" width="80"  label="需求数量" align="right">
                         <template slot-scope="scope">
                            {{scope.row.llQty | formatDecimal}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="outboundQty" width="100"  label="出库中数量" align="right">
                         <template slot-scope="scope">
                            {{scope.row.outboundQty | formatDecimal}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="haveOutboundQty" width="100"  label="已出库数量" align="right">
                         <template slot-scope="scope">
                            {{scope.row.haveOutboundQty | formatDecimal}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="haveOutboundQty" width="100" sortable label="欠料数量" align="right">
                         <template slot-scope="scope">
                            {{scope.row.llQty - scope.row.haveOutboundQty | formatDecimal}}
                        </template>
                    </el-table-column>
                    <el-table-column prop="inventQty" width="80"  label="当前库存" align="right">
                         <template slot-scope="scope">
                            {{scope.row.inventQty | formatDecimal}}
                        </template>
                    </el-table-column> 
                    <el-table-column width="120"  label="本次出库数量" align="center" v-if="showInfoform.orderType==4">
                         <template slot-scope="scope" v-if="scope.row.llQty - scope.row.haveOutboundQty>0">
                            <el-input-number v-model="scope.row.outNum" :precision="2" :controls="false" :min="0.00" placeholder="请输入数量"  @blur="outNumFun(scope.row,scope)" style="width:98%"></el-input-number>
                        </template>
                    </el-table-column>                    
                </el-table>
                <div class="pagination" style="height:10px;padding-top:5px;">
                    <DIV style="float:left;">
                        <el-pagination background layout="total, prev, pager, next" :current-page="goodsPageIndex" :page-size="pageSize" :total="goodsPageTotal" @current-change="goodsHandlePageChange"></el-pagination>
                    </DIV>

                    <DIV style="float:right">
                        <el-button type="success" v-if="showInfoform.orderType==4 && ckState ==1&&userPower.indexOf('2008')>-1" @click="outGoods('showInfoform')">出库</el-button>
                        <el-button type="success" v-if="showInfoform.orderType==1&&userPower.indexOf('2005')>-1" @click="eidtOrderState(showInfoform.llID,3)">审核通过</el-button>
                        <el-button type="success" v-if="showInfoform.orderType==2&&userPower.indexOf('2007')>-1" @click="eidtOrderState(showInfoform.llID,1)">提交订单复审核</el-button>
                        <el-button type="primary" plain v-if="showInfoform.orderType==2" @click="subBackInfo(showInfoform.llID)">查看驳回信息</el-button>
                        <el-button type="success" v-if="showInfoform.orderType==3&&userPower.indexOf('2009')>-1" @click="doPrint(showInfoform.llID)">打印单据</el-button>
                        <el-button type="success" v-if="showInfoform.orderType==3&&userPower.indexOf('2010')>-1" @click="eidtOrderState(showInfoform.llID,4)">财务批核</el-button>
                        <el-button type="danger" v-if="userPower.indexOf('2006')>-1&&showInfoform.orderType==1"  @click="backLL()">驳 回</el-button>
                        <el-button @click="showVisible = false">取 消</el-button>
                    </DIV>
                </div>
            </el-form>
        </el-dialog>
        <!-- 驳回原因填写弹出框 -->
        <el-dialog title="" :before-close="partClose" :visible.sync="showBackVisible" width="50vw">
            <el-form ref="editBackForm" :model="editBackForm" :rules="rules" label-width="100px" class="demo-ruleForm">                
                <el-col class="list_unit">
                    <el-form-item label="原 因：" prop="content">
                        <el-input v-model="editBackForm.content" type="textarea" :rows="10" placeholder="请输入驳回原因" style="width:99%;"></el-input>
                    </el-form-item>
                </el-col>                 
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showBackVisible = false">取 消</el-button>
                <el-button type="primary" @click="subBack('editBackForm')">确认</el-button>
            </span>
        </el-dialog>
        <!-- 驳回原因填写弹出框 -->
        <el-dialog title="驳回详情" :before-close="partClose" :visible.sync="showBackInfoVisible" width="50vw">            
            <div class="block">
                <el-timeline>
                    <el-timeline-item  v-for="(activity, index) in activities" :timestamp="activity.createTime" placement="top">
                      <el-card>
                        <h4> {{activity.content}}</h4>
                        <p style="line-height:35px;">{{activity.checkName}} 提交驳回原因</p>
                      </el-card>
                    </el-timeline-item>
                </el-timeline>
            </div>
        </el-dialog>

        <!-- 领料单列表 -->
        <el-dialog title="领料记录" :visible.sync="getMaterialOrderVisible">
            <el-table :data="getMaterialListData" :span-method="objectSpanMethod" border style="font-size:10px" class="table" ref="multipleTable" height="58vh" header-cell-class-name="table-header">
                <el-table-column prop="ckTime" width="150" :show-overflow-tooltip="true" label="出库时间"></el-table-column>
                <el-table-column prop="name" label="物料名称" ></el-table-column>
                <el-table-column prop="ckQty" label="出库数量" width="100" align="center">
                    <template slot-scope="scope">
                        {{scope.row.ckQty | formatDecimal}}
                    </template>
                </el-table-column>                                             
                <el-table-column prop="unitName" width="50" label="单位" align="center"></el-table-column>  
                <el-table-column prop="ckName" width="100" label="出库人" align="center"></el-table-column>  
            </el-table>
            <span slot="footer" class="dialog-footer">
                <el-button @click="getMaterialOrderVisible = false">取 消</el-button>
            </span>                  
        </el-dialog>
        <el-drawer title="选择商品"  :visible.sync="boxDialog" direction="ltr" custom-class="demo-drawer" size="65%" ref="drawer">   
            <SelectComTem :domains="domains" @fuaddDomain="fuaddDomain"></SelectComTem>
        </el-drawer>·
    </div>
</template>

<script>
import qs from 'qs';
import SelectComTem from './selectComTem.vue';
import { seallBill,eidtllState } from '../../api/orders';
import { addLLOrderAndLLGoods,seallBillGodds,addckgoods,seaCKGoods} from '../../api/goods';
import { addllBackLog,seallBackLog } from '../../api/subsidiary';
export default {
    components: {
        SelectComTem       
    },
    name: 'basetable',
    data() {
        return {
            q:'',
            rules: {                
                toWhere: [
                    { required: true, message: '请填写To内容', trigger: 'blur' }
                ],
                FR: [
                    { required: true, message: '请填写FR内容', trigger: 'blur' }
                ], 
                proposerDep: [
                    { required: true,message: '请填写申请部门', trigger: 'blur' }
                ]   
            },
            activeName: '0',
            tabIndex:'',
            pageIndex: 1,
            goodsPageIndex: 1,
            Selectable:'',
            pageSize: 20,
            pageTotal: 0,
            goodsPageTotal: 0,
            showVisible: false,
            putShowVisible: false,
            boxDialog: false,
            showBackVisible: false,
            showBackInfoVisible: false,
            addForm:{},
            showInfoform:{},
            tableData: [],
            orderData: [],
            domains: [],
            ckState:0,
            multipleSelection: [],
            locationOptions: [],   
            editBackForm:{},
            reverse: true,
            getMaterialOrderVisible:false,
            getMaterialListData: [],
            activities: [],
            arr1: [],
            userPower: []
        };
    },
    created() {
        this.getData(0);
        // 获取用户权限
        this.userPower = sessionStorage.getItem('userPower').split(',');
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
        formatTime(val) {           
            return val.substring(0,10);          
        },
        formatState(value) {
             //1为订单生成，2为审核，3为驳回，4确认生产，5生产完成…… 
            let rec='';
            switch (value) {
                case 1:
                    rec = "生成订单";
                    break;
                case 2:
                    rec = "驳回";
                     break;
                case 3:
                    rec = "审核成功";
                     break;
                case 4:
                    rec = "已存根";
                     break;
            }             
            return rec
        }
    },   
    methods: {          
        // 获取 easy-mock 的模拟数据
        getData(orderType) {
            let self = this;
            seallBill({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                orderType:orderType,
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
        handleClick(tab) {
            let self = this;
            self.tabIndex =tab.name;
            self.getData(tab.name);
        },
        fuaddDomain(data) {
            const self = this;              
            self.boxDialog = false;
            self.domains = data; 
            console.log(self.domains)      
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
        seaCKGoods(row){
            const self = this;
            seaCKGoods({
                ck_ll_ID: row.llID
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
        // 订单物料提交
        submitOrderReview(formName){
            let self = this;
            let llGoodsData = [];
            if(self.domains.length<1){
                self.$message.error('无商品！');
                return false;
            }else{
                for (let i = 0; i < self.domains.length; i++) {   
                    let oneDBgoods = {
                        'llGoodsID':self.domains[i].id,
                        'llQty':self.domains[i].qty
                    }    
                    llGoodsData[i]= oneDBgoods; 
                }        
                self.addForm.llUserName = sessionStorage.getItem('admin_name');
                self.addForm.llGoodsData = llGoodsData;
            }
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    addLLOrderAndLLGoods(self.addForm).then(res => { 
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
                self.domains = [];
                self.putShowVisible = false;
            });

        }, 
        // 展示订单详细信息
        showSOInfo(row,column,event,cell){
            let self = this;
            if(column.label !="操作" && column.label !="复选框"){
                self.showVisible = true;
                self.showInfoform = row;
                self.ckState = 0;
                seallBillGodds({  
                    pageIndex: self.goodsPageIndex,
                    pageSize: self.pageSize,
                    llID:row.llID,
                }).then(res => { 
                    if(res.code == "00"){
                        self.orderData = res.rec;
                        for (var i =0; i<self.orderData.length; i++) {
                            if(self.orderData[i].llQty>self.orderData[i].haveOutboundQty){
                                self.ckState = 1;
                                break;
                            }
                        }
                        self.goodsPageTotal = res.total || 0;
                    } else {
                        self.$message.error('暂无数据');
                        return false;
                    }
                }).catch(function(err) {
                    self.$message.error('请求失败，请检查刚绝是否正常。');
                    return false;
                });
                // seaPrintCGBillGodds({  
                //     CGID:row.CGID
                // }).then(res => { 
                //     if(res.code == "00"){
                //         self.printGoodsData  = res.rec;
                //         // self.printBillData  = res.recBill;                        
                //     }else {
                //         self.$message.error('暂无数据');
                //         return false;
                //     }
                // }).catch(function(err) {
                //     self.$message.error('请求失败，请检查刚绝是否正常。');
                //     return false;
                // });
            }            
        }, 
        addLLOrder() {            
            let self = this;
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
        // 订单审核
        eidtOrderState(Id,orderType) {
            const self = this;
            self.showVisible = false;
            let turnoverAddData =[];
            eidtllState({
                'llID':Id,
                'chekName':sessionStorage.getItem('admin_name'),
                'orderType':orderType
            }).then(res => {
                if(res.code == "00"){
                    self.getData(self.tabIndex);                        
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
        // 订单驳回
        backLL() {
            let self = this;            
            self.showBackVisible = true;
        },
        // 订单驳回
        subBackInfo(llID) {
            let self = this;     
            seallBackLog({
               ll_Id:llID
            }).then(res => {
                if(res.code == "00"){
                    self.activities = res.rec;      
                }else {
                    self.$message.error('操作失败');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('数据处理失败，请检查数据是否正确。');                            
                return false;
            });
            self.showBackInfoVisible = true;
        },

        // 订单打印        
        doPrint(llID) {
             // console.log(this.printGoodsData)
            // 1.设置要打印的区域 div的className
            this.isActive=true;
            document.getElementById('print').style.display="block";
            document.getElementById('print').style.fontFamily="SimSun";
            console.log(document.getElementById('print'))
            var t = setTimeout(function (){
                var newstr = document.getElementsByClassName('print')[0].innerHTML
                console.log(newstr)
                //2. 复制给body，并执行window.print打印功能
                document.body.innerHTML = newstr

                window.print()
                //重新加载页面，以刷新数据
                window.location.reload()
            }, 100);

        },
        // 提交驳回原因
        subBack(formName) {
            let self = this;
            self.editBackForm.ll_Id = self.showInfoform.llID;
            self.editBackForm.checkName = sessionStorage.getItem('admin_name');
            self.$refs[formName].validate((valid) => { 
                if (valid) {
                    self.showBackVisible= false;
                    addllBackLog(self.editBackForm).then(res => {
                        if(res.code == "00"){
                            self.eidtOrderState(self.showInfoform.llID,2);      
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
            self.editBackForm= {};            
        },
        partClose(done) {
            let self = this;     
            self.ADDform = {}; 
            self.editForm= {};
            self.addVisible = false;  
            self.editVisible = false;      
            done();          
        },
        // 分页导航
        handlePageChange(val) {
            let self = this;
            self.pageIndex = val;
            this.getData();
        },
        outNumFun(row){
            let self = this;
            let recNum = 0;
            if((row.llQty - row.haveOutboundQty)>0){
                if(row.outNum>(row.llQty - row.haveOutboundQty)){
                    row.outNum = row.llQty - row.haveOutboundQty; 
                }
                if(row.outNum>row.inventQty){
                    row.outNum=row.inventQty;
                }                
            }
            return row.outNum;
        },
        // 出库
        outGoods(formName) {
            let self = this;
            self.$refs[formName].validate((valid) => { 
                if (valid) {
                    let ckGoodsData = [];
                    let editckGoodsData = [];
                    if(self.orderData.length<1){
                        self.$message.error('无物料！');
                        return false;
                    }else{
                        for (let i = 0; i < self.orderData.length; i++) {
                            if(self.orderData[i].outNum>0){
                                let onegoods = { 
                                    'ckgoodsID':self.orderData[i].id, 
                                    'ck_ll_ID':self.orderData[i].llID, 
                                    'ckQty':self.orderData[i].outNum,  
                                    'ckName':sessionStorage.getItem('admin_name'), 
                                    'ckTime':self.getLocalTime(new Date().getTime())
                                }
                                ckGoodsData.push(onegoods);
                                let onegoods2 = { 
                                    'lllID':self.orderData[i].lllID, 
                                    'll_llID':self.orderData[i].ll_llID, 
                                    'llQty':self.orderData[i].llQty,  
                                    'llGoodsID':self.orderData[i].llGoodsID, 
                                    'haveOutboundQty':self.orderData[i].outNum*1+self.orderData[i].haveOutboundQty*1
                                }
                                editckGoodsData.push(onegoods2);
                            }
                        }
                    }
                    addckgoods({
                        llID:self.showInfoform.llID,
                        ckGoodsData:ckGoodsData,
                        editckGoodsData:editckGoodsData,
                    }).then(res => {
                        if(res.code == "00"){                    
                            self.showVisible= false;    
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
        },
        getLocalTime(ts) {  
            var time = new Date(ts);
            var y = time.getFullYear();
            var m = time.getMonth()+1;
            var d = time.getDate();
            var h = time.getHours();
            var mm = time.getMinutes();
            var s = time.getSeconds();
            return y+'-'+this.addz(m)+'-'+this.addz(d)+' '+this.addz(h)+':'+this.addz(mm)+':'+this.addz(s);  
        },
        addz(m){
            return m<10?'0'+m:m 
        },
        goodsHandlePageChange(val) {
            let self = this;
            self.gooodsPageIndex = val;
            seallBillGodds({  
                pageIndex:val,
                pageSize: self.pageSize,
                llID:self.showInfoform.llID,
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
        importfxx(obj) {
            let self = this;        

            let admin_name = sessionStorage['admin_name'];
            let inputDOM = this.$refs.inputer;
            // 通过DOM取文件数据
            this.file = event.currentTarget.files[0];
            var rABS = false; //是否将文件读取为二进制字符串
            var f = this.file;
            var reader = new FileReader();
            //if (!FileReader.prototype.readAsBinaryString) {
            FileReader.prototype.readAsBinaryString = function(f) {
                var binary = "";
                var rABS = false; //是否将文件读取为二进制字符串
                var pt = this;
                var wb; //读取完成的数据
                var outdata;
                var reader = new FileReader();
                reader.onload = function(e) {
                    var bytes = new Uint8Array(reader.result);
                    var length = bytes.byteLength;
                    for(var i = 0; i < length; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    var XLSX = require('xlsx');
                    if(rABS) {
                        wb = XLSX.read(btoa(fixdata(binary)), { //手动转化
                            type: 'base64'
                        });
                    } else {
                        wb = XLSX.read(binary, {
                            type: 'binary'
                        });
                    }
                        console.log(wb.Sheets[wb.SheetNames[0]])
                    outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);//outdata就是你想要的东西

                    this.da = [...outdata]
                        let arr = []
                        this.da.map(v => {
                            let obj = {}
                            console.log(v)
                            obj.number = v.零件编号
                            obj.goodsSeries = v.产品系列
                            obj.qty = v.数量
                            obj.price = v.单价RMB不含税
                            obj.priceTax = v.单价RMB含税                            
                            obj.cycle = v.交期
                            arr.push(obj)
                        })
                        console.log(arr)

                    if(outdata.length>0){
                        self.$axios.post('http://wms.lyccco.com/erpv9/Goods/bacthImportLL', qs.stringify({
                            goodsData:arr,
                        })).then((res) => {
                            if (res.data.code == '00') {
                                self.domains = res.data.rec;
                                self.$message({
                                    message:'导入成功',
                                    type: 'success'
                                });                                                                  
                            }else{
                                self.$message.error(res.data.msg);
                            }
                            self.getData();   
                        }).catch(function(err) {
                            self.$message.error('操作失败！');
                        });
                    }
                }
                reader.readAsArrayBuffer(f);
            }
            if(rABS) {
                reader.readAsArrayBuffer(f);
            } else {
                reader.readAsBinaryString(f);
            }
        },
        exceldown(url){
            try{ 
                var elemIF = document.createElement("iframe");   
                elemIF.src = url;   
                elemIF.style.display = "none";   
                document.body.appendChild(elemIF);   
            }catch(e){ } 
            // window.open("http://oa.leadingdata.cn/02.xlsx");
        },
        setdates(arr) {
            let self = this;
            self.arr1 = [];
            var obj = {},k;
            for(var i = 0, len = arr.length; i < len; i++) {
                k = arr[i].ckTime;
                obj[k]?obj[k]++:obj[k] = 1;
            }
            for(var o in obj) {
                for(let i=0;i<obj[o];i++){
                    i===0?this.arr1.push(obj[o]):this.arr1.push(0);
                }
            }
        }
    }
};
</script>
<style>
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
/*#print .el-table thead{
    color: #000;
}
#print .table{    
    border: 1px solid #000;
    color: #000;
    font-size: 10px;
}
#print .el-table--border th,{
    color: #000;
    border-bottom: 1px solid #000;
    border-right: 1px solid #000;
    font-size: 10px;
}
#print .el-table--border td {
    color: #000;
    border-bottom: 1px solid #000;
    border-right: 1px solid #000;
    font-size: 10px;
}*/
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
#print{
    display:none;
}
.list_dy_title{
    padding:0 3px 2px 3px;
    font-family:'SimSun';
    font-size:10px;
}
.list_dy_title2{
    line-height: 30px;
    padding:0 10px;
    font-family:'SimSun';
    font-size:10px;
}
.list_dy_unit{
    min-height: 20px;
    overflow: hidden;
    padding-left: 10px;
    font-family:'SimSun';
    font-size:10px;
    line-height:25px;
    min-height: 30px;
}
.list_dy_unit2{
    font-family:'SimSun';
    min-height: 20px;
    font-size:10px;
    overflow: hidden;
    padding:5px;
    line-height:14px;
}
.list_dy_unit3{
    font-family:'SimSun';
    min-height: 20px;
    font-size:10px;
    overflow: hidden;
    padding:15px;
    line-height:16px;
}
.list_dy_unit4{
    font-family:'SimSun';
    min-height: 16px;
    font-size:10px;
    overflow: hidden;
    padding:5px 5px 0 5px;
    line-height:14px;
}  

.list_dy_unit5{ 
    font-family:'SimSun';       
    overflow: hidden;
    font-size:10px;
    padding:15px;
    line-height:22px;
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
.fl{
    float: left;
}
.pt13{
    padding-top:13px;
}
.w25{width:25px;}
.w35{width:35px;}
.w60{width:60px;}
.w70{width:70px;}
.w75{width:75px;}
.w83{width:83px;}
.w87{width:87px;}
.w200{width:238px;}
.w350{width:350px;}
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


.batch_input{
    position: relative;
    opacity: 0; 
    cursor: pointer;
    height: 37px; 
    width: 125px;
    margin-right:5px;
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
    .tc{
        text-align:center;
    }
    .tr{
        text-align:right;
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
    .ll_title{
        margin:0 0 2px 12px;
        font-size:10px;
        line-height:20px;
        text-align:left;
    }
</style>
