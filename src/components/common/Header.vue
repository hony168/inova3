<template>
    <div class="header">
        <!-- 折叠按钮 -->
        <div class="collapse-btn" @click="collapseChage">
            <i v-if="!collapse" class="el-icon-s-fold"></i>
            <i v-else class="el-icon-s-unfold"></i>
        </div>
        <div class="logo">INOVA管理平台</div>
        <div class="header-right">
            <div class="header-user-con">
                <!-- 全屏显示 -->
                <div class="btn-fullscreen" @click="handleFullScreen">
                    <el-tooltip effect="dark" :content="fullscreen?`取消全屏`:`全屏`" placement="bottom">
                        <i class="el-icon-rank"></i>
                    </el-tooltip>
                </div>
                <!-- 消息中心 -->
                <div class="btn-bell">
                    <el-tooltip effect="dark" :content="message?`有${message}条未读消息`:`消息中心`"  placement="bottom">
                        <router-link to="/tabs">
                            <i class="el-icon-bell"></i>
                        </router-link>
                    </el-tooltip>
                    <span class="btn-bell-badge" v-if="message"></span>
                </div>
                <!-- 用户头像 -->
                <div class="user-avator">
                    <img src="../../assets/img/img.jpg" />
                </div>
                <!-- 用户名下拉菜单 -->
                <el-dropdown class="user-name" trigger="click" @command="handleCommand">
                    <span class="el-dropdown-link">
                        {{username}}
                        <i class="el-icon-caret-bottom"></i>
                    </span>
                    <el-dropdown-menu slot="dropdown">
                        <el-button type="text"  @click="editPass" style="font-size:13px;width:100%;text-align:center;">修改密码</el-button>
                        <!--  <a href="https://github.com/lin-xin/vue-manage-system" target="_blank">
                            <el-dropdown-item>项目仓库</el-dropdown-item>
                        </a> -->
                        <el-dropdown-item divided command="loginout">退出登录</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>
         <!-- 领料单列表 -->
        <el-dialog title="修改密码" :visible.sync="editPassVisible" width="35vw">
            <el-form :model="editForm" :rules="rules" id = "editForm" ref="editForm" label-width="100px" class="demo-ruleForm">
                    <el-form-item label="密码：" prop="epwd">
                        <el-input type="password" v-model="editForm.epwd" placeholder="请设置帐号密码"></el-input>
                    </el-form-item>
                    <el-form-item label="确认密码：" prop="ecpwd">
                        <el-input type="password" v-model="editForm.ecpwd" placeholder="请输入确认密码"></el-input>
                    </el-form-item>
            </el-form>                 
            <div style="text-align:right;padding-top:20px;">
                <el-button type="primary" @click="saveEdit('editForm')">提交修改</el-button>
                <el-button @click="editPassVisible = false">取 消</el-button>
            </div>                 
        </el-dialog>
    </div>
</template>
<script>
import bus from '../common/bus';
import { userEditPass} from '../../api/index';
export default {
    data() {
        return {
            collapse: false,
            fullscreen: false,
            editPassVisible: false,
            name: '',
            editForm: {}, 
            rules: {                
                epwd:[
                    { required: true, message: '请输入密码', trigger: 'blur' },
                    { min: 6, max: 30, message: '长度在 6 到 15 个字符', trigger: 'blur' }
                ],
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
            },
            message: 0
        };
    },
    computed: {
        username() {
            let username = sessionStorage.getItem('admin_name');
            return username ? username : this.name;
        }
    },
    methods: {
        // 用户名下拉菜单选择事件
        handleCommand(command) {
            if (command == 'loginout') {
                sessionStorage.removeItem('admin_name');
                this.$router.push('/login');
            }
        },
        // 侧边栏折叠
        collapseChage() {
            this.collapse = !this.collapse;
            bus.$emit('collapse', this.collapse);
        },
        // 全屏事件
        handleFullScreen() {
            let element = document.documentElement;
            if (this.fullscreen) {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitCancelFullScreen) {
                    document.webkitCancelFullScreen();
                } else if (document.mozCancelFullScreen) {
                    document.mozCancelFullScreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            } else {
                if (element.requestFullscreen) {
                    element.requestFullscreen();
                } else if (element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen();
                } else if (element.mozRequestFullScreen) {
                    element.mozRequestFullScreen();
                } else if (element.msRequestFullscreen) {
                    // IE11
                    element.msRequestFullscreen();
                }
            }
            this.fullscreen = !this.fullscreen;
        },
        // 修改密码对话框
        editPass() {
            this.editPassVisible = true;
        }, 
        // 保存编辑
        saveEdit(formName) {
            let self = this;
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    self.editForm.id =sessionStorage.getItem('user_id');
                    userEditPass(self.editForm).then(res => {
                        if(res.code == "00"){
                            self.editPassVisible = false;
                            self.editForm = {};
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
            });
        }
    },
    mounted() {
        if (document.body.clientWidth < 1500) {
            this.collapseChage();
        }
    }
};
</script>
<style scoped>
.header {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 70px;
    font-size: 22px;
    color: #fff;
}
.collapse-btn {
    float: left;
    padding: 0 21px;
    cursor: pointer;
    line-height: 70px;
}
.header .logo {
    float: left;
    width: 250px;
    padding-left: 56px;
    background: url(../../assets/img/loginlogo.png)  no-repeat 0 50%;
    line-height: 70px;
}
.header-right {
    float: right;
    padding-right: 50px;
}
.header-user-con {
    display: flex;
    height: 70px;
    align-items: center;
}
.btn-fullscreen {
    transform: rotate(45deg);
    margin-right: 5px;
    font-size: 24px;
}
.btn-bell,
.btn-fullscreen {
    position: relative;
    width: 30px;
    height: 30px;
    text-align: center;
    border-radius: 15px;
    cursor: pointer;
}
.btn-bell-badge {
    position: absolute;
    right: 0;
    top: -2px;
    width: 8px;
    height: 8px;
    border-radius: 4px;
    background: #f56c6c;
    color: #fff;
}
.btn-bell .el-icon-bell {
    color: #fff;
}
.user-name {
    margin-left: 10px;
}
.user-avator {
    margin-left: 20px;
}
.user-avator img {
    display: block;
    width: 40px;
    height: 40px;
    border-radius: 50%;
}
.el-dropdown-link {
    color: #fff;
    cursor: pointer;
}
.el-dropdown-menu__item {
    text-align: center;
}
</style>
