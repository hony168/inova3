<template>
    <div class="">
        <div class="crumbs">
            <el-breadcrumb separator="/">
                <el-breadcrumb-item><i class="el-icon-lx-copy"></i> 消息管理</el-breadcrumb-item>
            </el-breadcrumb>
        </div>
        <div class="container" >
            <el-tabs v-model="message" :before-leave="moreState">
                <el-tab-pane :label="`未读消息(${unread.length})`" name="first" >
                    <el-table :data="unread" style="width: 100%"  @row-click="openDetails" :row-class-name="tableRowClassName">
                        <el-table-column prop="G_name" label='姓名' width="120"></el-table-column>
                        <el-table-column prop="G_phone" label='电话号码' width="100"></el-table-column>
                        <el-table-column prop="G_email" label='E-Mail' width="180"> 
                            <template slot-scope="scope">
                                <span class="message-title">{{scope.row.G_email}}</span>
                            </template>
                        </el-table-column>
                        <el-table-column  label='内容'>
                            <template slot-scope="scope">
                                <span class="message-title">{{scope.row.G_Msg}}</span>
                            </template>
                        </el-table-column>

                        <el-table-column prop="G_time" label='时间' align="right" width="180"></el-table-column>
                    </el-table>
                    <!-- <div class="handle-row">
                        <el-button type="primary">全部标为已读</el-button>
                    </div> -->
                </el-tab-pane>
                <el-tab-pane :label="`已读消息(${read.length})`" name="second" @row-click="ViewMessage" :row-class-name="tableRowClassName">
                    <template v-if="message === 'second'">
                        <el-table :data="read" style="width: 100%">                            
                            <el-table-column prop="G_name" label='姓名' width="120"></el-table-column>
                            <el-table-column prop="G_phone" label='电话号码' width="100"></el-table-column>
                            <el-table-column prop="G_email" label='E-Mail' width="180"> 
                                <template slot-scope="scope">
                                    <span class="message-title">{{scope.row.G_email}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column  label='内容'>
                                <template slot-scope="scope">
                                    <span class="message-title">{{scope.row.G_Msg}}</span>
                                </template>
                            </el-table-column>
                            <el-table-column prop="G_time" label='时间' width="180"></el-table-column>
                            <el-table-column prop="date" width="150"></el-table-column>
                            <el-table-column width="100" align="right">
                                <template slot-scope="scope">
                                    <el-button type="danger" @click="handleDel(scope.$index)">删除</el-button>
                                </template>
                            </el-table-column>
                        </el-table>
                        <!--<div class="handle-row"> 
                            <el-button type="danger">删除全部</el-button>
                        </div> -->
                    </template>
                </el-tab-pane>                
            </el-tabs>
        </div>

            <el-dialog title="Refer to the message" :visible.sync="handleVisible" top="20vh" width="50%">
                <div :model='form' style="padding:20px;width:95%;background-color:#00000010;border-radius:5px;margin:-25px auto 0 auto;">
                    <el-row>
                        <el-col :span="8">
                            <div style="margin-bottom:25px;"><i class="el-icon-s-custom"> Name:</i>{{form.G_name}}</div>
                        </el-col>
                        <el-col :span="8">
                            <div style="margin-bottom:25px;"><i class="el-icon-phone-outline"> Tel ：</i>{{form.G_phone}}</div>
                        </el-col>
                        <el-col :span="8">
                            <div style="margin-bottom:25px;"><i class="el-icon-eleme"> Email：</i>{{form.G_email}}</div>
                        </el-col>
                    </el-row>  
                    <el-row v-if="form.G_company">
                        <el-col :span="24">
                            <div style="margin-bottom:25px;"><i class="el-icon-office-building"> 公司名称:</i>{{form.G_company}}</div>
                        </el-col>
                    </el-row> 
                    <el-row v-if="form.G_title">
                        <el-col :span="24">
                            <div style="margin-bottom:25px;"><i class="el-icon-chat-line-round"> 标题 ：</i>{{form.G_title}}</div>
                        </el-col>
                    </el-row> 
                    <el-row>                        
                        <el-col :span="24">
                            <el-divider v-if="form.G_DAS || form.G_WAS || form.G_TW" content-position="left" style="border-radius:5px;">​ 感兴趣的产品</el-divider>
                                <div class="font_stylt" v-if="form.G_DAS">Dry Adsorbent Scrubbers:{{form.G_DAS}} </div> 
                                <div class="font_stylt" v-if="form.G_WAS">Wet Absortion Scrubbers:{{form.G_WAS}}</div>
                                <div class="font_stylt" v-if="form.G_TW">Thermal / Wet:{{form.G_TW}} </div>                                 
                            <el-divider content-position="left">留言内容</el-divider>
                                <span>{{form.G_Msg}}</span>
                            <el-divider><i class="el-icon-time"> 时间：</i>{{form.G_time}}</el-divider>
                        </el-col>                         
                    </el-row>  
                </div>        
            </el-dialog>
    </div>
</template>

<script>
    import qs from 'qs';
    export default {
        name: 'tabs',
        data() {
            return {                
                urls:'', 
                message: 'first',
                handleVisible: false,
                showHeader: false,
                checked1: false,
                checked2: true,                
                cur_page: 1,
                total:0,
                pagesize:20,
                currentPage: 1,
                form:{},
                unread: [],
                read: []
            }
        },
        created() {
            this.getData('first');
            this.getData('second');
        },
        methods: {
            moreState(tab, event){
                if(tab){
                    this.message=tab;            
                    this.getData(this.message);
                }
            },
            
            getData(val) {
                let self = this;
                var Gsh;
                val=='first'?Gsh=1:Gsh=2;
                // self.$axios.post(self.urls+'Member/messagelist', qs.stringify({
                //     cur_page:this.cur_page,
                //     p_size:self.pagesize,
                //     G_sh:Gsh,
                // })).then((res) => {
                //     if (res.data.code == '00') { 
                //         if(Gsh==1){
                //             self.unread = res.data.rec;
                //         }else{
                //             self.read = res.data.rec;
                //         } 
                //         self.total = res.data.count;    
                //     }
                // }).catch(function(err) {
                //     self.$message.error('暂无数据');
                // });
            },
            handleDel(index) {
                const item = this.read.splice(index, 1);
                this.recycle = item.concat(this.recycle);
            },
            handleRestore(index) {
                const item = this.recycle.splice(index, 1);
                this.read = item.concat(this.read);
            },
            openDetails(row) {
              const item = this.unread.splice(row.index, 1);
                let self = this;
                self.form = item[0];
                self.handleVisible = true;
                self.$axios.post(self.urls+'Member/upMessage', qs.stringify({
                    id:row.G_id,
                    G_sh:2,
                })).then((res) => {
                    if (res.data.code == '00') { 
                        self.getData(1) ;    
                    } else {
                        self.$message.error('暂无数据');
                    }
                }).catch(function(err) {
                    self.$message.error('暂无数据');
                });
            },
            ViewMessage(row) {
                console.log(row)
              // const item = this.unread.splice(row.index, 1);
                // let self = this;
                // self.form = item[0];
                // self.handleVisible = true;
                // self.$axios.post(self.urls+'Member/upMessage', qs.stringify({
                //     id:row.G_id,
                //     G_sh:2,
                // })).then((res) => {
                //     if (res.data.code == '00') { 
                //         self.getData(1) ;    
                //     } else {
                //         self.$message.error('暂无数据');
                //     }
                // }).catch(function(err) {
                //     self.$message.error('暂无数据');
                // });
            },
            tableRowClassName ({row, rowIndex}) {
                  // 把每一行的索引放进row
                  row.index = rowIndex;
            }
            
        },
        computed: {
            unreadNum(){
                return this.unread.length;
            }
        },
        // watch: {
        //     'unread' () {
        //         unreadNum;        
        //     }
        // }
    }

</script>

<style>
.message-title{
    cursor: pointer;
}
.handle-row{
    margin-top: 30px;
}
.el-divider__text {
    border-radius: 10px;
    line-height: 25px;
    background: #409EFFb9;
    color: #ffffff;
}
.font_stylt{
    line-height:2rem;
    font-size:0.2rem;
}
</style>

