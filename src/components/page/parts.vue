<template>
  <div>
    <el-table :data="tableData6" :span-method="objectSpanMethod" border style="width: 100%; margin-top: 20px">
      <el-table-column prop="name" label="姓名">
      </el-table-column>
      <el-table-column prop="amount1" label="数值 1（元）">
      </el-table-column>
      <el-table-column prop="amount2" label="数值 2（元）">
      </el-table-column>
      <el-table-column prop="amount3" label="数值 3（元）">
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
    name: 'basetable',
    data() {
      return {
        tableData6: [{
          name: '王小虎',
          type: 0,
          amount1: '234',
          amount2: '3.2',
          amount3: 10
        }, {
          name: '王小虎',
          type: 0,
          amount1: '165',
          amount2: '4.43',
          amount3: 12
        }, {
          name: '王小虎',
          type: 0,
          amount1: '324',
          amount2: '1.9',
          amount3: 9
        }, {
          name: '王小虎',
          type: 0,
          amount1: '621',
          amount2: '2.2',
          amount3: 17
        },{
          name: '王小虎1',
          type: 0,
          amount1: '234',
          amount2: '3.2',
          amount3: 10
        }, {
          name: '王小虎1',
          type: 0,
          amount1: '165',
          amount2: '4.43',
          amount3: 12
        }, {
          name: '王小虎1',
          type: 0,
          amount1: '324',
          amount2: '1.9',
          amount3: 9
        }, {
          name: '王小虎1',
          type: 0,
          amount1: '621',
          amount2: '2.2',
          amount3: 17
        }, {
          name: '王小虎2',
          type: 0,
          amount1: '621',
          amount2: '2.2',
          amount3: 17
        }, {
          name: '王小虎2',
          type: 0,
          amount1: '539',
          amount2: '4.1',
          amount3: 15
        }, {
          name: '王小虎3',
          type: 0,
          amount1: '539',
          amount2: '4.1',
          amount3: 15
        }, {
          name: '王小虎4',
          type: 0,
          amount1: '539',
          amount2: '4.1',
          amount3: 15
        }],
        arr1:[]
      };
    },
    created() {
        this.setdates(this.tableData6)
    },
    methods: {
        setdates(arr) {
            var obj = {},k, arr1 = [];
            for(var i = 0, len = arr.length; i < len; i++) {
                k = arr[i].name;
                obj[k]?obj[k]++:obj[k] = 1;
            }
            console.log(obj)
            //保存结果{el-'元素'，count-出现次数}
            for(var o in obj) {
                for(let i=0;i<obj[o];i++){
                    i===0?this.arr1.push(obj[o]):this.arr1.push(0);
                }
            }
          
          console.log(this.arr1);
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
      }
    }
};
</script>