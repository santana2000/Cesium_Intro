<template>
  <div>
    <el-button type="text" @click="dialogVisible = true">点击打开 Dialog</el-button>

    <el-dialog 
      title="提示"
      :visible.sync="dialogVisible"
      width="90%"
      
      :before-close="handleClose">
      <!-- <span>这是一段信息</span> -->
      
      <div id="panel">
        <div id="leftpanel">
        <!-- 
            tabs标签栏
            label + input + color + button
            transfer

            添加至视图按钮-->
          <el-tabs v-model="activeName" @tab-click="handleClick">

            <el-tab-pane label="用户管理" name="first"> 
              <el-transfer v-model="value" :data="data">
              </el-transfer>
            </el-tab-pane>

            <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>

            <el-tab-pane label="角色管理" name="third">角色管理</el-tab-pane>

          </el-tabs>

        </div>


      <div id="rightpanel">
        <!-- 
            标题栏
            文件内容
            日期
         -->
         <span>标题栏</span>
         <span>标题栏</span>
         <span>日期</span>
         <img src="" alt="">
      </div>
      </div>


      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
    name:'eleui',
    data() {
      const generateData = _ => {
        const data = [];
        for (let i = 1; i <= 5; i++) {
          data.push({
            key: i,
            label: `备选项 ${ i }`,
            disabled: i % 4 === 0
          });
        }
        return data;
      };
      return {
        dialogVisible: false,
        activeName:"second",
        data: generateData(),
        value: [1, 4],
      };
    },
    methods: {
      handleClose(done) {
        this.$confirm('确认关闭？')
          .then(_ => {
            done();
          })
          .catch(_ => {});
      },
      handleClick(tab, event) {
        console.log(tab, event);
      },
    }

}
</script>

<style>
.el-dialog{
  height: 500px;
  justify-content:center;
}
.el-dialog__body{
  height: 60%;
}
#panel{
  display: flex;
}
#leftpanel{
  width: 40%;
  height: 100%;

}
.el-transfer{
  display: flex;
  justify-content: space-around;

}
/* .el-transfer__buttons{
  display: flex;
 
  flex-direction: column;
  width: 10px;
} */
.el-checkbox__inner{
  /* float: left; */
  /* display: ;
  z-index: ; */
margin-right: 10px;
}
#rightpanel{
  background-color: cadetblue;
  width: 60%;
  height: 100%;

}
</style>

