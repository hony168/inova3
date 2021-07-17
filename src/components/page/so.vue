<template>
    <div>
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-lx-cascades"></i> 销售管理
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container">
            <div class="handle-box">
                <el-button v-if="userPower.indexOf('5001')>-1" type="danger" icon="el-icon-delete" class="handle-del mr10" @click="delAllSelection">批量删除</el-button>
                <el-input v-model="q" placeholder="请输入单据号、客户名称" class="handle-input mr10"></el-input>
                <el-date-picker v-model="value1" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" class="mr10"></el-date-picker>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button v-if="userPower.indexOf('5000')>-1" type="success" icon="el-icon-plus" @click="SOAdd">增加销售订单</el-button>
                <!-- <el-button icon="el-icon-printer" @click="handleSearch">打印</el-button>
                <el-button icon="el-icon-upload2" @click="handleSearch">导出</el-button>-->
            </div>            
            <el-tabs v-model="activeName" @tab-click="handleClick">
                <el-tab-pane label="全部" name="0"></el-tab-pane>
                <el-tab-pane label="待审核" name="1"></el-tab-pane>
                <el-tab-pane label="审核通过" name="2"></el-tab-pane>
                <el-tab-pane v-if="userPower.indexOf('5002')>-1" label="驳回" name="3"></el-tab-pane>
                <el-tab-pane label="待发货" name="4"></el-tab-pane>
                <el-tab-pane label="已收货" name="5"></el-tab-pane>
                <el-tab-pane label="客户签收" name="6"></el-tab-pane>
                <el-tab-pane label="完成付款" name="7"></el-tab-pane>
            </el-tabs>
            <el-table :data="tableData" border style="font-size:10px" stripe class="table" ref="multipleTable" header-cell-class-name="table-header"  @cell-click="showSOInfo" @selection-change="handleSelectionChange" height="63vh">
                <el-table-column type="selection" width="50" align="center"></el-table-column>          
                <el-table-column label="操作" width="70" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-picture" @click="imgEdit(scope.row,0)">附件</el-button>
                    </template>
                </el-table-column>     
                <el-table-column prop="billDate" width="120" label="单据日期" sortable></el-table-column>
                <el-table-column prop="billEndDate" width="120" label="交货日期" sortable></el-table-column>
                <el-table-column prop="soBillNo" width="180" label="单据编号" sortable :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="contactName" label="客户" :show-overflow-tooltip="true"></el-table-column>
                <el-table-column prop="salesName" width="80" label="销售员" :show-overflow-tooltip="true" align="center"></el-table-column>
                <el-table-column prop="totalAmount" width="120" label="销售金额" align="right">                    
                     <template slot-scope="scope">
                        {{scope.row.totalAmount | formatDecimal}}
                    </template>
                </el-table-column>                
                <el-table-column prop="rpAmount" width="100"  label="已收款" align="right">
                     <template slot-scope="scope">
                        {{scope.row.rpAmount | formatDecimal}}
                    </template>                    
                </el-table-column>
                <el-table-column prop="hxStateCode" width="100"  label="收款状态" align="right">
                     <template slot-scope="scope">
                        {{scope.row.hxStateCode | payState}}
                    </template>                    
                </el-table-column>
                <el-table-column prop="userName" width="70"  label="制单人" ></el-table-column>
                <el-table-column prop="checkName" width="70"  label="审核人" ></el-table-column>
                <el-table-column label="状态" align="center" width="80" >
                    <template slot-scope="scope">
                        {{scope.row.billStatus | formatState}}
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" :show-overflow-tooltip="true"></el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="pageIndex" :page-size="pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 增加销售订单弹出框 -->
        <el-dialog title="销售订单详细信息" id='boxso' align='center' :visible.sync="showAddVisible" top="5vh" width="70vw">
            <div class="container" id="container">
                <el-form id="ADDform" :model="ADDform" label-width="100px" class="demo-dynamic" :rules="rules" ref="ADDform">
                    <el-row>
                        <el-col :span="9" class="list_unit">
                            <el-form-item label="订单编号：" prop='soBillNo'>
                                <el-input v-model="ADDform.soBillNo" placeholder="请输入订单编号一旦生成不可修改"></el-input>
                            </el-form-item>
                        </el-col>

                        <el-col :span="5" class="list_unit">
                            <el-form-item label="销售员：" prop="salesId">
                                <el-select v-model="ADDform.salesId" placeholder="请选择">
                                    <el-option v-for="item in staffData" :key="item.value" :label="item.label" :value="item.value"></el-option>
                                </el-select>                          
                            </el-form-item>
                        </el-col>
                        <el-col :span="5" class="list_unit">
                            <el-form-item label="单据日期：" prop='billDate'>
                                <el-date-picker type="date" placeholder="选择单据日期" v-model="ADDform.billDate" format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
                            </el-form-item>          
                        </el-col>
                        <el-col :span="5" class="list_unit">
                            <el-form-item label="交货日期：" prop='billEndDate'>
                                <el-date-picker type="date" placeholder="选择交货日期" v-model="ADDform.billEndDate" format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
                            </el-form-item>          
                        </el-col>
                    </el-row>
                    <el-row>
                        <el-col :span="6" class="list_unit" style="height:50px;overflow:hidden;">
                            <el-form-item label="客　户：" prop="concatName">
                                <el-cascader v-model="ADDform.comName" :options="clientOptions" clearable :show-all-levels="false" :props="{ expandTrigger: 'hover',label:'label'}"  @change="clientIdChange" placeholder="选择客户" filterable>
                                    <template slot-scope="{ node, data }">
                                        <span>{{ data.label }}</span>
                                        <span v-if="!node.isLeaf" > ({{ data.children.length }}) </span>
                                    </template>
                                </el-cascader>
                            </el-form-item> 
                        </el-col>
                        <el-col :span="4" class="list_unit" style="text-align:left;padding-left:25px;" v-if="ADDform.concatName">联系人：{{ADDform.linkName}}</el-col>
                        <el-col :span="4" class="list_unit" style="text-align:left;" v-if="ADDform.concatName">联系方式：{{ADDform.linkMobile}}</el-col>
                        <el-col :span="10" class="list_unit" style="text-align:left;" v-if="ADDform.concatName">地 址：{{ADDform.address}}</el-col>
                    </el-row>
                    <el-row  style="height:50px;overflow:hidden;">
                        <el-col :span="6" class="list_unit" style="text-align:left;">
                            <el-form-item label="客户承担费用：" prop='customerFree'>
                                <el-input-number v-model="ADDform.customerFree" :precision="2" :controls="false" :min="0.001" placeholder="请输入费用" style="width:98%"></el-input-number>
                            </el-form-item>
                        </el-col>
                    </el-row>
                    <el-table :data="domains" border class="table" ref="multipleTable" header-cell-class-name="table-header" style="font-size:10px;min-height:50vh;">  
                        <el-table-column label="序号" type="index" width="50" align="center"></el-table-column>
                        <el-table-column prop="number" label="零件编号" width="210"></el-table-column>
                        <el-table-column prop="name" label="描述" ></el-table-column>

                        <el-table-column prop="goods_num" label="数量(PCS)" width="150" align="center">
                            <template scope="scope">
                                <el-input-number v-model="scope.row.num" :precision="3" :controls="false" :min="0.001"></el-input-number>
                            </template>
                        </el-table-column>
                        <el-table-column prop="salePrice" label="单价（RMB不含税）" align="center" width="140">
                            <template scope="scope">
                                <el-input-number v-model="scope.row.salePriceno" :precision="2" :controls="false" :min="0.001" placeholder="请输入价格" style="width:98%"></el-input-number>
                            </template>
                        </el-table-column>
                        <el-table-column prop="salePrice" label="单价（RMB含税）" align="center" width="140">
                            <template scope="scope">
                                <el-input-number v-model="scope.row.salePrice" :precision="2" :controls="false" :min="0.001" placeholder="请输入价格" style="width:98%"></el-input-number>
                            </template>
                        </el-table-column>
                        <el-table-column prop="good_remark" label="交期(天)" >
                            <template scope="scope">
                                <el-input-number v-model="scope.row.cycle" :precision="0" :controls="false" :min="0.001" placeholder="请输入交期天数" style="width:98%"></el-input-number>
                            </template>
                        </el-table-column>
                        <el-table-column prop="good_remark" label="总价(RMB)" >
                            <template scope="scope">
                                <p style="line-height:14px;height:30px;">
                                    含　税：￥{{scope.row.num * scope.row.salePrice | formatDecimal}}<br />
                                    不含税：￥{{scope.row.num * scope.row.salePriceno | formatDecimal}}
                                </p>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="80" align="center">
                            <template slot-scope="scope">
                                <el-button type="text" icon="el-icon-delete" @click="removeDomain(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>                        
                    </el-table>
                    <div class="pagination" style="padding-right:10px;">
                        <el-button  type="warning" @click="submitOrderReview('ADDform')">提交订单审核</el-button>
                        <el-button @click="addMaterial">新增商品</el-button>
                    </div>
                </el-form>
            </div>
        </el-dialog>

        <!-- 销售订单详情弹出框 -->
        <el-dialog title="销售订单详细信息" id='box' align='center' :visible.sync="showVisible" top="2vh" width="70vw">
            <el-form :inline="true" ref="showInfoform" :model="showInfoform" :rules="rules" >               
                <el-row style="border:1px solid #000;text-align:left;">
                    <el-row style="border:1px solid #00000045;margin:10px 10px 0 10px;">
                        <el-row style="border-bottom:1px solid #00000045;">
                            <el-col :span ="8" class="list_unit" style="margin-left:20px;">单据编号：{{showInfoform.soBillNo}}</el-col>
                            <el-col :span ="4" class="list_unit" >销售员：{{showInfoform.salesName}}</el-col>
                            <el-col :span ="4" class="list_unit">单据日期：{{showInfoform.billDate}}</el-col>
                            <el-col :span ="4" class="list_unit">交货日期：{{showInfoform.billEndDate}}</el-col>
                        </el-row>
                        <el-row>
                            <el-col :span ="8" class="list_unit" style="margin-left:20px;">客　户：{{showInfoform.contactName}}</el-col>
                            <el-col :span ="6" class="list_unit" >联系人：{{showInfoform.linkName}} | 联系方式：{{showInfoform.linkMobile}}</el-col>
                            <el-col :span ="9" class="list_unit">地址：{{showInfoform.prov}} {{showInfoform.city}} {{showInfoform.district}} {{showInfoform.address}}</el-col>
                        </el-row>                         
                    </el-row>
                    <el-table :data="domains" border style="font-size:10px" stripe class="table" ref="multipleTable" header-cell-class-name="table-header" @selection-change="handleSelectionChange" height="63vh">
                        <el-table-column label="操作" width="120" align="center" v-if="showInfoform.billStatus==3">
                            <template slot-scope="scope">
                                <el-button type="text" icon="el-icon-edit" @click="imgEdit(scope.row,0)"></el-button>
                                <el-button type="text" icon="el-icon-delete" @click="imgEdit(scope.row,0)"></el-button>
                            </template>
                        </el-table-column>
                        <el-table-column label="操作" width="120" align="center" v-if="showInfoform.billStatus==2">
                            <template slot-scope="scope">
                                <el-button type="text" icon="el-icon-edit" @click="imgEdit(scope.row,0)">确认生产</el-button>
                                <el-button type="text" icon="el-icon-delete" @click="imgEdit(scope.row,0)"></el-button>
                            </template>
                        </el-table-column> 
                        <el-table-column v-if="showInfoform.billStatus==7||showInfoform.billStatus==8||showInfoform.billStatus==9" type="selection" width="50" align="center"></el-table-column>     
                        <el-table-column prop="number" label="商品编号" width="100" :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column prop="name" width="220" label="商品名称" :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column prop="categoryName" width="180" label="类别" :show-overflow-tooltip="true"></el-table-column>
                        <el-table-column prop="locationName" width="80" label="仓库" :show-overflow-tooltip="true" v-if="showInfoform.billStatus<9" align="center"></el-table-column>

                        <el-table-column prop="expressName" width="180" label="物流公司" :show-overflow-tooltip="true" v-if="showInfoform.billStatus>8"></el-table-column>
                        <el-table-column prop="expressNum" width="80" label="物流单号" :show-overflow-tooltip="true" v-if="showInfoform.billStatus>8"></el-table-column>
                        <!-- <el-table-column prop="unitName" width="70" label="单位"></el-table-column> -->
                        <el-table-column prop="qty" width="120"  label="需求数量" align="right">
                             <template slot-scope="scope">
                                {{scope.row.qty | formatDecimal}} （{{scope.row.unitName}}）
                            </template>
                        </el-table-column>
                        <el-table-column prop="inventQty" width="80"  label="当前库存" align="right" v-if="showInfoform.billStatus<9">
                             <template slot-scope="scope">
                                {{scope.row.inventQty | formatDecimal}}
                            </template>
                        </el-table-column> 

                        <el-table-column prop="client" label="备注" :show-overflow-tooltip="true"></el-table-column>
                    </el-table>
                </el-row>
                <el-row type="flex" style="font-size:10px;padding:15px 0 0 5px;" v-if="showInfoform.billStatus==8">
                  <el-col :span="10">
                    <el-form-item label="物流公司名称" prop="expressName"  >
                        <el-input v-model="showInfoform.expressName"></el-input>
                    </el-form-item>
                  </el-col>
                  <el-col :span="10">
                        <el-form-item label="物流单号" prop="expressNum"  >
                            <el-input v-model="showInfoform.expressNum"></el-input>
                        </el-form-item>
                  </el-col>
                </el-row>
                <el-row v-else>
                    <el-col :span ="3" class="list_unit" align="left">客户承担费用:{{showInfoform.customerFree | formatDecimal}}</el-col>
                    <el-col :span ="3" class="list_unit">应收款：{{showInfoform.totalAmount | formatDecimal}}</el-col>
                    <el-col :span ="3" class="list_unit">欠款：{{showInfoform.totalAmount - showInfoform.rpAmount | formatDecimal}}</el-col>
                    <el-col :span ="3" class="list_unit">制单人:{{showInfoform.userName}}</el-col>
                    <el-col :span ="3" v-if="userPower.indexOf('5006')>-1" class="list_unit"><el-button type="text" icon="el-icon-picture" @click="imgEdit(showInfoform,1)">查看销售附件</el-button></el-col>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button type="success" v-if="showInfoform.billStatus==9" @click="eidtOrderState(showInfoform.soId,10)">客户签收</el-button>
                <el-button type="success" v-if="showInfoform.billStatus==8" @click="shipments('showInfoform',showInfoform.billStatus,showInfoform.id,9)">打包发货</el-button>
                <el-button type="success" v-if="showInfoform.billStatus==7" @click="createLLOrder(showInfoform.id,8)">出库</el-button>
                <el-button type="success" v-if="showInfoform.billStatus==1 && userPower.indexOf('5004')>-1" @click="eidtOrderState(showInfoform.soId,2)">审核通过</el-button>
                <el-button type="success" v-if="showInfoform.billStatus==3" @click="eidtOrderState(showInfoform.soId,1)">提交订单复审核</el-button>
                <el-button type="success" v-if="showInfoform.billStatus==3  && userPower.indexOf('5002')>-1" @click="addMaterial">新增商品</el-button>
                <el-button type="danger" v-if="showInfoform.billStatus<3 && userPower.indexOf('5005')>-1"  @click="backSO()">驳 回</el-button>
                <el-button @click="showVisible = false">取 消</el-button>
            </span>
        </el-dialog>

        <el-drawer title="选择商品"  :visible.sync="boxDialog" direction="ltr" custom-class="demo-drawer" size="65%" ref="drawer">   
            <SelectComTem :domains="domains" @fuaddDomain="fuaddDomain"></SelectComTem>
        </el-drawer>

        <!-- 驳回原因填写弹出框 -->
        <el-dialog title="驳回详情" :before-close="partClose" :visible.sync="showBackVisible" width="50vw">
            <el-form ref="editBackForm" :model="editBackForm" :rules="rules" label-width="100px" class="demo-ruleForm">                
                <el-col class="list_unit">
                    <el-form-item label="原 因：" prop="content">
                        <el-input v-model="editBackForm.content" type="textarea" :rows="10" placeholder="请输入驳回原因" style="width:99%;"></el-input>
                    </el-form-item>
                </el-col>                 
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showBackVisible = false">取 消</el-button>
                <el-button type="primary" @click="subBack('editBackForm')">确认</el-button>
            </span>
        </el-dialog>


        <!--驳回销售订单修改弹出框 -->
        <el-dialog title="销售订单详细信息" id='box' align='center' :visible.sync="showBackeditVisible" top="5vh" width="70vw">
            <el-form id="ADDform" :model="editForm" label-width="100px" class="demo-dynamic" :rules="rules" ref="editForm">
                <el-row>
                    <el-col :span="9" class="list_unit">
                        <el-form-item label="订单编号：" prop='soBillNo'>
                            <el-input v-model="editForm.soBillNo" placeholder="请输入订单编号一旦生成不可修改"></el-input>
                        </el-form-item>
                    </el-col>

                    <el-col :span="5" class="list_unit">
                        <el-form-item label="销售员：" prop="salesId">
                            <el-select v-model="editForm.salesId" placeholder="请选择">
                                <el-option v-for="item in staffData" :key="item.value" :label="item.label" :value="item.value"></el-option>
                            </el-select>                          
                        </el-form-item>
                    </el-col>
                    <el-col :span="5" class="list_unit">
                        <el-form-item label="单据日期：" prop='billDate'>
                            <el-date-picker type="date" placeholder="选择单据日期" v-model="editForm.billDate" format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
                        </el-form-item>          
                    </el-col>
                    <el-col :span="5" class="list_unit">
                        <el-form-item label="交货日期：" prop='billEndDate'>
                            <el-date-picker type="date" placeholder="选择交货日期" v-model="editForm.billEndDate" format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
                        </el-form-item>          
                    </el-col>
                </el-row>
                <el-row>
                    <el-col :span="6" class="list_unit" style="height:50px;overflow:hidden;">
                        <el-form-item label="客　户：" prop="soBuId">
                            <el-cascader v-model="editForm.contactArr" :options="clientOptions" clearable :show-all-levels="false" :props="{ expandTrigger: 'hover',label:'label'}" @change="queryCCategory" placeholder="选择客户" filterable>
                                <template slot-scope="{ node, data }">
                                    <span>{{ data.label }}</span>
                                    <span v-if="!node.isLeaf" > ({{ data.children.length }}) </span>
                                </template>
                            </el-cascader>
                        </el-form-item> 
                    </el-col>
                    <el-col :span="4" class="list_unit" style="text-align:left;padding-left:25px;" v-if="editForm.soBuId">联系人：{{editForm.linkName}}</el-col>
                    <el-col :span="4" class="list_unit" style="text-align:left;" v-if="editForm.soBuId">联系方式：{{editForm.linkMobile}}</el-col>
                    <el-col :span="10" class="list_unit" style="text-align:left;" v-if="editForm.soBuId">地 址：{{editForm.addressAll}}</el-col>
                </el-row>
                <el-row  style="height:50px;overflow:hidden;">
                    <el-col :span="6" class="list_unit" style="text-align:left;">
                        <el-form-item label="客户承担费用：" prop='customerFree'>
                            <el-input-number v-model="editForm.customerFree" :precision="2" :controls="false" :min="0.001" placeholder="请输入费用" style="width:98%"></el-input-number>
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-table :data="domains" border class="table" ref="multipleTable" header-cell-class-name="table-header" style="font-size:10px;min-height:50vh;">  
                    <el-table-column label="序号" type="index" width="50" align="center"></el-table-column>
                    <el-table-column prop="number" label="零件编号" width="210"></el-table-column>
                    <el-table-column prop="name" label="描述" ></el-table-column>

                    <el-table-column prop="goods_num" label="数量(PCS)" width="150" align="center">
                        <template scope="scope">
                            <el-input-number v-model="scope.row.qty" :precision="3" :controls="false" :min="0.001"></el-input-number>
                        </template>
                    </el-table-column>
                    <el-table-column prop="salePrice" label="单价（RMB不含税）" align="center" width="140">
                        <template scope="scope">
                            <el-input-number v-model="scope.row.salePriceno" :precision="2" :controls="false" :min="0.001" placeholder="请输入价格" style="width:98%"></el-input-number>
                        </template>
                    </el-table-column>
                    <el-table-column prop="salePrice" label="单价（RMB含税）" align="center" width="140">
                        <template scope="scope">
                            <el-input-number v-model="scope.row.salePrice" :precision="2" :controls="false" :min="0.001" placeholder="请输入价格" style="width:98%"></el-input-number>
                        </template>
                    </el-table-column>
                    <el-table-column prop="good_remark" label="交期(天)" >
                        <template scope="scope">
                            <el-input-number v-model="scope.row.deliveryNumDays" :precision="0" :controls="false" :min="0.001" placeholder="请输入交期（天）数" style="width:98%"></el-input-number>
                        </template>
                    </el-table-column>
                    <el-table-column prop="good_remark" label="总价(RMB)" >
                        <template scope="scope">
                            <p style="line-height:14px;height:30px;">
                                含　税：￥{{scope.row.num * scope.row.salePrice | formatDecimal}}<br />
                                不含税：￥{{scope.row.num * scope.row.salePriceno | formatDecimal}}
                            </p>
                        </template>
                    </el-table-column>
                    <el-table-column label="操作" width="80" align="center">
                        <template slot-scope="scope">
                            <el-button type="text" icon="el-icon-delete" @click="removeDomain(scope.row)">删除</el-button>
                        </template>
                    </el-table-column>                        
                </el-table>                
                <el-row>
                    <el-col :span ="3" class="list_unit" align="left">客户承担费用:{{editForm.customerFree | formatDecimal}}</el-col>
                    <el-col :span ="3" class="list_unit">应收款：{{editForm.totalAmount | formatDecimal}}</el-col>
                    <el-col :span ="3" class="list_unit">欠款：{{editForm.totalAmount - editForm.rpAmount | formatDecimal}}</el-col>
                    <el-col :span ="3" class="list_unit">制单人:{{editForm.userName}}</el-col>
                    <el-col :span ="3" class="list_unit">
                        <el-button type="text" icon="el-icon-picture" @click="imgEdit(editForm,0)" v-if="editForm.billStatus==3">附件</el-button>
                        <el-button type="text" icon="el-icon-picture" @click="imgEdit(editForm,1)" v-else>查看销售附件</el-button>
                    </el-col>
                </el-row>
                <div class="pagination" style="padding-right:10px;">
                    <el-button  type="success" @click="submitOrderSave('editForm')">提交订单复审核</el-button>
                    <el-button @click="addMaterial">新增商品</el-button>
                </div>
            </el-form>
        </el-dialog>
        <!-- 图片弹出框 -->
        <el-dialog title="附件" :before-close="partClose" :visible.sync="imgVisible" width="50vw" :modal-append-to-body="false">
            <el-form ref="editImgForm" id="editImgForm" :model="editImgForm" :rules="rules" label-width="100px" class="demo-ruleForm">
                <el-upload action="http://wms.lyccco.com/erpv9/upimg/upPdf" :file-list="editImgForm.fileList" :data="editImgForm" list-type="picture" :on-preview="handlePictureCardPreview" :on-remove="handleRemove" :disabled="fileState">                   
                    <el-button  size="small" type="primary" v-if="fileState==false && userPower.indexOf('5007')>-1">点击上传</el-button>
                    <div slot="tip" class="el-upload__tip" v-if="fileState==false">只能上传PDF/jpg/png文件为最佳，且不超过3Mb</div>
                </el-upload>
                <el-dialog :visible.sync="dialogImgVisible" :modal-append-to-body="true" :append-to-body="true" top="5vh">
                    <img v-if="fileType=='img'" width="100%" :src="dialogImageUrl" alt="" />
                    <Pdf v-if="fileType=='pdf'" width="100%" :src="dialogImageUrl"  />
                </el-dialog>
                
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="imgVisible = false">取 消</el-button>
            </span>
        </el-dialog>
    </div>
</template>

<script>
import SelectComTem from './selectComTem.vue';
import Pdf from 'vue-pdf';
import { seaStaff,seaContact} from '../../api/index';
import { addSO,selectSO,batchDel,seaSOBillGodds,eidtSOOrder,eidtSOState} from '../../api/orders';
import { getPDBilleARingNumGodds,editXSOrderexpressInfo,delImg} from '../../api/goods';
import { addSOBackLog } from '../../api/subsidiary';
export default {
    components: {
        SelectComTem,Pdf 
    },
    name: 'basetable',
    data() {
        return {
            drawer: false,
            q:'',
            activeName: '0',
            value1:'',
            pageIndex: 1,
            pageSize: 20,
            pageTotal: 0,
            infoPageIndex: 1,
            infoPageSize: 20,
            infoPageTotal: 0,
            showVisible: false,
            showAddVisible: false,
            showBackeditVisible: false,
            fileState: false,
            showInfoform:{},
            userPower: [],
            tableData: [],
            clientOptions: [], 
            staffData: [],
            domains: [], 
            ADDform:{},
            editForm:{},
            editBackForm:{},
            multipleSelection: [],
            delList: [],
            pageTotal: 0,
            rules: {
                expressName: [
                    { required: true, message: '请填写物流公司名称', trigger: 'blur' }
                ],
                expressNum: [
                    { required: true, message: '请填写物流单号', trigger: 'blur' }
                ], 
                concatName: [
                    { required: true,message: '请选择客户', trigger: 'change' }
                ], 
                soBuId: [
                    { required: true,message: '请选择客户', trigger: 'change' }
                ],  
                soBillNo: [
                    { required: true, message: '请输入订单编号', trigger: 'change' }
                ],              
                salesId: [
                    { required: true, message: '请选择销售员', trigger: 'change' }
                ],             
                billDate: [
                    { required: true, message: '请选择日期', trigger: 'change' }
                ] ,             
                billEndDate: [
                    { required: true, message: '请选择交货日期', trigger: 'change' }
                ],            
                content: [
                    { required: true, message: '请选填写原因', trigger: 'change' }
                ],    
            },
            boxDialog: false,
            editImgForm:{},
            dialogImageUrl: '',
            dialogImgVisible:false,
            imgVisible:false,
            showBackVisible:false,
            fileType:'', 
            delDomains:[]
        };
    },
    created() {
        this.getData();

        // 获取客户数据
        this.getContactData();

        // 获取销售员数据
        this.getStaffData();
        // 获取用户权限
        this.userPower = sessionStorage.getItem('userPower').split(',');
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
        },
        payState(val) {
            // 0未付款 1部分付款 
            if (val == 2) {
                return '全部付款';
            } else if(val == 1){
                return '部分付款';
            }else{
                return '未付款';
            }           
        },
        formatState(value) {
             //1为订单生成，2为审核，3为驳回，4确认生产，5生产完成…… 
            let rec='';
            switch (value) {
                case 1:
                    rec = "待审核";
                    break;
                case 2:
                    rec = "审核成功";
                     break;
                case 3:
                    rec = "驳回";
                     break;
                case 4:
                    rec = "确认生产";
                     break;
                case 5:
                    rec = "生产完成";
                     break;
                case 6:
                    rec = "核对物料";
                     break;
                case 7:
                    rec = "成品入库";
                     break;
                case 8:
                    rec = "申请出库";
                     break;
                case 9:
                    rec = "成品出库";
                     break;
                case 10:
                    rec = "客户签收";
                     break;
            }             
            return rec
        }
    },   
    methods: {        
        // 获取 easy-mock 的模拟数据
        getData() {
            let self = this;
            selectSO({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                transType:150601,
                billStatus:self.activeName,
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.tableData = res.rec;
                    self.pageTotal = res.total || 0;
                }else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },        
        handleClick(tab) {
            let self = this;
            self.tabIndex =tab.name;
            self.getData(tab.name);
        },
        // 获取客户数据
        getContactData(){
            let self = this;
            seaContact({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                categoryId:self.categoryId,
                typeNumber:'customertype',
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.clientOptions = res.rec;
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
        // 获取销售员数据
        getStaffData(){
            let self = this;
            seaStaff({  
                pageIndex: self.pageIndex,
                pageSize: self.pageSize,
                categoryId:self.categoryId,
                q:self.q
            }).then(res => { 
                if(res.code == "00"){
                    self.staffData = res.rec;
                } else {
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
            if(column.label !="操作" && column.label !="复选框"){
                if(row.billStatus==3){
                    self.showBackeditVisible = true;
                    self.editForm =row;
                    self.editForm.salesId=row.salesId.toString();
                    self.queryCCategory(self.editForm.soBuId)
                }else{
                    self.showVisible = true;
                    self.showInfoform =row;
                }
                seaSOBillGodds({  
                    pageIndex: self.infoPageIndex,
                    pageSize: self.infoPageSize,
                    soId:row.soId,
                }).then(res => { 
                    if(res.code == "00"){
                        self.domains = res.rec;
                        self.pageTotal = res.total || 0;                   
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
        categoryIdChange(value) {
            let self = this;
            self.categoryId = value[value.length-1];
        },
               
        // 增加销售订单
        SOAdd() {
            let self = this;
            self.ADDform= {};
            self.domains= [];
            self.showAddVisible= true;
        },
           
        // 销售订单物料提交审核
        submitOrderReview(formName){
            let self = this;
            let goodsData = [];
            if(self.domains.length<1){
                self.$message.error('无商品！');
                return false;
            }else{
                let totalAmount = 0; 1
                for (let i = 0; i < self.domains.length; i++) {
                    let onegoods = { 
                        'invId':self.domains[i].id,//商品id
                        'qty':self.domains[i].num, //商品数量unitId
                        'unitName':self.domains[i].unitName,//商品单位
                        'deliveryNumDays':self.domains[i].cycle//交期（天）单位
                    }
                    totalAmount +=(self.domains[i].num*self.domains[i].salePrice);
                    goodsData[i]= onegoods; 
                }                
                totalAmount +=self.ADDform.customerFree*1;
                self.ADDform.userName = sessionStorage.getItem('admin_name');
                self.ADDform.goodsData = goodsData;
                self.ADDform.transType = 150601;
                self.ADDform.totalAmount = totalAmount;
            }
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    addSO(self.ADDform).then(res => { 
                        if(res.code == "00"){
                            self.getData();
                            self.$message.warning('提交成功');
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
            self.domains = [];
            self.showAddVisible = false;

        },  // 销售订单驳回提交复审核
        submitOrderSave(formName){
            let self = this;
            let goodsData = [];
            if(self.domains.length<1){
                self.$message.error('无商品！');
                return false;
            }else{
                let totalAmount = 0; 
                for (let i = 0; i < self.domains.length; i++) {
                    let onegoods = { 
                        'invId':self.domains[i].id,//商品id                       
                        'qty':self.domains[i].qty, //商品数量unitId
                        'unitName':self.domains[i].unitName,//商品单位
                    }
                    self.domains[i].l_soId?onegoods.l_soId=self.domains[i].l_soId:onegoods.l_soId=self.editForm.soId;
                    self.domains[i].CILId?onegoods.id=self.domains[i].CILId:onegoods.id=0;
                    self.domains[i].deliveryNumDays?onegoods.deliveryNumDays=self.domains[i].deliveryNumDays:onegoods.deliveryNumDays=cycle;//交期（天）单位

                    totalAmount +=(self.domains[i].qty*self.domains[i].salePrice);
                    goodsData[i]= onegoods; 
                }                
                totalAmount +=self.editForm.customerFree*1;
                self.editForm.userName = sessionStorage.getItem('admin_name');
                self.editForm.goodsData = goodsData;
                self.editForm.transType = 150601;
                self.editForm.totalAmount = totalAmount;
                self.editForm.delDomains = self.delDomains;
            }
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    eidtSOOrder(self.editForm).then(res => { 
                        if(res.code == "00"){
                            self.getData();
                            self.$message.warning('提交成功');
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
            self.domains = [];
            self.editForm = {};
            self.delDomains = [];            
            self.showBackeditVisible = false;

        },    

        // 触发搜索按钮
        handleSearch() {            
            let self = this;
            self.pageIndex= 1;
            self.getData();
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        removeDomain(item) {  
            let self = this;
            var index = self.domains.indexOf(item);
            if (index !== -1) {  
                self.domains.splice(index, 1);;
            }
            self.delDomains.push(item.CILId);
        },
        delAllSelection() {
            const self = this;
            length = self.multipleSelection.length;
            let str = '';
            var idArr = [];
            self.delList = self.delList.concat(self.multipleSelection);
            for (let i = 0; i < length; i++) {
                str += self.multipleSelection[i].soBillNo + ' ';
                idArr[idArr.length] = self.multipleSelection[i].soId;
            }
            if(!str){
                self.$message.warning('请勾选需要删除的选项！');
            }else{
                batchDel({
                    'idArr':idArr,
                    'tabalName':'ci_so',
                    'idName':'soId',
                    'delName':'isDelete'                    
                }).then(res => {
                    if(res.code == "00"){
                        self.getData();
                        self.$message.error('删除了'+str);
                    } else {
                        self.$message.error('暂无数据');
                        return false;
                    }
                }).catch(function(err) {
                    self.$message.error('数据处理失败，请检查数据是否正确。');                            
                    return false;
                });
                
            }
            self.multipleSelection = [];
        },
        // 订单驳回
        backSO() {
            let self = this;            
            self.showBackVisible = true;
        },

        // 提交驳回原因
        subBack(formName) {
            let self = this;
            self.editBackForm.soId = self.showInfoform.soId;
            self.editBackForm.checkName = sessionStorage.getItem('admin_name');
            self.$refs[formName].validate((valid) => { 
                if (valid) {
                    self.showBackVisible= false;
                    addSOBackLog(self.editBackForm).then(res => {
                        if(res.code == "00"){
                            self.eidtOrderState(self.showInfoform.soId,3);      
                        }else {
                            self.$message.error('操作失败');
                            return false;
                        }
                    }).catch(function(err) {
                        self.$message.error('数据处理失败，请检查数据是否正确。');                            
                        return false;
                    });
                
                }else{
                    return false;
                }
            });
            self.editBackForm= {};            
        },
        // 订单审核
        eidtOrderState(soId,billStatus) {
            const self = this;
            self.showVisible = false;
            let turnoverAddData =[];
            eidtSOState({
                'soId':soId,
                'billStatus':billStatus
            }).then(res => {
                if(res.code == "00"){
                    self.getData();                        
                    self.$message.success('操作成功');
                }else {
                    self.$message.error('未通过');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('数据处理失败，请检查数据是否正确。');                            
                return false;
            });
        },
        // 生成领料单
        createLLOrder(soId,billStatus) {
            const self = this;
            const length = self.multipleSelection.length;
            const dataArr = self.multipleSelection;
            let turnoverAddData =[];
            if(length<1){
                self.$message.error('请勾选需要申请的物料！');
                return false;
            }else{
                console.log(self.multipleSelection);
                for (let i = 0; i < length; i++) {
                    if(dataArr[i]['qty']>0&&dataArr[i]['inventQty']>0){
                        let CKqty = 0;
                        if((dataArr[i]['qty'] - dataArr[i]['inventQty'])<0){
                            CKqty = dataArr[i]['qty'];
                        }else{
                            CKqty = dataArr[i]['inventQty'];
                        }
                        let onegoods = { 
                            'qty':dataArr[i]['qty'], 
                            'ARNum':0,
                            'ARingNum':0,
                            'CKqty':CKqty,
                            'inventQty':dataArr[i]['inventQty'],
                            'invId':dataArr[i]['invId']
                        }
                        turnoverAddData[i]= onegoods;
                    }else{
                        continue;
                    }
                }
                if(turnoverAddData.length<1){
                    self.$message.warning('无可领物料！');
                    return false;
                }
                getPDBilleARingNumGodds({
                    'domains':turnoverAddData,
                    'pdBillNoID':self.showInfoform.id,
                    'CKBillNo':self.randomNumber('ck'),
                    'CKApplyName':sessionStorage.getItem('admin_name'),
                    'billStatus':billStatus
                }).then(res => {
                    if(res.code == "00") {
                        self.$message.success('出库申请成功！');
                    }else{
                        self.$message.warning('当前库存无料可领');
                        return false;
                    }
                    self.eidtSOState(soId,billStatus);
                    self.getData();
                }).catch(function(err) {
                    self.$message.error('数据处理失败，请检查数据是否正确。');                            
                    return false;
                });      
            }

            self.showVisible = false;
        }, 
         // 打包发货
        shipments(formName,nowBillStatus,id,billStatus) {
            const self = this;
            const length = self.multipleSelection.length;
            const dataArr = self.multipleSelection;
            if(nowBillStatus==8){
                if(length<1){
                    self.$message.error('请勾选需要处理的物料！');
                    return false;
                }else{
                    self.$refs[formName].validate((valid) => { 
                        if (valid) { 
                            let goodsData = [];
                            for (let i = 0; i < length; i++) {  
                                let oneDBgoods = {
                                    'id':dataArr[i].CILId,
                                    'expressName':self.showInfoform.expressName,
                                    'expressNum':self.showInfoform.expressNum
                                }
                                goodsData[i]= oneDBgoods; 
                            }
                            self.showVisible = false;
                            editXSOrderexpressInfo({                        
                                'id':id,                      
                                'billStatus':billStatus,       
                                // 'state':beforeState,                      
                                'goodsData':goodsData
                            }).then(res => {
                                if(res.code == "00"){
                                    self.getData(self.tabIndex);                        
                                    self.$message.success('操作成功');
                                }else {
                                    self.$message.error('操作失败');
                                    return false;
                                }
                            }).catch(function(err) {
                                self.$message.error('数据处理失败，请检查数据是否正确。');                            
                                return false;
                            });
                        
                        }else{
                            return false;
                        }
                    });
                }
            }else{
                return false;
            }
        }, 
        //根据当前时间和随机数生成流水号
        randomNumber(v) {
            let date = new Date();
            date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); // toJSON 的时区补偿
            var num = v+date.toJSON().substr(0, 19).replace(/[-T]|:/g, ''); 
            num +=(Math.round(Math.random() * 9 + 0)).toString(); 
            num +=(Math.round(Math.random() * 9 + 0)).toString(); 
            num +=(Math.round(Math.random() * 9 + 0)).toString(); 
            num +=(Math.round(Math.random() * 9 + 0)).toString(); 
            return num;
        },
        getCascaderObj(val,opt,childrenVal) {
            return val.map(function (value, index, array) {
                for (var itm of opt) {
                    if (itm.value == value) {
                        opt = itm.children;                       
                        return itm;
                    }
                }
                return null;
            });
        },
        clientIdChange(value,) {
            let self = this;
            self.ADDform.concatName = '';
            self.ADDform.linkMobile = '';
            self.ADDform.linkName = '';
            self.ADDform.address = '';
            self.ADDform.soBuId = value[value.length-1];
            var vals=self.getCascaderObj(value, self.clientOptions);
            if(vals.length>0){
                vals.forEach((v)=>{
                    if(v.value==value[value.length-1]){
                        self.ADDform.concatName = v.label;
                        self.ADDform.linkMobile = v.info.linkMobile;
                        self.ADDform.linkName = v.info.linkName;
                        self.ADDform.address = v.info.addressAll;
                    }
                })
            }
        },
        queryCCategory(value) { 
            let self = this;
            if(Array.isArray(value)){
                self.editForm.soBuId = value[value.length-1];
                self.editForm.contactArr = value;
            }
            let typeNo = ''; 
            for (let i = 0; i < self.clientOptions.length; i++) {
                for (let j = 0; j < self.clientOptions[i].children.length; j++) {
                    if ( self.clientOptions[i].children[j].value == self.editForm.soBuId) {
                        typeNo = self.clientOptions[i].value;
                        self.editForm.linkMobile = self.clientOptions[i].children[j].info.linkMobile;
                        self.editForm.linkName = self.clientOptions[i].children[j].info.linkName;
                        self.editForm.addressAll = self.clientOptions[i].children[j].info.addressAll;
                        break;
                    }
                }
            }
            if(typeNo){
                self.editForm.contactArr = [typeNo, String(self.editForm.soBuId)];
            }else{
                self.editForm.soBuId = '';  
            }
        },
        fuaddDomain(data) {
            const self = this;  
            self.boxDialog = false;
            self.domains = data; 
        },
        addMaterial(){
            let self = this;
            self.boxDialog = true;
        },
        // 分页导航
        handlePageChange(val) {
            let self = this;
            self.pageIndex = val;
            this.getData();
        },
        // 图片编辑操作
        imgEdit(row,state) {   
            let self = this; 
            self.editImgForm = row;
            state===1?self.fileState=true:self.fileState=false;
            self.imgVisible = true;
        },
        // 图片删除
        handleRemove(file, fileList) {
            let self = this;
            delImg({  
                url: file.url
            }).then(res => { 
                if(res.code == "00"){                   
                    self.$message.success('删除成功');
                } else {
                    self.$message.error('暂无数据');
                    return false;
                }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },

        // 图片放大
        handlePictureCardPreview(file) {
            let self = this;          
            self.fileType='';
            if(file.type == "application/pdf"){
                self.fileType='pdf';
                
            }else {                
                self.fileType='img';
            }
            self.dialogImageUrl = file.url;
            self.dialogImgVisible = true;        
        },
        partClose(done) {
            let self = this;     
            self.ADDform = {}; 
            self.editForm= {};
            self.addVisible = false;  
            self.editVisible = false;      
            done();          
        }
    },
    watch: {
        $route(){            
            this.getData(); 
        },
        column(){},
    }
};
</script>

<style>
#boxso .el-dialog__header{
    padding-top:18px;
    margin-bottom: -25px;
}
#boxso .el-form-item__label{
    font-size: 10px;
    padding: 0;
}
#boxso .el-input-number .el-input__inner {
    text-align: left;
}
</style>
<style scoped>
#container{
    padding:20px 10px 10px 10px;
}
#boxso .el-dialog__header{
    padding:0;
}
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
        font-size: 10px;
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
