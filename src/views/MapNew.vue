<template>
<!--   <div class="container"> -->
    <el-container>
        <el-aside>
            <div id="menu">菜单栏
                <ul>
                    <!-- <li @click="getAttribute">坐标气泡窗</li> -->
                    <li @click="uploadQR">专题图</li>
                    <li>路线图</li>
                </ul>
            </div>
        </el-aside>
        <el-main>
        <div id="cesiumContainer" ref="getmap">

        </div>
        <div id="infoboxx">

        </div>
        </el-main>
<!--   </div> -->
    </el-container>
</template>
 
<script>
import html2canvas from 'html2canvas'; 
export default {
  name: 'mapnew',
  data () {
    return {
      QRUrl: '',
      LOGOUrl: '',
      dataURL: ''
    }
  },
  methods:{
    generatorImage() {
       
    }, 
        makeImg() {
      var that = this
      var opts = {
        logging: true, // 启用日志记录以进行调试 (发现加上对去白边有帮助)
        allowTaint: true, // 否允许跨源图像污染画布
        backgroundColor: null, // 解决生成的图片有白边
        useCORS: true // 如果截图的内容里有图片,解决文件跨域问题
      }
      // eslint-disable-next-line no-undef
      html2canvas(that.$refs.getmap, opts).then((canvas) => {
        var url = canvas.toDataURL('image/png')
        that.dataURL = url
      })
    },
    // http图片转成base64，防止解决不了的图片跨域问题
    getBase64Image(img) {
      var canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      var ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, img.width, img.height)
      var dataURL = canvas.toDataURL('image/png') // 可选其他值 image/jpeg
      return dataURL
    },
    main(src) {
      var that = this
      var image = new Image()
      image.src = src + '?v=' + Math.random() // 处理缓存
      image.crossOrigin = '*' // 支持跨域图片
      image.onload = function() {
        that.LOGOUrl = that.getBase64Image(image)
      }
    },
    // 下载html2canvas生成的截图
    uploadQR() {
      var a = document.createElement('a')
      a.href = this.dataURL
      a.download = '图'
      a.click()
    },
    // 获取数据
    async getUserInfo(params) {
      const { data } = await getInfo(params)
      this.main(data.iconUrl) // 将logo路径转成base64，阻止无法解决的跨域问题
      setTimeout(function() {
        that.makeImg() // 等数据都生成后，再执行
      }, 300)
    }

  },
  mounted(){

    var Cesium = this.Cesium;
    // var widgets =this.widgets;
    var cesiumContainer = document.getElementById("cesiumContainer");
    Cesium.Ion.defaultAccessToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZTA3YWQ1MC04NGEwLTRiNGItYjlmMC03YmYyYjU2NWY5OTEiLCJpZCI6OTEwMywic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIiwicHIiXSwiaWF0IjoxNTk0MTExNjM0fQ.yUm357eFGBOmUhDba64eAsSpXrYNpRg7cCpwzyz5FjE';

    var viewer = new Cesium.Viewer("cesiumContainer",{
        animation: false,  //是否显示动画控件
        baseLayerPicker: true, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: true,  //是否显示点击要素之后显示的信息
        CreditsDisplay: false,
        terrainProvider: new Cesium.CesiumTerrainProvider({
            url: Cesium.IonResource.fromAssetId(1),
        })});

        viewer.imageryLayers.addImageryProvider(new Cesium.WebMapTileServiceImageryProvider({
            url: "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=ebf64362215c081f8317203220f133eb",
            layer: "tdtBasicLayer",
            style: "default",
            format: "tiles",
            tileMatrixSetID: "GoogleMapsCompatible",
            show: true,
            maximumLevel: 18
            }));
 
    this.getUserInfo()

    //mount    
    }   
}
</script>
 

<style scoped>
.container{
    width: 100%;
    height: 100%;
}

#menu{
   
    background-color: rgb(226, 226, 226);
    font-size: 25px;
    height: 100%;
    padding-top: 15px;
    color: dodgerblue;
    overflow: hidden;
    box-sizing: border-box;
}
ul{
    list-style: none;
    padding: 0;
}
li{
    margin-bottom: 15px;
    color: black;
    border: white 1px solid;
}


.el-main{
    padding: 0 0 0 10px;
}
#cesiumContainer{
    width: 100%;
    /* height: 100%; */
}

</style>
