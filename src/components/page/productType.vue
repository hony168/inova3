<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 商品类别管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="success" icon="el-icon-plus" @click="handleADD">增加商品类别</el-button>
            </div>

            <el-table :data="options" style="font-size:10px;" row-key="value" border :tree-props="{children: 'children', hasChildren: 'hasChildren'}">
                <el-table-column prop="" label="名称">                    
                    <template slot-scope="scope"> {{scope.row.label}}
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="120" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button type="text" style="color:#ff0000;" icon="el-icon-delete" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
        </div>
        <!-- 编辑弹出框 -->
        <el-dialog title="编辑商品类别" align='center' :before-close="partClose" :visible.sync="editVisible" width="30vw">
            <el-form ref="editForm" id="editForm" :model="editForm" :rules="rules" label-width="100px" class="demo-ruleForm">
                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 商品类别信息</div><el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b">
                            <el-form-item label="类别：">
                                <el-cascader v-model="editForm.path" :options="options" clearable :props="{ expandTrigger: 'hover',checkStrictly: true }" @change="categoryIdEditChange" style="width:98%;" placeholder="类目不选择，默认为一级目录" filterable></el-cascader>
                            </el-form-item>
                        </el-col>    
                        <el-col class="list_unit b_b" >
                            <el-form-item label="名称：" prop="label">
                                <el-input v-model="editForm.label" placeholder="请输入商品类别名称"></el-input>
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
        <el-dialog title="商品类别增加" align='center' :before-close="partClose" :visible.sync="addVisible" width="30vw">
            <el-form :model="ADDform" :rules="rules" id = "ADDform" ref="ADDform" label-width="100px" class="demo-ruleForm">

                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 商品类别信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b" >
                            <el-form-item label="类别：">
                                <el-cascader v-model="categoryIdArr" :options="options" clearable :props="{ expandTrigger: 'hover',checkStrictly: true }" @change="categoryIdAddChange" style="width:98%;" placeholder="类目不选择，默认为一级目录" filterable></el-cascader>
                            </el-form-item>
                        </el-col> 
                        <el-col class="list_unit b_b" >
                            <el-form-item label="名称：" prop="name">
                                <el-input v-model="ADDform.name" placeholder="请输入商品类别名称"></el-input>
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
import { addClientOrContact,editClientOrContact,delTradeClass} from '../../api/subsidiary';
import { generateTree} from '../../api/goods';
export default {
    name: 'Cselect',
    data() {
        return {
            q:'',
            options: [], 
            categoryIdArr: [],      
            ADDform: {},    
            delList: [],
            editVisible: false,
            editForm: {},
            addVisible: false,
            rules: {
                name: [
                    { required: true, message: '请输入商品类别名称', trigger: 'blur' }
                ],
                label: [
                    { required: true, message: '请输入商品类别名称', trigger: 'blur' }
                ]
            }    
        };
    },
    created() {
        // 获取物料分类数据
        this.getCategory();
    },  
    methods: {     
        
        // 获取商品分类数据
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
        // 增加操作
        handleADD() {
            let self = this;
            self.addVisible = true;
        },
        addContact(formName) {
            let self = this;
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    self.ADDform.typeNumber = 'trade';
                    addClientOrContact(self.ADDform).then(res => {
                        if(res.code == "00"){
                            self.getCategory();
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
        // 触发搜索按钮
        handleSearch() {            
            let self = this;
            self.getCategory();
        },
        handleDel(index, row) {
            const self = this;
            if(row.children){
                self.$message.warning('分类下有子级，请先删除子级');
                return false;
            }
            delTradeClass({
                'id':row.value
            }).then(res => {
                if(res.code == "00"){
                    self.getCategory();
                    self.$message.error('删除了'+row.label);
                } else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('数据处理失败，请检查数据是否正确。');                            
                return false;
            });                
        },
        categoryIdAddChange(value) {
            let self = this;
            if(Array.isArray(value)){
                self.ADDform.categoryId = value[value.length-1];
                self.ADDform.level = value.length+1;
                self.ADDform.path = value.toString();
            }
        },
        categoryIdEditChange(value) {
            let self = this;
            if(Array.isArray(value)){
                self.editForm.categoryId = value[value.length-1];
                self.editForm.level = value.length+1;
                self.editForm.path = value.toString();
            }
        },
        // 编辑操作
        handleEdit(index, row) {   
            let self = this; 
            self.editForm = row;
            self.editForm.path= row.path.split(',').map(Number);
            self.editVisible = true;
        },
        // 保存编辑
        saveEdit(formName) {
            let self = this;
            if(Array.isArray(self.editForm.path)){
                self.editForm.path = self.editForm.path.toString();
            }
            self.editForm.id=self.editForm.value;
            self.editForm.name=self.editForm.label;
            self.editForm.typeNumber = 'trade';
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    self.editForm.typeNumber='trade';
                    editClientOrContact(self.editForm).then(res => {
                        if(res.code == "00"){
                            self.getCategory();
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
