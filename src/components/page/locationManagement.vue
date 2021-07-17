<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 仓库管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button v-if="userPower.indexOf('9001')>-1" type="danger" icon="el-icon-delete" class="handle-del mr10" @click="delAllSelection">批量删除</el-button>
                <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button v-if="userPower.indexOf('9000')>-1"  type="success" icon="el-icon-plus" @click="handleADD">增加仓库</el-button>
            </div>
            <el-table :data="tableData" border style="font-size:10px" stripe class="table" ref="multipleTable" header-cell-class-name="table-header" :show-header='true' @selection-change="handleSelectionChange" height="63vh">
                <el-table-column type="selection" width="50" align="center"></el-table-column>
                <el-table-column prop="locationNo" label="仓库编号" width="80"  :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="name" label="仓库名称" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="disable" label="状态" align="center" width="70" >
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.disable==0?'success':(scope.row.disable==0?'danger':'danger')">{{scope.row.disable===0?'正常':'锁定'}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="60" align="center" v-if="userPower.indexOf('9002')>-1" >
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
        <el-dialog title="仓库信息编辑" align='center'  :before-close="partClose" :visible.sync="editVisible" width="30vw">
            <el-form ref="editForm" id="editForm" :model="editForm" :rules="rules" label-width="100px" class="demo-ruleForm">
                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 仓库信息</div><el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b">
                            <el-form-item label="仓库编号：" prop="locationNo">
                                <el-input v-model="editForm.locationNo" placeholder="请输入仓库编号"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" >
                            <el-form-item label="名称：" prop="name">
                                <el-input v-model="editForm.name" placeholder="请输入仓库名称"></el-input>
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
        <el-dialog title="增加仓库信息" align='center' :before-close="partClose" :visible.sync="addVisible" width="30vw">
            <el-form :model="ADDform" :rules="rules" id = "ADDform" ref="ADDform" label-width="100px" class="demo-ruleForm">

                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 仓库信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col class="list_unit b_b">
                            <el-form-item label="仓库编号：" prop="locationNo">
                                <el-input v-model="ADDform.locationNo" placeholder="请输入仓库编号"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col class="list_unit b_b" >
                            <el-form-item label="名称：" prop="name">
                                <el-input v-model="ADDform.name" placeholder="请输入仓库名称"></el-input>
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
import { locationAllList,addLocation,editLocation,delLocation} from '../../api/subsidiary';
export default {
    name: 'Cselect',
    data() {
        return {
            q:'',
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            options: [],      
            ADDform: {},     
            tableData: [],
            userPower: [],
            multipleSelection: [],
            delList: [],
            editVisible: false,
            editForm: {},
            addVisible: false,
            rules: {
                name: [
                    { required: true, message: '请输入仓库编号', trigger: 'blur' }
                ],                
                locationNo: [
                    { required: true, message: '请输入仓库名称', trigger: 'blur' }
                ]
            }
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
            locationAllList({  
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
            self.addVisible = true;
        },
        addContact(formName) {
            let self = this;
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    addLocation(self.ADDform).then(res => {
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
                delLocation({
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
            self.editVisible = true;
        },
        // 保存编辑
        saveEdit(formName) {
            let self = this;
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    editLocation(self.editForm).then(res => {
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
