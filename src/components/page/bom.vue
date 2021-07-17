<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> BOM管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button type="danger" icon="el-icon-delete" class="handle-del mr10" @click="delAllSelection">批量删除</el-button>
                <el-cascader v-model="value" :options="options" :props="{ expandTrigger: 'hover' }" @change="handleChange" placeholder="请选择分类" class="handle-input mr10"></el-cascader>
                <el-input v-model="q" placeholder="请输入BOM名称" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="success" icon="el-icon-plus" @click="AddBom">增加BOM模板</el-button>
            </div>
            <el-table :data="tableData" border style="font-size:10px" stripe class="table" ref="multipleTable" header-cell-class-name="table-header"  @cell-click="showSOInfo" @selection-change="handleSelectionChange" height="63vh">
                <el-table-column type="selection" width="50" align="center"></el-table-column>
                <el-table-column label="操作" width="180" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-sort" @click="turnoverFun(scope.$index, scope.row)">往返记录</el-button>
                        <el-button type="text" icon="el-icon-edit"  @click="editBOMModel">编辑模板</el-button>
                    </template>
                </el-table-column>
                <el-table-column prop="BOMId" width="180" label="编号" sortable :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="BOMName" label="模板名称" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="createName" width="120" label="制模板人" align="center"></el-table-column>
                <el-table-column prop="createTime" width="120" label="创建日期" sortable></el-table-column>
                <el-table-column prop="status" width="80"  label="状态" align="center">
                     <template slot-scope="scope">
                        {{scope.row.billStatus }}
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 订单详情弹出框 -->
        <el-dialog title="BOM模板细信息" align='center' :before-close="bomClose"  :visible.sync="showVisible" top="2vh" width="70vw">
            <el-form ref="form" :model="showInfoform" label-width="0px">
                <el-row>
                    <el-col :span ="6" class="list_unit" style="margin-left:20px;">名称：{{showInfoform.BOMName}}</el-col>
                    <el-col :span ="6" class="list_unit" >制模板人：{{showInfoform.createName}}</el-col>
                    <el-col :span ="10" class="list_unit">日期：{{showInfoform.createTime}}</el-col>
                </el-row>                 
                <el-row style="border:1px solid #000;text-align:left;">                   
                    <div class="handle-box" style="margin:10px 0 10px 10px;"> 
                        <el-cascader v-model="categoryIdArr" :options="goodsClassData" clearable :props="{ checkStrictly: true }" @change="categoryIdChange" class="handle-input mr10" placeholder="试试搜索：类别名称" filterable></el-cascader>
                        <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                        <el-button type="primary" icon="el-icon-search" @click="getBOMListData(showInfoform.BOMId)">搜索</el-button>
                    </div>
                    <el-tabs v-model="activeBomName" @tab-click="handleBomClick" style="margin:0 10px;">
                        <el-tab-pane label="所有物料" name="0"></el-tab-pane>
                        <el-tab-pane label="标准结构件" name="1"></el-tab-pane>
                        <el-tab-pane label="电气件" name="2"></el-tab-pane>
                        <el-tab-pane label="机械加工件" name="3"></el-tab-pane>
                        <el-tab-pane label="包装材料" name="4"></el-tab-pane>
                        <el-tab-pane label="其它" name="5"></el-tab-pane>
                    </el-tabs>
                    <el-table :data="domains" style="font-size:10px" class="table" ref="multipleTable" height="58vh" header-cell-class-name="table-header">
                        <el-table-column prop="num" width="60" label="操作" align="center"  v-if="editBOMState">
                            <template slot-scope="scope">
                                <el-button type="text" icon="el-icon-circle-plus-outline" @click="addMaterial"></el-button>
                                <el-button type="text" icon="el-icon-delete"  @click="removeDomain(scope.row)"></el-button>
                            </template>
                        </el-table-column>
                        <el-table-column prop="number" width="100" :show-overflow-tooltip="true" label="物料编号"></el-table-column>
                        <el-table-column prop="name" label="物料名称" ></el-table-column>             
                        <el-table-column prop="rQty" label="要求数量" width="150" align="center">                            
                             <template slot-scope="scope">
                                <el-input-number size="mini" v-model="scope.row.rQty" :precision="2" :min="0" v-if="editBOMState"></el-input-number>
                                <span v-else>{{scope.row.rQty | formatDecimal}}</span>
                            </template>
                        </el-table-column>           
                        <el-table-column prop="unitName" width="50" label="单位" align="center"></el-table-column>
                        </el-table-column>                        
                    </el-table>
                    <div class="pagination">
                        <el-pagination background layout="total, prev, pager, next" :current-page="BOMpageIndex" :page-size="BOMpageSize" :total="BOMpageTotal" @current-change="BOMhandlePageChange"></el-pagination>
                    </div>

                  
                </el-row>
                <el-row>
                    <el-col :span ="24" class="list_unit" align="left">备注:</el-col>
                </el-row>
            </el-form>
            <!-- <span slot="footer" v-if="editBOMState" class="dialog-footer"> -->
            <span slot="footer" class="dialog-footer" v-if="activeBomName!=0">
                <el-button  type="success"  @click="submitOrderReview(showInfoform.BOMId)">保存</el-button>
                <el-button @click="addMaterial" >新增商品</el-button>
                <el-button @click="showVisible = false">取 消</el-button>
            </span>
        </el-dialog>
 
        <!-- 增加模板 -->
        <el-dialog title="" :visible.sync="addVisible" width="35%">        
            <el-form ref="form" :model="form" label-width="170px" :rules="rules">
                <el-form-item label="BOM模板分类：" prop="parentId">               
                    <el-cascader v-model="form.parentId" :options="options" :props="{ expandTrigger: 'hover' , checkStrictly: true }" placeholder="请选择分类"></el-cascader>
                </el-form-item>
                <el-form-item label="模板名称：" prop="BOMName">
                    <el-input style="width:15vw;" v-model="form.BOMName"></el-input>
                </el-form-item>
                
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addVisible = false">取 消</el-button>
                <el-button type="primary" @click="submitBOMData('form')">确 定</el-button>
            </span>
        </el-dialog>

        <!-- 往返记录 -->
        <el-dialog title="" :visible.sync="turnoverVisible" width="55%">
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="增加商品" name="first">
                    <el-table :data="turnoverAddData" style="font-size:10px" class="table" ref="multipleTable" height="58vh" header-cell-class-name="table-header">
                        <el-table-column prop="stockID" width="100" :show-overflow-tooltip="true" label="唯一ID"></el-table-column>
                        <el-table-column prop="number" width="100" :show-overflow-tooltip="true" label="物料编号"></el-table-column>
                        <el-table-column prop="name" label="物料名称" ></el-table-column>
                        <el-table-column prop="num" label="数量" width="80" align="center"></el-table-column>                                             
                        <el-table-column prop="unitName" width="50" label="单位" align="center"></el-table-column>  
                        <el-table-column prop="locationName" width="180" label="仓库" :show-overflow-tooltip="true"></el-table-column>                       
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="减少商品" name="second">
                    <el-table :data="turnoverSubtractData" style="font-size:10px" class="table" ref="multipleTable" height="58vh" header-cell-class-name="table-header">
                        <el-table-column prop="stockID" width="100" :show-overflow-tooltip="true" label="唯一ID"></el-table-column>
                        <el-table-column prop="number" width="100" :show-overflow-tooltip="true" label="物料编号"></el-table-column>
                        <el-table-column prop="name" label="物料名称" ></el-table-column>
                        <el-table-column prop="num" label="数量" width="80" align="center"></el-table-column>                                             
                        <el-table-column prop="unitName" width="50" label="单位" align="center"></el-table-column>  
                        <el-table-column prop="locationName" width="180" label="仓库" :show-overflow-tooltip="true"></el-table-column>                       
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="报费商品" name="third">
                    <el-table :data="turnoverCancellationData" style="font-size:10px" class="table" ref="multipleTable" height="58vh" header-cell-class-name="table-header">
                        <el-table-column prop="stockID" width="100" :show-overflow-tooltip="true" label="唯一ID"></el-table-column>
                        <el-table-column prop="number" width="100" :show-overflow-tooltip="true" label="物料编号"></el-table-column>
                        <el-table-column prop="name" label="物料名称" ></el-table-column>
                        <el-table-column prop="num" label="数量" width="80" align="center"></el-table-column>                                             
                        <el-table-column prop="unitName" width="50" label="单位" align="center"></el-table-column>  
                        <el-table-column prop="locationName" width="180" label="仓库" :show-overflow-tooltip="true"></el-table-column>                       
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="其他" name="fourth">
                    <el-table :data="turnoverOthernData" style="font-size:10px" class="table" ref="multipleTable" height="58vh" header-cell-class-name="table-header">
                        <el-table-column prop="stockID" width="100" :show-overflow-tooltip="true" label="唯一ID"></el-table-column>
                        <el-table-column prop="number" width="100" :show-overflow-tooltip="true" label="物料编号"></el-table-column>
                        <el-table-column prop="name" label="物料名称" ></el-table-column>
                        <el-table-column prop="num" label="数量" width="80" align="center"></el-table-column>                                             
                        <el-table-column prop="unitName" width="50" label="单位" align="center"></el-table-column>  
                        <el-table-column prop="locationName" width="180" label="仓库" :show-overflow-tooltip="true"></el-table-column>                       
                    </el-table>
                </el-tab-pane>
            </el-tabs>
        </el-dialog>
        <!-- 领料 -->
        <el-dialog title="" :visible.sync="getMaterialVisible" width="55%">
            <el-table :data="turnoverAddData" style="font-size:10px" class="table" ref="multipleTable" height="58vh" header-cell-class-name="table-header">
                <el-table-column prop="stockID" width="100" :show-overflow-tooltip="true" label="唯一ID"></el-table-column>
                <el-table-column prop="number" width="100" :show-overflow-tooltip="true" label="物料编号"></el-table-column>
                <el-table-column prop="name" label="物料名称" ></el-table-column>
                <el-table-column prop="num" label="可领数量" width="80" align="center"></el-table-column>                                             
                <el-table-column prop="unitName" width="50" label="单位" align="center"></el-table-column>  
                <el-table-column prop="locationName" width="180" label="仓库" :show-overflow-tooltip="true"></el-table-column>                       
            </el-table>                    
        </el-dialog>

        <el-drawer title="选择商品"  :visible.sync="dialog" direction="ltr" custom-class="demo-drawer" size="65%" ref="drawer">   
            <SelectComTem :box="dialog" :domains="domains" @fuaddDomain="fuaddDomain"></SelectComTem>

        </el-drawer>
    </div>
</template>

<script>
import SelectComTem from './selectComTem.vue'
import { seaBom,bomTree,addBOMs,generateTree,seaBomModelData,addBOMGoods} from '../../api/goods';

export default {
    components: {
        SelectComTem       
    },
    data() {
        return {
            drawer: false,
            categoryIdArr: [], 
            goodsClassData: [],  
            turnoverAddData: [{
                "stockID":"LV429931","turnoverName":1,"name":"\u5e26\u6f0f\u7535\u4fdd\u62a4\u5851\u58f3\u65ad\u8def\u5668,3P,100A","number":"02-1000-0001","num":3,"unitName":"\u4e2a","locationName":"\u6c5f\u897f\u4ed3\u5e93"
            },{
                "stockID":"LV496852","turnoverName":1,"name":"微型断路器，C65N 小型断路器, C曲线, 2P, 16A","number":"02-1000-0003","num":1,"unitName":"\u4e2a","locationName":"\u6c5f\u897f\u4ed3\u5e93"
            },{
                "stockID":"LV896315","turnoverName":1,"name":"熔断器底座，单层，6.3A,500v","number":"02-1000-0009","num":2,"unitName":"\u4e2a","locationName":"\u6c5f\u897f\u4ed3\u5e93"
            }],
            turnoverSubtractData: [{
                "stockID":"WV493166","turnoverName":1,"name":"断路器，40A,3P","number":"02-1000-0002","num":2,"unitName":"\u4e2a","locationName":"\u6c5f\u897f\u4ed3\u5e93"
            }],
            turnoverCancellationData: [{
                "stockID":"LV429931","turnoverName":1,"name":"\u5e26\u6f0f\u7535\u4fdd\u62a4\u5851\u58f3\u65ad\u8def\u5668,3P,100A","number":"02-1000-0001","num":3,"unitName":"\u4e2a","locationName":"\u6c5f\u897f\u4ed3\u5e93"
            }],
            turnoverOthernData: [],
            domains: [],
            activeName: 'first',
            activeBomName: '0',
            outOptions: [{
                value: 'add',
                label: '增加'
            },{
                value: 'subtract',
                label: '减少'
            },{
                value: 'cancellation',
                label: '报费'
            },{
                value: 'other',
                label: '其他'
            }],
            rules: {                
                BOMName: [
                    { required: true, message: '请输入模板名称', trigger: 'change' }
                ]
            },
            q:'',
            editBOMState:false,
            value1:'',
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            BOMpageIndex: 1,
            BOMpageSize: 20,
            BOMpageTotal: 0,
            pageBomId:0,
            showVisible: false,            
            dialog: false,            
            turnoverVisible: false,   
            getMaterialVisible: false,
            showInfoform:{},
            tableData: [],
            value:[],
            options: [],
            multipleSelection: [],
            delList: [],
            addVisible: false,
            pageTotal: 0,
            form: {},
            idx: -1,
            id: -1,
        };
    },
    created() {        
        // 获取模板数据
        this.getData();

        // 获取BOM分类数据
        this.getBOMTreeData();

        //获取 商品分类数据
        this.getCategory();
        
    },
    filters: {
        formatDecimal(num, decimal=2) {
            num?num = num.toString(): num = '0';
            var index = num.indexOf('.');
            if (index !== -1) {
                num = num.substring(0, decimal + index + 1)
            } else {
                num = num.substring(0)
            }
            return parseFloat(num).toFixed(decimal)
        }
    },   
    methods: {
        // 获取模板数据
        getData() {
            let self = this;
            seaBom({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                parentId:self.parentId,
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
        // 获取BOM模板中的数据
        getBOMListData(bomId) {
            let self = this;
            seaBomModelData({  
                pageIndex: self.BOMpageIndex,
                pageSize: self.BOMpageSize,
                parentId:self.parentId,                
                categoryId:self.categoryId,      
                bomType:self.activeBomName,
                bomId:bomId,
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.domains = res.rec;
                    self.BOMpageTotal = res.total || 0;
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
        
        //获取 商品分类数据
        getCategory() {
            let self = this;
            generateTree().then(res => { 
                if(res.code == "00"){
                    self.goodsClassData = res.tree;
                } else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },
        // 获取BOM分类数据
        getBOMTreeData() {
            let self = this;
            bomTree({ 
                transType:150601,
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.options = res.tree;                
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        }, 

        categoryIdChange(value) {
            let self = this;
            self.categoryId = value[value.length-1];
        },
        handleClick(tab, event) {
            console.log(tab, event);
        },
        handleBomClick(tab, event) {
            let self = this;
            self.activeBomName = tab.name;
            console.log(self.showInfoform.BOMId);
            self.getBOMListData(self.showInfoform.BOMId);
        },
        
        handleChange(value) {
            console.log(value);
        },
        fuaddDomain(data) {
            const self = this;          
            self.dialog = false;
            self.domains = data;      
        },
        // BOM提交
        submitOrderReview(bomId){
            let self = this;
            let goodsData = [];
            if(self.domains.length<1){
                self.$message.error('无物料！');
                return false;
            }else{
                console.log()
                for (let i = 0; i < self.domains.length; i++) {                   
                    let onegoods = { 
                        'id':self.domains[i].id, 
                        'rQty':self.domains[i].rQty,
                        'name':self.domains[i].name,
                        'number':self.domains[i].number,
                        'unitName':self.domains[i].unitName,
                        'baseUnitId':self.domains[i].baseUnitId,
                        'categoryId':self.domains[i].categoryId,
                        'categoryName':self.domains[i].categoryName,
                        'remark':self.domains[i].remark,
                        'bomId':bomId,
                        'bomType':self.activeBomName
                    }
                    goodsData[i]= onegoods; 
                }
            }
            addBOMGoods({  
                goodsData:goodsData,
            }).then(res => { 
                if(res.code == "00"){
                    self.showVisible = false;
                    self.getData();
                    self.$message.warning('提交成功');
                } else if(res.code == "-100"){
                    self.$message.warning('登录超时');
                    sessionStorage.removeItem('admin_name');
                    self.$router.push('/login');
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
            

        },
        editBOMModel(){
            let self = this;
            self.showVisible = true;
            self.editBOMState = true;
        },
        
        // 展示订单详细信息
        showSOInfo(row,column,event,cell){
            let self = this;
            self.pageBomId = 0;
            self.showInfoform =row;
            if(column.label !="操作" && column.label !="复选框"){
                self.showVisible = true;

                self.activeBomName = '0';
            }
            self.pageBomId = row.BOMId;
            self.getBOMListData(row.BOMId);
            
        },
          
        addMaterial(){
            let self = this;
            self.dialog = true;
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
        // 商品往返记录
        turnoverFun(){
            this.turnoverVisible = true;
        },
        // 领料
        getMaterial(){
            this.getMaterialVisible = true;
        },
        // 增加BOM操作
        AddBom() {
            this.addVisible = true;
        },
        // 关闭BOM编辑框操作
        bomClose(done) {
            this.editBOMState = false;
            done();
        },

        // 商品移出BOM模板操作
        removeDomain(item) {  
            let self = this;
            console.log(item)
            var index = self.domains.indexOf(item);
            if (index !== -1) {
              self.domains.splice(index, 1);
            }
        },
       
        // 提交新增BOM数据
        submitBOMData(formName){
            let self = this;
            if(self.form.parentId){
                self.form.parentId.length>0?self.form.parentId = self.form.parentId[self.form.parentId.length-1]:self.form.parentId = self.form.parentId[0];
            }else{
                self.form.parentId=0;
            }
            self.form.createName = sessionStorage.getItem('admin_name'),//制模板人
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    addBOMs(self.form).then(res => { 
                        if(res.code == "00"){
                            self.$router.push('/advanceOrder');
                            self.$message.warning('提交成功');
                        } else if(res.code == "-100"){
                            self.$message.warning('登录超时');
                            sessionStorage.removeItem('admin_name');
                            self.$router.push('/login');
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
        // 保存商品增减编辑
        saveEdit() {
            this.addVisible = false;
            this.$message.success(`修改第 ${this.idx + 1} 行成功`);
            // this.$set(this.tableData, this.idx, this.form);
        },
        // 分页导航
        handlePageChange(val) {
            let self = this;
            self.pageIndex = val;
            this.getData();
        },
        // BOM分页导航
        BOMhandlePageChange(val) {
            let self = this;
            self.BOMpageIndex = val;
            this.getBOMListData(self.pageBomId);
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
.batch_input{
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0; 
    cursor: pointer;
    height: 32px; 
    width: 125px;
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
.table {
    width: calc(100% - 20px);
    margin: 0 10px; 
    font-size: 14px;
}

.handle-input {
    width: 140px;
    display: inline-block;
}
.handle-input2 {
    width: 40%;
    display: inline-block;
}
.ml-35{
    margin-left: -35px;
}
.plr10{
    padding:0 10px; 
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
