<template>
    <div class="table" v-loading="loading" element-loading-text="数据处理中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-s-grid"></i> {{title}}
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container" id="container">
            <div class="handle-box">         
                <el-button v-if="userPower.indexOf('4001')>-1"  type="danger" icon="el-icon-delete" class="handle-del mr10"  @click="delAllSelection">批量删除</el-button> 
                <el-input v-if="userPower.indexOf('4003')>-1" v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button v-if="userPower.indexOf('4003')>-1" type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button v-if="userPower.indexOf('4000')>-1" type="primary" icon="el-icon-circle-plus" @click="handleADD">增加会员</el-button>
            </div>
            <el-table v-if="userPower.indexOf('4003')>-1" :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header" @cell-click="showPartInfo" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" label="复选框" align="center"></el-table-column>
                <el-table-column prop="id" label="ID" width="80"></el-table-column>
                <el-table-column prop="truename" label="帐号名称" ></el-table-column>
                <el-table-column prop="mobile" label="联系方式" ></el-table-column>
                <el-table-column prop="sex" label="性别" align="center" width="80">
                    <template slot-scope="scope">
                        <el-tag  :type="scope.row.sex==0?'success':(scope.row.sex==1?'danger':'')">{{scope.row.sex | sexFormat}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="login_time" label="登陆时间" align="center">
                    <template slot-scope="scope">
                       {{scope.row.login_time | dataFormat}} 
                    </template>
                </el-table-column>            
                <el-table-column v-if="userPower.indexOf('4002')>-1" label="操作" width="150" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 帐号数据展示弹出框 -->
        <el-dialog title="帐号信息" align='center' :visible.sync="showVisible" width="40vw" >
            <el-form ref="form" :model="showInfoform" label-width="50px">                
                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 基本信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-row class="b_b">
                            <el-col :span ="3" class="list_unit" align="right">帐号名称：</el-col>
                            <el-col :span ="6" class="list_unit">{{showInfoform.truename}}</el-col>
                            <el-col :span ="2" class="list_unit" align="right">性别：</el-col>
                            <el-col :span ="1" class="list_unit">{{showInfoform.sex | sexFormat}}</el-col>
                            <el-col :span ="4" class="list_unit" align="right">联系方式：</el-col>
                            <el-col :span ="8" class="list_unit">{{showInfoform.mobile}}</el-col>
                        </el-row>   
                        <el-row class="b_b">
                            <el-col :span ="3" class="list_unit" align="right">名称：</el-col>
                            <el-col :span ="21" class="list_unit">{{showInfoform.truename}}</el-col>
                        </el-row>  
                        <el-row class="b_b">
                            <el-col :span ="3" class="list_unit" align="right">类别：</el-col>
                            <el-col :span ="21" class="list_unit">{{showInfoform.type_name}}</el-col>
                        </el-row>                        
                    </el-row>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showVisible = false">取 消</el-button>
            </span>
        </el-dialog> 

        <!-- 增加帐号弹出框 -->
        <el-dialog v-if="userPower.indexOf('4000')>-1" title="帐号增加" align='center' :before-close="partClose" :visible.sync="addVisible" width="60vw" top='10vh'>
            <el-form :model="ADDform" :rules="rules" id = "ADDform" ref="ADDform" label-width="100px" class="demo-ruleForm">

                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 基本信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span ="8" class="list_unit b_b">
                            <el-form-item label="帐号名称：" prop="user_name">
                                <el-input v-model="ADDform.user_name" placeholder="请输入帐号名称"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col  :span ="8" class="list_unit b_b">
                            <el-form-item label="密码：" prop="pwd">
                                <el-input type="password" v-model="ADDform.pwd" placeholder="请设置帐号密码："></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col  :span ="8" class="list_unit b_b">
                            <el-form-item label="确认密码：" prop="cpwd">
                                <el-input type="password" v-model="ADDform.cpwd" placeholder="请输入确认密码："></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span ="8" class="list_unit">
                            <el-form-item label="联系方式：" prop="user_tel">
                                <el-input v-model="ADDform.user_tel" placeholder="请输入联系方式"></el-input>
                            </el-form-item>
                        </el-col>   
                        <el-col :span ="8" class="list_unit">
                            <el-form-item label="性别：" prop="user_sex">
                                <el-select v-model="ADDform.user_sex" placeholder="请选择性别" style="width:98%">
                                    <el-option key="1" label="男" value="1"></el-option>
                                    <el-option key="0" label="女" value="0"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>     
                    </el-row>

                    <div class="tab_title"><i class="el-icon-bank-card"></i> 权限选择</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b">
                                <el-divider content-position="left">
                                    <el-checkbox :indeterminate="partsOption" v-model="partscheckAll" @change="partsOptionChange">物料清单管理权限（全选）</el-checkbox>
                                </el-divider>
                                <div style="margin: -5px 0 15px 41px;">
                                    <el-checkbox-group v-model="checkedParts" @change="handleCheckedPartsChange">
                                        <el-checkbox v-for="parts in partsArr" :label="parts" :key="parts">{{parts}}</el-checkbox>
                                    </el-checkbox-group>
                                </div>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="orderOption" v-model="ordercheckAll" @change="orderOptionChange">仓管管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedOrder" @change="handleCheckedOrderChange" size="mini">
                                    <el-checkbox v-for="order in orderArr" :label="order" :key="order">{{order}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col> 
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="storeOption" v-model="storecheckAll" @change="storeOptionChange">采购订单管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedstore" @change="handleCheckedstoreChange" size="mini">
                                    <el-checkbox v-for="store in storeArr" :label="store" :key="store">{{store}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="userOption" v-model="usercheckAll" @change="userOptionChange">会员管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkeduser" @change="handleCheckeduserChange" size="mini">
                                    <el-checkbox v-for="user in userArr" :label="user" :key="user">{{user}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col> 
                    </el-row>
                </el-row>
            </el-form>                
                <div style="text-align:right;padding-top:20px;">
                    <el-button v-if="userPower.indexOf('4000')>-1" type="primary" @click="AddUser('ADDform')">立即创建</el-button>
                    <el-button v-if="userPower.indexOf('4000')>-1" @click="resetAddPart('ADDform')">重置</el-button>
                </div>
        </el-dialog> 

        <!-- 编辑弹出框 -->
        <el-dialog v-if="userPower.indexOf('4002')>-1" title="修改帐号信息" align='center' :visible.sync="editVisible" width="60vw">
            <el-form :model="editForm" :rules="rules" id = "editForm" ref="editForm" label-width="100px" class="demo-ruleForm">
                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 帐号信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col  :span ="8" class="list_unit b_b">
                            <el-form-item label="密码：" prop="epwd">
                                <el-input type="password" v-model="editForm.epwd" placeholder="请设置帐号密码："></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col  :span ="8" class="list_unit b_b">
                            <el-form-item label="确认密码：" prop="ecpwd">
                                <el-input type="password" v-model="editForm.ecpwd" placeholder="请输入确认密码："></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span ="8" class="list_unit b_b">
                            <el-form-item label="联系方式：" prop="mobile">
                                <el-input v-model="editForm.mobile" placeholder="请输入联系方式"></el-input>
                            </el-form-item>
                        </el-col> 
                    </el-row>

                    <div class="tab_title"><i class="el-icon-bank-card"></i> 权限选择</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="soOption" v-model="socheckAll" @change="soOptionChange">销售管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedso" @change="handleCheckedsoChange">
                                    <el-checkbox v-for="so in soArr" :label="so" :key="so">{{so}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="partsOption" v-model="partscheckAll" @change="partsOptionChange">物料管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedParts" @change="handleCheckedPartsChange">
                                    <el-checkbox v-for="parts in partsArr" :label="parts" :key="parts">{{parts}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="cgOption" v-model="cgcheckAll" @change="cgOptionChange">生成采购订单管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedcg" @change="handleCheckedcgChange" size="mini">
                                    <el-checkbox v-for="cg in cgArr" :label="cg" :key="cg">{{cg}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col> 
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="storeOption" v-model="storecheckAll" @change="storeOptionChange">采购订单管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedstore" @change="handleCheckedstoreChange" size="mini">
                                    <el-checkbox v-for="store in storeArr" :label="store" :key="store">{{store}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="orderOption" v-model="ordercheckAll" @change="orderOptionChange">仓管管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedOrder" @change="handleCheckedOrderChange" size="mini">
                                    <el-checkbox v-for="order in orderArr" :label="order" :key="order">{{order}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col> 
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="gysOption" v-model="gyscheckAll" @change="gysOptionChange">供应商类别管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedgys" @change="handleCheckedgysChange" size="mini">
                                    <el-checkbox v-for="gys in gysArr" :label="gys" :key="gys">{{gys}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="contactOption" v-model="contactcheckAll" @change="contactOptionChange">供应商管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedcontact" @change="handleCheckedcontactChange" size="mini">
                                    <el-checkbox v-for="contact in contactArr" :label="contact" :key="contact">{{contact}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="clientTypeOption" v-model="clientTypecheckAll" @change="clientTypeOptionChange">客户类别管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedclientType" @change="handleCheckedclientTypeChange" size="mini">
                                    <el-checkbox v-for="clientType in clientTypeArr" :label="clientType" :key="clientType">{{clientType}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="clientOption" v-model="clientcheckAll" @change="clientOptionChange">客户管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedclient" @change="handleCheckedclientChange" size="mini">
                                    <el-checkbox v-for="client in clientArr" :label="client" :key="client">{{client}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="locationOption" v-model="locationcheckAll" @change="locationOptionChange">仓库管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedlocation" @change="handleCheckedlocationChange" size="mini">
                                    <el-checkbox v-for="location in locationArr" :label="location" :key="location">{{location}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="unitOption" v-model="unitcheckAll" @change="unitOptionChange">计量单位管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkedunit" @change="handleCheckedunitChange" size="mini">
                                    <el-checkbox v-for="unit in unitArr" :label="unit" :key="unit">{{unit}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col>
                        <el-col class="list_unit b_b">
                            <el-divider content-position="left">
                                <el-checkbox :indeterminate="userOption" v-model="usercheckAll" @change="userOptionChange">会员管理权限（全选）</el-checkbox>
                            </el-divider>
                            <div style="margin: -5px 0 15px 41px;">
                                <el-checkbox-group v-model="checkeduser" @change="handleCheckeduserChange" size="mini">
                                    <el-checkbox v-for="user in userArr" :label="user" :key="user">{{user}}</el-checkbox>
                                </el-checkbox-group>
                            </div>
                        </el-col> 
                    </el-row>
                </el-row>
            </el-form>                 
            <div style="text-align:right;padding-top:20px;">
                <el-button v-if="userPower.indexOf('4002')>-1" type="primary" @click="saveEdit('editForm')">提交修改</el-button>
                <!-- <el-button @click="resetAddMac('editForm')">重置</el-button> -->
            </div>
        </el-dialog>  
    </div>
</template>

<script>

    const soOptions = ['增加销售订单', '删除销售订单', '修改销售订单', '查询销售订单','审核销售订单','驳回销售订单','查询附件','附件上传'];
    const partsOptions = ['增加物料', '删除物料', '修改物料', '查询物料', '查看价格','查询物料状态'];
    const orderOptions = ['增加入库单', '查询入库单', '查询库存', '增加领料单', '查询领料单', '审核领料单','驳回领料单','提交订单复审核','出库','打印单据','单据存根','查询驳回领料单','查询存根领料单','修改库存'];
    const gysOptions = ['增加供应商类别', '删除供应商类别', '修改供应商类别', '查询供应商类别'];
    const clientTypeOptions = ['增加客户类别', '删除客户类别', '修改客户类别', '查询客户类别'];
    const unitOptions = ['增加计量单位', '删除计量单位', '修改计量单位', '查询计量单位'];
    const contactOptions = ['增加供应商', '删除供应商', '修改供应商', '查询供应商'];
    const clientOptions = ['增加客户', '删除客户', '修改客户', '查询客户'];
    const locationOptions = ['增加仓库', '删除仓库', '修改仓库', '查询仓库'];
    const cgOptions = ['增加采购订单', '下采购订单', '批量导入采购订单', '采购订单模板下载', '查询采购订单', '打印采购订单'];
    const storeOptions = ['发货', '确认收货', '品检', '退换商品', '入库', '补发商品'];
    const userOptions = ['增加账号', '批量删除', '修改', '查询'];
import qs from 'qs';
import { AddUser,batchDelUser,userEdit,userlist} from '../../api/index';
export default {
    name: 'basetable',
    data() {
        return {
            tableData: [],
            hsData: [],
            userPower: [],
            type_id: '',
            q: '',  
            hs_q: '',            
            ADDform: {},
            hsShowData : {},          
            dialog: false,
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            socheckAll: false,
            checkedso: [],
            soArr: soOptions,
            soOption: true,

            partscheckAll: false,
            checkedParts: [],
            partsArr: partsOptions,
            partsOption: true,

            ordercheckAll: false,
            checkedOrder: [],
            orderArr: orderOptions,
            orderOption: true,

            cgcheckAll: false,
            checkedcg: [],
            cgArr: cgOptions,
            cgOption: true,

            usercheckAll: false,
            checkeduser: [],
            userArr: userOptions,
            userOption: true,

            storecheckAll: false,
            checkedstore: [],
            storeArr: storeOptions,
            storeOption: true,

            gyscheckAll: false,
            checkedgys: [],
            gysArr: gysOptions,
            gysOption: true,

            clientcheckAll: false,
            checkedclient: [],
            clientArr: clientOptions,
            clientOption: true,

            clientTypecheckAll: false,
            checkedclientType: [],
            clientTypeArr: clientTypeOptions,
            clientTypeOption: true,

            contactcheckAll: false,
            checkedcontact: [],
            contactArr: contactOptions,
            contactOption: true,

            locationcheckAll: false,
            checkedlocation: [],
            locationArr: locationOptions,
            locationOption: true,

            unitcheckAll: false,
            checkedunit: [],
            unitArr: unitOptions,
            unitOption: true,

            loading: false,
            showInfoform:{},
            deriveData:[],
            co_list:[],            
            multipleSelection: [],
            delList: [],
            editVisible: false,
            addVisible: false,
            showVisible: false,
            editForm: {},  
            fileList:[],
            batchAddDate: {},
            delDate: {},
            title:'',                    
            rules: {
                user_name: [
                    { required: true, message: '请输入会员名', trigger: 'blur' },
                    { min: 2, max: 30, message: '长度在 2 到 30 个字符', trigger: 'blur' }
                ],
                user_tel: [
                    { required: true, message: '请输入联系方式', trigger: 'blur' },
                    { min: 0, max: 60, message: '长度在 1 到 60 个字符', trigger: 'blur' }
                ],
                mobile: [
                    { required: true, message: '请输入联系方式', trigger: 'blur' },
                    { min: 0, max: 60, message: '长度在 1 到 60 个字符', trigger: 'blur' }
                ],                
                part_inventory: [
                    { required: true, message: '请输入库存', trigger: 'change' }
                ],
                part_unit: [
                    { required: true, message: '请输入计量单位', trigger: 'blur' }
                ],                
                user_sex: [
                    { required: true, message: '请选择性别', trigger: 'blur' }
                ],
                pwd:[
                    { required:true, message:'创建密码',trigger:'blur' }
                ],
                cpwd:[
                    { required:true,message:'确认密码',trigger:'blur' },
                    {
                        validator:(rule,value,callback)=>{
                            if(value===''){
                                callback(new Error('请再次输入密码'))
                            }else if(value!==this.ADDform.pwd){
                                callback(new Error('两次输入密码不一致'))
                            }else{
                                callback();
                            }
                        },
                        trigger:'blur'
                    }
                ],
                // epwd:[
                //     {
                //         required:true,
                //         validator:(rule,value,callback)=>{
                //             if(value==='' || value===undefined){
                //                 callback();
                //             }else{
                //                 if(value.length<6)
                //                 callback(new Error('密码至少6位'))
                //             }
                //         },
                //         trigger:'blur'
                //     }
                // ],
                ecpwd:[
                    {
                        required:false,
                        validator:(rule,value,callback)=>{
                            if(!this.editForm.epwd){
                                callback();
                            }else{
                               if(value===''){
                                    callback(new Error('请再次输入密码'))
                                }else if(value!==this.editForm.epwd){
                                    callback(new Error('两次输入密码不一致'))
                                }else{
                                    callback();
                                }
                            }
                            
                        },
                        trigger:'blur'
                    }
                ]
             }
        };
    },
    created() {
        //获取物料数据
        this.getData();
        this.title = this.$route.meta.title;
        this.userPower = sessionStorage.getItem('userPower').split(',');
    },
    filters: {
        dataFormat(val) {   
            if(val){
                return new Date(parseInt(val) * 1000).toLocaleString().replace(/:\d{1,2}$/,' '); 
            }else{
                return '0000/00/00 00:00';
            }
        },
        sexFormat(sex) {
            if(sex==0){
                return '女';
            }else if(sex == 1){
                return '男';
            }
        }
    },   
    methods: {
        AddUser(formName) {
            let self = this;
            self.ADDform.token=sessionStorage.getItem('token');
            self.ADDform.user_id=sessionStorage.getItem('user_id');
            self.ADDform.userPowerNum=4000;

            var arr = [];
            if(self.checkedParts.length<1){
                self.checkedParts.push('物料无权限');
            }
            if(self.checkedOrder.length<1){
                self.checkedOrder.push('订单无权限');
            }
            if(self.checkedstore.length<1){
                self.checkedstore.push('订单采购无权限');
            }
            if(self.checkeduser.length<1){
                self.checkeduser.push('会员无权限');
            }
            if(self.checkedso.length<1){
                self.checkedso.push('销售无权限');
            }
            arr= self.checkedParts.concat(self.checkedOrder).concat(self.checkeduser).concat(self.checkedstore).concat(self.checkedso);
            arr.push('基础权限');
            self.ADDform.userPower=self.powerChange(arr) ;

            self.$refs[formName].validate((valid) => {
                if (valid) {
                    AddUser(self.ADDform).then(res => {
                        if(res.code == "00"){
                        //     self.resetAddMac(formName);
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

        // 合并权限数组
        powerChange(arr) {
            var newArr = [];
            for(var i=0;i<arr.length;i++){
                newArr[i]=this.ChangeNum(arr[i]);
            };
            return newArr.toString(); ;
        },
        // 获取会员数据
        getData() {
            let self = this;
            userlist({  
                type_id: self.type_id,
                keyword: '',
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                user_id: sessionStorage.getItem('user_id'),
                token: sessionStorage.getItem('token'),
                userPowerNum:4003,
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
        // 触发搜索按钮
        handleSearch() {
            let self = this;
            self.getData();
        }, 
        // 批量删会员料操作
        delAllSelection() {
            const self = this,
            length = self.multipleSelection.length;
            let str = '';
            var user_id_arr = [];
            self.delList = self.delList.concat(self.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += self.multipleSelection[i].truename + ' ';
                user_id_arr[user_id_arr.length] = self.multipleSelection[i].id;
            }
            if(!str){
                self.$message.warning('请勾选需要删除的选项！');
            }else{
                self.delDate.token = sessionStorage.getItem('token');
                self.delDate.user_id = sessionStorage.getItem('user_id');
                self.delDate.user_id_arr=user_id_arr;
                self.delDate.userPowerNum = 4002,
                batchDelUser(self.delDate).then(res => {
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
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },        
        // 增加操作
        handleADD() {
            let self = this;
            self.addVisible = true;
        },  

        // 编辑操作
        handleEdit(row) {
            this.editForm = row;
            this.checkedParts = [];
            this.checkedOrder = [];
            this.checkedstore = [];
            this.checkeduser = [];    
            this.checkedso = [];    
            this.checkedgys = [];    
            this.checkedcontact = [];    
            this.editForm.userPower.split(',').forEach(v=>{  
                if(v>999 && v<1999 && v!==100){
                    this.checkedParts.push(this.ChangeName(v));
                } 
                if(v>1999 && v<2999 && v!==100){
                    this.checkedOrder.push(this.ChangeName(v));
                } 
                if(v>2999 && v<3999 && v!==100){
                    this.checkedstore.push(this.ChangeName(v));
                } 
                if(v>3999 && v<4999 && v!==100){
                    this.checkeduser.push(this.ChangeName(v));
                } 
                if(v>4999 && v<5999 && v!==100){
                    this.checkedso.push(this.ChangeName(v));
                }
                if(v>5999 && v<6999 && v!==100){
                    this.checkedgys.push(this.ChangeName(v));
                } 
                if(v>6999 && v<7999 && v!==100){
                    this.checkedcontact.push(this.ChangeName(v));
                }  
                if(v>7999 && v<8999 && v!==100){
                    this.checkedclient.push(this.ChangeName(v));
                }  
                if(v>8999 && v<9999 && v!==100){
                    this.checkedlocation.push(this.ChangeName(v));
                } 
                if(v>9999 && v<10999 && v!==100){
                    this.checkedclientType.push(this.ChangeName(v));
                }   
                if(v>10999 && v<11999 && v!==100){
                    this.checkedunit.push(this.ChangeName(v));
                }   
                if(v>11999 && v<12999 && v!==100){
                    this.checkedcg.push(this.ChangeName(v));
                } 
            }); 
            this.editVisible = true;  
        },      
        // 展示设备详细信息
        showPartInfo(row,column,event,cell){
            let self = this;
            if(column.label !="操作" && column.label !="复选框"){
                self.showVisible = true;
                self.showInfoform =row;
            }
            
        }, 
        // 保存编辑
        saveEdit(formName) {
             let self = this;
            self.editForm.token=sessionStorage.getItem('token');
            self.editForm.user_id=sessionStorage.getItem('user_id');
            self.editForm.userPowerNum=4002;

            var arr = [];
            if(self.checkedParts.length<1){
                self.checkedParts.push('物料无权限');
            }
            if(self.checkedOrder.length<1){
                self.checkedOrder.push('仓管无权限');
            }
            if(self.checkedstore.length<1){
                self.checkedstore.push('订单采购无权限');
            }
            if(self.checkeduser.length<1){
                self.checkeduser.push('会员无权限');
            }
            if(self.checkedso.length<1){
                self.checkedso.push('销售无权限');
            }
            if(self.checkedgys.length<1){
                self.checkedgys.push('供应商类别无权限');
            }
            if(self.checkedcontact.length<1){
                self.checkedcontact.push('供应商无权限');
            }
            if(self.checkedclient.length<1){
                self.checkedclient.push('客户无权限');
            }
            if(self.checkedlocation.length<1){
                self.checkedlocation.push('仓库无权限');
            }
            if(self.checkedclientType.length<1){
                self.checkedclientType.push('客户类别无权限');
            }
            if(self.checkedunit.length<1){
                self.checkedunit.push('计量单位无权限');
            }
            if(self.checkedcg.length<1){
                self.checkedcg.push('生成采购订单无权限');
            }
            arr= self.checkedParts.concat(self.checkedOrder).concat(self.checkeduser).concat(self.checkedstore).concat(self.checkedso).concat(self.checkedgys).concat(self.checkedcontact).concat(self.checkedclient).concat(self.checkedlocation).concat(self.checkedclientType).concat(self.checkedunit).concat(self.checkedcg);
            arr.push('基础权限');
            self.editForm.userPower=self.powerChange(arr) ;
            self.$refs[formName].validate((valid) => {

                if (valid) {
                    userEdit(self.editForm).then(res => {
                        if(res.code == "00"){
                            self.getData();
                            self.editVisible = false;
                            self.editForm = {};
                            self.$message.success('修改成功');
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
        partClose(done) {
            let self = this;     
            self.ADDform = {}; 
            self.editForm = {};
            self.hsShowData = {};
            self.addVisible = false;      
            done();          
        },
        // 分页导航
        handlePageChange(val) {
            let self = this;
            self.pageIndex = val;
            this.getData();
        },

        soOptionChange(val) {
            this.checkedso = val ? soOptions : [];
            this.soOption = false;
        },
        handleCheckedsoChange(value) {
            let checkedCount = value.length;
            this.socheckAll = checkedCount === this.soArr.length;
            this.soOption = checkedCount > 0 && checkedCount < this.soArr.length;
        },

        partsOptionChange(val) {
            this.checkedParts = val ? partsOptions : [];
            this.partsOption = false;
        },
        handleCheckedPartsChange(value) {
            let checkedCount = value.length;
            this.partscheckAll = checkedCount === this.partsArr.length;
            this.partsOption = checkedCount > 0 && checkedCount < this.partsArr.length;
        }, 

        cgOptionChange(val) {
            this.checkedcg = val ? cgOptions : [];
            this.cgOption = false;
        },
        handleCheckedcgChange(value) {
            let checkedCount = value.length;
            this.cgcheckAll = checkedCount === this.cgArr.length;
            this.cgOption = checkedCount > 0 && checkedCount < this.cgArr.length;
        },  

        orderOptionChange(val) {
            this.checkedOrder = val ? orderOptions : [];
            this.orderOption = false;
        },
        handleCheckedOrderChange(value) {
            let checkedCount = value.length;
            this.ordercheckAll = checkedCount === this.orderArr.length;
            this.orderOption = checkedCount > 0 && checkedCount < this.orderArr.length;
        }, 

        userOptionChange(val) {
            this.checkeduser = val ? userOptions : [];
            this.userOption = false;
        },
        handleCheckeduserChange(value) {
            let checkedCount = value.length;
            this.usercheckAll = checkedCount === this.userArr.length;
            this.userOption = checkedCount > 0 && checkedCount < this.userArr.length;
        }, 

        storeOptionChange(val) {
            this.checkedstore = val ? storeOptions : [];
            this.storeOption = false;
        },
        handleCheckedstoreChange(value) {
            let checkedCount = value.length;
            this.storecheckAll = checkedCount === this.storeArr.length;
            this.storeOption = checkedCount > 0 && checkedCount < this.storeArr.length;
        }, 

        gysOptionChange(val) {
            this.checkedgys = val ? gysOptions : [];
            this.gysOption = false;
        },
        handleCheckedgysChange(value) {
            let checkedCount = value.length;
            this.gyscheckAll = checkedCount === this.gysArr.length;
            this.gysOption = checkedCount > 0 && checkedCount < this.gysArr.length;
        },

        contactOptionChange(val) {
            this.checkedcontact = val ? contactOptions : [];
            this.contactOption = false;
        },
        handleCheckedcontactChange(value) {
            let checkedCount = value.length;
            this.contactcheckAll = checkedCount === this.contactArr.length;
            this.contactOption = checkedCount > 0 && checkedCount < this.contactArr.length;
        },

        clientOptionChange(val) {
            this.checkedclient = val ? clientOptions : [];
            this.clientOption = false;
        },
        handleCheckedclientChange(value) {
            let checkedCount = value.length;
            this.clientcheckAll = checkedCount === this.clientArr.length;
            this.clientOption = checkedCount > 0 && checkedCount < this.clientArr.length;
        },

        locationOptionChange(val) {
            this.checkedlocation = val ? locationOptions : [];
            this.locationOption = false;
        },
        handleCheckedlocationChange(value) {
            let checkedCount = value.length;
            this.locationcheckAll = checkedCount === this.locationArr.length;
            this.locationOption = checkedCount > 0 && checkedCount < this.locationArr.length;
        },

        clientTypeOptionChange(val) {
            this.checkedclientType = val ? clientTypeOptions : [];
            this.clientTypeOption = false;
        },
        handleCheckedclientTypeChange(value) {
            let checkedCount = value.length;
            this.clientTypecheckAll = checkedCount === this.clientTypeArr.length;
            this.clientTypeOption = checkedCount > 0 && checkedCount < this.clientTypeArr.length;
        },

        unitOptionChange(val) {
            this.checkedunit = val ? unitOptions : [];
            this.unitOption = false;
        },
        handleCheckedunitChange(value) {
            let checkedCount = value.length;
            this.unitcheckAll = checkedCount === this.unitArr.length;
            this.unitOption = checkedCount > 0 && checkedCount < this.unitArr.length;
        },
        // 权限名称转代号
        ChangeNum(val) {
            var o='';
            switch(val) {
                case '增加物料':
                    o=1000;
                    break;
                case '删除物料':
                    o=1001;
                    break;
                case '修改物料':
                    o=1002;
                    break;
                case '查询物料':
                    o=1003;
                    break;
                case '查看价格':
                    o=1004;
                    break;
                case '查询物料状态':
                    o=1005;
                    break;
                case '物料无权限':
                    o=1999;
                    break;

                case '增加入库单':
                    o=2000;
                    break;
                case '查询入库单':
                    o=2001;
                    break;
                case '查询库存':
                    o=2002;
                    break;
                case '增加领料单':
                    o=2003;
                    break;
                case '查询领料单':
                    o=2004;
                    break;
                case '审核领料单':
                    o=2005;
                    break;
                case '驳回领料单':
                    o=2006;
                    break;
                case '提交订单复审核':
                    o=2007;
                    break;
                case '出库':
                    o=2008;
                    break;
                case '打印单据':
                    o=2009;
                    break;
                case '单据存根':
                    o=2010;
                    break;
                case '查询驳回领料单':
                    o=2011;
                    break;
                case '查询存根领料单':
                    o=2012;
                    break;
                case '修改库存':
                    o=2013;
                    break;
                case '仓管无权限':
                    o=2999;
                    break;

                case '发货':
                    o=3000;
                    break;
                case '确认收货':
                    o=3001;
                    break;
                case '品检':
                    o=3002;
                    break;
                case '退换商品':
                    o=3003;
                    break;
                case '入库':
                    o=3004;
                    break;
                case '补发商品':
                    o=3005;
                    break;
                case '订单采购无权限':
                    o=3999;
                    break;


                case '增加账号':
                    o=4000;
                    break;
                case '批量删除':
                    o=4001;
                    break;
                case '修改':
                    o=4002;
                    break;
                case '查询':
                    o=4003;
                    break;
                case '会员无权限':
                    o=4999;
                    break;

                case '增加销售订单':
                    o=5000;
                    break;
                case '删除销售订单':
                    o=5001;
                    break;
                case '修改销售订单':
                    o=5002;
                    break;
                case '查询销售订单':
                    o=5003;
                    break;
                case '审核销售订单':
                    o=5004;
                    break;
                case '驳回销售订单':
                    o=5005;
                    break;
                case '查询附件':
                    o=5006;
                    break;
                case '附件上传':
                    o=5007;
                    break;
                case '销售无权限':
                    o=5999;
                    break;

                case '增加供应商类别':
                    o=6000;
                    break;
                case '删除供应商类别':
                    o=6001;
                    break;
                case '修改供应商类别':
                    o=6002;
                    break;
                case '查询供应商类别':
                    o=6003;
                    break;
                case '供应商类别无权限':
                    o=6999;
                    break;

                case '增加供应商':
                    o=7000;
                    break;
                case '删除供应商':
                    o=7001;
                    break;
                case '修改供应商':
                    o=7002;
                    break;
                case '查询供应商':
                    o=7003;
                    break;
                case '供应商无权限':
                    o=7999;
                    break;

                case '增加客户':
                    o=8000;
                    break;
                case '删除客户':
                    o=8001;
                    break;
                case '修改客户':
                    o=8002;
                    break;
                case '查询客户':
                    o=8003;
                    break;
                case '客户无权限':
                    o=8999;
                    break;

                case '增加仓库':
                    o=9000;
                    break;
                case '删除仓库':
                    o=9001;
                    break;
                case '修改仓库':
                    o=9002;
                    break;
                case '查询仓库':
                    o=9003;
                    break;
                case '仓库无权限':
                    o=9999;
                    break;

                case '增加客户类别':
                    o=10000;
                    break;
                case '删除客户类别':
                    o=10001;
                    break;
                case '修改客户类别':
                    o=10002;
                    break;
                case '查询客户类别':
                    o=10003;
                    break;
                case '客户类别无权限':
                    o=10999;
                    break;

                case '增加计量单位':
                    o=11000;
                    break;
                case '删除计量单位':
                    o=11001;
                    break;
                case '修改计量单位':
                    o=11002;
                    break;
                case '查询计量单位':
                    o=11003;
                    break;
                case '计量单位无权限':
                    o=11999;
                    break;

                case '增加采购订单':
                    o=12000;
                    break;
                case '下采购订单':
                    o=12001;
                    break;
                case '批量导入采购订单':
                    o=12002;
                    break;
                case '采购订单模板下载':
                    o=12003;
                    break;
                case '查询采购订单':
                    o=12004;
                    break;
                case '打印采购订单':
                    o=12005;
                    break;
                case '生成采购订单无权限':
                    o=12999;
                    break;

                default:
                    o=100;
            } 
            return o;
        },
        // 权限代号转名称
        ChangeName(val) {
            var o='';
            switch(val) {
                case '1000':
                    o='增加物料';
                    break;
                case '1001':
                    o='删除物料';
                    break;
                case '1002':
                    o='修改物料';
                    break;
                case '1003':
                    o='查询物料';
                    break;
                case '1004':
                    o='查看价格';
                    break;
                case '1005':
                    o='查询物料状态';
                    break;

                case '2000':
                    o='增加入库单';
                    break;
                case '2001':
                    o='查询入库单';
                    break;
                case '2002':
                    o='查询库存';
                    break;
                case '2003':
                    o='增加领料单';
                    break;
                case '2004':
                    o='查询领料单';
                    break;
                case '2005':
                    o='审核领料单';
                    break;
                case '2006':
                    o='驳回领料单';
                    break;
                case '2007':
                    o='提交订单复审核';
                    break;
                case '2008':
                    o='出库';
                    break;
                case '2009':
                    o='打印单据';
                    break;
                case '2010':
                    o='单据存根';
                    break;
                case '2011':
                    o='查询驳回领料单';
                    break;
                case '2012':
                    o='查询存根领料单';
                    break;
                case '2013':
                    o='修改库存';
                    break;

                case '3000':
                    o='发货';
                    break;
                case '3001':
                    o='确认收货';
                    break;
                case '3002':
                    o='品检';
                    break;
                case '3003':
                    o='退换商品';
                    break;
                case '3004':
                    o='入库';
                    break;
                case '3005':
                    o='补发商品';
                    break;

                case '4000':
                    o='增加账号';
                    break;
                case '4001':
                    o='批量删除';
                    break;
                case '4002':
                    o='修改';
                    break;
                case '4003':
                    o='查询';
                    break;

                case '5000':
                    o='增加销售订单';
                    break;
                case '5001':
                    o='删除销售订单';
                    break;
                case '5002':
                    o='修改销售订单';
                    break;
                case '5003':
                    o='查询销售订单';
                    break;
                case '5004':
                    o='审核销售订单';
                    break;
                case '5005':
                    o='驳回销售订单';
                    break;
                case '5006':
                    o='查询附件';
                    break;
                case '5007':
                    o='附件上传';
                    break;

                case '6000':
                    o='增加供应商类别';
                    break;
                case '6001':
                    o='删除供应商类别';
                    break;
                case '6002':
                    o='修改供应商类别';
                    break;
                case '6003':
                    o='查询供应商类别';
                    break;

                case '7000':
                    o='增加供应商';
                    break;
                case '7001':
                    o='删除供应商';
                    break;
                case '7002':
                    o='修改供应商';
                    break;
                case '7003':
                    o='查询供应商';
                    break;

                case '8000':
                    o='增加客户';
                    break;
                case '8001':
                    o='删除客户';
                    break;
                case '8002':
                    o='修改客户';
                    break;
                case '8003':
                    o='查询客户';
                    break;

                case '9000':
                    o='增加仓库';
                    break;
                case '9001':
                    o='删除仓库';
                    break;
                case '9002':
                    o='修改仓库';
                    break;
                case '9003':
                    o='查询仓库';
                    break;

                case '10000':
                    o='增加客户类别';
                    break;
                case '10001':
                    o='删除客户类别';
                    break;
                case '10002':
                    o='修改客户类别';
                    break;
                case '10003':
                    o='查询客户类别';
                    break;

                case '11000':
                    o='增加计量单位';
                    break;
                case '11001':
                    o='删除计量单位';
                    break;
                case '11002':
                    o='修改计量单位';
                    break;
                case '11003':
                    o='查询计量单位';
                    break;

                case '12000':
                    o='增加采购订单';
                    break;
                case '12001':
                    o='下采购订单';
                    break;
                case '12002':
                    o='批量导入采购订单';
                    break;
                case '12003':
                    o='采购订单模板下载';
                    break;
                case '12004':
                    o='查询采购订单';
                    break;
                case '12005':
                    o='打印采购订单';
                    break;

                default:
                    o=100;
            } 
            return o;
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
