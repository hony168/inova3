<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 客户管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button  v-if="userPower.indexOf('8001')>-1" type="danger" icon="el-icon-delete" class="handle-del mr10" @click="delAllSelection">批量删除</el-button>
                <el-cascader v-model="categoryIdArr" :options="options" clearable @change="categoryIdChange" class="handle-input mr10" placeholder="试试搜索：类别名称" filterable></el-cascader>
                <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button v-if="userPower.indexOf('8000')>-1" type="success" icon="el-icon-plus" @click="handleADD">增加客户</el-button>
            </div>
            <el-table :data="tableData" border style="font-size:10px" stripe class="table" ref="multipleTable" header-cell-class-name="table-header" :show-header='true' @selection-change="handleSelectionChange" height="63vh">
                <el-table-column type="selection" width="50" align="center"></el-table-column>
                <el-table-column prop="cCategoryName" label="所属类别" width="120" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="id" label="客户ID" width="80"  :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="name" label="客户名称" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="linkName" label="联系人" width="80" align="center"></el-table-column>
                <el-table-column prop="linkMobile" label="联系电话" width="100" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="place" label="联系人职务" width="80" align="center" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="email" label="邮箱(Email)" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="contactCode" label="公司地址" width="300" :show-overflow-tooltip="true">
                     <template slot-scope="scope">
                        {{scope.row.prov}} - {{scope.row.city}} - {{scope.row.district}} - {{scope.row.address}}
                    </template>
                </el-table-column>
                <el-table-column prop="bankNo" :show-overflow-tooltip="true" label="银行账号"></el-table-column>
                <el-table-column prop="depositBank" :show-overflow-tooltip="true" label="开户行" ></el-table-column>
                <el-table-column prop="remark" :show-overflow-tooltip="true" label="备注"></el-table-column>
                <el-table-column label="操作" width="60" align="center" v-if="userPower.indexOf('8002')>-1" >
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>


        <!-- 编辑弹出框 -->
        <el-dialog title="客户编辑" align='center' :before-close="partClose" :visible.sync="editVisible" width="50vw">
            <el-form ref="editForm" id="editForm" :model="editForm" :rules="rules" label-width="100px" class="demo-ruleForm">
                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 客户信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="名称：" prop="name">
                                <el-input v-model="editForm.name" placeholder="请输入客户名称"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="所属类别：" prop="cCategory">
                                <el-cascader v-model="editForm.cCategory" :options="options" clearable @change="categortyChange" class="handle-input mr10" placeholder="试试搜索：类别名称" filterable></el-cascader>
                            </el-form-item> 
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="联系人：" prop="linkName">
                                <el-input v-model="editForm.linkName" placeholder="请输入联系人姓名"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="联系电话：" prop="linkMobile">
                                <el-input v-model="editForm.linkMobile" placeholder="请输入联系电话"></el-input>
                            </el-form-item>
                        </el-col>           
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="联系人职务：" prop="place">
                                <el-input v-model="editForm.place" placeholder="请输入联系人职务"></el-input>
                            </el-form-item>
                        </el-col>  
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="邮 箱：" prop="email">
                                <el-input v-model="editForm.email" placeholder="请输入邮箱"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="银行账号：" prop="bankNo">
                                <el-input v-model="editForm.bankNo" placeholder="请输入银行账号"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="开户行：" prop="depositBank">
                                <el-input v-model="editForm.depositBank" placeholder="请输入开户行"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="24">
                            <el-form-item label="地 址：" prop="minNum">
                                <el-select v-model="prov" style="width:167px;margin-right: 25px;">
                                    <el-option v-for="option in arr" :value="option.name">{{ option.name }}</el-option>
                                </el-select>
                                <el-select v-model="city" style="width:167px;margin-right: 25px;">
                                    <el-option v-for="option in cityArr" :value="option.name">{{ option.name }}</el-option>
                                </el-select>
                                <el-select v-model="district" v-if="district" style="width:167px;">
                                    <el-option v-for="option in districtArr" :value="option.name">{{ option.name }}</el-option>
                                </el-select>
                                <el-input v-model="editForm.address" placeholder="请输入详细地址" style="width:98%"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" style="padding-top:15px;" :span="24">
                            <el-form-item label="备 注：" prop="remark">
                                <el-input v-model="editForm.remark" type="textarea" :rows="2" placeholder="请输入备注" style="width:99%;"></el-input>
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

        <!-- 增加物料弹出框 -->
        <el-dialog title="客户增加" align='center' :before-close="partClose" :visible.sync="addVisible" width="50vw">
            <el-form :model="ADDform" :rules="rules" id = "ADDform" ref="ADDform" label-width="100px" class="demo-ruleForm">

                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 客户信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="名称：" prop="name">
                                <el-input v-model="ADDform.name" placeholder="请输入客户名称"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="所属类别：" prop="cCategory">
                                <el-cascader v-model="ADDform.cCategory" :options="options" clearable @change="categortyChange" class="handle-input mr10" placeholder="试试搜索：类别名称" filterable></el-cascader>
                            </el-form-item> 
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="联系人：" prop="linkName">
                                <el-input v-model="ADDform.linkName" placeholder="请输入联系人姓名"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="联系电话：" prop="linkMobile">
                                <el-input v-model="ADDform.linkMobile" placeholder="请输入联系电话"></el-input>
                            </el-form-item>
                        </el-col>           
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="联系人职务：" prop="place">
                                <el-input v-model="ADDform.place" placeholder="请输入联系人职务"></el-input>
                            </el-form-item>
                        </el-col>  
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="邮 箱：" prop="email">
                                <el-input v-model="ADDform.email" placeholder="请输入邮箱"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="银行账号：" prop="bankNo">
                                <el-input v-model="ADDform.bankNo" placeholder="请输入银行账号"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="12">
                            <el-form-item label="开户行：" prop="depositBank">
                                <el-input v-model="ADDform.depositBank" placeholder="请输入开户行"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" :span="24">
                            <el-form-item label="地 址：" prop="minNum">
                                <el-select v-model="prov" style="width:167px;margin-right: 25px;">
                                    <el-option v-for="option in arr" :value="option.name">{{ option.name }}</el-option>
                                </el-select>
                                <el-select v-model="city" style="width:167px;margin-right: 25px;">
                                    <el-option v-for="option in cityArr" :value="option.name">{{ option.name }}</el-option>
                                </el-select>
                                <el-select v-model="district" v-if="district" style="width:167px;">
                                    <el-option v-for="option in districtArr" :value="option.name">{{ option.name }}</el-option>
                                </el-select>
                                <el-input v-model="ADDform.address" placeholder="请输入详细地址" style="width:98%"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" style="padding-top:15px;" :span="24">
                            <el-form-item label="备 注：" prop="remark">
                                <el-input v-model="ADDform.remark" type="textarea" :rows="2" placeholder="请输入备注" style="width:99%;"></el-input>
                            </el-form-item>
                        </el-col> 
                    </el-row>
                </el-row>


            </el-form>                
                <div style="text-align:right;padding-top:20px;">
                    <el-button type="primary" @click="addContact('ADDform')">立即创建</el-button>
                </div>
        </el-dialog>
    </div>
</template>

<script>
import area from '../../api/area.js';
import { seaSupplierInfo,contactClassify,contactAllList,addContact,eidtContact,delContact} from '../../api/contact';
export default {
    name: 'Cselect',
    data() {
        return {
            q:'',
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            categoryIdArr: [],
            categoryId:0,
            options: [],      
            ADDform: {},     
            tableData: [],
            multipleSelection: [],
            delList: [],
            editVisible: false,
            editForm: {},
            addVisible: false,
            rules: {
                name: [
                    { required: true, message: '请输入名称', trigger: 'blur' },
                    { min: 1, max: 60, message: '长度在 1 到 60 个字符', trigger: 'blur' }
                ],               
                linkName: [
                    { required: true, message: '请输入联系人姓名', trigger: 'blur' }
                ], 
                cCategory: [
                    { required: true, message: '请选择类别', trigger: 'blur' }
                ],
            },
            arr: area.arrAll,
            prov: '',
            city: '',
            district: '',
            cityArr: [],
            districtArr: [],
            userPower: []
        };
    },
    created() {
        this.getData();

        // 客户分类数据
        this.getCategory();
        // 获取用户权限
        this.userPower = sessionStorage.getItem('userPower').split(',');
    },  
    methods: {
        
        // 获取 easy-mock 的模拟数据
        getData() {
            let self = this;
            contactAllList({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                categoryId:self.categoryId,
                type:1,
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
        // 获取 客户分类数据
        getCategory() {
            let self = this;
            contactClassify({
                typeNumber:'customertype',
            }).then(res => { 
                if(res.code == "00"){
                    self.options = res.rec;
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
            self.addVisible = true;
        },
        addContact(formName) {
            let self = this;
            self.ADDform.prov=self.prov;
            self.ADDform.city=self.city;
            self.ADDform.district=self.district;
            self.ADDform.type=1;//类型 1为客户  2为供应商
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    addContact(self.ADDform).then(res => {
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
        },
        categortyChange(value) {
            let self = this;
            if(value){
                self.ADDform.cCategory = value[value.length-1];
            }else{
                return false;
            }
            for(var i in self.options) { 
                if(self.options[i].value == value) { 
                    self.ADDform.cCategoryName = self.options[i].label;
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
                delContact({
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
            self.prov = row.prov;
            self.city = row.city;
            self.prov = row.prov;
            self.editVisible = true;
        },
        // 保存编辑
        saveEdit(formName) {
            let self = this;
            if(Array.isArray(self.editForm.cCategory)){
                self.editForm.cCategory = self.editForm.cCategory[0];
            }
            self.editForm.prov=self.prov;
            self.editForm.city=self.city;
            self.editForm.district=self.district;
            self.editForm.type=1;//类型 1为客户  2为供应商
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    eidtContact(self.editForm).then(res => {
                        if(res.code == "00"){
                            self.getData();
                            self.$message.success('修改成功');
                        } else {
                            self.$message.warning('暂无数据修改');
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
        updateCity() {
            for (var i in this.arr) {
                var obj = this.arr[i];
                if (obj.name) {
                    if (obj.name == this.prov) {
                        this.cityArr = obj.sub;
                        break;
                    }
                }
            }
            this.city = this.cityArr[1].name;
        },
        updateDistrict() {
            for (var i in this.cityArr) {
                var obj = this.cityArr[i];
                if (obj.name == this.city) {
                    this.districtArr = obj.sub;
                    break;
                }
            }
            if (this.districtArr && this.districtArr.length > 0 && this.districtArr[1].name) {
                this.district = this.districtArr[1].name;
            } else {
                this.district = '';
            }
        },
        beforeMount() {
            this.updateCity();
            this.updateDistrict();
        },
    },
    watch: {
        editForm(){            
        },
        prov() {
            this.updateCity();
            this.updateDistrict();
        },
        city() {
            this.updateDistrict();
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
.table-td-thumb {
    display: block;
    margin: auto;
    width: 40px;
    height: 40px;
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
