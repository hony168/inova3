<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 出库管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <!-- <el-button type="danger" icon="el-icon-delete" class="handle-del mr10" @click="delAllSelection">批量删除</el-button> -->
                <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-date-picker v-model="value1" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="mr10"></el-date-picker>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">查询</el-button>
                <!-- <el-button type="success" icon="el-icon-plus" @click="handleSearch">增加出库单</el-button> -->
                <!-- <el-button icon="el-icon-upload2" @click="handleSearch">导出单据</el-button> -->
            </div>
             <el-row :gutter="20" style="margin-top:15px;">
                <el-col :span="4"  style="margin-top:25px;">
                    <el-card class="box-card"  style="text-align:center;">
                        <el-button class="addType" plain @click="handleSearch">
                            <i class="el-icon-plus icon_style"></i>
                            <div class="type_title">增加出库单</div>
                        </el-button>                            
                    </el-card>
                </el-col>


                <el-col :span="4" v-for="(psort,index) in tableData"  style="margin-top:25px;">
                    <div class="grid-content bg-purple" @click="QOrderList(psort)" @mouseover="mouseover(index)" @mouseleave="mouseLeave(index)" :style="active">
                        <div style="width:100%;height:0px; position:relative;top:1px;right:1px;text-align:right;display:none;" ref="acp">
                            <vue-qr :text="psort.CKBillNo" :size="100"></vue-qr>                          
                        </div>
                        <div>
                            <el-card class="box-card">
                                <div class="model_name">单据编号：{{ psort.CKBillNo }}</div>
                                <div class="model_num">申请人：{{ psort.CKApplyName }}</div>
                                <div class="model_num">时间：{{ psort.CKCreateTime }}</div>
                                <div style="text-align:right;padding-top:8px;">
                                    <el-button round size="mini">备料</el-button>
                                </div>
                            </el-card>  

                        </div>                 
                    </div>       
                </el-col>
            </el-row>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog :title="'领料单号'+showInfoform.CKBillNo" align='center' :visible.sync="boxVisible" top="2vh" width="70vw">            
            <el-table :data="orderData" border :span-method="objectSpanMethod" style="font-size:10px" class="table" ref="multipleTable" header-cell-class-name="table-header" @cell-click="showSOInfo" height="63vh">
                <el-table-column prop="categoryName" label="所属分类" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="number" label="物料编号" width="120"></el-table-column>
                <el-table-column prop="name" label="名称" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="CKqty" width="80"  label="出库数量" align="right">
                     <template slot-scope="scope">
                        {{scope.row.CKqty | formatDecimal}}
                    </template>
                </el-table-column>
                <el-table-column prop="haveOutboundQty" width="120"  label="完成备货数量" align="right">
                     <template slot-scope="scope">
                        {{scope.row.haveOutboundQty | formatDecimal}}
                    </template>
                </el-table-column>
                <el-table-column prop="outboundQty" width="100"  label="备货中数量" align="right">
                     <template slot-scope="scope">
                        {{scope.row.outboundQty | formatDecimal}}
                    </template>
                </el-table-column>
                <el-table-column v-if="percentage<1&&showInfoform.CKtransType==1" label="操作" width="100" align="center">
                    <template slot-scope="scope">
                        <el-button v-if="scope.row.CKqty>scope.row.outboundQty" type="text" icon="el-icon-sort" @click="comGoods(scope.row)">确认物料</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <span slot="footer" class="dialog-footer">
                <el-button v-if="percentage>=1 && showInfoform.CKtransType==1" type="primary" @click="finish">完成备料</el-button>
                <el-button v-if="showInfoform.CKtransType==2" type="danger" @click="finishCKOrder">商品出库</el-button>
        
                <el-button @click="boxVisible = false">取 消</el-button>
            </span>
        </el-dialog>
        <!-- 确认物料弹出框 -->
        <el-dialog :visible.sync="comVisible" width="40vw" top="5vh"> 
            <div style="margin:-25px 0 15px 0;line-height:20px;">
                <b>物料名称：</b>{{showComGoods.name}} 　　<b>物料编号：</b>{{showComGoods.number}}<br>
                <b>需要数量：</b>{{showComGoods.CKqty}} ({{showComGoods.unitName}})
            </div>

            <el-input v-model="input" @input="querySearch" placeholder="请输入内容" :disabled="inputStaer" ref="input"></el-input>  

           
            <el-table :data="showComGoodsData" border style="font-size:10px" class="table" ref="multipleTable" header-cell-class-name="table-header" @selection-change="handleSelectionChange" height="63vh">
                <el-table-column type="selection" width="50" align="center"></el-table-column>
                <el-table-column prop="onlyID" label="唯一物料身份证号" :show-overflow-tooltip="true"></el-table-column>
                <!-- <el-table-column prop="remainderQty" width="80"  label="余量" align="right"></el-table-column> -->
                <el-table-column prop="remainderQty" width="120"  label="出库量" align="right">
                     <template slot-scope="scope">

                     <el-input v-model="scope.row.outQty" @input="outQtyInput(scope.row)" placeholder="请输入库存" autocomplete="off" oninput="value=value.replace(/[^\d.]/g, '').replace(/\.{2,}/g, '.').replace('.', '$#$').replace(/\./g, '').replace('$#$', '.').replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3').replace(/^\./g, '')"></el-input>
                    </template>
                </el-table-column>
            </el-table> 

            <span slot="footer" class="dialog-footer">
                <el-button type="primary" @click="comPreparation">确定</el-button>
                <el-button @click="comVisible = false">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>

import vueQr from 'vue-qr';
import { QCKOrderList,QgoodsInventoryList,seaCKBilleGodds,comGoodsCK,finishGoodsCK } from '../../api/goods';
import { seaMaterialOrder,editCKOrderTate } from '../../api/orders';
export default {
    name: 'qecode',
    data() {
        return {
            drawer: false,
            q:'',
            value1:'', 
            active:'',
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            options: [],
            orderData: [],
            showComGoodsData: [],
            arr1:[],
            input:'',
            tableData: [],
            multipleSelection: [],
            delList: [],
            boxVisible: false,
            comVisible: false,
            inputStaer: false,
            pageTotal: 0,
            showInfoform: {},
            showComGoods: {},
            remainderQty:0,
            percentage:0
        };
    },
    components: {
        vueQr
    },
    mounted() {
       
    },
    created() {
        this.getData();
    },
    filters: {
        formatDecimal(num, decimal=3) {
            num?num = num.toString(): num = '0';
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
        outQtyInput(row){
            let self = this;
            // self.remainderQty=row.remainderQty;
            if(row.outQty>row.remainderQty){
                self.$message.warning('超出余量，请重新填写！');
                row.outQty=row.remainderQty;
            }

            // console.log(row)
        },
        querySearch() {
            let self = this;
            if(self.input && self.input.length>7){
                seaCKBilleGodds({  
                    'onlyID':self.input,
                    'i_goodsID':self.showComGoods.id
                }).then(res => { 
                    if(res.code == "00"){
                        if(res.rec){
                            var index = self.showComGoodsData.map(function(el){return el.onlyID;}).indexOf(self.input*1); 
                            if (index == -1) { 
                                res.rec.outQty = res.rec.remainderQty;
                                self.showComGoodsData.push(res.rec);
                                self.showComGoods.CKqty>self.showComGoodsData.length?self.inputStaer=false:self.inputStaer=true;
                            } else{
                                self.$message.warning('商品已增加！');
                            }
                            self.input = '';
                        } 
                    } else {
                        self.$message.success('商品不匹配，请核实商品！');
                        return false;
                    }  
                }).catch(function(err) {
                    self.$message.error('请求失败，请检查刚绝是否正常。');
                    return false;
                });                
            }
        },
        
        // 获取 easy-mock 的模拟数据
        getData() {
            let self = this;
            seaMaterialOrder({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                CKtransType:[1,2,3],
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.tableData = res.rec;
                    self.pageTotal = res.total || 0;
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
        mouseover(val) {
            var acps = this.$refs.acp;
            acps[val].style.display = "block";
        },
        mouseLeave(val) {
            this.active = "";
            var acps = this.$refs.acp;
            acps[val].style.display = "none";
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
        delAllSelection() {
            const length = this.multipleSelection.length;
            let str = '';
            this.delList = this.delList.concat(this.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += this.multipleSelection[i].name + ' ';
            }
            this.$message.error(`删除了${str}`);
            this.multipleSelection = [];
        },
        // 查询某一出库订单商品记录
        QOrderList(row) {
            let self = this; 
            self.showInfoform = row;
            self.boxVisible = true;
            QCKOrderList({  
                'CKID':row.CKID
            }).then(res => { 
                if(res.code == "00"){
                    self.orderData = res.rec;
                    self.comVisible = false;
                    self.setdates(res.rec);
                    self.percentage = res.num;
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
        // 查询某一商品所有库存
        comGoods(row) {
            let self = this; 
            self.showComGoodsData=[];
            self.showComGoods = row;
            self.comVisible = true;
            self.inputStaer=false;

            this.$nextTick(() => {
                this.$refs.input.focus();
            });
        },
        comPreparation(){
            let self = this; 
            comGoodsCK({  
                'CKLID':self.showComGoods.CKLID,
                'CKLCKID':self.showComGoods.CKLCKID,
                'showComGoodsData':self.showComGoodsData
            }).then(res => { 
                if(res.code == "00"){
                    self.showComGoodsData=[];
                    self.orderData = res.rec;
                    self.comVisible = false;
                    self.QOrderList(self.showInfoform);
            
                }else{
                    self.$message.error('暂无数据');
                    return false;
                }  
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },
        finish(){
            let self = this; 
            if(self.showInfoform.CKtransType>1 ){
                return false;  
            }        
            finishGoodsCK({  
                'CKID':self.showInfoform.CKID,
                'CKtransType':2,
                'GoodsData':self.orderData
            }).then(res => { 
                if(res.code == "00"){
                    self.getData();
                    self.$message.success('备货完成');    
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }  
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
            self.boxVisible = false;
            self.getData();

        },
        finishCKOrder(){
            let self = this;            
            editCKOrderTate({  
                'CKID':self.showInfoform.CKID,
                'CKtransType':3,
            }).then(res => { 
                 if(res.code == "00"){
                    self.getData();
                    self.$message.success('完成出货');    
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }  
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
            self.boxVisible = false;            
            self.getData();
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
        setdates(arr) {
            var obj = {},k, arr1 = [];
            for(var i = 0, len = arr.length; i < len; i++) {                   
                k = arr[i].categoryName;
                obj[k]?obj[k]++:obj[k] = 1;
            }

        //保存结果{el-'元素'，count-出现次数}
            for(var o in obj) {
                for(let i=0;i<obj[o];i++){
                    i===0?this.arr1.push(obj[o]):this.arr1.push(0);
                }
            }
        },
        // 展示订单详细信息
        showSOInfo(row,column,event,cell){
            let self = this;
        },
        // 保存编辑
        saveEdit() {
            this.boxVisible = false;
        },
        // 分页导航
        handlePageChange(val) {
            let self = this;
            self.pageIndex = val;
            this.getData();
        }
    },
    watch: {
        $route(){            
            this.getData(); 
        },        
        'showInfoform.CKtransType': {
            handler(newName, oldName) {},
            deep: true,
            immediate: true
        }
    }
};
</script>

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
.model_num{
    font-size: 10px;
    padding-bottom: 0px;
    color:#00000080;
}
.model_name{
    padding-top: 10px;
    padding-bottom: 15px;
}

.addType{
    text-align: center;
    font-size: 10px;
    width: 100px;
    height: 100px;
    border:2px solid ;
    margin:14px 0 18px 0; 
    border-radius:50% 50% 50% 50%;
}
.icon_style{
    font-size: 36px;
    line-height: 42px;
    font-weight: 1000;
}
</style>
