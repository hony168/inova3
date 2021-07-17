<template>
    <div class="table" v-loading="loading" :element-loading-text="loadingcontent" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        
        <div class="container">               
            <div class="handle-box">物料分类</div>

            <el-row :gutter="20">
                <el-col :span="4">
                    <el-card class="box-card"  style="text-align:center;">
                        <el-button class="addType" plain @click="handleADD">
                            <i class="el-icon-plus icon_style"></i>
                            <div class="type_title">新建分类</div>
                        </el-button>                            
                    </el-card>
                </el-col>


                <el-col :span="4" v-for="(psort,index) in tableData">
                    
                    
                    <div class="grid-content bg-purple "  @mouseover="mouseover(index)" @mouseleave="mouseLeave(index)" :style="active">
                        <div style="width:100%;height:0px; position:relative;top:6px;right:5px;text-align:right;display:none;" ref="acp" @click="delBox(psort.S_id)">
                            <i class="el-icon-circle-close"></i>
                        </div>
                        <div @click="selectMacTypeList(psort.S_id,psort.S_title)">
                        <el-card class="box-card">
                            <div class="model_name">{{ psort.S_title }}</div>
                            <div class="model_num">物料种类：{{psort.macTypeList.length}}个</div>
                            <div style="display: -webkit-flex;display: flex;flex-wrap:wrap;justify-content: space-between ">
                                <div v-for="imgData in psort.macTypeList" :key="o" class="text item">
                                    <img :src="imgData.M_img" style="width:100%; object-fit: cover;" />
                                </div>
                            </div>
                        </el-card>  
                        </div>                      
                    </div>       
                </el-col>
            </el-row>           
        </div> 

        <!-- 增加弹出框 -->
        <el-dialog align='center' :visible.sync="addVisible">
            <el-form :model="ADDform" :rules="rules" id = "ADDform" ref="ADDform" label-width="100px" class="demo-ruleForm">

                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 设备分类信息</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="24" class="list_unit b_b">
                            <el-form-item label="分类名称：" prop="S_title">
                                <el-input v-model="ADDform.S_title" placeholder="请输入设备分类名称"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="24" class="list_unit b_b">
                              <el-form-item label="English name：" prop="S_entitle" required>
                                <el-input placeholder="Please enter device classification name" v-model="ADDform.S_entitle"></el-input>
                              </el-form-item> 
                        </el-col>
                        <el-col :span="24" class="list_unit b_b">
                            <el-form-item label="是否可见：" prop="S_show">
                                <el-select v-model="ADDform.S_show" placeholder="请选择是否可见">
                                    <el-option label="可见"  value="1"></el-option>
                                    <el-option label="不可见"  value="2"></el-option>
                                </el-select>                                
                            </el-form-item>
                        </el-col>                 
                    </el-row> 
                </el-row>
            </el-form>                
            <div style="text-align:right;padding-top:20px;">
                <el-button type="primary" @click="addMacPsort('ADDform')">立即创建</el-button>
                <el-button @click="resetAddMacpsort('ADDform')">重置</el-button>
            </div>
        </el-dialog>        
    </div>
</template>

<script>
import { AddMacPsort,DelMacPsort,EditMacPsort,selectMacPsort,selectMacType} from '../../api/index';
    export default {
        data() {
            return {              
                loading:false,  
                addVisible: false,
                ADDform: {
                    S_id:'',
                    S_entitle:'',
                    S_show:''
                },
                tableData: [],
                active:'',
                loadingcontent:'数据加载中',
                rules: {
                    S_show: [
                        { required: true, message: '请选择是否可见', trigger: 'change' }
                    ],
                    S_entitle: [
                        { required: true, message: 'Please enter the category name', trigger: 'blur' },
                        { min: 2, max: 20, message: 'The length is between 2 and 40 characters', trigger: 'blur' }
                    ],
                    S_title: [
                        { required: true, message: '请输入分类名称', trigger: 'blur' },
                        { min: 2, max: 20, message: '长度在 2 到 40 个字符', trigger: 'blur' }
                    ]
                }
            }
        },
        created() {
            this.getData();

                        
        },
        mounted() {
        },
        methods: {
            //增加分类
            addMacPsort(formName) {
                let self = this;
                self.ADDform.token=sessionStorage.getItem('token');
                self.ADDform.user_id=sessionStorage.getItem('user_id');
                self.$refs[formName].validate((valid) => {
                    if (valid) {
                        AddMacPsort(self.ADDform).then(res => {
                            if(res.code == "00"){
                                self.getData();
                                self.resetAddMacpsort(formName);
                                self.addVisible = false;
                                self.$message.success('增加成功');
                            } else if(res.code == "-100"){
                                self.$message.warning('登录超时');
                                sessionStorage.removeItem('admin_name');
                                self.$router.push('/login');
                            }else if(res.code == "-2"){
                                self.$message.warning(res.msg);
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
            //删除分类
            DelMacPsort(id) {
                let self = this;
                let obj ={};
                obj.token=sessionStorage.getItem('token');
                obj.user_id=sessionStorage.getItem('user_id');
                obj.S_id =id;
                DelMacPsort(obj).then(res => {
                    if(res.code == "00"){
                        self.getData();
                        self.$message.success('删除成功');
                    } else if(res.code == "-100"){
                        self.$message.warning('登录超时');
                        sessionStorage.removeItem('admin_name');
                        self.$router.push('/login');
                    }else if(res.code == "-1"){
                        self.$message.warning(res.msg);
                    }else {
                        self.$message.error('暂无数据');
                        return false;
                    }
                }).catch(function(err) {
                    self.$message.error('请求失败，请检查刚绝是否正常。');
                    return false;
                });                    
            },
            resetAddMacpsort(formName) {
                this.$refs[formName].resetFields();
            },
            getData(){
                let self = this;
                let obj = {};
                obj.token = sessionStorage.getItem('token');
                obj.user_id = sessionStorage.getItem('user_id');
                selectMacPsort(obj).then(res => {
                    if(res.code == "00"){
                        self.tableData = res.rec;
                    } else if(res.code == "-100"){
                        self.$message.warning('登录超时');
                        sessionStorage.removeItem('admin_name');
                        self.$router.push('/login');;
                    }else {
                        self.$message.error('暂无数据');
                        return false;
                    }
                }).catch(function(err) {
                    self.$message.error('请求失败，请检查刚绝是否正常。');
                    return false;
                });
            },
            // getMacTypeData(mid){
            //     let self = this;
            //     let obj = {};
            //     obj.token = sessionStorage.getItem('token');
            //     obj.user_id = sessionStorage.getItem('user_id');
            //     obj.M_S_id = mid;
            //     selectMacType(obj).then(res => {
            //         if(res.code == "00"){
            //             let total =res.total;
            //             return total;                        
            //         } else if(res.code == "-100"){
            //             self.$message.warning('登录超时');
            //             sessionStorage.removeItem('admin_name');
            //             self.$router.push('/login');;
            //         }else {
            //             self.$message.error('暂无数据');
            //             return false;
            //         }
            //     }).catch(function(err) {
            //         self.$message.error('请求失败，请检查刚绝是否正常。');
            //         return false;
            //     });
            // },        
            // 增加操作
            handleADD() {
                let self = this;
                self.addVisible = true;
            },
            selectMacTypeList(id,typeName){
                let self = this;
                self.$router.push({path:'/macTypeList',query:{'S_id':id,'typeName':typeName}});
                // console.log('跳转到相应分类列表')
            },
            mouseover(val) {
                var acps = this.$refs.acp;
                acps[val].style.display = "block";
            },
            mouseLeave(val) {
                this.active = "";

                var acps = this.$refs.acp;
                acps[val].style.display = "none";
            },
            delBox(id) {
                this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }).then(() => {
                        this.DelMacPsort(id);

                }).catch(() => {
                        this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });          
                });
            }
        }
    }

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
.container{
    min-height: 80vh;
}
.handle-box {
    margin:25px 0 20px 0;
    font-size: 20px;
}

.handle-select {
    width: 120px;
}
.handle-mac-type {
    width: 200px;
}


.handle-input {
    width: 300px;
    text-align: right;
    display: inline-block;
}
.crumbs{
    font-size: 19px;
}
.addType{
    text-align: center;
    font-size: 10px;
    width: 70px;
    height: 70px;
    border:2px solid ;
    margin-top:20px; 
    border-radius:50% 50% 50% 50%;
}
.type_title{
    margin-top: 26px;
    text-align: center;
    font-size: 12px;
}
.icon_style{
    font-size: 40px;
    line-height: 48px;
    font-weight: 1000;
}
.model_num{
    font-size: 12px;
    padding-bottom: 10px;
    color:#00000069;
}
.model_name{
    padding-top: 10px;
    padding-bottom: 15px;
}
    .text {
    font-size: 14px;
  }

  .item {
    padding: 8px 0;
    width: 20%;
  }

  .box-card {
    width: 100%;
    height: 170px;
  }
  .el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
  }
  .el-col {
    border-radius: 4px;
  }
  .bg-purple-light {
    background: #ff0000;
  }
  .grid-content {
    border-radius: 4px;
    min-height: 36px;
    margin-bottom: 20px;
    cursor:pointer;
  }
  .row-bg {
    padding: 10px 0;
    background-color: #f9fafc;
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

    .del_icon{
        /*display: none;
        top:0;
        right: 0;*/
        position:absolute;
    }
</style>
