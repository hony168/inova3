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
            <div class="handle-box" id="handle-box">
                <el-cascader v-model="categoryIdArr" :options="options" clearable :props="{ expandTrigger: 'hover',checkStrictly: true }" @change="categoryIdChange" class="handle-input mr10" placeholder="试试搜索：类别名称" filterable></el-cascader>
                <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button v-if="userPower.indexOf('2013')>-1" type="primary" icon="el-icon-upload" @click="getOutData()">物料导出</el-button>
                <el-upload style="margin:0 10px;top:12px; position: relative; display: inline-block;"
                    action="" :on-change="handleChange" :before-upload="beforeUpload" :show-file-list="false" :file-list="fileListUpload" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" :auto-upload="false">
                    <el-button type="primary" icon="el-icon-upload2">库存导入</el-button>
                </el-upload>
                <el-upload style="margin:0 10px 0 0;top:12px; position: relative; display: inline-block;"
                    action="" :on-change="handleChangewz" :before-upload="beforeUpload" :show-file-list="false" :file-list="fileListUpload" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" :auto-upload="false">
                    <el-button type="primary" icon="el-icon-upload2">位置导入</el-button>
                </el-upload>
                <el-button v-if="userPower.indexOf('2013')>-1" type="primary" icon="el-icon-download" @click="exceldown('http://wms.lyccco.com/excel/kc.xlsx')">库存模块下载</el-button>
                <el-button v-if="userPower.indexOf('2013')>-1" type="primary" icon="el-icon-download" @click="exceldown('http://wms.lyccco.com/excel/wz.xlsx')">位置模块下载</el-button>
            </div>
            <el-table :data="tableData" border style="font-size:10px" stripe class="table" ref="multipleTable" header-cell-class-name="table-header" :show-header='true'  @selection-change="handleSelectionChange" height="63vh">
                <el-table-column type="selection" width="50" align="center"></el-table-column>
                <el-table-column label="图片" width="60" align="center">
                    <template slot-scope="scope">
                        <span v-if="scope.row.imgArr.length==0">无图</span>
                        <el-image v-else class="table-td-thumb" :src="scope.row.imgArr[0]" :preview-src-list="scope.row.imgArr"></el-image>
                    </template>
                </el-table-column>
                <el-table-column prop="number" width="120" label="商品编号" sortable></el-table-column>
                <el-table-column prop="name" label="商品名称" width="320"  :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="brand" label="品牌" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="spec" label="规格" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="contactCode" label="厂家编码" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="contactName" label="供应商" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="inventQty" width="120" label="当前库存" align="right" sortable>                    
                     <template slot-scope="scope">
                        {{scope.row.inventQty | formatDecimal}}
                    </template>
                </el-table-column>
                <el-table-column prop="remark" width="90"  label="仓储位置" align="center"></el-table-column>
                <el-table-column prop="cunitName" width="50"  label="单位" align="center"></el-table-column>
                <el-table-column prop="locationName" width="120" label="仓库" :show-overflow-tooltip="true"></el-table-column>
            </el-table>

            <div class="pagination">
                <el-pagination background layout="total, slot, sizes, prev, pager, next, jumper" :current-page="pageIndex" :page-size="pageSize" :page-sizes="pageSizes" :total="pageTotal" @size-change="handleSizeChange" @current-change="handlePageChange"><span class="inventQtyTotal"> 库存{{inventQtyTotal}}条</span></el-pagination>
                </el-pagination>
            </div>
        </div>
        <el-dialog title="导入物料仓储位置数据" :visible.sync="dialogVisible" width="60%" top="2vh" :before-close="handleClose" center>
            <div class="table" v-loading="loading" element-loading-text="数据处理中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.5)">
                <el-table :data="accountList.slice((currentPage-1)*pageSize,currentPage*pageSize)" border style="width: 100%" >
                    <el-table-column prop="number" header-align="center"  align="center" label="零件编号"></el-table-column>
                    <el-table-column prop="inventQty" header-align="center" v-if="excleType=='kc'" align="center" label="库存数量"></el-table-column>
                    <el-table-column prop="remark" header-align="center" align="center" v-if="excleType=='wz'"  label="仓储位置"></el-table-column>
                </el-table>
                <div class="pagination">
                    <el-pagination @current-change="handleCurrentChange" :page-size="pageSize" layout="prev, pager, next, jumper" :total="accountList.length"></el-pagination>
                </div>
                <span slot="footer" class="dialog-footer">
                    <el-button @click="dialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="importExcel()">确 定</el-button>
                </span>
            </div>
        </el-dialog>
        <!-- 编辑弹出框 -->
        <!-- <el-dialog title="" align='center' :visible.sync="showVisible" top="2vh" width="70vw">
            <div style="margin:0 0 14px 15px;text-align:left;font-size:13px;font-weight:bold;line-height:25px;">
                商品名称：{{showInfoform.name}}　　　　商品编号：{{showInfoform.number}}　当前库存：{{showInfoform.inventQty}}{{showInfoform.unitName}}　　　　供应商：{{showInfoform.contactName}}<br />商品类别：{{showInfoform.categoryName}}
            </div>             
            <el-table :data="orderData" border :span-method="objectSpanMethod" borderstyle="font-size:10px" class="table" ref="multipleTable" header-cell-class-name="table-header" @cell-click="showSOInfo" @selection-change="handleSelectionChange" height="63vh">
                <el-table-column prop="ADDTime" width="150" label="时间" sortable align="center"></el-table-column>  
                <el-table-column width="50">
                    <template slot-scope="scope">
                        {{scope.$index+1}}
                    </template>
                </el-table-column>                  
                <el-table-column prop="onlyID" label="唯一编号" width="100" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="onlyID" label="编号二维码" width="120" align="center">
                    <template slot-scope="scope">
                        <vue-qr :text="scope.row.onlyID | numToStr" :size="100"></vue-qr>

                    </template>
                </el-table-column>
                <el-table-column prop="onlyID" label="编号条形码" align="center">
                    <template slot-scope="scope">
                        <img :id="'a'+scope.row.onlyID"  />
                    </template>
                </el-table-column>

                <el-table-column prop="remainderQty" label="当前商品余量" :show-overflow-tooltip="true"></el-table-column>
                <!-- <el-table-column prop="l_qty" width="80"  label="数量" align="right">
                     <template slot-scope="scope">
                        {{scope.row.l_qty | formatDecimal}}
                    </template>
                </el-table-column> 
            </el-table>
        </el-dialog> -->
    </div>
</template>

<script>
import qs from 'qs';
import vueQr from 'vue-qr';
import JsBarcode from 'jsbarcode';
import { selectAllGoods,selectGoods,generateTree,seaGoodsInventoryDetail,bacthImport} from '../../api/goods';
export default {
    name: "qecode",
    data() {
        return {
            q:'',
            pageSizes: [20,50,100,200,500],
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            cur_page: 1,
            currentPage: 1,
            inventQtyTotal: 0,
            loading: true,
            excleType:'',

            categoryIdArr: [],
            categoryId:0,
            options: [],
            showInfoform:{},
            orderData: [],
            tableData: [],
            outTableData: [],
            multipleSelection: [],
            delList: [],
            showVisible: false,
            pageTotal: 0,
            arr1:[],
            fileListUpload: [],
            disabled: false,
            dialogVisible: false,
            accountList:[],
            userPower:[]
        };
    },
    components: {
        vueQr
    },
    created() {
        this.getCategory();
        this.getData();
        // 获取用户权限
        this.userPower = sessionStorage.getItem('userPower').split(',');
    },
    filters: {
        formatDecimal(num, decimal=2) {
            num = num.toString();
            var index = num.indexOf('.');
            if (index !== -1) {
                num = num.substring(0, decimal + index + 1)
            } else {
                num = num.substring(0)
            }
            return parseFloat(num).toFixed(decimal)
        },
        numToStr(num) {
            return  num.toString();
        }
    },   
    methods: {

        
        // 获取 easy-mock 的模拟数据
        getData() {
            let self = this;
            selectGoods({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                categoryId:self.categoryId,
                order:'desc',
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.tableData = res.rec;
                    self.pageTotal = res.total || 0;
                    self.inventQtyTotal = res.inventQtyTotal || 0;
                } else if(res.code == "-100"){
                    // self.$message.warning('登录超时');
                    // sessionStorage.removeItem('admin_name');
                    // self.$router.push('/login');
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },
        // 获取 easy-mock 的模拟数据
        getOutData() {
            let self = this;
            selectAllGoods({  
                categoryId:self.categoryId,
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    // self.outTableData = res.rec;
                    require.ensure([], () => {
                        const { export_json_to_excel } = require('../../excel/Export2Excel');
                        const tHeader = ['零件编号','商品名称','商品类别','当前库存','计量单位','仓库'];
                        const filterVal = ['number','name','categoryName','inventQty','unitName','locationName'];
                        const list = res.rec;
                        const data = this.formatJson(filterVal, list);
                        export_json_to_excel(tHeader, data, '物料列表');
                    })
                } else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => v[j]))
        },
        // 获取 easy-mock 的模拟数据
        getCategory() {
            let self = this;
            generateTree().then(res => { 
                if(res.code == "00"){
                    self.options = res.tree;
                } else if(res.code == "-100"){
                    // self.$message.warning('登录超时');
                    // sessionStorage.removeItem('admin_name');
                    // self.$router.push('/login');
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },
        // 展示订单详细信息
        showSOInfo(row,column,event,cell){
            let self = this;
            
            if(column.label !="图片"){
                if(row.inventQty>0){
                    self.showVisible = true;
                }else{
                    self.$message.success('商品当前无库存！');
                    return false;
                }
                self.showInfoform =row;
                seaGoodsInventoryDetail({  
                    // 'pageIndex': self.pageIndex,
                    // 'pageSize': self.pageSize,
                    'i_goodsID':row.id
                }).then(res => { 
                    if(res.code == "00"){
                        self.orderData = res.rec;
                        self.setdates(res.rec);
                    } else if(res.code == "-100"){
                        // self.$message.warning('登录超时');
                        // sessionStorage.removeItem('admin_name');
                        // self.$router.push('/login');
                    }else {
                        self.$message.error('暂无数据');
                        return false;
                    }
                }).catch(function(err) {
                    self.$message.error('请求失败，请检查刚绝是否正常。');
                    return false;
                });
            }
            
        },
        setdates(arr) {
            var obj = {},k, arr1 = [];
            for(var i = 0, len = arr.length; i < len; i++) {                   
                k = arr[i].operationTime;
                obj[k]?obj[k]++:obj[k] = 1;
            }

        //保存结果{el-'元素'，count-出现次数}
            for(var o in obj) {
                for(let i=0;i<obj[o];i++){
                    i===0?this.arr1.push(obj[o]):this.arr1.push(0);
                }
            }
            var t = setTimeout(function (){
                for(var i = 0, len = arr.length; i < len; i++) {
                    JsBarcode("#a"+arr[i].onlyID,arr[i].onlyID, {
                        format: "CODE128",//选择要使用的条形码类型
                        width:2,//设置条之间的宽度
                        height:45,//高度
                        displayValue:true,//是否在条形码下方显示文字
                        font:"fantasy",//设置文本的字体
                        textAlign:"left",//设置文本的水平对齐方式
                        textMargin:2,//设置条形码和文本之间的间距
                        fontSize:12,//设置文本的大小
                        background:"#00000000",//设置条形码的背景
                        lineColor:"#000000",//设置条和文本的颜色。
                        marginTop:15,//设置条形码周围的空白边距
                        marginRight:15, //设置条形码周围的空白边距
                        marginLeft:15,//设置条形码周围的空白边距
                        marginBottom:15 //设置条形码周围的空白边距
                    });
                }
            }, 10);
        },
        objectSpanMethod({ row, column, rowIndex, columnIndex }) {            
            if (columnIndex === 0) {
                let _row = this.arr1[rowIndex];
                let _col = this.arr1[rowIndex] > 0 ? 1 : 0;
                return {
                    rowspan: _row,
                    colspan: _col
                };
            }
        },
        categoryIdChange(value) {
            let self = this;
            self.categoryId = value[value.length-1];
        },
        // 触发搜索按钮
        handleSearch() {            
            let self = this;
            self.pageIndex= 1;
            self.getData();
        },
        // 删除操作
        handleDelete(index, row) {
            // 二次确认删除
            this.$confirm('确定要删除吗？', '提示', {
                type: 'warning'
            })
                .then(() => {
                    this.$message.success('删除成功');
                    this.tableData.splice(index, 1);
                })
                .catch(() => {});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        // 分页导航
        handlePageChange(val) {
            let self = this;
            self.pageIndex = val;
            this.getData();
        },

        handleSizeChange(val) {
            let self = this;
            self.pageSize = val;
            this.getData();
        },
        handleCurrentChange(val) {
            let self = this;
            self.cur_page = val;
            self.currentPage = val;
        },
        handleChange(file, fileList) {
            this.fileTemp = file.raw
            let fileName = file.raw.name
            let fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
            this.accountList =[];
            this.loading = true;
            // 判断上传文件格式
            if (this.fileTemp) {
                if ((fileType == 'xlsx') || (fileType == 'xls')) {
                    this.importf(this.fileTemp,'kc')
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
        handleChangewz(file, fileList) {
            this.fileTemp = file.raw
            let fileName = file.raw.name
            let fileType = fileName.substring(fileName.lastIndexOf('.') + 1);
            this.accountList =[];
            this.loading = true;
            // 判断上传文件格式
            if (this.fileTemp) {
                if ((fileType == 'xlsx') || (fileType == 'xls')) {
                    this.importf(this.fileTemp,'wz')
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
            this.loading = true;
        },
        beforeUpload() {
            this.loading = true;
        },
        importf(obj,parameter) {
            this.dialogVisible = true;
            let _this = this; 
            let inputDOM = this.$refs.inputer;   // 通过DOM取文件数据
            this.file = event.currentTarget.files[0];
            _this.excleType = parameter;
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
                        // debugger;//调试器
                        // console.log(jsonString);
                        v = JSON.parse(jsonString);
                        let obj = {}
                        obj.number = v.零件编号
                        if(parameter=='wz'){
                            obj.remark = v.仓储位置
                        }
                        if(parameter=='kc'){
                            obj.inventQty = v.库存数量
                        }
                        arr.push(obj)
                    })
                    _this.accountList = [...arr];
                    if(_this.accountList.length>0){
                        _this.loading = false;
                    }
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
            let self = this;
            bacthImport({  
                goodsData: self.accountList,
                excleType: self.excleType
            }).then(res => { 
                if(res.code == "00"){
                    self.$message.success('导入成功');      
                    self.getData();                  
                } else {
                    self.$message.error('导入不成功');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
            self.dialogVisible = false;
            // self.loading = false;
        },
        handleCurrentChange(val) {
            this.cur_page = val;
            this.currentPage = val;
        },
        exceldown(url){
            try{ 
                var elemIF = document.createElement("iframe");   
                elemIF.src = url;   
                elemIF.style.display = "none";   
                document.body.appendChild(elemIF);   
            }catch(e){ } 
            // window.open("http://oa.leadingdata.cn/02.xlsx");
        }
    }
};
</script>
<style>
#handle-box .el-upload{
    width:  auto;
    height: auto;
}
#handle-box .el-upload--text {
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
