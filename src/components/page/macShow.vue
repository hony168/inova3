<template>
    <div class="table" v-loading="loading" element-loading-text="数据处理中" element-loading-spinner="el-icon-loading" element-loading-background="rgba(0, 0, 0, 0.8)">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item>
                    <i class="el-icon-s-grid"></i> {{title}}
                </el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container" id="container">
            <div class="handle-box">         
                <el-button type="danger" icon="el-icon-delete" class="handle-del mr10"  @click="delAllSelection">批量删除</el-button>   
                <el-autocomplete v-model="select_word" :fetch-suggestions="querySearchAsync" placeholder="请输入公司名称" @select="handleSelect" class="handle-input mr10"></el-autocomplete>
                <el-select v-model="query.macType" placeholder="设备类别" class="handle-mac-type mr10">
                    <el-option key="1" label="Dry Adsorbent Scrubbers" value="Dry Adsorbent Scrubbers"></el-option>
                    <el-option key="2" label="Wet Absortion Scrubbers" value="Wet Absortion Scrubbers"></el-option>
                    <el-option key="3" label="Thermal / Wet" value="Thermal / Wet"></el-option>                    
                </el-select>
                <el-input v-model="query.keyword" placeholder="关键字" class="handle-input mr10"></el-input>
                <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索</el-button>
                <el-button type="primary" icon="el-icon-circle-plus" @click="handleADD">增加设备</el-button>
                <el-button type="primary" icon="el-icon-upload2" @click="exportTable()">导出EXCEL&nbsp;</el-button>
                <el-button type="primary" icon="el-icon-download" style=" position: relative;">设备批量导入&nbsp;
                <input type="file" @change="importfxx(this)" class="batch_input" accept=".csv,.xlsm, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" /></el-button>
            </div>
            <el-table :data="tableData" border class="table" ref="multipleTable" header-cell-class-name="table-header"   @cell-click="showMacInfo" @selection-change="handleSelectionChange">
                <el-table-column type="selection" width="55" label="复选框" align="center"></el-table-column>
                <el-table-column prop="P_macNum" label="设备编号" width="150"></el-table-column>
                <el-table-column prop="M_name" label="设备名称" ></el-table-column>
                <el-table-column prop="c_name" label="所属公司"></el-table-column>
                <!-- <el-table-column label="设备图片(查看大图)" align="center">
                    <template slot-scope="scope">
                        <el-image class="table-td-thumb" :src="scope.row.P_thumb" :preview-src-list="[scope.row.P_thumb]"></el-image>
                    </template>
                </el-table-column> -->
                <el-table-column prop="P_useAddress" label="地址"></el-table-column>
                <el-table-column label="状态" align="center" width="60">
                    <template slot-scope="scope">
                        <el-tag :type="scope.row.state==='运行'?'success':(scope.row.state==='停止'?'danger':'')">{{scope.row.state}}</el-tag>
                    </template>
                </el-table-column>

                <el-table-column prop="P_buy_time" label="购买时间" width="100" align="center">
                    <template scope="scope">
                        <dl>{{scope.row.P_buy_time|timeformat}}</dl>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150" align="center">
                    <template slot-scope="scope">
                        <el-button type="text" icon="el-icon-edit" @click="handleEdit(scope.row)">编辑</el-button>
                        <el-button type="text" icon="el-icon-pie-chart" @click="dataChart(scope.row.P_id)">数据图表</el-button>
                        <!-- <el-button type="text" icon="el-icon-edit" @click="handleChart(scope.$index, scope.row)">辑</el-button> -->
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination">
                <el-pagination background layout="total, prev, pager, next" :current-page="query.pageIndex" :page-size="query.pageSize" :total="pageTotal" @current-change="handlePageChange"></el-pagination>
            </div>
        </div>

        <!-- 编辑弹出框 -->
        <el-dialog title="设备信息修改" align='center' :visible.sync="editVisible" top="10vh" width="60%">
            <el-form :model="editForm" :rules="rules" id = "editForm" ref="editForm" label-width="100px" class="demo-ruleForm">

                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 设备档案</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="设备型号：" prop="P_title">
                                <el-select v-model="editForm.P_title" placeholder="请输入设备型号">
                                <el-option label="Mojave" value="Mojave"></el-option>
                                <el-option label="Monsoon" value="Monsoon"></el-option>
                            </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="设备序列号：" prop="P_macNum">
                                <el-input v-model="editForm.P_macNum" placeholder="请输入设备序列号"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b">                        
                            <el-form-item label="设备类别：" prop="P_sort">
                                <!-- <el-select v-bind:value="editForm.P_sort | sort" placeholder="请输入设备类别"> -->
                                <el-select v-model="editForm.P_sort" placeholder="请输入设备类别">
                                    <el-option label="干燥吸附剂洗涤塔" value="1"></el-option>
                                    <el-option label="湿式吸收洗涤塔" value="2"></el-option>
                                    <el-option label="干燥/湿式吸收洗涤塔" value="3"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>

                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="客户名称：" prop="P_manufacturer">
                                <el-input v-model="editForm.P_manufacturer" placeholder="请输入客户名称"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="终端客户：" prop="P_customers">
                                <el-input v-model="editForm.P_customers" placeholder="请输入终端客户名称"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b">
                            <!-- <el-form-item label="购买日期：" required> -->
                              <el-form-item label="购买日期：" prop="P_buy_time" required>
                                <el-date-picker type="date" placeholder="选择购买日期" v-model="editForm.P_buy_time" style="width: 100%;"></el-date-picker>
                              </el-form-item>                        
                          <!-- </el-form-item> -->
                        </el-col>

                        <el-col :span="12" class="list_unit b_b b_r">
                            <el-form-item label="所属公司：" prop="co_id">
                                <el-select v-model="editForm.co_id" placeholder="请输入公司名称" class="handle-select mr10">
                                    <el-option v-for="itemc in co_list" :key="itemc.c_id" :label="itemc.c_name" :value="itemc.c_id"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" class="list_unit b_b">
                            <el-form-item label="使用地址：" prop="P_useAddress">
                                <el-input v-model="editForm.P_useAddress" placeholder="请输入设备使用地址"></el-input>
                            </el-form-item>
                        </el-col>                     
                    </el-row> 

                    <div class="tab_title"><i class="el-icon-eleme"></i> 技术参数</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="版 本 号：" prop="P_version">
                                <el-input v-model="editForm.P_version" placeholder="请输入版本号"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="PLC品牌：" prop="P_PLC_brand">
                                <el-input v-model="editForm.P_PLC_brand" placeholder="请输入PLC品牌"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b">
                            <el-form-item label="通讯方式：" prop="P_communication">
                                <el-input v-model="editForm.P_communication" placeholder="请输入通讯方式"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="接口类型：" prop="P_api_type">
                                <el-input v-model="editForm.P_api_type" placeholder="请输入接口类型"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="16" class="list_unit b_b">
                            <el-form-item label="接口协议：" prop="P_api_port">
                                <el-input v-model="editForm.P_api_port" placeholder="请输入接口协议"></el-input>
                            </el-form-item>
                        </el-col>          
                    </el-row>  

                    <div class="tab_title"><i class="el-icon-coin"></i> 设备属性</div>
                    <el-row style="border:1px solid #000;margin:2px;"> 
                        <el-form-item label="分解有毒化学品列表：" prop="P_gass">
                            <el-checkbox-group v-model="editForm.P_gass" style="padding:6px 0 0 15px;line-height:18px;">
                                <el-checkbox label="C2F6" name="C2F6"></el-checkbox>
                                <el-checkbox label="CF4" name="CF4"></el-checkbox>
                                <el-checkbox label="Cl2" name="Cl2"></el-checkbox>
                                <el-checkbox label="CO" name="CO"></el-checkbox>
                                <el-checkbox label="HBr" name="HBr"></el-checkbox>
                                <el-checkbox label="NH3" name="NH3"></el-checkbox>
                                <el-checkbox label="SF6" name="SF6"></el-checkbox>
                                <el-checkbox label="SiH4" name="SiH4"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>                                       
                    </el-row>

                    <div class="tab_title"><i class="el-icon-bank-card"></i> 设备档案</div>
                     <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="12" class="list_unit b_b b_r">
                            <el-form-item label="电源：" prop="P_supply">
                                <el-input v-model="editForm.P_supply" placeholder="请输入电源参数"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" class="list_unit b_b ">
                            <el-form-item label="尺寸：" prop="P_size">
                                <el-input v-model="editForm.P_size" placeholder="请输入尺寸"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" class="list_unit b_b b_r">
                            <el-form-item label="厂房内通风负压：" prop="P_negative_pressure">
                                <el-input v-model="editForm.P_negative_pressure" placeholder="请输入厂房通风负压参数"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col :span="12" class="list_unit b_b">
                            <el-form-item label="最大废气流量：" prop="P_traffic">
                                <el-input v-model="editForm.P_traffic" placeholder="请输入最大工艺废气流量参数"></el-input>
                            </el-form-item>
                        </el-col>        
                    </el-row>
                </el-row>
            </el-form>                
                <div style="text-align:right;padding-top:20px;">
                    <el-button type="primary" @click="saveEdit('editForm')">提交修改</el-button>
                    <!-- <el-button @click="resetAddMac('editForm')">重置</el-button> -->
                </div>
        </el-dialog>

        <!-- 增加弹出框 -->
        <el-dialog title="增加设备" align='center' :visible.sync="addVisible" top="10vh" width="60%">
            <el-form :model="ADDform" :rules="rules" id = "ADDform" ref="ADDform" label-width="100px" class="demo-ruleForm">

                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 设备档案</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="设备型号：" prop="P_title">
                                <el-select v-model="ADDform.P_title" placeholder="请输入设备型号">
                                <el-option label="Mojave" value="Mojave"></el-option>
                                <el-option label="Monsoon" value="Monsoon"></el-option>
                            </el-select>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="设备序列号：" prop="P_macNum">
                                <el-input v-model="ADDform.P_macNum" placeholder="请输入设备序列号"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b">                        
                            <el-form-item label="设备类别：" prop="P_sort">
                                <el-select v-model="ADDform.P_sort" placeholder="请输入设备类别">
                                    <el-option label="干燥吸附剂洗涤塔" value="1"></el-option>
                                    <el-option label="湿式吸收洗涤塔" value="2"></el-option>
                                    <el-option label="干燥/湿式吸收洗涤塔" value="3"></el-option>
                                </el-select>
                            </el-form-item>
                        </el-col>

                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="客户名称：" prop="P_manufacturer">
                                <el-input v-model="ADDform.P_manufacturer" placeholder="请输入客户名称"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="终端客户：" prop="P_customers">
                                <el-input v-model="ADDform.P_customers" placeholder="请输入终端客户名称"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b">
                            <!-- <el-form-item label="购买日期：" required> -->
                              <el-form-item label="购买日期：" prop="P_buy_time" required>
                                <el-date-picker type="date" placeholder="选择购买日期" v-model="ADDform.P_buy_time" format="yyyy-MM-dd" style="width: 100%;"></el-date-picker>
                              </el-form-item>                        
                          <!-- </el-form-item> -->
                        </el-col>

                        <el-col :span="12" class="list_unit b_b b_r">
                            <el-form-item label="所属公司：" prop="co_id">
                             <el-select v-model="ADDform.co_id" placeholder="请输入公司名称" class="handle-select mr10">
                                    <el-option v-for="item in co_list" :key="item.c_id" :label="item.c_name" :value="item.c_id"></el-option>
                                </el-select>
                            </el-form-item> 
                            
                               
                           
                        </el-col>
                        <el-col :span="12" class="list_unit b_b">
                            <el-form-item label="使用地址：" prop="P_useAddress">
                                <el-input v-model="ADDform.P_useAddress" placeholder="请输入设备使用地址"></el-input>
                            </el-form-item>
                        </el-col>                     
                    </el-row> 

                    <div class="tab_title"><i class="el-icon-eleme"></i> 技术参数</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="版 本 号：" prop="P_version">
                                <el-input v-model="ADDform.P_version" placeholder="请输入版本号"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="PLC品牌：" prop="P_PLC_brand">
                                <el-input v-model="ADDform.P_PLC_brand" placeholder="请输入PLC品牌"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b">
                            <el-form-item label="通讯方式：" prop="P_communication">
                                <el-input v-model="ADDform.P_communication" placeholder="请输入通讯方式"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="8" class="list_unit b_b b_r">
                            <el-form-item label="接口类型：" prop="P_api_type">
                                <el-input v-model="ADDform.P_api_type" placeholder="请输入接口类型"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="16" class="list_unit b_b">
                            <el-form-item label="接口协议：" prop="P_api_port">
                                <el-input v-model="ADDform.P_api_port" placeholder="请输入接口协议"></el-input>
                            </el-form-item>
                        </el-col>          
                    </el-row>  

                    <div class="tab_title"><i class="el-icon-coin"></i> 设备属性</div>
                    <el-row style="border:1px solid #000;margin:2px;"> 
                        <el-form-item label="分解有毒化学品列表：" prop="P_gass">
                            <el-checkbox-group v-model="ADDform.P_gass" style="padding:6px 0 0 15px;line-height:18px;">
                                <el-checkbox label="C2F6" name="C2F6"></el-checkbox>
                                <el-checkbox label="CF4" name="CF4"></el-checkbox>
                                <el-checkbox label="Cl2" name="Cl2"></el-checkbox>
                                <el-checkbox label="CO" name="CO"></el-checkbox>
                                <el-checkbox label="HBr" name="HBr"></el-checkbox>
                                <el-checkbox label="NH3" name="NH3"></el-checkbox>
                                <el-checkbox label="SF6" name="SF6"></el-checkbox>
                                <el-checkbox label="SiH4" name="SiH4"></el-checkbox>
                            </el-checkbox-group>
                        </el-form-item>                
                    </el-row>

                    <div class="tab_title"><i class="el-icon-bank-card"></i> 设备档案</div>
                     <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="12" class="list_unit b_b b_r">
                            <el-form-item label="电源：" prop="P_supply">
                                <el-input v-model="ADDform.P_supply" placeholder="请输入电源参数"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" class="list_unit b_b ">
                            <el-form-item label="尺寸：" prop="P_size">
                                <el-input v-model="ADDform.P_size" placeholder="请输入尺寸"></el-input>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12" class="list_unit b_b b_r">
                            <el-form-item label="厂房内通风负压：" prop="P_negative_pressure">
                                <el-input v-model="ADDform.P_negative_pressure" placeholder="请输入厂房通风负压参数"></el-input>
                            </el-form-item>
                        </el-col> 
                        <el-col :span="12" class="list_unit b_b">
                            <el-form-item label="最大废气流量：" prop="P_traffic">
                                <el-input v-model="ADDform.P_traffic" placeholder="请输入最大工艺废气流量参数"></el-input>
                            </el-form-item>
                        </el-col>        
                    </el-row>
                </el-row>
            </el-form>                
                <div style="text-align:right;padding-top:20px;">
                    <el-button type="primary" @click="AddMac('ADDform')">立即创建</el-button>
                    <el-button @click="resetAddMac('ADDform')">重置</el-button>
                </div>
        </el-dialog>

        <!-- 数据展示弹出框 -->
        <el-dialog title="设备详细信息" align='center' :visible.sync="showVisible" width="60%">
            <el-form ref="form" :model="showInfoform" label-width="50px">
                <el-row style="border:1px solid #000;text-align:left;">
                    <div class="tab_title"><i class="el-icon-bank-card"></i> 设备档案</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="3" class="list_unit plr10 b_b b_r">设备型号：</el-col>
                        <el-col :span="4" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_title"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">设备序列号:</el-col>
                        <el-col :span="6" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_macNum?showInfoform.P_macNum:'&nbsp;'"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">类别：</el-col>
                        <el-col :span="5"  class="list_unit plr10 b_b" v-html="showInfoform.P_sort"></el-col>                       
                        <el-col :span="3" class="list_unit plr10 b_b b_r">客户名称：</el-col>
                        <el-col :span="4" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_manufacturer?showInfoform.P_manufacturer:'&nbsp;'"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">终端客户：</el-col>
                        <el-col :span="6" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_customers?showInfoform.P_customers:'&nbsp;'"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">设备联系人/电话:</el-col>
                        <el-col :span="5"  class="list_unit plr10 b_b">{{showInfoform.c_contacts}} - {{showInfoform.c_tel}}</el-col>
                        <el-col :span="3" class="list_unit7 b_b b_r flexdiv">购买时间：</el-col>
                        <el-col :span="4" class="list_unit7 b_b b_r flexdiv" v-html="showInfoform.P_buy_time?showInfoform.P_buy_time:'&nbsp;'"></el-col>
                        <el-col :span="2" class="list_unit7 b_b flexdiv">所属公司：</el-col>
                        <el-col :span="7" class="list_unit7 b_b b_r flexdiv" v-html="showInfoform.c_name?showInfoform.c_name:'&nbsp;'"></el-col>                           
                        <el-col :span="2" class="list_unit7 b_b flexdiv">使用地址：</el-col>
                        <el-col :span="6" class="list_unit7 b_b flexdiv" v-html="showInfoform.P_useAddress?showInfoform.P_useAddress:'&nbsp;'"></el-col>                        
                    </el-row>

                    <div class="tab_title"><i class="el-icon-eleme"></i> 技术参数</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="3" class="list_unit plr10 b_b b_r">版本号：</el-col>
                        <el-col :span="4" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_version?showInfoform.P_version:'&nbsp;'"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">PLC 品牌：</el-col>
                        <el-col :span="6" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_PLC_brand?showInfoform.P_PLC_brand:'&nbsp;'"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">通讯方式：</el-col>
                        <el-col :span="5"  class="list_unit plr10 b_b" v-html="showInfoform.P_communication?showInfoform.P_communication:'&nbsp;'"></el-col>                         
                        <el-col :span="3" class="list_unit plr10 b_b b_r">接口类型：</el-col>
                        <el-col :span="4" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_api_type?showInfoform.P_api_type:'&nbsp;'"></el-col> 
                        <el-col :span="3" class="list_unit plr10 b_b b_r">接口协议：</el-col>
                        <el-col :span="14" class="list_unit plr10 b_b" v-html="showInfoform.P_api_port?showInfoform.P_api_port:'&nbsp;'"></el-col>                     
                    </el-row>

                    <div class="tab_title"><i class="el-icon-coin"></i> 设备属性</div>
                    <el-row style="border:1px solid #000;margin:2px;"> 
                        <el-col :span="4" class="list_unit7 b_b b_r flexdiv">分解有毒化学品列表：</el-col>
                        <el-col :span="20" class="list_unit7 b_b flexdiv" v-html="showInfoform.P_gass?showInfoform.P_gass:'&nbsp;'"></el-col>                       
                    </el-row>
 
                    <div class="tab_title">  <i class="el-icon-setting"></i> 设备参数</div>
                    <el-row style="border:1px solid #000;margin:2px;">
                        <el-col :span="3" class="list_unit plr10 b_b b_r">电源：</el-col>
                        <el-col :span="4" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_supply?showInfoform.P_supply:'&nbsp;'"></el-col> 
                        <el-col :span="3" class="list_unit plr10 b_b b_r">最大工艺废气流量：:</el-col>
                        <el-col :span="6" class="list_unit plr10 b_b b_r" v-html="showInfoform.P_traffic?showInfoform.P_traffic:'&nbsp;'"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">厂房通风负压：</el-col>
                        <el-col :span="5"  class="list_unit plr10 b_b" v-html="showInfoform.P_negative_pressure?showInfoform.P_negative_pressure:'&nbsp;'"></el-col>
                        <el-col :span="3" class="list_unit plr10 b_b b_r">尺寸：</el-col>
                        <el-col :span="21" class="list_unit plr10 b_b" v-html="showInfoform.P_size?showInfoform.P_size:'&nbsp;'"></el-col>               
                    </el-row>
                </el-row>
            </el-form>
            <span slot="footer" class="dialog-footer">
                <el-button @click="showVisible = false">取 消</el-button>
                <el-button type="primary" @click="dataChart(showInfoform.P_id)">数据图表</el-button>
                <!-- <el-button type="primary" @click="saveEdit">打 印</el-button> -->
            </span>
        </el-dialog>
    </div>
</template>

<script>
import { fetchData,addMac,batchAddMac,batchDelMac,eidtMac,coSelect } from '../../api/index';
import macAdd from './macAdd.vue'; 
import macEdit from './macEdit.vue'; 
import macShow from './macShow.vue';
export default {
    name: 'basetable',
    data() {
        return {
            query: {
                macType: '',
                keyword: '',
                pageIndex: 1,
                pageSize: 20,
                user_id: '',
                token: '',
            },
            loading: false,
            showInfoform:{},
            tableData: [],
            deriveData:[],
            co_list:[],            
            multipleSelection: [],
            delList: [],
            editVisible: false,
            addVisible: false,
            showVisible: false,
            pageTotal: 0,
            editForm: {},
            ADDform: {
                P_buy_time:'',
                P_gass:[],
            },  
            fileList:[],
            batchAddDate: {},
            delDate: {},            
            idx: -1,
            id: -1,
            title:'',
            select_word: '',            
            restaurants: [ { "value": "江西乐印科技有限公司", "address": "长宁区新渔路144号" }],            
            rules: {
                P_title: [
                    { required: true, message: '请输入设备型号', trigger: 'change' }
                ],
                P_macNum: [
                    { required: true, message: '请输入设备型号', trigger: 'blur' },
                    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
                ],
                P_sort: [
                    { required: true, message: '请输入设备类别', trigger: 'change' }
                ],
                P_manufacturer: [
                    { required: true, message: '请输入客户名称', trigger: 'blur' }
                ],
                P_customers: [
                    { required: true, message: '请输入终端客户名称', trigger: 'blur' }
                ],
                P_buy_time: [
                    { type: 'date', required: true, message: '请选择购买日期', trigger: 'change' }
                ],
                co_id: [
                    { required: true, message: '请输入公司名称', trigger: 'blur' }
                ],
                P_useAddress: [
                    { required: true, message: '请输入设备使用地址', trigger: 'blur' }
                ],
                // P_version: [
                //     { required: true, message: '请输入版本号', trigger: 'blur' }
                // ],
                // P_PLC_brand: [
                //     { required: true, message: '请输入PLC品牌', trigger: 'blur' }
                // ],
                // P_communication: [
                //     { required: true, message: '请输入通讯方式', trigger: 'blur' }
                // ],
                // P_api_type: [
                //     { required: true, message: '请输入接口类型', trigger: 'blur' }
                // ],
                // P_api_port: [
                //     { required: true, message: '请输入接口协议', trigger: 'blur' }
                // ],
                P_gass: [
                    { type: 'array', required: true, message: '请至少选择一种气体', trigger: 'change' }
                ],
                P_supply: [
                    {  required: true, required: true, message: '请输入电源参数', trigger: 'blur' }
                ],
                // P_negative_pressure: [
                //     { required: true, required: true, message: '请输入厂房通风负压参数', trigger: 'blur' }
                // ],
                P_size: [
                    { required: true, required: true, message: '请输入尺寸', trigger: 'blur' }
                ]
            }
        };
    },
    components:{
        macAdd, macEdit,macShow
    },
    created() {
        this.getData();
        this.coSelect();
        this.query.token=sessionStorage.getItem('token');
        this.query.user_id=sessionStorage.getItem('user_id');
        this.title = this.$route.meta.title;

    },
    filters: {
        timeformat: function(value) {
            value.toLocaleString();
           return value.toLocaleString().substring(0, 10);
        },
        sort: function(value) {
            let v;
            switch(value) {
                case 1:
                    v = "干燥吸附剂洗涤塔";
                    break;
                 case 2:
                     v = "湿式吸收洗涤塔";
                    break;
                 case 3:
                    v = "干燥/湿式吸收洗涤塔";
                    break;
            } 
           return v;
        }
    },   
    methods: {
        AddMac(formName) {
            let self = this;
            self.ADDform.token=sessionStorage.getItem('token');
            self.ADDform.user_id=sessionStorage.getItem('user_id');
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    addMac(self.ADDform).then(res => {
                        if(res.code == "00"){
                            self.resetAddMac(formName);
                            self.getData();
                            self.addVisible = false;
                            self.$message.success('增加成功');
                        } else if(res.code == "-1"){
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
        resetAddMac(formName) {
            this.$refs[formName].resetFields();
        },
        // 获取 easy-mock 的模拟数据
        getData() {
            let self = this;
            fetchData(self.query).then(res => {
                if(res.code == "00"){
                    self.tableData = res.rec;
                    self.pageTotal = res.total || 50;
                } else if(res.code == "-1"){
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
        // 获取 客户公司列表
        coSelect() {
            let self = this;
            let obj = {}
            obj.token = sessionStorage.getItem('token');
            obj.user_id = sessionStorage.getItem('user_id');
            coSelect(obj).then(res => {
                console.log(res)
                if(res.code == "00"){
                    self.co_list = res.rec;
                }
                // else if(res.code == "-1"){
                //     self.$message.warning('登录超时');
                //     sessionStorage.removeItem('admin_name');
                //     self.$router.push('/login');
                // }else {
                //     self.$message.error('暂无数据');
                //     return false;
                // }
            }).catch(function(err) {
                self.$message.error('请求失败，请检查刚绝是否正常。');
                return false;
            });
        },
        //查询公司名称
        querySearchAsync(queryString, cb) {
            var restaurants = this.restaurants;
            var results = queryString ? restaurants.filter(this.createStateFilter(queryString)) : restaurants;

            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                cb(results);
            }, 3000 * Math.random());
        },
        handleSelect(item) {
            let self =this;
            self.companyid = item.COMPANYID;
        },   
        // 触发搜索按钮
        handleSearch() {
            this.$set(this.query, 'pageIndex', 1);
            this.getData();
        },        
        // 增加操作
        handleADD() {
            let self = this;
            self.addVisible = true;
        },        
        // 展示设备详细信息
        showMacInfo(row,column,event,cell){
            let self = this;
            if(column.label !="操作" && column.label !="设备图片(查看大图)" && column.label !="复选框"){
                self.showVisible = true;
                self.showInfoform =row;
            }
            
        },
        dataChart(pid){
            let self = this;
            self.showVisible = false;
            self.$router.push({path:'/macBasicInfo',query:{P_id:pid}});
        },
        // 多选操作
        handleSelectionChange(val) {
            this.multipleSelection = val;
        },
        delAllSelection() {
            const self = this,
            length = self.multipleSelection.length;
            let str = '';
            var productId = [];
            self.delList = self.delList.concat(self.multipleSelection);      
            for (let i = 0; i < length; i++) {
                str += self.multipleSelection[i].P_macNum + ' ';
                productId[productId.length] = self.multipleSelection[i].P_id;
            }
            if(!str){
                self.$message.warning('请勾选需要删除的选项！');
            }else{
                self.delDate.token = sessionStorage.getItem('token');
                self.delDate.user_id = sessionStorage.getItem('user_id');
                self.delDate.productId=productId;
                batchDelMac(self.delDate).then(res => {
                    if(res.code == "00"){
                        self.getData();
                        self.$message.error('删除了'+str);
                    } else if(res.code == "-1"){
                        self.$message.warning('登录超时');
                        sessionStorage.removeItem('admin_name');
                        self.$router.push('/login');
                    }else {
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
        // 编辑操作
        handleEdit(row) {
            this.editForm = row;
            this.editVisible = true;
            let gass=row.P_gass;
            if(row.P_gass && !(row.P_gass instanceof Array)){
                this.editForm.P_gass = gass.split(",");
            }
            switch(row.P_sort) {
                case 1:
                    this.editForm.P_sort = "干燥吸附剂洗涤塔";
                    break;
                case 2:
                    this.editForm.P_sort = "湿式吸收洗涤塔";
                    break;
                case 3:
                    this.editForm.P_sort = "干燥/湿式吸收洗涤塔";
                    break;
                default:
                    this.editForm.P_sort = "";
            } 

            let buy_time=row.P_buy_time;
            if(!(row.P_buy_time instanceof Object)){
                this.editForm.P_buy_time = new Date(buy_time.replace(/-/g,"/"));
            }
            
        },
        // 保存编辑
        saveEdit(formName) {
            let self = this;
            self.editForm.token=sessionStorage.getItem('token');
            self.editForm.user_id=sessionStorage.getItem('user_id');
            console.log(self.editForm)
            self.$refs[formName].validate((valid) => {
                if (valid) {
                    eidtMac(self.editForm).then(res => {
                        if(res.code == "00"){
                            self.resetAddMac(formName);
                            self.getData();
                            self.editVisible = false;
                            self.$message.success('修改成功');
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
        // 分页导航
        handlePageChange(val) {
            this.$set(this.query, 'pageIndex', val);
            this.getData();
        },
        //excel导出
        exportTable() {
            const self = this,
            length = self.multipleSelection.length;
            let str = '';
            var outproductData = [];
            self.delList = self.delList.concat(self.multipleSelection);      
            for (let i = 0; i < length; i++) {
                console.log(self.multipleSelection[i])
                outproductData.push(self.multipleSelection[i]);
                // productId[productId.length] = self.multipleSelection[i].P_id;
            }
            if(outproductData.length<1){
                self.$message.warning('请勾选需要导出的选项！');           
            } else{
                require.ensure([], () => {
                    const { export_json_to_excel } = require('../../excel/Export2Excel');
                    const tHeader = ['公司ID','设备序列号','设备型号','有毒气体列表','设备类别','终端客户','购买时间','客户名称','设备使用地址','PLC品牌','协议名称','版本号','接口类型','接口协议','通讯方式','厂房通风负压','电源','最大工艺废气流量','尺寸'];
                    const filterVal = ['co_id','P_macNum','P_title','P_gass','P_sort','P_buy_time','P_customers','P_manufacturer','P_useAddress','P_PLC_brand','P_prot_name','P_version','P_api_type','P_api_port','P_communication','P_negative_pressure','P_supply','P_MAXtraffic','P_size'];
                    const list = outproductData;
                    const data = self.formatJson(filterVal, list);
                    export_json_to_excel(tHeader, data, '设备列表');
                })
            }
            self.multipleSelection = [];
        },
        formatJson(filterVal, jsonData) {
            return jsonData.map(v => filterVal.map(j => v[j]))
        },
        //excel导入
        importfxx(obj) {
            let self = this;
            let admin_name = sessionStorage['admin_name'];
            let inputDOM = this.$refs.inputer;
            // 通过DOM取文件数据
            this.file = event.currentTarget.files[0];
            var rABS = false; //是否将文件读取为二进制字符串
            var f = this.file;
            var reader = new FileReader();
            //if (!FileReader.prototype.readAsBinaryString) {
            FileReader.prototype.readAsBinaryString = function(f) {
                var binary = "";
                var rABS = false; //是否将文件读取为二进制字符串
                var pt = this;
                var wb; //读取完成的数据
                var outdata;
                var reader = new FileReader();
                reader.onload = function(e) {
                    var bytes = new Uint8Array(reader.result);
                    var length = bytes.byteLength;
                    for(var i = 0; i < length; i++) {
                        binary += String.fromCharCode(bytes[i]);
                    }
                    var XLSX = require('xlsx');
                    if(rABS) {
                        wb = XLSX.read(btoa(fixdata(binary)), { //手动转化
                            type: 'base64'
                        });
                    } else {
                        wb = XLSX.read(binary, {
                            type: 'binary'
                        });
                    }
                    outdata = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);//outdata就是你想要的东西
                    this.da = [...outdata]
                        let arr = []
                        this.da.map(v => {
                            let obj = {}
                            obj.co_id = self.selectCo(v.所属公司)
                            obj.P_macNum = v.设备序列号                      
                            obj.P_title = v.设备型号
                            obj.P_gass = v.有毒气体列表
                            obj.P_sort = v.设备类别
                            obj.P_customers = v.终端客户
                            obj.P_buy_time = self.addDate(v.购买时间)
                            obj.P_manufacturer = v.客户名称
                            obj.P_useAddress = v.设备使用地址
                            obj.P_PLC_brand = v.PLC品牌
                            obj.P_prot_name = v.协议名称
                            obj.P_version = v.版本号
                            obj.P_api_type = v.接口类型
                            obj.P_api_port = v.接口协议
                            obj.P_communication = v.通讯方式
                            obj.P_negative_pressure = v.厂房通风负压
                            obj.P_supply = v.电源
                            obj.P_MAXtraffic = v.最大工艺废气流量
                            obj.P_size = v.尺寸
                            arr.push(obj)
                        })
                    if(outdata.length>0){
                        self.loading = true;
                        self.batchAddDate.token = sessionStorage.getItem('token');
                        self.batchAddDate.user_id = sessionStorage.getItem('user_id');
                        self.batchAddDate.data=arr;
                        batchAddMac(self.batchAddDate).then(res => {
                            self.loading = false;
                            if(res.code == "00"){
                                self.getData();
                                self.$message.success(res.msg);
                            } else if(res.code == "-2"){ 
                                self.$message.warning(res.msg);                                
                                return false;
                            } else if(res.code == "-1"){
                                self.$message.warning('登录超时');
                                sessionStorage.removeItem('admin_name');
                                self.$router.push('/login');
                            }else {
                                self.$message.error('暂无数据');
                                return false;
                            }
                        }).catch(function(err) {
                            self.$message.error('数据处理失败，请检查数据是否正确。');                            
                            return false;
                        });
                    }else{
                         self.$message.warning('请检查表单是否有数据。');
                    }
                }
                reader.readAsArrayBuffer(f);
            }
            if(rABS) {
                reader.readAsArrayBuffer(f);
            } else {
                reader.readAsBinaryString(f);
            }
        },
        addDate(days){ 
            var d=new Date('1900-01-01'); 
            d.setDate(d.getDate()+days-2); 
            var m=d.getMonth()+1; 
            return d.getFullYear()+'-'+m+'-'+d.getDate(); 
        },
        selectCo(val){ 
             let v;
            switch(val) {
                case "无锡华润上华":
                    v = 2;
                    break;
                case "常德汉能":
                    v = 3;
                    break;
                case "德州仪器":
                    v = 4;
                    break;
                case "SunPower Malaysia":
                    v = 5;
                    break;
                case "杭州士兰集昕微":
                    v = 6;
                    break;
                case "湖北荆州顺佰太阳能电力有限公司":
                    v = 7;
                    break;
                case "北京中芯国际":
                    v = 8;
                    break;
                case "安徽省宣城市金能移动能源有限公司":
                    v = 9;
                    break;
                case "南开大学":
                    v = 10;
                    break;
                case "深圳中芯国际":
                    v = 11;
                    break;
                default:
                    v =1;
            } 
           return v; 
        }

    }
};
</script>

<style>
#ADDform .el-input__inner , #editForm .el-input__inner{
    border: 0px;
}
#ADDform .el-form-item__label , #editForm .el-form-item__label{
    font-size: 12px;
    padding:6px 0 0 0;
    line-height: 20px;
}
#ADDform .el-form-item__error, #editForm  .el-form-item__error {
    padding-left:15px;
}
#container .el-upload--text{
    height: 32px;
    border:0px;
    text-align: left;
    display: inline;
}
#container .el-upload-list{
    display: none;
}
</style>
<style scoped>
.handle-box {
    margin-bottom: 20px;
}
.handle-select {
    width: 120px;
}
.handle-mac-type {
    width: 200px;
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
