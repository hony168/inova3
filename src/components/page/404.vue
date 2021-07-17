<template>
    <div class="error-page">
        <div class="error-code">4<span>0</span>4</div>
        <div class="error-desc"  >啊哦~ 你所访问的页面不存在</div>
        <div class="error-handle">
            <router-link to="/">
                <el-button type="primary" size="large">返回首页</el-button>
            </router-link>
            <el-button class="error-btn" type="primary" size="large" @click="goBack">返回上一页</el-button>
            <el-button class="error-btn" type="primary" size="large" @click="aa">返回上fasfasfdasdfasdfasfdasdf一页</el-button>
        </div>
        <div id="print" class="print" ref="print">
        <!-- startprint -->
            <p>打印内容</p>
            <p :class="{noprint:isActive}">非打印内容 方法1：添加no-print样式类</p>
            <p :class="{noprint:isActive}">非打印内容 方法1：添加no-print样式类</p>
            <p :class="{noprint:isActive}">非打印内容 方法1：添加no-print样式类</p>
            <p :class="{noprint:isActive}">非打印内容 方法1：添加no-print样式类</p>
            <p :class="{noprint:isActive}">非打印内容 方法1：添加no-print样式类</p>
            <p :class="{noprint:isActive}">非打印内容 方法1：添加no-print样式类</p>
            <p :class="{noprint:isActive}">非打印内容 方法1：添加no-print样式类</p>
            <p class="className">非打印内容 方法2：自定义类名</p>
            <!-- endprint -->
        </div>
        <!-- <button v-print="'#print'">打印</button>     -->
        <button @click="doPrint()">打印</button>
    </div>

</template>

<script>

import { aa} from '../../api/goods';
export default {
    data() {
        return {
            isActive: false
        }
    },
    methods: {
        goBack(){
            this.$router.go(-1);
        },
        aa(){ 
            let self = this;

   
            aa({
             }).then(res => {
                
            }).catch(function(err) {
                self.$message.error('数据处理失败，请检查数据是否正确。');                            
                return false;
            });
        },
        doPrint () {
            // 1.设置要打印的区域 div的className
            this.isActive=true;
            console.log(document.getElementById('print').style.display)
            document.getElementById('print').style.display="block";
          
            var t = setTimeout(function (){
    

                var newstr = document.getElementsByClassName('print')[0].innerHTML
                console.log(newstr)
                //2. 复制给body，并执行window.print打印功能
                document.body.innerHTML = newstr

                window.print()
                //重新加载页面，以刷新数据
                window.location.reload()
            }, 100);

        }
    }
}
</script>


<style scoped>
    #print{
        display:none;
    }
    .noprint{
        display:none
    }
    .wenzi{
        font-family: SYHT;
        letter-spacing:3px;
        font-weight: 100;
    }
    .error-page{
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        width: 100%;
        height: 100%;
        background: #f3f3f3;
        box-sizing: border-box;
    }
    .error-code{
        line-height: 1;
        font-size: 250px;
        font-weight: bolder;
        color: #2d8cf0;
    }
    .error-code span{
        color: #00a854;
    }
    .error-desc{
        font-size: 30px;
        color: #777;
    }
    .error-handle{
        margin-top: 30px;
        padding-bottom: 200px;
    }
    .error-btn{
        margin-left: 100px;
    }
</style>
