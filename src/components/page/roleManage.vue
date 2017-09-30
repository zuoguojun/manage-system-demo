<template>
    <div class="role-content">
        <div class="table">
            <div class="crumbs">
                <el-breadcrumb separator="/">
                    <el-breadcrumb-item><i class="el-icon-menu"></i> 用户管理</el-breadcrumb-item>
                </el-breadcrumb>
            </div>
            <div class="handle-box">
                <el-button type="primary" icon="add" class="handle-del mr10 el-icon-plus" @click="handleAddRole">添加角色</el-button>
                <el-button type="primary" icon="delete" class="handle-del mr10" @click="delAll(multipleSelection)">批量删除</el-button>
               <!-- <el-select v-model="select_cate" placeholder="筛选角色" class="handle-select mr10">
                    <el-option key="1" label="所有" value="所有"></el-option>
                    <el-option key="1" label="超级管理员" value="超级管理员"></el-option>
                </el-select>-->
                <el-input v-model="select_word" placeholder="筛选关键词" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="search" @click="search">搜索</el-button>
            </div>
            <el-table :data="data" border style="width: 100%" ref="multipleTable" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column prop="name" label="角色名称" sortable width="150">
                </el-table-column>
                <el-table-column prop="description" label="角色描述">
                </el-table-column>
                <el-table-column prop="id" label="排序id">
                </el-table-column>
                <el-table-column prop="createDate" label="创建时间" sortable>
                </el-table-column>
                <el-table-column label="操作" width="180">
                    <template scope="scope">
                        <el-button size="small"
                                @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                        <el-button size="small" type="danger"
                                @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination
                        @current-change ="handleCurrentChange"
                        layout="prev, pager, next"
                        :total="pageNum">
                </el-pagination>
            </div>
        </div>

        <!-------------------------弹出框--------------------------->
        <div class="diaglog">
            <el-dialog
                :title="title"
                :visible.sync="dialogVisible"
                size="larger"
                :before-close="handleClose">

                <div class="form-box">
                    <el-form ref="form" :model="form" :rules="rules" label-width="80px">
                        <el-form-item label="角色名称" prop="name" required>
                            <el-input v-model="form.name"></el-input>
                        </el-form-item>
                        <el-form-item label="角色描述">
                            <el-input v-model="form.description"></el-input>
                        </el-form-item>
                        <el-form-item label="排序id" hidden>
                            <el-input v-model="form.id" readonly hidden></el-input>
                        </el-form-item>
                        <el-form-item>
                            <el-button type="primary" @click="onSubmit('form', title)">确定</el-button>
                            <el-button @click="dialogVisible = false">取消</el-button>
                        </el-form-item>
                    </el-form>
                </div>
            </el-dialog>

        </div>
    </div>

</template>

<script>
    export default {
        data() {
            return {
                url: 'http://10.96.17.55:9827/serverBack/back/service.do',
                tableData: [],
                cur_page: 1,
                multipleSelection: [],
                select_cate: '',
                select_word: '',
                del_list: [],
                is_search: false,
                dialogVisible: false,
                title:"新增角色",
                pageNum: 0,
                form: {
                    name: '',
                    description: '',
                    id: ''
                },
                rules: {
                    name: [
                        { required: true, message: '请输入角色名称', trigger: 'blur' },
                        { min: 1, max: 32, message: '长度在 1 到 32 个字符', trigger: 'blur' }
                    ]
                }
            }

        },
        created(){
            this.getData();
            this.getPageNum();
        },
        computed: {
            data(){
                const self = this;

                return self.tableData.filter(function(d){
                    let is_del = false;
                    for (let i = 0; i < self.del_list.length; i++) {


                        if(d.name === self.del_list[i].name){
                            is_del = true;
                            break;
                        }
                    }

                    if(!is_del){
                        /*if(self.select_cate){

                        }*/

                        if(d.name.indexOf(self.select_cate) > -1 &&
                            (d.name.indexOf(self.select_word) > -1)
                        ){
                            return d;
                        }
                    }
                })
            }
        },
        methods: {
            handleCurrentChange(val){
                this.cur_page = val;
                this.getData(val);
            },
            getData(pageIndex){
                let self = this;
                if(!pageIndex){
                    pageIndex = 0;
                }else{
                    pageIndex--;
                }

                let postData = {
                    "msgId": "ROLE_LIST",
                    "index": pageIndex * 20,
                    "pageSize": 20
                };

                self.$axios.post(self.url, 'text='+ JSON.stringify(postData)).then((res) => {
                    self.tableData = res.data.resultMap.roleList;
                })
            },
            getPageNum() {
                let self = this;
                let postData = {
                    "msgId": "ROLE_LIST"
                };

                self.$axios.post(self.url, 'text='+ JSON.stringify(postData)).then((res) => {
                    self.pageNum = res.data.resultMap.roleList.length;
                    if(self.pageNum <= 20){
                        self.pageNum = 20;
                    }
                })
            },
            search(){
                this.is_search = true;
                let self = this;
               console.log("select_word-->", self.select_word);

                let postData = {
                    "msgId": "ROLE_LIST",
                    "index": 0,
                    "pageSize": 20,
                    "name": self.select_word
                };

                self.$axios.post(self.url, 'text='+ JSON.stringify(postData)).then((res) => {
                    self.tableData = res.data.resultMap.roleList;
                    self.pageNum = self.tableData.length;
                })
            },
            formatter(row, column) {
                return row.address;
            },
            filterTag(value, row) {
                return row.tag === value;
            },
            handleEdit(index, row) {
                //this.$message('编辑第'+(index+1)+'行');
                this.form = {
                    name: row.name,
                    description: row.description,
                    id: row.id
                };
                console.log("row.id--->", row.id);

                this.title = "修改角色";
                this.dialogVisible = true;
            },
            handleAddRole() {
                let self = this;
                self.dialogVisible = true;
                self.form = {
                    name: "",
                    description: ""
                };
                this.title = "新增角色";
            },
            handleDelete(index, row) {
                let self = this;

                let postData = {
                    "msgId": "ROLE_DEL",
                    "roleIds": [row.id]
                }

                self.$axios.post(self.url, 'text='+ JSON.stringify(postData)).then((res) => {
                    if(res.data.code == 0) {
                        this.$message.success('删除角色成功！');
                        self.getData();
                    }else {
                        self.$message.error('删除角色失败');
                    }
                })
            },
            delAll(multipleSelection){



                this.$confirm('确认删除这些角色?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    const self = this,
                        length = self.multipleSelection.length;
                    let str = '';
                    self.del_list = self.del_list.concat(self.multipleSelection);
                    let deleteArr = [];
                    for(var i = 0; i < length; i++){
                        deleteArr.push(+(self.multipleSelection[i].id));
                    }

                    if(deleteArr.length <= 0) {
                        return false;
                    }

                    let postData = {
                        "msgId": "ROLE_DEL",
                        "roleIds": deleteArr
                    }

                    self.$axios.post(self.url, 'text='+ JSON.stringify(postData)).then((res) => {
                        if(res.data.code == 0) {

                            this.$message.success('删除' + deleteArr.length + '个角色成功！');
                            self.getData();
                        }else {
                            self.$message.error('删除角色失败');
                        }
                        self.multipleSelection = [];
                    })
                }).catch(() => {
                    this.$message({
                        type: 'info',
                        message: '已取消删除'
                    });
                });

            },
            handleSelectionChange(val) {
                this.multipleSelection = val;
            },
            handleClose(done) {
                this.$confirm('确认关闭？')
                    .then(_ => {
                        done();
                    })
                    .catch(_ => {});
            },
            onSubmit(formName, title) {
                let self = this;

                this.$refs[formName].validate((valid) => {
                    if (valid) {
                        var actionType = "ROLE_ADD";
                        if(title.indexOf("修改") != -1){
                            actionType = "ROLE_EDIT";
                        }

                        let postData = {
                            "msgId": actionType,
                            "name": this.form.name,
                            "description": this.form.description
                        };

                        if(actionType == "ROLE_EDIT"){
                            postData.id = this.form.id;
                        }

                        self.$axios.post(self.url, 'text='+ JSON.stringify(postData)).then((res) => {
                            if(res.data.code == 0) {
                                this.$message.success(title + '成功！');
                                self.dialogVisible = false;
                                self.getData();
                            }else {
                                self.$message.error(title + '失败');
                            }
                        })
                    } else {
                        return false;
                    }
                });

            }
        }
    }
</script>

<style scoped>
.handle-box{
    margin-bottom: 20px;
}
.handle-select{
    width: 120px;
}
.handle-input{
    width: 300px;
    display: inline-block;
}
</style>
