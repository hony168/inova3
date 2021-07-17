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
                <el-button  v-if="userPower.indexOf('7001')>-1" type="danger" icon="el-icon-delete" class="handle-del mr10" @click="delAllSelection">批量删除</el-button>               
                <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button v-if="userPower.indexOf('7000')>-1" type="success" icon="el-icon-plus" @click="handleADD('add')">增加生产订单</el-button>
            </div>
            <el-table :data="tableData" border style="font-size:10px" stripe class="table" ref="multipleTable" header-cell-class-name="table-header" :show-header='true' @cell-click="showSOInfo" @selection-change="handleSelectionChange" height="63vh">
                <el-table-column type="selection" width="50" align="center"></el-table-column>
                <el-table-column label="序号" width="50" align="center">
                    <template slot-scope="scope">{{scope.$index+1}}</template>
                </el-table-column>
                <el-table-column prop="pdNum" label="生产编号" width="120" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="customerName" label="客户名称" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="productType" label="产品型号" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="deliverTime" label="交货日期" width="100" align="center"></el-table-column>
                <el-table-column prop="pdDeliverNum" label="数量" width="80" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="remark" :show-overflow-tooltip="true" label="备注"></el-table-column>
                <el-table-column label="操作" width="60" align="center" v-if="userPower.indexOf('7002')>-1">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 增加弹出框 -->
        <el-dialog title="" align='center' :before-close="partClose" :visible.sync="addVisible" width="60vw">
            <el-form :model="ADDform" :rules="rules" id = "ADDform" ref="ADDform" label-width="100px" class="demo-ruleForm">

                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 订单信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="生产编号：" prop="pdNum">
                                <el-input v-model="ADDform.pdNum" placeholder="请输入生产编号"></el-input>
                            </el-form-item>
                        </el-col> 

                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="生产日期：" prop="pdDate">
                                <el-date-picker v-model="ADDform.pdDate" value-format="yyyy-MM-dd" type="date" placeholder="选择生产日期"></el-date-picker>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="客户名称：" prop="customerName">
                                <el-input v-model="ADDform.customerName" placeholder="请输入客户名称"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="交货日期：" prop="deliverTime">
                                <el-date-picker v-model="ADDform.deliverTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                            </el-form-item>
                        </el-col>           
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="产品型号：" prop="productType">
                                <el-input v-model="ADDform.productType" placeholder="请输入产品型号"></el-input>
                            </el-form-item>
                        </el-col>  
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="交货数量：" prop="pdDeliverNum">
                                <el-input v-model="ADDform.pdDeliverNum" placeholder="请输入数量"></el-input>
                            </el-form-item>
                        </el-col> 
                    </el-row>

                    <div class="tab_title2">
                        <el-col class="list_unit" :span="6">工序</el-col>
                        <el-col class="list_unit" :span="5">接收时间</el-col> 
                        <el-col class="list_unit" :span="5">完成时间</el-col>
                        <el-col class="list_unit" :span="3">责任人</el-col> 
                        <el-col class="list_unit" :span="5">备注</el-col>
                    </div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_r b_b tc":span="5">机加工件备料</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date1recTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                        </el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date1comTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker></el-col>
                        </el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">
                            <el-input v-model="ADDform.date1Name" placeholder="请输入责任人"></el-input>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="5">
                            <el-input v-model="ADDform.date1tag" placeholder="请输入备注"></el-input>
                        </el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">电气件备料</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date2recTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                        </el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date2comTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker></el-col>
                        </el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">
                            <el-input v-model="ADDform.date2Name" placeholder="请输入责任人"></el-input>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="5">
                            <el-input v-model="ADDform.date2tag" placeholder="请输入备注"></el-input>
                        </el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">结构件、包材备料</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date3recTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                        </el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date3comTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker></el-col>
                        </el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">
                            <el-input v-model="ADDform.date3Name" placeholder="请输入责任人"></el-input>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="5">
                            <el-input v-model="ADDform.date3tag" placeholder="请输入备注"></el-input>
                        </el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">结构组装</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date4recTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                        </el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date4comTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker></el-col>
                        </el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">
                            <el-input v-model="ADDform.date4Name" placeholder="请输入责任人"></el-input>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="5">
                            <el-input v-model="ADDform.date4tag" placeholder="请输入备注"></el-input>
                        </el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">电控组装</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date5recTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                        </el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date5comTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker></el-col>
                        </el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">
                            <el-input v-model="ADDform.date5Name" placeholder="请输入责任人"></el-input>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="5">
                            <el-input v-model="ADDform.date5tag" placeholder="请输入备注"></el-input>
                        </el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">整机测试</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date6recTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                        </el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date6comTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker></el-col>
                        </el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">
                            <el-input v-model="ADDform.date6Name" placeholder="请输入责任人"></el-input>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="5">
                            <el-input v-model="ADDform.date6tag" placeholder="请输入备注"></el-input>
                        </el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">产品资料</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date7recTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                        </el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date7comTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker></el-col>
                        </el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">
                            <el-input v-model="ADDform.date7Name" placeholder="请输入责任人"></el-input>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="5">
                            <el-input v-model="ADDform.date7tag" placeholder="请输入备注"></el-input>
                        </el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">打包入库</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date8recTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker>
                        </el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">
                            <el-date-picker v-model="ADDform.date8comTime" type="date" value-format="yyyy-MM-dd" placeholder="选择日期"></el-date-picker></el-col>
                        </el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">
                            <el-input v-model="ADDform.date8Name" placeholder="请输入责任人"></el-input>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="5">
                            <el-input v-model="ADDform.date8tag" placeholder="请输入备注"></el-input>
                        </el-col>
                        
                        <el-col class="list_unit b_b" style="padding-top:10px;" :span="24">
                            <el-form-item label="备 注：" prop="remark">
                                <el-input v-model="ADDform.remark" type="textarea" :rows="2" placeholder="请输入备注" style="width:99%;"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="24">
                            <el-form-item label="计划起止时间：" prop="startTime">
                                <el-date-picker v-model="ADDform.startTimeArr" type="daterange" value-format="yyyy-MM-dd"  range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="24">
                            <el-form-item label="实际完成时间：" prop="actualTime">
                                <el-date-picker v-model="ADDform.actualTimeArr" type="daterange" value-format="yyyy-MM-dd" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
                            </el-form-item>
                        </el-col>
                    </el-row> 
                </el-row>


            </el-form>                
                <div style="text-align:right;padding-top:20px;">
                    <el-button type="primary" @click="addContact('ADDform')">{{moldeName}}</el-button>
                </div>
        </el-dialog>

        <!-- 展示弹出框 -->
        <el-dialog title="生产订单" align='center' :before-close="partClose" :visible.sync="showVisible" width="60vw">
                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 订单信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b pl15" :span="8">生产编号：{{showInfoform.pdNum}}</el-col>
                        <el-col class="list_unit b_b" :span="8">生产日期：{{showInfoform.pdDate}}</el-col> 
                        <el-col class="list_unit b_b" :span="8">交货日期：{{showInfoform.deliverTime}}</el-col> 

                        <el-col class="list_unit b_b pl15" :span="8">客户名称：{{showInfoform.customerName}}</el-col>
                        <el-col class="list_unit b_b" :span="8">产品型号：{{showInfoform.productType}}</el-col> 
                        <el-col class="list_unit b_b" :span="8">交货数量：{{showInfoform.pdDeliverNum}}</el-col> 
                    </el-row>

                    <div class="tab_title2">
                        <el-col class="list_unit" :span="6">工序</el-col>
                        <el-col class="list_unit" :span="5">接收时间</el-col> 
                        <el-col class="list_unit" :span="5">完成时间</el-col>
                        <el-col class="list_unit" :span="3">责任人</el-col> 
                        <el-col class="list_unit" :span="5">备注</el-col>
                    </div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_r b_b tc":span="5">机加工件备料</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date1recTime}}</el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date1comTime}}</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">{{showInfoform.date1Name}}</el-col> 
                        <el-col class="list_unit b_b pl15" :span="5">{{showInfoform.date1tag}}</el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">电气件备料</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date2recTime}}</el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date2comTime}}</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">{{showInfoform.date2Name}}</el-col> 
                        <el-col class="list_unit b_b pl15" :span="5">{{showInfoform.date2tag}}</el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">结构件、包材备料</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date3recTime}}</el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date3comTime}}</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">{{showInfoform.date3Name}}</el-col> 
                        <el-col class="list_unit b_b pl15" :span="5">{{showInfoform.date3tag}}</el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">结构组装</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date4recTime}}</el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date4comTime}}</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">{{showInfoform.date4Name}}</el-col> 
                        <el-col class="list_unit b_b pl15" :span="5">{{showInfoform.date4tag}}</el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">电控组装</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date5recTime}}</el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date5comTime}}</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">{{showInfoform.date5Name}}</el-col> 
                        <el-col class="list_unit b_b pl15" :span="5">{{showInfoform.date5tag}}</el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">整机测试</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date6recTime}}</el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date6comTime}}</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">{{showInfoform.date6Name}}</el-col> 
                        <el-col class="list_unit b_b pl15" :span="5">{{showInfoform.date6tag}}</el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">产品资料</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date7recTime}}</el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date7comTime}}</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">{{showInfoform.date7Name}}</el-col> 
                        <el-col class="list_unit b_b pl15" :span="5">{{showInfoform.date7tag}}</el-col>

                        <el-col class="list_unit b_r b_b tc" :span="5">打包入库</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date8recTime}}</el-col> 
                        <el-col class="list_unit b_r b_b tc" :span="5">{{showInfoform.date8comTime}}</el-col>
                        <el-col class="list_unit b_r b_b tc" :span="4">{{showInfoform.date8Name}}</el-col> 
                        <el-col class="list_unit b_b pl15" :span="5">{{showInfoform.date8tag}}</el-col>
                        <el-col class="list_unit b_b pl15" :span="12">
                            计划起止时间：{{showInfoform.startTime}} -- {{showInfoform.startEndTime}}
                        </el-col>
                        <el-col class="list_unit b_b" :span="12">
                            实际完成时间：{{showInfoform.actualTime}} -- {{showInfoform.actualEndTime}}
                        </el-col>
                        <el-col class="list_unit b_b" style="padding:10px;" :span="24">备 注：{{showInfoform.remark}}</el-col>
                    </el-row> 
                </el-row>
        </el-dialog>
    </div>
</template>

<script>
import { seaSupplierInfo,contactAllList,delContact} from '../../api/contact';
import {selectPdOrder,addPdOrder,delOrder} from '../../api/pd';
export default {
    name: 'Cselect',
    data() {
        return {
            q:'',
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            categoryIdArr: [],
            options: [],      
            ADDform: {},      
            showInfoform: {},     
            tableData: [],
            multipleSelection: [],
            delList: [],
            showVisible: false,
            editForm: {},
            addVisible: false,
            moldeName: '',
            rules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 60, message: '长度在 1 到 60 个字符', trigger: 'blur' }
                ],
                pdNum: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 60, message: '长度在 1 到 60 个字符', trigger: 'blur' }
                ],               
                customerName: [
                    { required: true, message: '请输入客户名称', trigger: 'blur' }
                ],               
                productType: [
                    { required: true, message: '请输入产品类型', trigger: 'blur' }
                ], 
                cCategory: [
                    { required: true, message: '请选择类别', trigger: 'blur' }
                ],
                pdDeliverNum: [
                    { required: true, message: '请输入数量', trigger: 'blur' }
                ],
                pdDate: [
                    { required: true, message: '请选择生产日期', trigger: 'blur' }
                ],
                deliverTime: [
                    { required: true, message: '请选择交货日期', trigger: 'blur' }
                ],
                deliverTime: [
                    { required: true, message: '请选择交货日期', trigger: 'blur' }
                ],
                startTimeArr: [
                    { required: true, message: '请选择计划起止日期', trigger: 'blur' }
                ],
                actualTimeArr: [
                    { required: true, message: '请选择实际完成日期', trigger: 'blur' }
                ],
            },
            userPower: []
        };
    },
    created() {
        this.getData();
        // 获取用户权限
        this.userPower = sessionStorage.getItem('userPower').split(',');
    },  
    methods: {        
        // 获取 easy-mock 的模拟数据
        getData() {
            let self = this;
            selectPdOrder({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.tableData = res.rec;
                    self.pageTotal = res.total || 0;
                } else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },
       
        // 增加操作
        handleADD() {
            let self = this;
            self.moldeName = '增加';
            self.addVisible = true;
        },
        addContact(formName) {
            let self = this;
            console.log(self.ADDform)
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    addPdOrder(self.ADDform).then(res => {
                        if(res.code == "00"){
                            self.getData();
                            self.addVisible = false;
                            self.ADDform = {};
                            self.$message.success(self.moldeName+'成功');
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
        },
        partClose(done) {
            let self = this;     
            self.ADDform = {}; 
            self.addVisible = false;      
            done();          
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
        delAllSelection() {
            const self = this;
            const length = this.multipleSelection.length;
            if(length<1){
                self.$message.warning('请勾选需要删除的选项！');
            }else{
                let str = '';
                var idArr = '';
                self.delList = self.delList.concat(self.multipleSelection);
                for (let i = 0; i < length; i++) {
                    str += self.multipleSelection[i].pdNum + ' ';
                    idArr += self.multipleSelection[i].pdId + ',';
                }
                idArr = idArr.substr(0, idArr.length - 1);
                delOrder({
                    'idArr':idArr
                }).then(res => {
                    if(res.code == "00"){
                        self.getData();
                        self.$message.error('删除了'+str);
                    }else {
                        self.$message.error('暂无数11据');
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
        handleEdit(index, row) {   
            let self = this; 
            self.moldeName = '修改';
            self.ADDform = row;        
            let timeArr = [];
            let timeArr2 = [];
            timeArr.push(self.ADDform.startEndTime);
            timeArr.unshift(self.ADDform.startTime);  
            timeArr2.push(self.ADDform.actualEndTime);
            timeArr2.unshift(self.ADDform.actualTime);            
            self.ADDform.startTimeArr = timeArr;      
            self.ADDform.actualTimeArr = timeArr2;
            self.addVisible = true;
        },
        // 分页导航
        handlePageChange(val) {
            let self = this;
            self.pageIndex = val;
            this.getData();
        },
        showSOInfo(row,column,event,cell){
            let self = this;
            if(column.label !="操作" && column.label !="复选框"){
                // if(row.billStatus==3){
                //     self.showBackeditVisible = true;
                //     self.editForm =row;
                //     self.editForm.salesId=row.salesId.toString();
                //     self.queryCCategory(self.editForm.soBuId)
                // }else{
                    self.showVisible = true;
                    self.showInfoform =row;
                // }
                // seaSOBillGodds({  
                //     pageIndex: self.infoPageIndex,
                //     pageSize: self.infoPageSize,
                //     soId:row.soId,
                // }).then(res => { 
                //     if(res.code == "00"){
                //         self.domains = res.rec;
                //         self.pageTotal = res.total || 0;                   
                //     }else {
                //         self.$message.error('暂无数据');
                //         return false;
                //     }
                // }).catch(function(err) {
                //     self.$message.error('请求失败，请检查刚绝是否正常。');
                //     return false;
                // });
            }
        }
    }

};
</script>
<style>
#ADDform .el-input__inner , #editForm .el-input__inner{
    border: 0px;
}
#editForm .el-input__inner , #editForm .el-input__inner{
    border: 0px;
}
#ADDform .el-form-item__label , #editForm .el-form-item__label{
    font-size: 12px;
    padding:6px 0 0 0;
    line-height: 20px;
}
#editForm .el-form-item__label , #editForm .el-form-item__label{
    font-size: 12px;
    padding:6px 0 0 0;
    line-height: 20px;
}
#editForm .el-form-item__error, #editForm  .el-form-item__error {
    padding-left:15px;
}
#editForm .el-input-number .el-input__inner {
    text-align: left;
}
#ADDform .el-form-item__error, #editForm  .el-form-item__error {
    padding-left:15px;
}
#ADDform .el-input-number .el-input__inner {
    text-align: left;
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
.el-input-number .el-input__inner {
    text-align: left;
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
.pl15 {
    padding-left: 15px;
}
.tc{
    text-align: center;
}
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
}
/*增加设备框样式 */
    .list_unit{
        min-height: 36px;
        font-size: 12px;
        overflow: hidden;
        line-height:34px;
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
        height:20px;
        margin:2px;
        text-align:center;
        line-height:20px;
        font-size:14px;
        font-weight:bold;color:#111
    }
    .tab_title2{
        border:1px solid #000;
        background: #409EFF32;
        height:30px;
        margin:2px;
        padding:0 0 10px 15px;
        line-height:35px;
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
