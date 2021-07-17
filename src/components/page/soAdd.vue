<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 库存管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box" id='aa'>
                <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="">搜索</el-button>          
                <el-upload style="margin:0 10px;top:12px; position: relative; display: inline-block;"
                    action=""
                    :on-change="handleChange"
                    :show-file-list="false"
                    :on-remove="handleRemove"
                    :file-list="fileListUpload"
                    :limit="limitUpload"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    :auto-upload="false">
                    <el-button type="primary" icon="el-icon-search">导入</el-button>
                </el-upload>
                <el-button type="primary" icon="el-icon-search" @click="">搜索</el-button>  
            </div>
        </div>
        <el-dialog title="导入物料仓储位置数据" :visible.sync="dialogVisible" width="60%" :before-close="handleClose" center>
            <el-table :data="accountList" border style="width: 100%;">
                <el-table-column prop="number" header-align="center"  align="center" label="零件编号"></el-table-column>
                <el-table-column prop="remark" header-align="center" align="center"  label="仓储位置"></el-table-column>
                <el-table-column prop="xxx" header-align="center" align="center" label="XXX"></el-table-column>
            </el-table>
          <span slot="footer" class="dialog-footer">
             <el-button @click="dialogVisible = false">取 消</el-button>
             <el-button type="primary" @click="importExcel()">确 定</el-button>
            </span>
        </el-dialog>
  </div>
</template>

<script>
// 在组件中使用

export default {
    data() {
        return {
            fileListUpload: [],
            q: '',
            limitUpload: 3,
            disabled: false,
            dialogVisible: false,
            accountList:[],
        };
    },
    
    methods: {
        handleChange(file, fileList) {
            this.fileTemp = file.raw
            let fileName = file.raw.name
            let fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
            // 判断上传文件格式
            if (this.fileTemp) {
                if ((fileType == 'xlsx') || (fileType == 'xls')) {
                    this.importf(this.fileTemp)
                } else {
                    this.$message({
                        type: 'warning',
                        message: '附件格式错误，请删除后重新上传！'
                    })
                }
            } else {
                this.$message({
                    type: 'warning',
                    message: '请上传附件！'
                })
            }
        },
        handleChange(file, fileList) {
            this.fileTemp = file.raw
            let fileName = file.raw.name
            let fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
            // 判断上传文件格式
            if (this.fileTemp) {
                if ((fileType == 'xlsx') || (fileType == 'xls')) {
                    this.importf(this.fileTemp)
                } else {
                    this.$message({
                        type: 'warning',
                        message: '附件格式错误，请删除后重新上传！'
                    })
                }
            } else {
                this.$message({
                    type: 'warning',
                    message: '请上传附件！'
                })
            }
        },
        handleClose(done) {
            this.dialogVisible = false;
        },
        importf(obj) {
            this.dialogVisible = true;
            let _this = this;
            let inputDOM = this.$refs.inputer;   // 通过DOM取文件数据
            this.file = event.currentTarget.files[0];
            var rABS = false; //是否将文件读取为二进制字符串
            var f = this.file;
            var reader = new FileReader();
            //if (!FileReader.prototype.readAsBinaryString) {
            FileReader.prototype.readAsBinaryString = function (f) {
                var binary = "";
                var rABS = false; //是否将文件读取为二进制字符串
                var pt = this;
                var wb; //读取完成的数据
                var outdata;
                var reader = new FileReader();
                reader.onload = function (e) {
                    var bytes = new Uint8Array(reader.result);
                    var length = bytes.byteLength;
                    for (var i = 0; i < length; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    var XLSX = require('xlsx');
                    if (rABS) {
                        wb = XLSX.read(btoa(fixdata(binary)), { //手动转化
                            type: 'base64'
                        });
                    } else {
                        wb = XLSX.read(binary, {
                            type: 'binary'
                        });
                    }
                    // outdata就是你想要的东西 excel导入的数据
                    outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                    // excel 数据再处理
                    let arr = []
                    outdata.map(v => {
                        // let jsonString = JSON.stringify(v).replace(/\*/g, '').replace(/\s/ig,'');
                        let jsonString = JSON.stringify(v).replace(/\//g, '').replace(/\s/ig,'');
                        // debugger;
                        console.log(jsonString);
                        v = JSON.parse(jsonString);
                        let obj = {}
                        obj.number = v.零件编号
                        obj.remark = v.仓储位置
                        arr.push(obj)
                    })
                    _this.accountList = [...arr];
                }
                reader.readAsArrayBuffer(f);
            }
            if (rABS) {
                reader.readAsArrayBuffer(f);
            } else {
                reader.readAsBinaryString(f);
            }
        },
        importExcel(){

            console.log(this.accountList)
            // this.$http({
            //     url: 'XXXX',
            //     method: 'post',
            //     data: this.accountList
            // }).then(({data}) => {
            //     if (data && data.code === 0) {
            //         this.$message({
            //             message: '操作成功',
            //             type: 'success',
            //             duration: 1500
            //         })
            //         this.getDataList()
            //     }
            // })
            this.dialogVisible = false;
        },
        // 移除excel表
        handleRemove(file, fileList) {
            this.fileTemp = null;
        }
    } 
}
</script> 
<style>
#aa .el-upload{
    width:  auto;
    height: auto;
}
#aa .el-upload--text {
    border: 0;    
    border-radius: 1px; 
    
}
</style>
<style scoped>
 
.handle-box {
    margin-bottom: 20px;
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
}
.inventQtyTotal{
    font-weight: 100; 
    color: #606266;
}
</style>