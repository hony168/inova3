<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 生成采购订单
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>                     
                <el-button v-if="userPower.indexOf('12000')>-1" type="primary" icon="el-icon-plus" @click="addCGOrder">增加采购单</el-button>
                <el-button v-if="userPower.indexOf('12002')>-1" type="primary" icon="el-icon-upload2" class="iconfont icon-yunshangchuan" style=" position: absolute;">批量导入&nbsp;</el-button>
                <input v-if="userPower.indexOf('12002')>-1" type="file" @change="importfxx(this)" class="batch_input" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                <el-button v-if="userPower.indexOf('12003')>-1" type="primary" icon="el-icon-download" style="margin-left:-10px;" @click="exceldown('http://wms.lyccco.com/excel/cg.xlsx')">批量导入模块下载</el-button>
            </div>  
            <el-table :data="tableData" border style="font-size:10px" stripe class="table" ref="multipleTable" header-cell-class-name="table-header" :show-header='true' height="63vh"> 
                <el-table-column label="操作" width="100" align="center" v-if="userPower.indexOf('12001')>-1">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-shopping-cart-1" @click="handleEdit(scope.$index, scope.row)">下采购订单</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="contactName" label="供应商名称" :show-overflow-tooltip="true"></el-table-column>
            </el-table>
        </div>

        <!-- 分检供应商弹出框 -->
        <el-dialog title="" :visible.sync="editVisible" top="5vh">
            <el-form id="contactform" :model="contactform" label-width="100px" class="demo-dynamic" :rules="rules" ref="contactform">
                <div class="className" style="font-size:16px;font-weight:weight:bold;text-align:center;line-height:22px;margin:-25px 0 10px 0;">江西诺发科技有限公司<br />采购订单</div>
                <el-row style="margin:20px 5px 0 5px;font-size:10px;line-height:20px;">
                    <el-col :span="8" class="list_unit"><b>供应商：</b>{{orderData.contactName}}</el-col>
                    <el-col :span="3" class="list_unit" style="padding-left:25px;">联系人：{{orderData.linkName}}</el-col>
                    <el-col :span="4" class="list_unit">联系方式：{{orderData.linkMobile}}</el-col>
                    <el-col :span="9" class="list_unit">地 址：{{orderData.addressAll}}</el-col>                    
                </el-row>                 
                <el-row>
                    <el-col :span="8" class="list_unit" id="ghz" style="height:38px;">
                        <el-form-item label="交货至：" prop="buId">
                            <el-cascader v-model="contactform.buId" :options="clientOptions"  clearable :show-all-levels="false" :props="{ expandTrigger: 'hover',label:'label'}"  @change="ChangeDTcontact" placeholder="选择收货方" filterable>
                                <template slot-scope="{ node, data }">
                                    <span>{{ data.label }}</span>
                                    <span v-if="!node.isLeaf" > ({{ data.children.length }}) </span>
                                </template>
                            </el-cascader>
                        </el-form-item> 
                    </el-col>
                    <el-col :span="3" class="list_unit" style="padding-left:25px;" v-if="contactform.concatNameDT">联系人：{{contactform.linkNameDT}}</el-col>
                    <el-col :span="4" class="list_unit" v-if="contactform.concatNameDT">联系方式：{{contactform.linkMobileDT}}</el-col>
                    <el-col :span="9" class="list_unit" v-if="contactform.concatNameDT">地 址：{{contactform.addressDT}}</el-col>                    
                </el-row>              
                <el-row>
                    <el-col :span="8" class="list_unit" id="ghz" style="height:45px;">
                        <el-form-item label="申请人：" prop="salesId">
                            <el-cascader v-model="contactform.salesId" :options="staffData"  clearable :show-all-levels="false" :props="{ expandTrigger: 'hover',label:'label'}"  @change="ChangeSalesId" placeholder="选择申请人" filterable>
                                <template slot-scope="{ node, data }">
                                    <span>{{ data.label }}</span>
                                    <span v-if="!node.isLeaf" > ({{ data.children.length }}) </span>
                                </template>
                            </el-cascader>
                        </el-form-item> 
                    </el-col>                  
                </el-row> 
                <el-row id="gys" style="border:1px solid #000000;text-align:left;">
                    <el-table :data="orderData.goods" border stripe  ref="multipleTable" header-cell-class-name="table-header" height="53vh">
                        <el-table-column prop="goodsIDNum" width="100" label="零件编号"></el-table-column>
                        <el-table-column prop="goodsSeries" label="产品系列" width="120" align="center"></el-table-column>
                        <el-table-column prop="gName" label="描述"></el-table-column>
                        <el-table-column prop="qty" width="60" :label="'数量\n(PCS)'" align="center">  
                            <template slot-scope="scope">
                                <span>{{scope.row.qty | formatDecimal}}</span>
                            </template>                           
                        </el-table-column>
                        <el-table-column  prop="price" :label="'单价\n(RMB不含税)'" align="center" width="100">
                            <template slot-scope="scope">
                                <span>{{scope.row.price | formatDecimal}}</span>
                            </template> </el-table-column>
                        </el-table-column>
                        <el-table-column prop="priceTax" :label="'单价\n(RMB含税)'"  width="100" align="center"> 
                            <template slot-scope="scope">
                                <span>{{scope.row.priceTax | formatDecimal}}</span>
                            </template>  
                        </el-table-column>
                        <el-table-column prop="acycle" label="交期"  width="80" align="center"></el-table-column>
                        <el-table-column prop="qty" :label="'总金额'"  width="80"  align="right">     
                             <template slot-scope="scope">
                                <span>{{scope.row.qty * scope.row.priceTax | formatDecimal}}</span>
                            </template>      
                        </el-table-column> 
                    </el-table>
                    <el-row>   
                        <el-col class="list_unit b_b" style="padding-top:15px;" :span="24">
                            <el-form-item label="备 注：" prop="description">
                                <el-input v-model="contactform.description" type="textarea" :rows="4" placeholder="请输入备注" style="width:97%;"></el-input>
                            </el-form-item>
                        </el-col>    
                    </el-row>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="success" @click="eidtOrderState('contactform')">生成采购单</el-button>
                <!-- <el-button type="danger"  @click="backOrderState(orderData.id,2)">驳 回</el-button> -->
                <el-button @click="editVisible = false">取 消</el-button>
            </span>          
        </el-dialog>


        <!-- 增加采购订单弹出框 -->
        <el-dialog title="物料采购" align='center' id="box" :visible.sync="showVisible" top="2vh" width="70vw">
            <div class="container" id="container">
                <el-form id="ADDform" :model="ADDform" label-width="100px" class="demo-dynamic" :rules="rules" ref="ADDform">                  
                    <el-table :data="domains" border class="table" ref="multipleTable" header-cell-class-name="table-header" style="font-size:10px;" >
                        <el-table-column label="序号" type="index" width="50" align="center"></el-table-column>
                        <el-table-column prop="number" label="零件编号" width="120"></el-table-column>
                        <el-table-column prop="goodsSeries" label="产品系列" width="120">
                            <template scope="scope">
                                <el-input v-model="scope.row.goodsSeries"  placeholder="请输入产品系列"></el-input>
                            </template></el-table-column>
                        <el-table-column prop="name" label="描述" width="240"></el-table-column>

                        <el-table-column prop="goods_num" label="数量(PCS)" width="150" align="center">
                            <template scope="scope">
                                <el-input-number v-model="scope.row.num" :precision="3" :controls="false" :min="0.001"></el-input-number>
                            </template>
                        </el-table-column>
                        <el-table-column prop="salePriceno" label="单价（RMB不含税）" align="center" width="140">
                            <template scope="scope">
                                <el-input-number v-model="scope.row.salePriceno" :precision="3" :controls="false" placeholder="请输入价格"></el-input-number>
                            </template>
                        </el-table-column>
                        <el-table-column prop="salePrice" label="单价（RMB含税）" align="center" width="140">
                            <template scope="scope">
                                <el-input-number v-model="scope.row.salePrice" :precision="3" :controls="false" placeholder="请输入价格"></el-input-number>
                            </template>
                        </el-table-column>
                        <el-table-column prop="good_remark" label="交期" >
                            <template scope="scope">
                                <el-input-number v-model="scope.row.cycle" :controls="false" placeholder="请输入交期"></el-input-number>
                            </template>
                        </el-table-column>
                        <el-table-column prop="salePrice" label="总价（RMB含税）" >
                            <template scope="scope">
                                {{scope.row.salePrice *scope.row.num |formatDecimal}}
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80" align="center">
                            <template slot-scope="scope">
                                <el-button type="text" icon="el-icon-delete" @click="removeDomain(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>                        
                    </el-table>
                    <div class="pagination" style="padding-right:10px;">
                        <el-button  type="warning" @click="submitOrderReview('ADDform')">提交订单审核</el-button>
                        <el-button @click="addMaterial">新增商品</el-button>
                    </div>
                </el-form>
            </div>
        </el-dialog>

        <el-drawer title="选择商品"  :visible.sync="boxDialog" direction="ltr" custom-class="demo-drawer" size="65%" ref="drawer">   
            <SelectComTem :domains="domains" @fuaddDomain="fuaddDomain"></SelectComTem>
        </el-drawer>

    </div>
</template>

<script>
import qs from 'qs';
import SelectComTem from './selectComTem.vue';
import { seaStaff,seaContact} from '../../api/index';
import { getContactTree,getContactData,seaContactOrderGoods,createOrder,backOrder } from '../../api/contact';
import { seleCGiGoods,generateTree,addCGGoods } from '../../api/goods';
export default {
    components: {
        SelectComTem       
    },
    name: 'basetable',
    data() {
        return {
            drawer: false,
            tableColums:[{prop:'name',label:'数据\n单位'}],
            showVisible: false,
            q:'',
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            restaurants: [],
            userPower: [], 
            rules: { 
                concatName: [
                    { required: true,message: '请选择供应商', trigger: 'change' }
                ],  
                billNo: [
                    { required: true, message: '请输入订单编号', trigger: 'change' }
                ],
                concatNameDT: [
                    { required: true,message: '请选择交付方', trigger: 'change' }
                ],
                buId: [
                    { required: true,message: '请选择交付方', trigger: 'change' }
                ],
                salesId: [
                    { required: true,message: '请选择申请人', trigger: 'change' }
                ]
            },
            tableData: [],
            multipleSelection: [],
            delList: [],
            orderData: [],
            editVisible: false,
            pageTotal: 0,
            ADDform:{},
            contactform:{},        
            clientOptions: [], 
            staffData: [],
            domains: [], 
            isActive: false,
            printVisible: false,
            boxDialog: false
        };
    },
    created() {
        this.getData();

        // 获取客户数据
        this.getContactData();

        // 获取销售员数据
        this.getStaffData();
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
        }
    },
    methods: {
        // 获取 easy-mock 的模拟数据
        getData() {
            let self = this;
            seaContactOrderGoods({
                state:2,
            }).then(res => { 
                if(res.code == "00"){
                    self.tableData = res.rec;
                    self.pageTotal = res.total || 0;
                }else {

                    self.tableData = [];
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        }, 
        // 获取客户数据
        getContactData(){
            let self = this;
            seaContact({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                categoryId:self.categoryId,
                typeNumber:'customertype',
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.clientOptions = res.rec;
                } else{
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },  
        // 获取销售员数据
        getStaffData(){
            let self = this;
            seaStaff({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                categoryId:self.categoryId,
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.staffData = res.rec;
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
        // 生成采购单
        eidtOrderState(formName) {
            const self = this;
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    // 生成随机订单号
                    let CGbillNo = self.randomNumber();
                    self.editVisible = false;
                    let goodsData = [];
                    if(self.orderData.goods.length<1){
                        self.$message.error('无商品！');
                        return false;
                    }else{
                        console.log(self.orderData.goods)
                        for (let i = 0; i < self.orderData.goods.length; i++) {                      
                            let onegoods = { 
                                'id':self.orderData.goods[i].buyID,
                                'listCGID':self.orderData.goods[i].gysId, 
                                'state':4, //目前不需要审核直接到待发货
                            }
                            goodsData[i]= onegoods; 
                        } 
                    }
                    let description = '';
                    self.contactform.description?description =self.contactform.description.replace(/\r\n/g, '<br/>').replace(/\n/g, '<br/>').replace(/\s/g, '&nbsp;'):description;
                    createOrder({
                        'CGbuId':self.orderData.contactID,  
                        'CGDTbuId':self.contactform.buId, 
                        'CGsalesId':self.contactform.salesId, 
                        'description':description,                    
                        'createName':sessionStorage.getItem('admin_name'),  
                        'CGbillNo':CGbillNo,
                        'CGtransType':4,
                        'goodsData':goodsData,
                    }).then(res => {
                        if(res.code == "00"){
                            self.getData();                        
                            self.$message.success('成功生成采购单');
                        }else {
                            self.$message.error('生成失败');
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
        },
        randomNumber() {
            let date = new Date();
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); // toJSON 的时区补偿
            var num = 'CG'+date.toJSON().substr(0, 19).replace(/[-T]|:/g, ''); 
            num +=(Math.round(Math.random() * 9 + 0)).toString(); 
            num +=(Math.round(Math.random() * 9 + 0)).toString(); 
            num +=(Math.round(Math.random() * 9 + 0)).toString(); 
            num +=(Math.round(Math.random() * 9 + 0)).toString(); 
            return num;
        },
        // 编辑操作
        handleEdit(index, row) {
            this.editVisible = true;
            this.contactform = {};
            this.orderData = row;
        },
        // 增加采购单
        handleSearch() {            
            let self = this;
            self.pageIndex= 1;
            self.getData();
        },
        // 采购订单物料提交审核
        submitOrderReview(formName){
            let self = this;
            let goodsData = [];
            if(self.domains.length<1){
                self.$message.error('无商品！');
                return false;
            }else{
                let totalAmount = 0;
                for (let i = 0; i < self.domains.length; i++) {   
                   
                    let onegoods = { 
                        'goodsID':self.domains[i].id,//商品id
                        'qty':self.domains[i].num, //商品数量unitId
                        'goodsSeries':self.domains[i].goodsSeries, //商品系列

                        'priceTax':self.domains[i].salePrice, //含税
                        'price':self.domains[i].salePriceno, //不含税
                        'cycle':self.domains[i].cycle, //交期
                    }
                    goodsData[i]= onegoods; 
                }                
                self.ADDform.goodsData = goodsData;
            }
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    addCGGoods(self.ADDform).then(res => { 
                        if(res.code == "00"){
                            self.getData();
                            self.$message.warning('提交成功');
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
                    self.showVisible = false;
                } else {
                    console.log('error submit!!');
                    return false;
                }
            });
            

        },
        removeDomain(item) {  
            let self = this;
            var index = self.domains.indexOf(item);
            if (index !== -1) {
              self.domains.splice(index, 1);
            }
        },
        // 增加按钮
        addCGOrder() {            
            let self = this;
            self.showVisible= true;
        },
        // 驳回采购订单
        backOrderState() {            
            const self = this;
            self.editVisible = false;
            let goodsData = [];
            console.log(self.orderData.goods)
            return false;
            if(self.orderData.goods.length<1){
                self.$message.error('无商品！');
                return false;
            }else{
                for (let i = 0; i < self.orderData.goods.length; i++) {                      
                    let onegoods = { 
                        'id':self.orderData.goods[i].buyID,
                        'state':99
                    }
                    goodsData[i]= onegoods; 
                } 
            }
            backOrder({
                'CGbuId':self.orderData.contactID,                    
                'createName':sessionStorage.getItem('admin_name'),
                'CGbillNo':CGbillNo,
                'goodsData':goodsData,
            }).then(res => {
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
        clientIdChange(value) {
            let self = this;
            self.ADDform.buId = value[value.length-1];
            var vals=self.getCascaderObj(value, self.clientOptions,);
            if(vals.length>0){
                vals.forEach((v)=>{
                    if(v.value==value[value.length-1]){
                        self.ADDform.concatName = v.label;
                        self.ADDform.linkMobile = v.info.linkMobile;
                        self.ADDform.linkName = v.info.linkName;
                        self.ADDform.address = v.info.addressAll;
                    }
                })
            }
        },
        clientIdChangeDT(value) {
            let self = this;
            self.ADDform.buId = value[value.length-1];
            var vals=self.getCascaderObj(value, self.clientOptions,);
            if(vals.length>0){
                vals.forEach((v)=>{
                    if(v.value==value[value.length-1]){
                        self.ADDform.concatNameDT = v.label;
                        self.ADDform.linkMobileDT = v.info.linkMobile;
                        self.ADDform.linkNameDT = v.info.linkName;
                        self.ADDform.addressDT = v.info.addressAll;
                    }
                })
            }
        },
        ChangeDTcontact(value) {
            let self = this;
            if(Array.isArray(value)){
                self.contactform.buId = value[value.length-1]; 
            }else{
                self.contactform= {};
                return false;
            }
            var vals=self.getCascaderObj(value, self.clientOptions,);
            if(vals.length>0){
                vals.forEach((v)=>{
                    if(v.value==value[value.length-1]){
                        self.contactform.concatNameDT = v.label;
                        self.contactform.linkMobileDT = v.info.linkMobile;
                        self.contactform.linkNameDT = v.info.linkName;
                        self.contactform.addressDT = v.info.addressAll;
                    }
                })
            }
        },
        ChangeSalesId(value) {
            let self = this;
            if(Array.isArray(value)){
                self.contactform.salesId = value[value.length-1]; 
            }else{
                return false;
            }
        },
        getCascaderObj(val,opt,childrenVal) {
            return val.map(function (value, index, array) {
                for (var itm of opt) {
                    if (itm.value == value) {
                        opt = itm.children;                       
                        return itm;
                    }
                }
                return null;
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

                    if(outdata.length>0){
                        self.$axios.post('http://wms.lyccco.com/erpv9/Goods/bacthImportCG', qs.stringify({
                            goodsData:arr,
                        })).then((res) => {
                            console.log(res.data.code)
                            if (res.data.code == '00') {
                                self.$message({
                                    message: res.data.msg,
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
#gys .el-table .cell {
    /*text-align: center;*/
    white-space: pre-line;/*保留换行符*/
}
#ghz .el-form-item__label {
    font-size: 10px;
    font-weight: bold;
    text-align: left;
    padding-left: 5px;
    width:50px;
}
#ghz .el-form-item--small .el-form-item__content{
    font-size: 10px;
    margin-left: -100px;

}
#ghz .el-form-item--small .el-form-item__error {
    font-size: 10px;
    top: 70%;
}

#ghz .el-input--small .el-input__inner{
    font-size: 10px;
    border: 0px;
    height: 35px;
    line-height: 50px;
    padding:0 15px 0 0;
    margin-left: -35px;
    width:240px;
}

#box .el-dialog__header{
    padding-top:18px;
    margin-bottom: -25px;
}
#box .el-input--small .el-input__inner{
    width:80%;
}
#box .el-form-item__label{
    font-size: 10px;
    padding: 0;
}
</style>
<style scoped>
@media print{   
    body{
        font-size:10px;
        font-family: "SimSun";
    }   
}  
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
    min-height: 50vh;
    height: auto;
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
.list_unit{
        min-height: 35px;
        font-size: 12px;
        overflow: hidden;
        text-align: left;
        line-height:36px;
}

.batch_input{
    position: relative;
    opacity: 0; 
    cursor: pointer;
    height: 37px; 
    width: 125px;
    margin-right:5px;
}

/*采购打印框样式 */
#print{
    display:none;
}
.list_unit{
    min-height: 20px;
    overflow: hidden;
    padding-left: 10px;
    font-family:'SimSun';
    font-size:10px;
    line-height:25px;
}
.list_unit2{
    font-family:'SimSun';
    min-height: 20px;
    font-size:10px;
    overflow: hidden;
    padding:5px;
    line-height:14px;
}
.list_unit3{
    font-family:'SimSun';
    min-height: 20px;
    font-size:10px;
    overflow: hidden;
    padding:15px;
    line-height:16px;
}
.list_unit4{
    font-family:'SimSun';
    min-height: 16px;
    font-size:10px;
    overflow: hidden;
    padding:5px 5px 0 5px;
    line-height:14px;
}  

.list_unit5{ 
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
.w60{width:60px;}
.w70{width:70px;}
.w75{width:75px;}
.w83{width:83px;}
.w87{width:87px;}
.w210{width:210px;}
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
</style>
