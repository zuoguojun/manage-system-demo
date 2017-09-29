<template>
    <div class="login-wrap">
        <div class="ms-title">后台管理系统</div>
        <div class="ms-login">
            <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="0px" class="demo-ruleForm">
                <el-form-item prop="username">
                    <el-input v-model="ruleForm.username" placeholder="username"></el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input type="password" placeholder="password" v-model="ruleForm.password" @keyup.enter.native="submitForm('ruleForm')"></el-input>
                </el-form-item>
                <div class="login-btn">
                    <el-button type="primary" @click="submitForm('ruleForm')">登录</el-button>
                </div>
                <p v-if="loginCK" style="font-size:12px;line-height:30px;color:#ff00ff;">{{msg}}</p>
            </el-form>
        </div>
    </div>
</template>

<script>
    import md5 from 'js-md5';
    export default {
        data: function(){
            return {
                ruleForm: {
                    username: '',
                    password: ''
                },
                rules: {
                    username: [
                        { required: true, message: '请输入用户名', trigger: 'blur' }
                    ],
                    password: [
                        { required: true, message: '请输入密码', trigger: 'blur' }
                    ]
                },
                msg:'登陆异常',
                loginCK:false
            }
        },
        methods: {
            submitForm(formName) {
                const self = this;
                self.$refs[formName].validate((valid) => {
                    if (valid) {
                        let params = JSON.stringify({"msgId":"ADMIN_LOGIN","userName":self.ruleForm.username,"password":md5(self.ruleForm.password)});
                        let reqUrl = 'http://10.96.17.55:9827/serverBack/back/service.do';
                        self.$axios.post(reqUrl,"text="+params).then((res) => {
                            res = res && res.data;
                            if(res && res.code == '0'){
                                localStorage.setItem('ms_username',res.resultMap.adminInfo.name);
                                self.$router.push('/readme');
                            }else if(res && res.code == '1'){
                                self.msg = res.message;
                                self.loginCK = true;
                            }else {
                               self.msg ='登陆异常';
                                self.loginCK = true;
                            }
                        });
                    } else {
                        return false;
                    }
                });
            }
        }
    }
</script>

<style scoped>
    .login-wrap{
        position: relative;
        width:100%;
        height:100%;
    }
    .ms-title{
        position: absolute;
        top:50%;
        width:100%;
        margin-top: -230px;
        text-align: center;
        font-size:30px;
        color: #fff;

    }
    .ms-login{
        position: absolute;
        left:50%;
        top:50%;
        width:300px;
        height:160px;
        margin:-150px 0 0 -190px;
        padding:40px;
        border-radius: 5px;
        background: #fff;
    }
    .login-btn{
        text-align: center;
    }
    .login-btn button{
        width:100%;
        height:36px;
    }
</style>
