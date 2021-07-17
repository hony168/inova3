<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 采购管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="q" placeholder="请输入单据号、客户名称或备注" class="handle-input mr10"></el-input>
                <el-date-picker v-model="seaTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="mr10"></el-date-picker>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>



            <el-tabs v-model="activeName" @tab-click="handleClick">
                <!-- <el-tab-pane label="全部" name="0"></el-tab-pane> -->
                <!-- <el-tab-pane label="待审核" name="1"></el-tab-pane>
                <el-tab-pane label="驳回" name="2"></el-tab-pane> 
                <el-tab-pane label="待付款" name="3"></el-tab-pane>-->
                <el-tab-pane v-if="userPower.indexOf('3000')>-1" label="待发货" name="4"></el-tab-pane>
                <!-- <el-tab-pane v-if="userPower.indexOf('3001')>-1" label="待确认收货" name="5"></el-tab-pane> -->
                <el-tab-pane v-if="userPower.indexOf('3002')>-1" label="品检" name="6"></el-tab-pane>
                <el-tab-pane v-if="userPower.indexOf('3004')>-1" label="待入库" name="7"></el-tab-pane>
                <el-tab-pane v-if="userPower.indexOf('3003')>-1" label="品检不合格" name="100"></el-tab-pane>
                <el-tab-pane v-if="userPower.indexOf('3005')>-1" label="退换商品" name="101"></el-tab-pane>
            </el-tabs>

            <el-table :data="tableData" border style="font-size:10px" stripe ref="multipleTable" header-cell-class-name="table-header"  @cell-click="showSOInfo" @selection-change="handleSelectionChange" height="58vh">
                <el-table-column width="50" align="center">
                    <template slot-scope="scope">
                    {{scope.$index+1}}
                    </template>
                </el-table-column>
                <el-table-column prop="createTime" width="100" align="center" label="单据日期" sortable>                    
                     <template slot-scope="scope">
                        {{scope.row.createTime | formatTime}}
                    </template>
                    
                </el-table-column>
                <el-table-column prop="CGbillNo" width="200" label="单据编号" sortable :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="name" label="供应商" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="totalAmount" width="80" label="金额" align="right">                    
                     <template slot-scope="scope">
                        {{scope.row.totalAmount | formatDecimal}}
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
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
               


        </div>

        <!-- 订单详情弹出框 -->
        <el-dialog title="" align='center' :visible.sync="showVisible" top="2vh" width="70vw">
            <div v-loading="loading" element-loading-text="数据处理中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)" style="text-align:right;">
                <el-form :inline="true"  ref="showInfoform" :model="showInfoform"  :rules="rules" > 
                    <div style="margin:0 0 14px 15px;text-align:left;font-size:12px;font-weight:bold;">
                        供应商：{{showInfoform.name}}　　　　单据日期：{{showInfoform.createTime}}　　　　单据编号：{{showInfoform.CGbillNo}}
                    </div>                 
                    
                    <el-table :data="orderData" border style="font-size:10px" stripe class="table" ref="multipleTable" @selection-change="handleSelectionChange" header-cell-class-name="table-header"  height="63vh">
                        <el-table-column width="30">
                            <template slot-scope="scope">
                                {{scope.$index+1}}
                            </template>
                        </el-table-column>
                        <!-- <el-table-column v-if="showInfoform.CGtransType==4 || showInfoform.CGtransType==5 || showInfoform.CGtransType==6|| showInfoform.CGtransType==7" type="selection" :selectable="checkSelectable" width="60" label="复选框" align="center"></el-table-column>  -->
                        <el-table-column type="selection" width="60" label="复选框" align="center"></el-table-column>                    
                        <el-table-column prop="number" label="商品编号" width="100" :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column prop="name" label="商品名称" :show-overflow-tooltip="true"></el-table-column>
                        <!-- <el-table-column prop="categoryName" width="180" label="类别" :show-overflow-tooltip="true"></el-table-column> -->
                        <el-table-column v-if="tabIndex=='5'" prop="expressName" label="物流公司名称" :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column v-if="tabIndex=='5'" prop="expressNum" label="物流单号" :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column v-if="tabIndex=='101'" prop="backExpressName" label="退回物流公司名称" :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column v-if="tabIndex=='101'" prop="backExpressNum" label="退回物流单号" :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column prop="qty" width="80"  label="需求数量" align="right">
                             <template slot-scope="scope">
                                <el-input-number v-model="scope.row.qty" :precision="2" :controls="false" :min="0.01" placeholder="请输入数量" style="width:98%"></el-input-number>
                            </template>
                        </el-table-column>
                        <el-table-column prop="unitName" width="80"  label="单位" align="center"></el-table-column>
                        <el-table-column prop="inventQty" width="80"  label="当前库存" align="right">
                             <template slot-scope="scope">
                                {{scope.row.inventQty | formatDecimal}}
                            </template>
                        </el-table-column>
                        <el-table-column prop="priceTax" width="100" label="商品单价" sortable align="right">                    
                             <template slot-scope="scope">
                                {{scope.row.priceTax | formatDecimal}}
                            </template>
                        </el-table-column>
                        <el-table-column prop="qty" width="80" label="金额" sortable align="right">                    
                             <template slot-scope="scope">
                                {{scope.row.qty*scope.row.priceTax | formatDecimal}}
                            </template>
                        </el-table-column> 
                    </el-table>                    
                    <div class="pagination">
                        <el-pagination background layout="total, prev, pager, next" :current-page="orderPageIndex" :page-size="orderPageSize" :total="orderPageTotal" @current-change="orderHandlePageChange"></el-pagination>
                    </div>
                    <el-row type="flex" style="font-size:10px;padding:15px 0 0 5px;" v-if="userPower.indexOf('3000')>-1 && (tabIndex=='4' || tabIndex=='101')">
                      <el-col :span="6">
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
                    <el-row type="flex" style="font-size:10px;padding:15px 0 0 5px;" v-if="tabIndex=='100'">
                      <el-col :span="6">
                        <el-form-item label="退回物流公司名称" prop="backExpressName"  >
                            <el-input v-model="showInfoform.backExpressName"></el-input>
                        </el-form-item>
                      </el-col>
                      <el-col :span="10">
                            <el-form-item label="退回物流单号" prop="backExpressNum"  >
                                <el-input v-model="showInfoform.backExpressNum"></el-input>
                            </el-form-item>
                      </el-col>
                    </el-row>
                </el-form>

                <span slot="footer" class="dialog-footer">
                    <el-button  v-if="userPower.indexOf('12005')>-1" type="success" @click="doPrint(showInfoform.CGID)">去打印</el-button>
                    <el-button type="success" v-if="String(showInfoform.CGtransType).indexOf('7')>-1&&tabIndex=='7'" @click="OrderDdeliverState('showInfoform',showInfoform.CGID,'8','7','7','8')">入库</el-button>
                    <el-button type="success" v-if="String(showInfoform.CGtransType).indexOf('101')>-1&&tabIndex=='101'" @click="OrderDdeliverState('showInfoform',showInfoform.CGID,'5','101','101','5')">补发商品</el-button>
                    <el-button type="danger" v-if="String(showInfoform.CGtransType).indexOf('100')>-1&&tabIndex=='100'" @click="OrderDdeliverState('showInfoform',showInfoform.CGID,'101','100','100','101')">退换商品</el-button>
                    <el-button type="danger" v-if="String(showInfoform.CGtransType).indexOf('6')>-1&&tabIndex=='6'" @click="OrderDdeliverState('showInfoform',showInfoform.CGID,'100','6','6','100')">品检不合格</el-button>
                    <el-button type="success" v-if="String(showInfoform.CGtransType).indexOf('6')>-1&&tabIndex=='6'" @click="OrderDdeliverState('showInfoform',showInfoform.CGID,'7','6','6','7')">品检合格</el-button>
                    <el-button type="success" v-if="String(showInfoform.CGtransType).indexOf('5')>-1&&tabIndex=='5'" @click="OrderDdeliverState('showInfoform',showInfoform.CGID,'6','5','5','6')">确认收货</el-button>
                    <el-button type="success" v-if="String(showInfoform.CGtransType).indexOf('4')>-1&&tabIndex=='4'&&userPower.indexOf('3000')>-1" @click="OrderDdeliverState('showInfoform',showInfoform.CGID,'6','4','4','6')">发货</el-button>
                    <el-button type="success" v-if="showInfoform.CGtransType==3" @click="eidtOrderState(showInfoform.CGID,4)">已付款</el-button>
                    <el-button type="success" v-if="showInfoform.CGtransType==1 || showInfoform.CGtransType==2" @click="eidtOrderState(showInfoform.CGID,3)">审核通过</el-button>
                    <!-- <el-button type="danger" v-if="showInfoform.CGtransType==3"  @click="eidtOrderState(showInfoform.CGID,2)">驳 回</el-button> -->
                    <el-button @click="showVisible = false">取 消</el-button>
                </span>
            </div>
        </el-dialog>

        <!-- 打印模板 -->
        <div id="print" class="print" ref="print" style="width:1200px;font-size:10px;">
            <div style="width:843px;margin-left:-63px;transform:scale(.85); ">      
                <div style="text-align:center;line-height:28px;font-size:18px;font-family:'SimSun';font-weight:bold;margin:-90px 0 10px 0;">江西诺发科技有限公司<br>采购订单</div>
                <el-row>
                    <el-col :span="20"><div class="list_dy_unit"><b>订单编号：</b>{{printBillData.CGbillNo}}</span></div></el-col>
                    <el-col :span="4"><div class="list_dy_unit tr">Rev.B</div></el-col>
                </el-row>

                <el-row style="border:1px solid #000000;">
                    <el-row>
                        <el-col :span="3" class="list_dy_unit tc b_r b_b">供应商：</el-col>
                        <el-col :span="9" class="list_dy_unit b_r b_b">{{printBillData.name}}</el-col> 
                        <el-col :span="3" class="list_dy_unit tc b_r b_b">交货至：</el-col>
                        <el-col :span="9" class="list_dy_unit b_b">{{printBillData.SFContactName}}</el-col> 
                    </el-row>
                    <el-row>
                        <el-col :span="3" class="list_dy_unit tc b_r b_b">联系人：</el-col>
                        <el-col :span="9" class="list_dy_unit b_r b_b">{{printBillData.linkName}}</el-col> 
                        <el-col :span="3" class="list_dy_unit tc b_r b_b">联系人：</el-col>
                        <el-col :span="9" class="list_dy_unit b_b">{{printBillData.SFlinkName}}</el-col> 
                    </el-row>
                    <el-row>
                        <el-col :span="3" class="list_dy_unit tc b_r b_b">联系电话：</el-col>
                        <el-col :span="9" class="list_dy_unit b_r b_b">{{printBillData.linkMobile}}</el-col> 
                        <el-col :span="3" class="list_dy_unit tc b_r b_b">联系电话：</el-col>
                        <el-col :span="9" class="list_dy_unit b_b">{{printBillData.SFlinkMobile}}</el-col> 
                    </el-row>
                    <el-row>
                        <el-col :span="3" class="list_dy_unit tc b_r b_b">联系地址：</el-col>
                        <el-col :span="9" class="list_dy_unit b_r b_b">{{printBillData.prov}}{{printBillData.city}}{{printBillData.district}}{{printBillData.address}}</el-col> 
                        <el-col :span="3" class="list_dy_unit tc b_r b_b">联系地址：</el-col>
                        <el-col :span="9" class="list_dy_unit b_b">{{printBillData.SFprov}}{{printBillData.SFcity}}{{printBillData.SFdistrict}}{{printBillData.SFaddress}}</el-col> 
                        <!-- <el-col :span="24" class="list_dy_unit b_t b_b"><b>供方银行及账号： {{printBillData.bankNo}}（{{printBillData.depositBank}}）</b></el-col> -->
                    </el-row>
                    <table class="biao" cellspacing="0">
                        <tr>
                            <th class="b_r b_b">序号</th>
                            <th class="b_r b_b">零件编号</th>
                            <th class="b_r b_b">产品系列</th>
                            <th class="b_r b_b">描述</th>
                            <th class="b_r b_b">数量<br>(PCS)</th>
                            <th class="b_r b_b">单价<br>(RMB不含税)</th>
                            <th class="b_r b_b">单价<br>(RMB含税)</th>
                            <th class="b_r b_b">交期(天)</th>
                            <th class="b_b">总价<br>(RMB含税)</th>
                        </tr>
                        <tr  v-for="(item,index) in printGoodsData">
                            <td class="b_r b_b tc">{{index+1}}</td>
                            <td class="b_r b_b">{{item.number}}</td>
                            <td class="b_r b_b">{{item.goodsSeries}}</td>
                            <td class="b_r b_b">{{item.name}}</td>
                            <td class="b_r b_b tc">{{item.qty | formatDecimal}}</td>
                            <td class="b_r b_b">{{item.price | formatDecimal}}</td>
                            <td class="b_r b_b">{{item.priceTax | formatDecimal}}</td>
                            <td class="b_r b_b tc">{{item.cycle}}</td>
                            <td class="b_b">{{item.priceTax * item.qty | formatDecimal}}</td>
                        </tr>
                        <tr v-if="printGoodsData.length<8"  v-for="ietma in printGoodsDataLength">
                            <td class="b_r b_b tr">&nbsp;</td>
                            <td class="b_r b_b"></td>
                            <td class="b_r b_b"></td>
                            <td class="b_r b_b"></td>
                            <td class="b_r b_b"></td>
                            <td class="b_r b_b"></td>
                            <td class="b_r b_b"></td>
                            <td class="b_r b_b"></td>
                            <td class="b_b"></td>
                        </tr>
                    </table>
                    <el-row>
                        <div class="list_dy_unit3 tr" >
                            不含税：￥{{printBillData.totalPrice  | formatDecimal}}<br>增值税：￥{{printBillData.totalPriceTax-printBillData.totalPrice  | formatDecimal}}<br>含税总计：￥{{printBillData.totalPriceTax}}<br>
                        </div> 
                    </el-row>
                    <el-row class="b_t" style="min-height:200px;">                        
                        <div class="list_dy_unit5" >
                            <b>备注：</b><br><span v-html="printBillData.description"></span>
                        </div> 
                    </el-row>
                    <el-row class="b_t" >                        
                        <el-col :span="12" class="list_dy_unit5 b_r" style="min-height:200px;">
                            <div style="min-height:200px;">供货方：<br>供方签字/盖章：</div>
                            <div class="tr"><span style="padding-right:20px">年</span><span style="padding-right:20px">月</span>日</div>
                        </el-col> 
                        <el-col :span="12" class="list_dy_unit5">
                            <div style="min-height:200px;">采购方：<br>采购方签字/盖章：</div>
                            <div class="tr"><span style="padding-right:20px">年</span><span style="padding-right:20px">月</span>日</div>
                        </el-col>  
                    </el-row>
                </el-row>
                <el-row >                        
                    <el-col :span="8" class="list_dy_unit5">
                        <div style="min-height:200px;">制作：{{printBillData.userName}}</div>
                    </el-col> 
                    <el-col :span="8" class="list_dy_unit5">
                        <div style="min-height:200px;">检查：{{printBillData.CGsalesName}}</div>
                    </el-col> 
                    <el-col :span="8" class="list_dy_unit5">
                        <div style="min-height:200px;">核准：{{printBillData.checkName}}</div>
                    </el-col>  
                </el-row>
            </div>
        </div>
    </div>
</template>

<script>
import { selectOrders,batchDelOrders,seaCGBillGodds,eidtOrderState,editCGBillstate,selectCGOrders,seaPrintCGBillGodds } from '../../api/orders';
import { editCGOrderexpressInfo } from '../../api/goods';

export default {
    name: 'basetable',
    data() {
        return {
            q:'',
            seaTime:'',
            tabIndex:'4',
            rules: {
                expressName: [
                    { required: true, message: '请填写物流公司名称', trigger: 'blur' }
                ],
                expressNum: [
                    { required: true, message: '请填写物流单号', trigger: 'blur' }
                ],
                backExpressName: [
                    { required: true, message: '请填写物流公司名称', trigger: 'blur' }
                ],
                backExpressNum: [
                    { required: true, message: '请填写物流单号', trigger: 'blur' }
                ]
            },
            loading: true,
            activeName: '4',
            pageIndex: 1,
            pageSize: 20,
            orderPageIndex: 1,
            orderPageSize: 20,
            Selectable:'',
            pageTotal: 0,
            orderPageTotal: 0,
            showVisible: false,
            showInfoform:{},
            tableData: [],
            orderData: [],
            printGoodsData: [],
            printGoodsDataLength: 0,
            printBillData: [],
            multipleSelection: [],
            delList: [],
            userPower: [],
            pageTotal: 0
        };
    },
    created() {
        // 获取用户权限
        this.userPower = sessionStorage.getItem('userPower').split(',');

        if(this.userPower.indexOf('3000')<0){
            this.tabIndex='5';
            this.activeName='5';
        } else if(this.userPower.indexOf('3001')<0){            
            this.tabIndex='6';
            this.activeName='6';
        } else if(this.userPower.indexOf('3002')<0){            
            this.tabIndex='7';
            this.activeName='7';
        } else if(this.userPower.indexOf('3003')<0){            
            this.tabIndex='100';
            this.activeName='100';
        } else if(this.userPower.indexOf('3004')<0){            
            this.tabIndex='101';
            this.activeName='101';
        } else if(this.userPower.indexOf('3005')<0){            
            this.tabIndex='0';
            this.activeName='0';
        }
        this.getData(this.tabIndex);
        
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
            }             
            return rec
        }
    },   
    methods: {     
        // 获取 easy-mock 的模拟数据
        getData(index) {
            let self = this;
            selectCGOrders({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                CGtransType:index,
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
        },// 获取 easy-mock 的模拟数据
        getOneOrerData(CGID) {
            let self = this;
            seaCGBillGodds({  
                pageIndex: self.orderPageIndex,
                pageSize: self.orderPageSize,
                CGID:CGID,
                gooosState:self.tabIndex
            }).then(res => { 
                if(res.code == "00"){
                    self.orderData  = res.rec;
                    sessionStorage.setItem('originalData',JSON.stringify(res.rec));
                    self.orderPageTotal = res.total || 0;
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
            self.getData(self.tabIndex);
        },
        // 展示订单详细信息
        async showSOInfo(row,column,event,cell){
            let self = this;
            if(column.label !="操作" && column.label !="复选框"){
                self.showInfoform =row;
                this.getOneOrerData(row.CGID);
                await seaPrintCGBillGodds({  
                    CGID:row.CGID
                }).then(res => { 
                    if(res.code == "00"){
                        this.loading = false;
                        res.rec.length<8? this.printGoodsDataLength = 8 - res.rec.length : this.printGoodsDataLength= 0;
                        self.printGoodsData  = res.rec;
                        self.printBillData  = res.recBill;                        
                    }else {
                        self.$message.error('暂无数据');
                        return false;
                    }
                }).catch(function(err) {
                    self.$message.error('请求失败，请检查刚绝是否正常。');
                    return false;
                });

                self.showVisible = true;
            }
            
        },    
        // 触发搜索按钮
        handleSearch() {            
            let self = this;
            self.pageIndex= 1;
            self.getData(this.tabIndex);
        },
        // 多选操作
        handleSelectionChange(val) {
            // console.log(val)
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
                        self.getData(self.tabIndex);
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
        eidtOrderState(CGID,CGtransType) {
            const self = this;
            self.showVisible = false;
            editCGBillstate({
                'CGID':CGID,
                'CGtransType':CGtransType
            }).then(res => {
                if(res.code == "00"){
                    self.getData(self.tabIndex);                        
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
        // 订单发货
        OrderDdeliverState(formName,CGID,CGtransType,laterOrderState,beforeState,nextState) {
            const self = this;
            length = self.multipleSelection.length;
            let originalData = JSON.parse(sessionStorage.getItem('originalData'));
            console.log(originalData)
            self.$refs[formName].validate((valid) => {  
                if (valid) {
                    let goodsData = [];
                    let putGoodsData = [];
                    let containState =-1 ;
                    if(length<1){
                        self.$message.error('无物料！');
                        return false;
                    }else{
                        for (let i = 0; i < length; i++) {  
                            if(length<originalData.length){
                                containState = 0;
                            }
                            originalData.some((value, index) => {
                                let expressName='';
                                let expressNum='';
                                let backExpressName='';
                                let backExpressNum='';
                                if(self.tabIndex =='4'|| self.tabIndex =='101'){
                                    expressName=self.showInfoform.expressName
                                    expressNum=self.showInfoform.expressNum;
                                }else{
                                    expressName=self.multipleSelection[i].expressName
                                    expressNum=self.multipleSelection[i].expressNum;
                                }
                                if(self.tabIndex =='100'){
                                    backExpressName = self.showInfoform.backExpressName;
                                    backExpressNum = self.showInfoform.backExpressNum;
                                }
                                if(self.tabIndex =='101'){
                                    backExpressName =self.multipleSelection[i].backExpressName;
                                    backExpressNum = self.multipleSelection[i].backExpressNum;
                                }
                                if(value.buyID == self.multipleSelection[i].buyID){
                                    if(self.multipleSelection[i].qty>=value.qty){
                                        self.multipleSelection[i].qty=value.qty;
                                        let onegoods = { 
                                            'id':self.multipleSelection[i].buyID, 
                                            'qty':value.qty, 
                                            'listCGID':self.multipleSelection[i].listCGID,  
                                            'remark':self.multipleSelection[i].remark, 
                                            'goodsSeries':self.multipleSelection[i].goodsSeries, 
                                            'goodsID':self.multipleSelection[i].goodsID, 
                                            'priceTax':self.multipleSelection[i].priceTax, 
                                            'price':self.multipleSelection[i].price, 
                                            'cycle':self.multipleSelection[i].cycle, 
                                            'isDelete':self.multipleSelection[i].isDelete,                                                 
                                            'state':nextState, //商品状态为发货
                                            'expressName':expressName,
                                            'expressNum':expressNum,
                                            'backExpressName':backExpressName,
                                            'backExpressNum':backExpressNum
                                        }
                                        goodsData.push(onegoods);
                                    }else{
                                        let onegoods = { 
                                            'id':self.multipleSelection[i].buyID, 
                                            'qty':self.multipleSelection[i].qty,
                                            'listCGID':self.multipleSelection[i].listCGID, 
                                            'remark':self.multipleSelection[i].remark, 
                                            'goodsSeries':self.multipleSelection[i].goodsSeries, 
                                            'goodsID':self.multipleSelection[i].goodsID, 
                                            'priceTax':self.multipleSelection[i].priceTax, 
                                            'price':self.multipleSelection[i].price, 
                                            'cycle':self.multipleSelection[i].cycle, 
                                            'isDelete':self.multipleSelection[i].isDelete,
                                            'state':nextState, //商品状态为发货
                                            'expressName':expressName,
                                            'expressNum':expressNum,
                                            'backExpressName':backExpressName,
                                            'backExpressNum':backExpressNum
                                        }
                                        let expressNameNull=''; 
                                        let expressNumNull=''; 
                                         if(self.tabIndex !='4'){
                                            expressNameNull =self.multipleSelection[i].expressName;
                                            expressNumNull =self.multipleSelection[i].expressNum;
                                        }
                                        let onegoods2 = { 
                                            'id':0, 
                                            'qty':value.qty-self.multipleSelection[i].qty, 
                                            'listCGID':self.multipleSelection[i].listCGID,  
                                            'remark':self.multipleSelection[i].remark, 
                                            'goodsSeries':self.multipleSelection[i].goodsSeries, 
                                            'goodsID':self.multipleSelection[i].goodsID, 
                                            'priceTax':self.multipleSelection[i].priceTax, 
                                            'price':self.multipleSelection[i].price, 
                                            'cycle':self.multipleSelection[i].cycle, 
                                            'isDelete':self.multipleSelection[i].isDelete, 
                                            'state':beforeState,
                                            'expressName':expressNameNull,
                                            'expressNum':expressNumNull,
                                            'backExpressName':'',
                                            'backExpressNum':''
                                        }
                                        goodsData.push(onegoods2,onegoods);
                                        containState = index;
                                    }
                                    return true;//当内部return true时跳出整个循环
                                }
                            });
                            let oneDBgoods = {
                                'l_goodsID':self.multipleSelection[i].goodsID,
                                'l_qty':self.multipleSelection[i].qty,
                                'ioName':sessionStorage.getItem('admin_name'),
                                'pieceQty':self.multipleSelection[i].pieceQty
                            }
                            putGoodsData[i]= oneDBgoods; 
                        }
                    }

                    let mixture = '';
                    //是否有当前订单状态码
                    if(self.showInfoform.CGtransType.indexOf(CGtransType)>-1){
                        mixture=self.showInfoform.CGtransType; 
                    }else{      
                        mixture=self.showInfoform.CGtransType+CGtransType;             
                    } 
                    //是否分单
                    if(containState <0){                        
                        mixture=mixture.replace(laterOrderState,"");            
                    }
                    console.log(goodsData)
                    editCGOrderexpressInfo({                        
                        'CGID':CGID,                      
                        'CGtransType':mixture,       
                        'state':beforeState,                      
                        'goodsData':goodsData,                    
                        'putBillNo':self.randomNumber('RK'),                   
                        'putUserName':sessionStorage.getItem('admin_name'),                                              
                        'putGoodsData':putGoodsData
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

                    self.showVisible = false;
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
            // sessionStorage.removeItem('originalData');            
        }, 
        checkSelectable(row) {
            // console.log(row)
            // let self = this;
            // if(self.showInfoform.CGtransType==4){
            //     return row.state == 3;
            // }else if(self.showInfoform.CGtransType==5){
            //     return row.state == 4;
            // }else if(self.showInfoform.CGtransType==6){
            //     return row.state == 5;
            // }else if(self.showInfoform.CGtransType==7){
            //     return row.state == 6;
            // }
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
            this.getData(self.tabIndex);
        },
        orderHandlePageChange(val) {
            let self = this;
            self.orderPageIndex = val;
            self.getOneOrerData(self.showInfoform.CGID);
        },
        openPrint(){
            this.printVisible=true;
        },
        doPrint (CGID) {
            
            // console.log(this.printGoodsData)
            // 1.设置要打印的区域 div的className
            this.isActive=true;
            document.getElementById('print').style.display="block";
            document.getElementById('print').style.fontFamily="SimSun";
            var t = setTimeout(function (){
    

                var newstr = document.getElementsByClassName('print')[0].innerHTML
                console.log(newstr)
                //2. 复制给body，并执行window.print打印功能
                document.body.innerHTML = newstr

                window.print()
                //重新加载页面，以刷新数据
                window.location.reload()
            }, 100);

        }
    },
    watch: {
        $route(){            
            this.getData(this.tabIndex);
        },
        showInfoform(){

        },
        multipleSelection(){

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
/*采购打印框样式 */
#print{
    display:none;
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
.w200{width:200px;}
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
.biao{
    font-size: 10px;
    width: 100%;
    font-family:'SimSun';
}
.biao tr td,.biao tr th{
    padding:  5px 8px;
} 
</style>
