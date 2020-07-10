<template>
  <div>
    <div id="getpic" @click="generatorImage">点击截图</div>
    <div id="box" ref='capture' style="width: 50%; height: 300px">

    </div>
  </div>
</template>

<script>
import html2canvas from 'html2canvas'; 
export default {
    name:'chart',
    methods:{
      // 折线图
      polygonal_chart(){
        let my_echarts = this.$echarts.init(document.getElementById("box"))
        let option = {
          xAxis: {
            type: 'category',
            data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
          },
          yAxis: {
            type: 'value'
          },
          series: [{
            data: [820, 932, 901, 934, 1290, 1330, 1320],
            type: 'line'
          }]
        };
        my_echarts.setOption(option)
      },
      generatorImage() {
        console.log('a');
        
        html2canvas(this.$refs.capture).then(canvas => {
          // this.$refs.addImage.append(canvas);//在下面添加canvas节点
          let link = document.createElement("a");
          link.href = canvas.toDataURL();//下载链接
          link.setAttribute("download","专题图.png");
          link.style.display = "none";//a标签隐藏
          document.body.appendChild(link);
          link.click();
        });
      },
    },
    mounted(){
      this.polygonal_chart()
    }
    
}
</script>

<style>

</style>