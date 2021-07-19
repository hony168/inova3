<template>
    <div class="login-wrap">
        <div class="ms-login">
            <div class="ms-title">后台管理系统1</div>
            <el-form :model="query" :rules="rules" ref="login" label-width="0px" class="ms-content">
                <el-form-item prop="username">
                    <el-input v-model="query.username" placeholder="username">
                        <el-button slot="prepend" icon="el-icon-lx-people"></el-button>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        type="password"
                        placeholder="password"
                        v-model="query.password"
                        @keyup.enter.native="submitForm()"
                    >
                        <el-button slot="prepend" icon="el-icon-lx-lock"></el-button>
                    </el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm()">登录</el-button>
                </div>
                <p class="login-tips">Tips : 请输入用户名和密码。</p>
            </el-form>
        </div>
    </div>
</template>

<script>
import { login } from '../../api/index';
export default {
    data: function() {
        return {       
            query: {
                username: '',
                password: '',
            },
            rules: {
                username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
                password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
            },
        };
    },
    methods: {
        submitForm() {            
            const self = this; 
            self.$refs.login.validate(valid => {
                if (valid) {
                    login(self.query).then(res => {
                        if(res.code == "00"){
                            self.loading = false
                            self.$message.success('登录成功');
                            sessionStorage.setItem('admin_name', res.rec.truename);
                            sessionStorage.setItem('token', res.rec.token);
                            sessionStorage.setItem('user_id', res.rec.id);
                            sessionStorage.setItem('userPower',res.rec.userPower.split(','));
                            self.$router.push('/');
                        } else {
                            self.$message.error('账号或密码不正确');
                            return false;
                        }
                    }).catch(function(err) {
                        self.$message.error('请求失败，请检查刚绝是否正常。');
                        return false;
                    });
                } else {
                    this.$message.error('请输入账号和密码');
                    console.log('error submit!!');
                    return false;
                }
            });
        },
    },
};
</script>

<style scoped>
.login-wrap {
    position: relative;
    width: 100%;
    height: 100%;
    background-image: url(../../assets/img/login-bg.jpg);
    background-size: 100%;
}
.ms-title {
    width: 100%;
    line-height: 50px;
    text-align: center;
    font-size: 20px;
    color: #fff;
    border-bottom: 1px solid #ddd;
}
.ms-login {
    position: absolute;
    left: 50%;
    top: 50%;
    width: 350px;
    margin: -190px 0 0 -175px;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.3);
    overflow: hidden;
}
.ms-content {
    padding: 30px 30px;
}
.login-btn {
    text-align: center;
}
.login-btn button {
    width: 100%;
    height: 36px;
    margin-bottom: 10px;
}
.login-tips {
    font-size: 12px;
    line-height: 30px;
    color: #fff;
}
</style>
