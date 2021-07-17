<template>
    <div v-loading="loading" element-loading-text="数据处理中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 商品管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button v-if="userPower.indexOf('1001')>-1" type="danger" icon="el-icon-delete" class="handle-del mr10" @click="delAllSelection">批量删除</el-button>
                <el-cascader v-model="categoryIdArr" :options="options" clearable :props="{ expandTrigger: 'hover',checkStrictly: true }" @change="categoryIdChange" class="handle-input mr10" placeholder="试试搜索：类别名称" filterable></el-cascader>
                <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button v-if="userPower.indexOf('1000')>-1" type="success" icon="el-icon-plus" @click="handleADD">增加商品</el-button>
                <el-button  type="primary" icon="el-icon-upload2" class="iconfont icon-yunshangchuan" style=" position: absolute;">批量导入&nbsp;</el-button>
                <input type="file" @change="importfxx(this)" class="batch_input" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                <el-button type="primary" icon="el-icon-upload"  style="margin-left:-10px;" @click="exportTable()">物料导出EXCEL</el-button>       
                <el-button type="primary" icon="el-icon-download" @click="exceldown('http://wms.lyccco.com/excel/goodsUp.xlsx')">批量导入模块下载</el-button>
                <!-- <el-button icon="el-icon-remove-outline" @click="handleSearch">禁用</el-button>
                <el-button icon="el-icon-circle-check" @click="handleSearch">启用</el-button>
                <el-button icon="el-icon-download" @click="handleSearch">导入</el-button>
                <el-button icon="el-icon-upload2" @click="handleSearch">导出</el-button> -->
            </div>
            <el-table :data="tableData" border style="font-size:10px" stripe class="table" ref="multipleTable" header-cell-class-name="table-header" :show-header='true' @selection-change="handleSelectionChange" height="63vh">
                <el-table-column type="selection" width="50" align="center"></el-table-column>
                <el-table-column label="图片" width="60" align="center">
                    <template slot-scope="scope">
                        <span v-if="scope.row.imgArr.length==0">无图</span>
                        <el-image v-else class="table-td-thumb" :src="scope.row.imgArr[0]" :preview-src-list="scope.row.imgArr"></el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="number" width="120" label="商品编号" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="name" label="物料描述" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="brand" label="品牌" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="spec" label="规格" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="contactCode" label="厂家编码" width="100"></el-table-column>
                <el-table-column prop="contactName" label="供应商" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="categoryName" label="商品类别" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="cunitName" width="50"  label="单位" align="center"></el-table-column>
                <el-table-column prop="inventQty" width="80" label="当前库存" align="right">                    
                     <template slot-scope="scope">
                        {{scope.row.inventQty | formatDecimal}}
                    </template>
                </el-table-column>
                <el-table-column prop="salePrice" width="70"  label="零售价" align="right">
                     <template slot-scope="scope">
                        {{scope.row.salePrice | formatDecimal}}
                    </template>
                </el-table-column>
                <el-table-column label="状态" align="center" width="70" >
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.status===1?'success':(scope.row.status===0?'danger':'')">{{scope.row.status===1?'启用':'禁用'}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="60" align="center" v-if="userPower.indexOf('1002')>-1">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit"  @click="handleEdit(scope.$index, scope.row)"></el-button>
                        <el-button type="text" icon="el-icon-picture" @click="imgEdit(scope.$index, scope.row)"></el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, sizes, prev, pager, next, jumper" :current-page="pageIndex" :page-size="pageSize" :page-sizes="pageSizes" :total="pageTotal" @size-change="handleSizeChange" @current-change="handlePageChange"></el-pagination>
                </el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="物料编辑" id="box":before-close="partClose" :visible.sync="editVisible" v-if="userPower.indexOf('1002')>-1" :close-on-click-modal="false" align='center' v-dialogDrag vh="8vh" width="50vw">
            <el-form ref="editForm" id="editForm" :model="editForm" :rules="rules" label-width="100px" class="demo-ruleForm">
                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 物料信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="编 号：" prop="number">
                                <el-input v-model="editForm.number" placeholder="请输入物料编号"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="物料描述：" prop="name">
                                <el-input v-model="editForm.name" placeholder="请输入物料描述"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="品 牌：" prop="brand">
                                <el-input v-model="editForm.brand" placeholder="请输入品牌"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="where use：" prop="whereuse">
                                <el-input v-model="editForm.whereuse" placeholder="请输入用于哪里"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="供应商：" prop="contactID">
                                <el-cascader v-model="editForm.contactArr" :options="clientOptions" clearable :show-all-levels="false" @change="queryCCategory" placeholder="搜索：客户名称" filterable  style="width:98%">
                                    <template slot-scope="{ node, data }">
                                        <span>{{ data.label }}</span>
                                        <span v-if="!node.isLeaf" > ({{ data.children.length }}) </span>
                                    </template>
                                </el-cascader>
                            </el-form-item> 
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="计量单位：" prop="unitId">
                                <el-select v-model="editForm.unitId" @change="unitChange" placeholder="请选择计量单位" style="width:98%">
                                    <el-option v-for="unitArr in unitOptions" :key="unitArr.value" :label="unitArr.label" :value="unitArr.value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="首选仓库：" prop="locationId">
                                <el-select v-model="editForm.locationId" placeholder="请选择首选仓库"  @change="locationChange" style="width:98%">
                                    <el-option v-for="locationArr in locationOptions" :key="locationArr.value" :label="locationArr.label" :value="locationArr.value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="类 别：" prop="categoryId" >
                                <el-select v-model="editForm.categoryId" placeholder="请选择类别"  @change="categoryChange" style="width:98%">
                                    <el-option v-for="typeArr in options" :key="typeArr.value" :label="typeArr.label" :value="typeArr.value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>                
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="最低预警值：" prop="minNum">
                                <el-input-number v-model="editForm.minNum" :precision="3" :controls="false" :min="0.001" placeholder="请输入最低预警值" style="width:180px;"></el-input-number>
                            </el-form-item>
                        </el-col> 
                        <el-col :span="12" class="list_unit b_b">
                            <el-form-item label="单 量：" prop="pieceQty">
                                <el-input v-model="editForm.pieceQty" placeholder="请输入每个单位数量"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col :span="12" class="list_unit b_b">
                            <el-form-item label="交 期(天)：" prop="cycle">
                                <el-input-number v-model="editForm.cycle" :controls="false" placeholder="请输入交付周期" style="width:180px;"></el-input-number>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" class="list_unit b_b" style="padding-bottom:1px;">
                            <el-form-item label="是否溯源：" prop="traceability">
                                <el-radio-group v-model="editForm.traceability">
                                    <el-radio label="1">是</el-radio>
                                    <el-radio label="2">否</el-radio>
                                </el-radio-group>
                            </el-form-item>
                        </el-col>                 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="零售价(不含税)：" prop="salePriceno">
                                <el-input-number v-model="editForm.salePriceno" :precision="3" :controls="false" :min="0.001" placeholder="请输入不含税零售价" style="width:98%"></el-input-number>
                            </el-form-item>
                        </el-col>                
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="零售价(含税)：" prop="salePrice">
                                <el-input-number v-model="editForm.salePrice" :precision="3" :controls="false" :min="0.001" placeholder="请输入含税零售价" style="width:98%"></el-input-number>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="规格型号：" prop="spec">
                                <el-input v-model="editForm.spec" placeholder="请输入规格型号"></el-input>
                            </el-form-item>
                        </el-col>    
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="厂家编码：" prop="contactCode">
                                <el-input v-model="editForm.contactCode" placeholder="请输入厂家编码"></el-input>
                            </el-form-item>
                        </el-col>  
                        <el-col :span="12" >
                            <el-form-item label="美国编号：" prop="usaCode">
                                <el-input v-model="editForm.usaCode" placeholder="请输入美国编号"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col :span="12">
                            <el-form-item label="替用料：" prop="loaner">
                                <el-input v-model="editForm.loaner" placeholder="请输入替用料"></el-input>
                            </el-form-item>
                        </el-col>
                        

                    </el-row>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editVisible = false">取 消</el-button>
                <el-button type="primary" @click="saveEdit('editForm')">确认</el-button>
            </span>
        </el-dialog>

        <!-- 图片弹出框 -->
        <el-dialog title="物料图片" :before-close="partClose" :visible.sync="editImgVisible" width="50vw" :modal-append-to-body="false">
            <el-form ref="editImgForm" id="editImgForm" :model="editImgForm" :rules="rules" label-width="100px" class="demo-ruleForm">
                <el-upload action="http://wms.lyccco.com/erpv9/upimg/upimg" :file-list="editImgForm.fileList" :data="editImgForm" list-type="picture-card" :on-preview="handlePictureCardPreview" :on-remove="handleRemove">
                    <i class="el-icon-plus"></i>
                </el-upload>
                <el-dialog :visible.sync="dialogImgVisible" :modal-append-to-body="true" :append-to-body="true">
                    <img width="100%" :src="dialogImageUrl" alt="">
                </el-dialog>
                
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editImgVisible = false">取 消</el-button>
                <!-- <el-button type="primary" @click="saveEdit('editForm')">确认</el-button> -->
            </span>
        </el-dialog>

        <!-- 增加物料弹出框 -->
        <el-dialog title="物料增加" id="boxadd" align='center' :before-close="partClose" :visible.sync="addVisible" width="50vw">
            <el-form :model="ADDform" :rules="rules" id = "ADDform" ref="ADDform" label-width="100px" class="demo-ruleForm">

                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 物料信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="编 号：" prop="number">
                                <el-input v-model="ADDform.number" placeholder="请输入物料编号"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="物料描述：" prop="name">
                                <el-input v-model="ADDform.name" placeholder="请输入物料描述"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="品 牌：" prop="brand">
                                <el-input v-model="ADDform.brand" placeholder="请输入品牌"></el-input>
                            </el-form-item>
                        </el-col>   
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="where use：" prop="whereuse">
                                <el-input v-model="ADDform.whereuse" placeholder="请输入用于哪里"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="供应商：" prop="contactID">
                                <el-cascader v-model="ADDform.contactID" :options="clientOptions" clearable :show-all-levels="false" @change="clientIdChange" placeholder="搜索：客户名称" filterable  style="width:98%">
                                    <template slot-scope="{ node, data }">
                                        <span>{{ data.label }}</span>
                                        <span v-if="!node.isLeaf" > ({{ data.children.length }}) </span>
                                    </template>
                                </el-cascader>
                            </el-form-item> 
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="计量单位：" prop="unitId">
                                <el-select v-model="ADDform.unitId" @change="unitChange" placeholder="请选择计量单位" style="width:98%">
                                    <el-option v-for="unitArr in unitOptions" :key="unitArr.value" :label="unitArr.label" :value="unitArr.value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="首选仓库：" prop="locationId">
                                <el-select v-model="ADDform.locationId" placeholder="请选择首选仓库"  @change="locationChange" style="width:98%">
                                    <el-option v-for="locationArr in locationOptions" :key="locationArr.value" :label="locationArr.label" :value="locationArr.value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="类 别：" prop="categoryId" >
                                <el-select v-model="ADDform.categoryId" placeholder="请选择类别"  @change="categoryChange" style="width:98%">
                                    <el-option v-for="typeArr in options" :key="typeArr.value" :label="typeArr.label" :value="typeArr.value"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>                
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="最低预警值：" prop="minNum">
                                <el-input-number v-model="ADDform.minNum" :precision="3" :controls="false" :min="0.001" placeholder="请输入最低预警值" style="width:180px;"></el-input-number>
                            </el-form-item>
                        </el-col>  
                        <el-col :span="12" class="list_unit b_b">
                            <el-form-item label="单 量：" prop="pieceQty">
                                <el-input v-model="ADDform.pieceQty" placeholder="请输入每个单位数量"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" class="list_unit b_b">
                            <el-form-item label="交 期(天)：" prop="cycle">
                                <el-input-number v-model="ADDform.cycle" :controls="false" placeholder="请输入交付周期" style="width:180px;"></el-input-number>
                            </el-form-item>
                        </el-col> 
                        <el-col :span="12" class="list_unit b_b" style="padding-bottom:1px;">
                            <el-form-item label="是否溯源：" prop="traceability">
                                <el-radio style="padding-left:16px;" v-model="ADDform.traceability" label="1">是</el-radio>
                                <el-radio v-model="ADDform.traceability" label="2">否</el-radio>
                            </el-form-item>
                        </el-col>             
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="零售价(不含税)：" prop="salePriceno">
                                <el-input-number v-model="ADDform.salePriceno" :precision="3" :controls="false" :min="0.001" placeholder="请输入不含税零售价" style="width:98%"></el-input-number>
                            </el-form-item>
                        </el-col>                
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="零售价(含税)：" prop="salePrice">
                                <el-input-number v-model="ADDform.salePrice" :precision="3" :controls="false" :min="0.001" placeholder="请输入含税零售价" style="width:98%"></el-input-number>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="规格型号：" prop="spec">
                                <el-input v-model="ADDform.spec" placeholder="请输入规格型号"></el-input>
                            </el-form-item>
                        </el-col>     
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="厂家编码：" prop="contactCode">
                                <el-input v-model="ADDform.contactCode" placeholder="请输入厂家编码"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col :span="12" >
                            <el-form-item label="美国编号：" prop="usaCode">
                                <el-input v-model="ADDform.usaCode" placeholder="请输入美国编号"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col :span="12" >
                            <el-form-item label="替用料：" prop="loaner">
                                <el-input v-model="ADDform.loaner" placeholder="请输入替用料"></el-input>
                            </el-form-item>
                        </el-col>

                    </el-row>
                </el-row>


            </el-form>                
                <div style="text-align:right;padding-top:20px;">
                    <el-button type="primary" @click="addPart('ADDform')">立即创建</el-button>
                </div>
        </el-dialog>
    </div>
</template>

<script>
import qs from 'qs';
import { addPart,eidtPart,delPart,selectGoods,generateTree,unitTree,locationTree,delImg} from '../../api/goods';
import { seaContact } from '../../api/index';
export default {
    name: 'basetable',
    data() {
        return {
            q:'',
            pageIndex: 1,
            pageSizes: [20,50,100,200,500],
            pageSize: 20,
            pageTotal: 0,
            categoryIdArr: [],
            userPower: [],
            categoryId:0,
            options: [], 
            locationOptions: [],      
            ADDform: {},
            typeData: [],      
            clientOptions: [],  
            unitOptions: [], 
            tableData: [],
            multipleSelection: [],
            delList: [],
            editForm: {},
            editImgForm: {},
            dialogImageUrl: '',
            loading: true,
            addVisible: false,
            editVisible: false,
            editImgVisible: false,
            dialogImgVisible: false,
            rules: {
                number: [
                    { required: true, message: '请输入物料编号', trigger: 'blur' },
                    { min: 6, max: 30, message: '长度在 6 到 30 个字符', trigger: 'blur' }
                ],
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 60, message: '长度在 1 到 60 个字符', trigger: 'blur' }
                ],
                contactID: [
                    { required: true, message: '请选择供应商', trigger: 'blur' }
                ],
                contactaa: [
                    { required: true, message: '请选择供应商', trigger: 'blur' }
                ],            
                unitId: [
                    { required: true, message: '请选择计量单位', trigger: 'blur' }
                ],               
                categoryId: [
                    { required: true, message: '请选择类别', trigger: 'blur' }
                ],                
                minNum: [
                    { required: true, message: '请输入最低预警值', trigger: 'blur' }
                ],                 
                brand: [
                    { required: true, message: '请输入品牌', trigger: 'blur' }
                ],     
                traceability: [
                    { required: true, message: '请选择是否溯源', trigger: 'blur' }
                ],     
                locationId: [
                    { required: true, message: '请选择首选仓库', trigger: 'blur' }
                ],     
                whereuse: [
                    { required: true, message: '请输入用于哪里', trigger: 'blur' }
                ],     
                cycle: [
                    { required: true, message: '请输入交付周期', trigger: 'blur' }
                ],     
                pieceQty: [
                    { required: true, message: '请输入每个单位数量', trigger: 'blur' }
                ]
            }
        };
    },
    created() {
        this.getData();

        // 获取物料分类数据
        this.getCategory();

        // 获取供应商数据
        this.getContactData();

        // 获取单位数据
        this.getUnitData();

        // 获取仓库数据
        this.getLocationData();

        // 获取用户权限
        this.userPower = sessionStorage.getItem('userPower').split(',');
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
        }
    },   
    methods: {
        
        // 获取 easy-mock 的模拟数据
        getData() {
            let self = this;
            selectGoods({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                categoryId:self.categoryId,
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
        // 获取供应商数据
        getContactData(){
            let self = this;
            seaContact({  
                typeNumber:'supplytype',
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.clientOptions = res.rec;
                } else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        }, 
        // 获取单位数据
        getUnitData() {
            let self = this;
            unitTree().then(res => { 
                if(res.code == "00"){
                    self.unitOptions = res.tree;
                } else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });            
        },
        // 获取仓库数据
        async getLocationData() {
            let self = this;
            await locationTree().then(res => { 
                if(res.code == "00"){
                    this.loading = false;
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
        getCategory() {
            let self = this;
            generateTree().then(res => { 
                if(res.code == "00"){
                    self.options = res.tree;
                } else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },    
        clientIdChange(value) {
            let self = this;
            if(value){
                self.ADDform.contactID = value[value.length-1];
            }else{
                return false;
            }
            var vals=self.getCascaderObj(value, self.clientOptions,);
            if(vals.length>0){
                vals.forEach((v)=>{
                    if(v.value==value[value.length-1]){
                        self.ADDform.contactName = v.label;
                    }
                })
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
        // 增加操作
        handleADD() {
            let self = this;
            self.addVisible = true;
        },
        addPart(formName) {
            let self = this;
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    addPart(self.ADDform).then(res => {
                        if(res.code == "00"){
                            self.getData();
                            self.addVisible = false;
                            self.ADDform = {};
                            self.$message.success('增加成功');
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
            self.editForm= {};
            self.addVisible = false;  
            self.editVisible = false;      
            done();          
        },
        categoryIdChange(value) {
            let self = this;
            self.categoryId = value[value.length-1];
            self.getData();
        },
        unitChange(value) {
            let self = this;
            self.ADDform.unitId =value;
            for(var i in self.unitOptions) { 
                if(self.unitOptions[i].value == value) { 
                    self.ADDform.unitName = self.unitOptions[i].label;
                    break; 
                } 
            }  
        },
        categoryChange(value) {
            let self = this;
            self.ADDform.categoryId =value;
            for(var i in self.options) { 
                if(self.options[i].value == value) { 
                    self.ADDform.categoryName = self.options[i].label;
                    break; 
                } 
            }  
        },
        locationChange(value) {
            let self = this;
            self.ADDform.locationId =value;
            for(var i in self.locationOptions) { 
                if(self.locationOptions[i].value == value) { 
                    self.ADDform.locationName = self.locationOptions[i].label;
                    break; 
                } 
            }  
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
            const length = this.multipleSelection.length;
            if(length<1){
                self.$message.warning('请勾选需要删除的选项！');
            }else{

                let str = '';
                var idArr = [];
                self.delList = self.delList.concat(self.multipleSelection);
                for (let i = 0; i < length; i++) {
                    str += self.multipleSelection[i].name + ' ';
                    idArr[idArr.length] = self.multipleSelection[i].id;
                }
                delPart({
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
        // 编辑操作
        handleEdit(index, row) {   
            let self = this; 
            self.editForm = row;
            self.editForm.traceability = ''+row.traceability;
            console.log(self.editForm)
            // self.editForm.traceability = 1;
            self.queryCCategory(self.editForm.contactID) 
            self.editVisible = true;
        },
        // 图片编辑操作
        imgEdit(index, row) {   
            let self = this; 
            self.editImgForm = row;
            self.editImgVisible = true;
        },
        queryCCategory(value) { 
            let self = this;
            if(Array.isArray(value)){
                self.editForm.contactID = value[value.length-1];
                self.editForm.contactArr = value;
            }
            let typeNo = ''; 
            for (let i = 0; i < self.clientOptions.length; i++) {
                for (let j = 0; j < self.clientOptions[i].children.length; j++) {
                    if ( self.clientOptions[i].children[j].value == self.editForm.contactID) {
                        typeNo = self.clientOptions[i].value;
                        break;
                    }
                }
            }
            if(typeNo){
                self.editForm.contactArr = [typeNo, String(self.editForm.contactID)];

                var vals=self.getCascaderObj(self.editForm.contactArr , self.clientOptions,);
                if(vals.length>0){
                    vals.forEach((v)=>{
                        if(v.value==value[value.length-1]){
                            self.editForm.contactName = v.label;
                        }
                    })
                }
            }else{
                self.editForm.contactID = '';  
            }

        },
        // 保存编辑
        saveEdit(formName) {
            let self = this;
            console.log(self.editForm.contactArr);
            self.$refs[formName].validate((valid) => {
                if (valid) {

                    console.log(self.editForm);
                    eidtPart(self.editForm).then(res => {
                        if(res.code == "00"){
                            self.getData();
                            self.$message.success('修改成功');
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

                self.editVisible = false;
                self.ADDform = {};
            });

        },
        // 分页导航
        handlePageChange(val) {
            let self = this;
            self.pageIndex = val;
            this.getData();
        },
        handleSizeChange(val) {
            let self = this;
            self.pageSize = val;
            this.getData();
        },

        // 图片删除
        handleRemove(file, fileList) {
            let self = this;
            delImg({  
                url: file.url
            }).then(res => { 
                if(res.code == "00"){                   
                    self.$message.success('删除成功');
                } else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },

        // 图片放大
        handlePictureCardPreview(file) {
            let self = this;
            self.dialogImageUrl = file.url;
            self.dialogImgVisible = true;        
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
                            obj.goodsName = v.物料描述
                            obj.brand = v.品牌
                            obj.whereuse = v.whereUse
                            obj.contactName = v.供应商  
                            obj.unitName = v.计量单位                            
                            obj.cycle = v.交期                           
                            obj.spec = v.规格型号              
                            obj.contactCode = v.厂家编码
                            switch(v.零件编号.substring(0,2)){
                                case '01':
                                    obj.categoryName = '01- Machining part(机械加工件)';
                                    break;
                                case '02':
                                    obj.categoryName =  '02- Switch/Circuit Breaker Switc安全设备类（断路器、熔断器等';
                                    break;
                                case '03':
                                    obj.categoryName =  '03 - 端子连接类';
                                    break;
                                case '04':
                                    obj.categoryName =  '04 - connector/ Relay 接触器、中间继电器';
                                    break;
                                case '05':
                                    obj.categoryName =  '05 - 电磁阀类';
                                    break;
                                case '06':
                                    obj.categoryName =  '06 - 电线、电缆类';
                                    break;
                                case '07':
                                    obj.categoryName =  '07- 检测开关、变送器、仪表类';
                                    break;
                                case '08':
                                    obj.categoryName =  '08- Transformer,Rectifier, Power supply 变压器、整流器';
                                    break;
                                case '09':
                                    obj.categoryName =  '09- Pump、Fan 泵、电机类、排风扇';
                                    break;
                                case '10':
                                    obj.categoryName =  '10- 温度类（加热器、开关、控制器、热电偶等）';
                                    break;
                                case '11':
                                    obj.categoryName =  '11- 按钮指示灯类';
                                    break;
                                case '12':
                                    obj.categoryName =  '12- PLC类';
                                    break;
                                case '13':
                                    obj.categoryName =  '13- PVC管材、管件、接头';
                                    break;
                                case '14':
                                    obj.categoryName =  '14- 阀门';
                                    break;
                                case '15':
                                    obj.categoryName =  '15- 不锈钢管、接头';
                                    break;
                                case '16':
                                    obj.categoryName =  '16- 包装材料';
                                    break;
                                case '17':
                                    obj.categoryName =  '17- 螺丝';
                                    break;
                                case '18':
                                    obj.categoryName =  '18- 快换接头';
                                    break;
                                case '19':
                                    obj.categoryName =  '19- PP接头';
                                    break;
                                case '20':
                                    obj.categoryName =  '20- 流量计';
                                    break;
                                case '21':
                                    obj.categoryName =  '21- 过滤器、真空泵';
                                    break;
                                case '22':
                                    obj.categoryName =  '22-其他';
                                    break;
                                case '23':
                                    obj.categoryName =  '23 - 吸附剂';
                                    break;
                            }                   
                            arr.push(obj)
                        })
                        console.log(arr)

                    if(outdata.length>0){
                        self.$axios.post('http://wms.lyccco.com/erpv9/Part/test', qs.stringify({
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
                            self.$message.error('操作失败请检查数据是否准确！');
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
        exportTable() {
            require.ensure([], () => {
                const { export_json_to_excel } = require('../../excel/Export2Excel');
                const tHeader = ['零件编号','物料描述','品牌','供应商','计量单位','规格型号','厂家编码'];
                const filterVal = ['number','name','brand','contactName','unitName','spec','contactCode'];
                const list = this.tableData;
                const data = this.formatJson(filterVal, list);
                export_json_to_excel(tHeader, data, '物料列表');
            })
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => v[j]))
        } ,
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
        editForm(){            
        }, 
        tableData(){            
        } 
    }

};
</script>
<style>
#box .el-dialog__header{
    padding-top:18px;
    margin-bottom: -30px;
}
#boxadd .el-dialog__header{
    padding-top:18px;
    margin-bottom: -30px;
}
#box .el-form-item__label{
    font-size: 10px;
    padding: 0;
}
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
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
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
