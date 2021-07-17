<template>
    <div class="table" v-loading="loading" element-loading-text="数据处理中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-s-grid"></i> {{advance_name}}订单详情
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container" id="container">
            <div id="advance_name">
                <el-input placeholder="订单名称" suffix-icon="el-icon-edit" v-model="advance_name"> </el-input>
            </div>
            <div style="text-align:center;font-size:13px;height:35px;line-height:26px;color:#00000096;">
                订单编号：{{$route.query.advance_id}}&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
                订单状态：{{$route.query.order_state_name}}&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
                创建人：{{$route.query.advance_creator}}&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;&nbsp;
                创建时间：{{$route.query.advance_create_time}}
            </div>
            <el-form :model="protocolForm" ref="protocolForm" label-width="100px" class="demo-dynamic">
                <el-table :data="domains" border class="table" ref="multipleTable" header-cell-class-name="table-header" @selection-change="handleSelectionChange">
                    <el-table-column label="序号" type="index" width="50" align="center"></el-table-column>
                    <el-table-column prop="part_code" label="物料编号" width="210"></el-table-column>
                    <el-table-column prop="part_name" label="物料名称" ></el-table-column>

                    <el-table-column prop="goods_num" label="要求数量" width="150" align="center">
                        <template scope="scope">
                            <el-input-number v-model="scope.row.goods_num" @change="AddNum"  :min="0.001"></el-input-number>
                            <!-- <el-input-number v-model="scope.row.goods_num" @change="AddNum" controls-position="right" :min="1" :max="scope.row.part_inventory"></el-input-number> -->
                        </template>
                    </el-table-column>
                    <el-table-column prop="goods_cost" label="参考价格" width="140">
                        <template scope="scope">
                            <el-input v-model="scope.row.good_cost" placeholder="请输入库存" autocomplete="off" oninput="value=value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column prop="good_remark" label="备注" >
                        <template scope="scope">
                            <el-input v-model="scope.row.good_remark"></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" align="center">
                        <template slot-scope="scope">
                            <el-button type="text" icon="el-icon-delete" @click="removeDomain(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>                        
                </el-table>
                <div class="pagination" style="padding-right:10px;">
                    <el-button  type="warning" @click="submitOrderReview">提交订单审核</el-button>
                    <el-button @click="addMaterial">新增物料</el-button>
                </div>
            </el-form>
        </div>
        <!-- 增加物料弹出框 -->
        <el-dialog title="物料增加" align='center' :before-close="partClose" :visible.sync="addVisible" width="40vw">
            <el-form :model="ADDform" :rules="rules" id = "ADDform" ref="ADDform" label-width="100px" class="demo-ruleForm">

                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 物料信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b">
                            <el-form-item label="编号：" prop="part_code">
                                <el-input v-model="ADDform.part_code" placeholder="请输入物料编号"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-form-item label="名称：" prop="part_name">
                                <el-input v-model="ADDform.part_name" placeholder="请输入名称"></el-input>
                            </el-form-item>
                        </el-col>                        
                        <!-- <el-col class="list_unit b_b">
                            <el-form-item label="库存：" prop="part_inventory">
                                <el-input v-model="ADDform.part_inventory" placeholder="请输入库存" autocomplete="off" oninput="value=value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')"></el-input>
                            </el-form-item>
                        </el-col> -->
                        <el-col class="list_unit b_b">
                            <el-form-item label="计量单位：" prop="part_unit">
                                <el-input v-model="ADDform.part_unit" placeholder="请输入计量单位"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-form-item label="类别：" prop="type_id">
                                <el-select v-model="ADDform.type_id" placeholder="请选择类别" style="width:98%">
                                    <el-option v-for="typeArr in typeData" :key="typeArr.part_type_id" :label="typeArr.part_type_id+' - '+typeArr.type_name" :value="typeArr.part_type_id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                    
                        <div class=" b_b" style="min-height: 35px;font-size: 12px;line-height:40px;">
                            <div style="width:100px;text-align:right;display:inline-block">HS编码：</div>
                            <div style="width:60%;display:inline-block;"><el-button @click="HSDialog = true"  style="border:0;"><span v-if="ADDform.hs_type_id">{{ADDform.hs_code}}</span><span  v-else>增加HS编号</span></el-button></div>
                        </div>
                        
                        <div  v-if="hsShowData.hs_code">                            
                            <el-row>
                                <el-col class="list_unit b_b">
                                    <el-form-item label="申报要素：">
                                        <span style="padding-right:15px;">{{hsShowData.hs_element}}</span>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row class="b_b">
                                <el-col :span ="5" class="list_unit" align="right">出口退税：</el-col>
                                <el-col :span ="3" class="list_unit">{{hsShowData.hs_export_drawback}}</el-col>
                                <el-col :span ="5" class="list_unit" align="right">出口关税：</el-col>
                                <el-col :span ="3" class="list_unit">{{hsShowData.hs_export_tariffa}}</el-col>
                                <el-col :span ="5" class="list_unit" align="right">出口增值税：</el-col>
                                <el-col :span ="3" class="list_unit">{{hsShowData.hs_export_added_value_tax}}</el-col>
                            </el-row>                            
                            <el-row class="b_b">
                                <el-col :span ="5" class="list_unit" align="right">最惠国进口税率：</el-col>
                                <el-col :span ="3" class="list_unit">{{hsShowData.hs_import_MFNtariff}}</el-col>
                                <el-col :span ="5" class="list_unit" align="right">进口增值税：</el-col>
                                <el-col :span ="3" class="list_unit">{{hsShowData.hs_import_added_value_tax}}</el-col>
                                <el-col :span ="5" class="list_unit" align="right">普通进口税率：</el-col>
                                <el-col :span ="3" class="list_unit">{{hsShowData.hs_import_tariff}}</el-col>
                            </el-row>             
                            <el-row class="b_b">
                                <el-col :span ="5" class="list_unit" align="right">单位：</el-col>
                                <el-col :span ="3" class="list_unit">{{hsShowData.hs_unit}}</el-col>
                                <el-col :span ="5" class="list_unit" align="right">检疫条件：</el-col>
                                <el-col :span ="3" class="list_unit">{{hsShowData.hs_quarantine}}</el-col>
                                <el-col :span ="5" class="list_unit" align="right">监管条件：</el-col>
                                <el-col :span ="3" class="list_unit">{{hsShowData.hs_supervise}}</el-col>
                            </el-row>                         
                        </div>    
                    </el-row>
                </el-row>
            </el-form>                
                <div style="text-align:right;padding-top:20px;">
                    <el-button type="primary" @click="AddPart('ADDform')">立即创建</el-button>
                    <el-button @click="resetAddPart('ADDform')">重置</el-button>
                </div>
        </el-dialog>
        <el-drawer title="选择物料" :before-close="handleClose" :visible.sync="dialog" direction="ltr" custom-class="demo-drawer" size="65%" ref="drawer">      
            <div class="handle-box">
                <el-select v-model="type_id" placeholder="物料类别" class="handle-input mr10">
                     <el-option v-for="typeArr in typeData" :key="typeArr.part_type_id" :label="typeArr.part_type_id+' - '+typeArr.type_name" :value="typeArr.part_type_id"></el-option>
                </el-select>
                <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="primary" icon="el-icon-circle-plus" @click="handleADD">增加物料</el-button>
            </div>
            <div style="overflow:auto;height:85%;">
                <el-table :data="tableData" border class="table" height="100%" ref="multipleTable" header-cell-class-name="table-header" @selection-change="wlhandleSelectionChange">
                    <el-table-column type="selection" width="55" label="复选框" align="center"></el-table-column>
                    <el-table-column prop="part_code" label="物料编号"></el-table-column>
                    <el-table-column prop="part_name" label="名称" ></el-table-column>
                    <el-table-column prop="type_name" label="所属分类" ></el-table-column>
                    <el-table-column prop="part_inventory" label="库存" width="100"></el-table-column>
                    <el-table-column prop="part_unit" label="计量单位" align="center" width="100"></el-table-column>
                    <el-table-column prop="hs_code" label="HS编码" width="100"></el-table-column>                                  
                </el-table>
            </div>
            <div style="padding:18px 10px; position:absolute;bottom:0;background:#ffffff;width:100%;height50px;">
                <el-row :gutter="20">
                    <el-col :span="18">
                        <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
                    </el-col>
                    <el-col :span="6" style="text-align:right;">
                        <el-button type="primary" icon="el-icon-plus" @click="addDomain">确认物料</el-button>
                    </el-col>
                </el-row>
            </div>

               
        </el-drawer>

        <!-- 数据展示弹出框 -->
        <el-dialog title="设备详细信息" align='center' :visible.sync="showVisible" width="60%">
            <el-form ref="form" :model="showInfoform" label-width="50px">
                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 设备档案</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="3" class="list_unit plr10 b_b b_r">设备型号：</el-col>
                        <el-col :span="4" class="list_unit plr10 b_b b_r" v-html="showInfoform.M_name"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">设备序列号:</el-col>
                        <el-col :span="6" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_macNum?showInfoform.P_macNum:'&nbsp;'"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">类别：</el-col>
                        <el-col :span="5"  class="list_unit plr10 b_b" v-html="showInfoform.S_title"></el-col>                       
                        <el-col :span="3" class="list_unit plr10 b_b b_r">客户名称：</el-col>
                        <el-col :span="4" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_manufacturer?showInfoform.P_manufacturer:'&nbsp;'"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">购买时间：</el-col>
                        <el-col :span="6" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_buy_time?showInfoform.P_buy_time:'&nbsp;'"></el-col>
                        <el-col :span="8" class="list_unit plr10 b_b">设备联系人/电话：{{showInfoform.c_contacts}} - {{showInfoform.c_tel}}</el-col>
                        <el-col :span="10" class="list_unit7 b_b b_r flexdiv">所属公司：{{showInfoform.c_name}}</el-col>                           
                        <el-col :span="14" class="list_unit7 b_b flexdiv">使用地址：{{showInfoform.P_useAddress}}</el-col>                        
                    </el-row>

                    <div class="tab_title"><i class="el-icon-eleme"></i> 技术参数</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="3" class="list_unit plr10 b_b b_r">版本号：</el-col>
                        <el-col :span="4" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_version?showInfoform.P_version:'&nbsp;'"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">PLC 品牌：</el-col>
                        <el-col :span="6" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_PLC_brand?showInfoform.P_PLC_brand:'&nbsp;'"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">通讯方式：</el-col>
                        <el-col :span="5"  class="list_unit plr10 b_b" v-html="showInfoform.P_communication?showInfoform.P_communication:'&nbsp;'"></el-col>                         
                        <el-col :span="3" class="list_unit plr10 b_b b_r">接口类型：</el-col>
                        <el-col :span="4" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_api_type?showInfoform.P_api_type:'&nbsp;'"></el-col> 
                        <el-col :span="3" class="list_unit plr10 b_b b_r">接口协议：</el-col>
                        <el-col :span="14" class="list_unit plr10 b_b" v-html="showInfoform.P_api_port?showInfoform.P_api_port:'&nbsp;'"></el-col>                     
                    </el-row>

                    <div class="tab_title"><i class="el-icon-coin"></i> 设备属性</div>
                    <el-row style="border:1px solid #000;margin:2px;"> 
                        <el-col :span="24" class="list_unit7 b_b flexdiv">分解有毒化学品列表：{{showInfoform.P_gass}}</el-col>                       
                    </el-row>
 
                    <div class="tab_title">  <i class="el-icon-setting"></i> 设备参数</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="3" class="list_unit plr10 b_b b_r">电源：</el-col>
                        <el-col :span="4" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_supply?showInfoform.P_supply:'&nbsp;'"></el-col> 
                        <el-col :span="9" class="list_unit plr10 b_b b_r">最大工艺废气流量： {{showInfoform.P_traffic}}</el-col>                        
                        <el-col :span="8" class="list_unit plr10 b_b">厂房通风负压：{{showInfoform.P_negative_pressure}}</el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">尺寸：</el-col>
                        <el-col :span="21" class="list_unit plr10 b_b" v-html="showInfoform.P_size?showInfoform.P_size:'&nbsp;'"></el-col>               
                    </el-row>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showVisible = false">取 消</el-button>
            </span>
        </el-dialog>
        <!-- HS编码左弹出弹 -->
        <el-drawer title="选择HS编码" :visible.sync="HSDialog" direction="ltr" custom-class="demo-drawer" size="75%" ref="drawer">      
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
                <el-pagination background layout="total, prev, pager, next" :current-page="hspageIndex" :page-size="hspageSize" :total="hspageTotal" @current-change="hshandlePageChange"></el-pagination>                   
            </div>
        </el-drawer>
    </div>
</template>

<script>
import { parts,PartGetType,AddPart,hsGet,batchAddMac,batchDelMac,eidtMac, } from '../../api/index';
import { addGoods,getCost, selectGoods,DelOrderGoods} from '../../api/goods';

export default {
    name: 'basetable',
    data() {
        return {
            tableData: [],
            domains: [],
            protocolForm:{},
            typeData: [],       
            type_id: '',     
            q: '',
            pageIndex: 1,
            hspageIndex: 1,
            pageSize: 20,
            hspageSize: 1,
            user_id: '',
            token: '',
            hsShowData : {},
            rules: {
                part_code: [
                    { required: true, message: '请输入物料编号', trigger: 'blur' },
                    { min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur' }
                ],
                part_name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 60, message: '长度在 1 到 60 个字符', trigger: 'blur' }
                ],
                // part_inventory: [
                //     { required: true, message: '请输入库存', trigger: 'change' }
                // ],
                part_unit: [
                    { required: true, message: '请输入计量单位', trigger: 'blur' }
                ],                
                type_id: [
                    { required: true, message: '请选择类别', trigger: 'blur' }
                ]
            },
            hsData: [],
            HSDialog: false,
            hs_q: '', 
            dialog: false,
            pageTotal: 0,
            hspageTotal: 0,
            loading: false,
            part_id_arr:[],  
            multipleSelection: [], 
            editVisible: false,
            addVisible: false,
            showVisible: false,
            showInfoform:{},
            editForm: {},
            ADDform: {},
            advance_name:''
        };
    },
    created() {
        if(!this.$route.query.advance_id){          
            this.$router.go(-1);
        }
        this.advance_name = this.$route.query.advance_name;
        this.getData();
        //获取物料分类数据
        this.getPartTYpeData();  
        //获取物料分类数据
        this.getHs();  
        //获取订单物料数据
        this.getadvanceData();      
    },
    methods: {
        AddPart(formName) {
            let self = this;
            self.ADDform.token=sessionStorage.getItem('token');
            self.ADDform.user_id=sessionStorage.getItem('user_id');
            self.ADDform.userPowerNum=2003;   
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    AddPart(self.ADDform).then(res => {
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
        addDomain() {
            const self = this;
            length = self.multipleSelection.length;
            if(length<1){
                self.$message.warning('请勾选需要物料选项！');
            }else{
                let str = '';
                for (let i = 0; i < length; i++) {
                    let istrue = false;
                    for (let j = 0; j < self.domains.length; j++) {
                        if(self.multipleSelection[i].part_id == self.domains[j].part_id){
                            str += self.multipleSelection[i].part_name + ' ';
                            istrue = true;
                            break;
                        }
                    }
                    if(!istrue){
                        self.multipleSelection[i].goods_num ='0.001';
                        self.multipleSelection[i].goods_cost =0;
                        self.multipleSelection[i].good_remark ='';
                        self.domains.push(self.multipleSelection[i]); 
                    }

                }                
                self.dialog = false;
                if(str){
                    self.$message.warning('物料'+ str +'已增加');
                }
            }

            self.$refs.multipleTable.clearSelection();            
        },
         // 获取物HS编码数据
        getCOstPrice(val) {
            let self = this;
            getCost({  
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                goods_part_id:val,
                userPowerNum:100
            }).then(res => { 
                if(res.code == "00"){                    
                    return res.goods_cost;
                } else if(res.code == "-100"){
                    self.$message.warning('登录超时');
                    sessionStorage.removeItem('admin_name');
                    self.$router.push('/login');
                }else {
                    self.$message.error('暂无数据');
                    return 0.000;
                }
            }).catch(function(err) {
                return 0.000;
            });
        },
        removeDomain(item) {  
            let self = this;
            var index = self.domains.indexOf(item);
            if (index !== -1) {
              self.domains.splice(index, 1);
            }
            var delDate ={};
            delDate.token = sessionStorage.getItem('token');
            delDate.user_id = sessionStorage.getItem('user_id');
            delDate.goods_id = item.goods_id;
            delDate.userPowerNum=100;
            DelOrderGoods(delDate).then(res => {
                if(res.code == "00"){
                    // self.getadvanceData();
                } else if(res.code == "-1"){
                    self.$message.warning('登录超时');
                    sessionStorage.removeItem('admin_name');
                    self.$router.push('/login');
                }
            }).catch(function(err) {
                self.$message.error('数据处理失败，请检查数据是否正确。');                            
                return false;
            });
            

        },
        handleClose(done) {
            this.$refs.multipleTable.clearSelection();
            this.loading = false;      
            done();  
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
                    self.hspageTotal=res.total;
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
        // 获取订单物料数据
        getadvanceData() {
            let self = this;
            selectGoods({  
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                goods_lot_code:self.$route.query.advance_id,                
                userPowerNum:2002
            }).then(res => { 
                if(res.code == "00"){
                    self.domains = res.rec;
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
            self.HSDialog = false;             
        },
        // 获取物料分类数据
        getPartTYpeData() {
            let self = this;
            PartGetType({  
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                userPowerNum:100
            }).then(res => { 
                if(res.code == "00"){
                    self.typeData = res.rec;
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
        partClose(done) {
            let self = this;     
            self.ADDform = {}; 
            self.hsShowData = {};
            self.addVisible = false;
            done();          
        },
        // 订单物料提交审核
        submitOrderReview(){
            let self = this;
            let goodsData = [];
            if(self.domains.length<1){
                self.$message.error('无物料！');
                return false;
            }else{
                console.log(self.domains)
                for (let i = 0; i < self.domains.length; i++) {   
                   
                    let onegoods = { 
                        'goods_id':self.domains[i].goods_id, 
                        'goods_part_id':self.domains[i].part_id,
                        'goods_supplier_id':1,//关联供应商表(supplier)supplier_id
                        'goods_lot_code':self.$route.query.advance_id,//批次号
                        'goods_state_id':1,//物品使用状态(关联状态表)goods_state_id  
                        'goods_apply':sessionStorage.getItem('admin_name'),//申请人  
                        'goods_num':self.domains[i].goods_num,//数量 
                        'goods_cost':self.domains[i].goods_cost,//参考价
                        'good_remark':self.domains[i].good_remark//备注
                    }
                    goodsData[i]= onegoods; 
                }
            }
            addGoods({  
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                goodsData:goodsData,
                advance_id:self.$route.query.advance_id,
                advance_name:self.advance_name,
                advance_state_id:2,        
                userPowerNum:2003
            }).then(res => { 
                if(res.code == "00"){
                    self.$router.push('/advanceOrder');
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
            

        },
        // 获取物料数据
        getData() {
            let self = this;
            parts({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                type_id:self.type_id,
                userPowerNum:1003,
                q:self.q
            }).then(res => {
                if(res.code == "00"){          
                    self.tableData=res.rec;
                    self.pageTotal = res.total;
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
        // 触发搜索按钮
        handleSearch() {
            this.pageIndex = 1;
            this.getData();
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
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        // 多选操作
        wlhandleSelectionChange(val) {
            this.multipleSelection = val;
        },
        addMaterial(){
            let self = this;
            self.dialog = true;
            self.multipleSelection = [];
        },
        AddNum(value) {
        },
        // 分页导航
        handlePageChange(val) {
            this.pageIndex = val;
            this.getData();
        },
        // hs分页导航
        hshandlePageChange(val) {
            this.hspageIndex = val;
            this.getHs();
        }
    },
    watch: {
        $route(){            
            this.$route.query.advance_id?this.getadvanceData():''; 
            this.$route.query.advance_name?this.advance_name=this.$route.query.advance_name:'';
            this.HSDialog = false;
            this.dialog = false;
            this.loading = false;
            this.editVisible = false;
            this.addVisible = false;
            this.showVisible = false;
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
#advance_name input{
    border:0;
    text-align: center;
    font-size: 35px;
    height: 70px;

}
/*.el-drawer {
    overflow: auto;
}*/
</style>
<style scoped>
.handle-box {
    margin:0 0 20px 10px;
}
.handle-select {
    width: 120px;
}
.handle-mac-type {
    width: 100px;
}
.handle-mac-co {
    width: 30%;
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
    width: 140px;
    display: inline-block;
}
.handle-input2 {
    width: 40%;
    display: inline-block;
}
.table {
    width: calc(100% - 20px);
    margin: 0 10px; 
    font-size: 10px;
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
        overflow: hidden;;
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
