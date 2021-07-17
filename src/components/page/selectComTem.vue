<template>
    <div style="height:90vh">   
            <div class="handle-box">
                <el-cascader v-model="categoryIdArr" :options="goodsClassData" clearable :props="{ expandTrigger: 'hover',checkStrictly: true }" @change="categoryIdChange" class="handle-input mr10" placeholder="试试搜索：类别名称" filterable></el-cascader>
                <el-input v-model="q" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
            </div>
            <div style="overflow:auto;height:85%;">
                <el-table :data="ComTableData" border class="table" height="100%" ref="multipleTable" header-cell-class-name="table-header" @selection-change="wlhandleSelectionChange">
                    <el-table-column type="selection" width="55" label="复选框" align="center"></el-table-column>
                    <el-table-column prop="number" label="物料编号"></el-table-column>
                    <el-table-column prop="name" label="名称" ></el-table-column>
                    <el-table-column prop="categoryName" label="所属分类" ></el-table-column>

                    <el-table-column prop="purPrice" width="100"  label="库存 " align="right">
                         <template slot-scope="scope">
                            {{scope.row.purPrice | formatDecimal}}
                        </template>                    
                    </el-table-column>
                    <el-table-column prop="unitName" label="计量单位" align="center" width="100"></el-table-column>                                 
                </el-table>
            </div>
            <div style="padding:18px 10px; position:absolute;bottom:0;background:#ffffff;width:100%;height50px;">
                <el-row :gutter="20">
                    <el-col :span="18">
                        <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
                    </el-col>
                    <el-col :span="6" style="text-align:right;padding-right:30px">
                        <el-button type="primary" icon="el-icon-plus" @click="addDomain">确认商品</el-button>
                    </el-col>
                </el-row>
            </div>    
    </div>
</template>

<script>
import { generateTree, selectGoods} from '../../api/goods';

export default {
    props:['domains'],
    
    data() {
        return {            
            ComTableData: [],
            q:'',            
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            categoryIdArr: [], 
            goodsClassData: [],    
            multipleSelection: [], 
        };
    },
    created() {
        //获取商品信息
        this.getComData();  

        //获取商品分类信息     
        this.getCategory();    
    },
    filters: {
        formatDecimal(num, decimal=2) {
            num?num = num.toString(): num = '0';
            var index = num.indexOf('.'); 
            if (index !== -1) {
                num = num.substring(0, decimal + index + 1);
            } else {
                num = num.substring(0);
            }
            return parseFloat(num).toFixed(decimal);        
        }
    }, 
    methods: {
        //获取 商品分类数据
        getCategory() {
            let self = this;
            generateTree().then(res => { 
                if(res.code == "00"){
                    self.goodsClassData = res.tree;
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
        categoryIdChange(value) {
            let self = this;
            self.categoryId = value[value.length-1];
        },
        addDomain() {
            const self = this;
            length = self.multipleSelection.length;
            if(length<1){
                self.$message.warning('请勾选需要物料选项！');
            }else{
                let str = '';
                for (let i = 0; i < length; i++) {
                    let istrue = false;
                    for (let j = 0; j < self.domains.length; j++) {
                        if(self.multipleSelection[i].id == self.domains[j].id){
                            str += self.multipleSelection[i].name + ' ';
                            istrue = true;
                            break;
                        }
                    }
                    if(!istrue){
                        self.multipleSelection[i].num ='1';                        
                        self.multipleSelection[i].qty =1;                      
                        self.multipleSelection[i].rQty =1;                    
                        self.multipleSelection[i].baseUnitId =self.multipleSelection[i].unitId;                        
                        self.multipleSelection[i].ARNum =0;
                        self.multipleSelection[i].goods_cost =0;
                        self.multipleSelection[i].good_remark ='';
                        self.multipleSelection[i].deliveryNumDays =1;
                        self.domains.push(self.multipleSelection[i]); 
                    }
                }                
                if(str){
                    self.$message.warning('物料'+ str +'已增加');
                }
            }

            self.$refs.multipleTable.clearSelection();    
            self.$emit('fuaddDomain',self.domains)        
        },
        handleClose(done) {
            this.$refs.multipleTable.clearSelection(); 
            this.box = true;
            done();  
        }, 
        // 获取物料数据
        getComData() {
            let self = this;
            selectGoods({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                categoryId:self.categoryId,
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.ComTableData = res.rec;
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
        // 触发搜索按钮
        handleSearch() {
            this.pageIndex = 1;
            this.getComData();
        },    
        // 多选操作
        wlhandleSelectionChange(val) {
            this.multipleSelection = val;
        },
        // 分页导航
        handlePageChange(val) {
            this.pageIndex = val;
            this.getComData();
        }
    }
};
</script>

<style>

#container .el-upload--text{
    height: 32px;
    border:0px;
    text-align: left;
    display: inline;
}
#container .el-upload-list{
    display: none;
}
#advance_name input{
    border:0;
    text-align: center;
    font-size: 35px;
    height: 70px;

}
/*.el-drawer {
    overflow: auto;
}*/
</style>
<style scoped>
.handle-box {
    margin:0 0 20px 10px;
}
.handle-select {
    width: 120px;
}
.handle-mac-type {
    width: 100px;
}
.handle-mac-co {
    width: 30%;
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
    width: 140px;
    display: inline-block;
}
.handle-input2 {
    width: 40%;
    display: inline-block;
}
.table {
    width: calc(100% - 20px);
    margin: 0 10px; 
    font-size: 10px;
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
</style>
