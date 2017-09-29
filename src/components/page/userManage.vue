<template>
    <div class="table">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-menu"></i> 用户管理</el-breadcrumb-item>
                <!--<el-breadcrumb-item>基础表格</el-breadcrumb-item>-->
            </el-breadcrumb>
        </div>
        <div class="handle-box">
            <el-button type="primary" icon="add" class="handle-add mr10" @click="handleAdd">添加</el-button>
            <el-dialog :title="dialogTitle" :visible.sync="dialogAddFormVisible">
                <el-form :model="form" :rules="rules" ref="form">
                    <el-form-item label="用户名" :label-width="formLabelWidth" prop="userName">
                        <el-input v-model="form.userName" auto-complete="off" :disabled="addOrEdit"></el-input>
                    </el-form-item>
                    <el-form-item label="密码" :label-width="formLabelWidth" prop="password">
                        <el-input v-model="form.password" type="password" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="姓名" :label-width="formLabelWidth">
                        <el-input v-model="form.name" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="电话" :label-width="formLabelWidth">
                        <el-input v-model="form.mobile" auto-complete="off"></el-input>
                    </el-form-item>
                    <el-form-item label="启用" :label-width="formLabelWidth">
                        <el-radio class="radio" v-model="form.isEnabled" label="1">是</el-radio>
                        <el-radio class="radio" v-model="form.isEnabled" label="0">否</el-radio>
                    </el-form-item>
                    <el-form-item label="角色组" :label-width="formLabelWidth">
                        <el-checkbox-group v-model="form.roleIds">
                            <el-checkbox v-for="role in roles" :label="role.id">{{role.name}}</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-form>
                <div slot="footer" class="dialog-footer">
                    <el-button @click="dialogAddFormVisible = false">取 消</el-button>
                    <el-button type="primary" @click="handleSubmit">确 定</el-button>
                </div>
            </el-dialog>
            <el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll">批量删除</el-button>
            <el-input v-model="select_word" placeholder="筛选姓名" class="handle-input mr10"></el-input>
            <el-button type="primary" icon="search" @click="search">搜索</el-button>
        </div>
        <el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
            <el-table-column type="selection" width="55"></el-table-column>
            <el-table-column prop="userName" label="用户名" sortable>
            </el-table-column>
            <el-table-column prop="name" label="姓名" width="120">
            </el-table-column>
            <el-table-column prop="mobile" label="电话">
            </el-table-column>
            <el-table-column prop="isEnabled" label="是否启用">
            </el-table-column>
            <el-table-column prop="createDate" label="创建时间" :formatter="formatterData" width="170">
            </el-table-column>
            <el-table-column label="操作" width="180">
                <template scope="scope">
                    <el-button size="small"
                               @click="handleEdit(scope.$index, scope.row)">编辑
                    </el-button>
                    <el-button size="small" type="danger"
                               @click="handleDelete(scope.$index, scope.row)">删除
                    </el-button>
                </template>
            </el-table-column>
        </el-table>
        <div class="pagination">
            <el-pagination
                @current-change="handleCurrentChange"
                layout="prev, pager, next"
                :total="userTotal">
            </el-pagination>
        </div>
    </div>
</template>

<script>
    import md5 from 'js-md5';

    export default {
        data() {
            return {
                url: 'http://10.96.17.55:9827/serverBack/back/service.do',
                tableData: [],
                cur_page: 1,
                cur_pageSize: 10,
                userTotal: 0,
                multipleSelection: [],
                select_word: '',
                is_search: false,
                dialogAddFormVisible: false,
                dialogTitle: '',
                form: {
                    id: '',
                    userName: '',
                    password: '',
                    name: '',
                    mobile: '',
                    isEnabled: '0',
                    roleIds: [],
                    oldPassword: ''
                },
                rules: {
                    userName: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ]
                },
                formLabelWidth: '70px',
                roles: [],
                addOrEdit: false

            }
        },
        created() {
            this.getData();
        },
        computed: {
            data() {
                const self = this;
                return self.tableData.filter(function (d) {
                    let is_del = false;
                    if (!is_del) {
                        if (d.name.indexOf(self.select_word) > -1) {
                            return d;
                        }
                    }
                })
            }
        },
        methods: {
            handleCurrentChange(val) {
                this.cur_page = val;
                this.getData();
            },
            getData() {
                let self = this;
                let params = JSON.stringify({
                    "msgId": "ADMIN_LIST",
                    "index": self.cur_page - 1,
                    "pageSize": self.cur_pageSize
                });
                self.$axios.post(self.url, "text=" + params).then((res) => {
                    if (res.data && res.data.resultMap) {
                        self.tableData = res.data.resultMap.adminList;
                        self.userTotal = +res.data.resultMap.count;
                    }
                });
            },
            search() {
                this.is_search = true;
                let self = this;
                let params = JSON.stringify({
                    "msgId": "ADMIN_LIST",
                    "name": self.select_word,
                    "index": self.cur_page - 1,
                    "pageSize": self.cur_pageSize
                });
                self.$axios.post(self.url, "text=" + params).then((res) => {
                    if (res.data && res.data.resultMap) {
                        self.tableData = res.data.resultMap.adminList;
                        self.userTotal = +res.data.resultMap.count;
                    }
                })
            },
            formatterData(row, column) {
                return row.createDate;
            },
            handleAdd() {
                let self = this;
                let params = JSON.stringify({"msgId": "ROLE_ALL"});
                self.$axios.post(self.url, "text=" + params).then((res) => {
                    self.roles = res.data.resultMap.roleList;
                });
                self.form.id = '';
                self.form.userName = '';
                self.form.password = '';
                self.form.name = '';
                self.form.mobile = '';
                self.form.isEnabled = '0';
                self.form.roleIds = [];
                self.addOrEdit = false;
                self.dialogTitle = '添加用户';
                self.dialogAddFormVisible = true;
                this.$refs['form'] && this.$refs['form'].resetFields();
            },
            handleSubmit() {
                let self = this;
                let params;
                if (self.addOrEdit) {     //编辑
                    console.log(self.newPassword);
                    params = JSON.stringify({
                        "msgId": "ADMIN_EDIT",
                        "id": self.form.id,
                        "userName": self.form.userName,
                        "password": self.form.oldPassword == self.form.password ? self.form.password : md5(self.form.password),
                        "name": self.form.name,
                        "mobile": self.form.mobile,
                        "isEnabled": self.form.isEnabled == "1" ? "true" : "false",
                        "roleIds": self.form.roleIds
                    });
                } else {                 //添加
                    params = JSON.stringify({
                        "msgId": "ADMIN_ADD",
                        "userName": self.form.userName,
                        "password": md5(self.form.password),
                        "name": self.form.name,
                        "mobile": self.form.mobile,
                        "isEnabled": self.form.isEnabled == "1" ? "true" : "false",
                        "roleIds": self.form.roleIds
                    });
                }
                self.$axios.post(self.url, "text=" + params).then((res) => {
                    if (res.data.code == "0") {
                        this.getData();
                        self.dialogAddFormVisible = false;
                        let msg = self.addOrEdit ? '修改成功' : '添加成功';
                        self.$message({
                            message: msg,
                            type: 'success'
                        });
                    } else {
                        let msg = self.addOrEdit ? '修改失败' : '添加失败';
                        self.$message.error(msg);
                    }
                });
            },
            handleEdit(index, row) {
                let self = this;
                let params_roles = JSON.stringify({"msgId": "ROLE_ALL"});
                self.$axios.post(self.url, "text=" + params_roles).then((res) => {
                    self.roles = res.data.resultMap.roleList;
                });
                let params = JSON.stringify({"msgId": "ADMIN_DETAIL", "id": row.id});
                self.$axios.post(self.url, "text=" + params).then((res) => {
                    if (res.data.code == "0") {
                        let info = res.data.resultMap.adminInfo;
                        self.form.id = info.id;
                        self.form.userName = info.userName;
                        self.form.password = info.password;
                        self.form.oldPassword = info.password;
                        self.form.name = info.name;
                        self.form.mobile = info.mobile;
                        self.form.isEnabled = info.isEnabled ? '1' : '0';
                        self.form.roleIds = [];
                        if (info.roleId && info.roleId instanceof Array) {
                            info.roleId.forEach(function (v) {
                                self.form.roleIds.push(v + '');
                            });
                        }
                    }
                });
                self.addOrEdit = true;
                self.dialogTitle = '编辑用户';
                this.$refs['form'] && this.$refs['form'].resetFields();
                self.dialogAddFormVisible = true;
            },
            handleDelete(index, row) {
                let self = this;
                let params = JSON.stringify({"msgId": "ADMIN_DEL", "adminIds": [row.id]});
                self.$axios.post(self.url, "text=" + params).then((res) => {
                    console.log(res.data);
                    if (res.data.code == "0") {
                        this.getData();
                        self.$message.success('删除成功');
                    } else {
                        self.$message.error('删除失败');
                    }
                });
            },
            delAll() {
                const self = this,
                    length = self.multipleSelection.length;
                let delUserIds = [];
                for (let i = 0; i < length; i++) {
                    delUserIds.push(self.multipleSelection[i].id);
                }
                self.multipleSelection = [];
                let params = JSON.stringify({"msgId": "ADMIN_DEL", "adminIds": delUserIds});
                self.$axios.post(self.url, "text=" + params).then((res) => {
                    console.log(res.data);
                    if (res.data.code == "0") {
                        this.getData();
                        self.$message.success('删除成功');
                    } else {
                        self.$message.error('删除失败');
                    }
                });
            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            }
        }
    }
</script>

<style scoped>
    .handle-box {
        margin-bottom: 20px;
    }

    .handle-input {
        width: 300px;
        display: inline-block;
    }
</style>
