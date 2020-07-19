<template>
  <div class="allpage" ref="getall">
    <el-container >
        <el-aside>
            <div id="menu" ref="getmenu">菜单栏
                <ul>
                    <li @click="getAttribute">气泡窗</li>
                    <li @click="generatorImage">专题图</li>
                    <li>测量</li>
                </ul>
            </div>
        </el-aside>
        <el-main>
            <div id="cesiumContainer" ref="getmap">
                <div id="infoboxx" ref="getllbox">
                </div>
            </div>
            <div id="changelayer">
                <input type="radio" name="checkboxName" id="1" value="1" @click="addLayer1" checked="checked"/> 矢量地图<br/>
                <input type="radio" name="checkboxName" id="2" value="2" @click="addLayer2"/> 遥感影像<br/>
            </div>
            <div id="panel">
                <img :src="imgsrc" alt="" width="400px" height="230px">

            </div>
        </el-main>
    </el-container> 
</div>
</template>
 
<script>
import html2canvas from 'html2canvas'; 
import Canvas2Image from '@/assets/canvas2image.js';
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"

import $ from 'jquery';
export default {
  name: 'cesiumPage',
  data () {
    return {
        getAttr:false,
        imgsrc:''
    }
  },

  methods:{
    //切换图层
    addLayer1(){
        var _this = this;
        _this.viewer.imageryLayers.remove(_this.remlayer);
        _this.viewer.imageryLayers.addImageryProvider(_this.veclayer);
        _this.viewer.imageryLayers.addImageryProvider(_this.noticelayer);
    },
    addLayer2(){
        var _this = this;
        _this.viewer.imageryLayers.remove(_this.veclayer);
        _this.viewer.imageryLayers.addImageryProvider(_this.remlayer);
        _this.viewer.imageryLayers.addImageryProvider(_this.noticelayer);
    },
    //测量
    getLine(){

    },
    //热力图
    //字体图标三种使用方式的区别------less和scss的使用
    //专题图
    generatorImage() {
        console.log('a');
        const opts = {
                    // logging: true, //便于查看html2canvas的内部执行流程
                    useCORS: true 
                };
        // html2canvas(this.$refs.getmap,opts).then(canvas => {
        // 可以获取不同节点的位置，关键在于cesium配置选项中是否开启了允许截取canvas元素
        html2canvas(this.$refs.getmap,opts).then(canvas => {
            
            //要想设置截取后的图片大小，可以预设样式，也可以通过canvas2image来设置
            // var imageWidth = 750;
            // var ximg = Canvas2Image.Canvas2Image.convertToImage(canvas, imageWidth, imageWidth * canvas.height / canvas.width,'png');

          let link = document.createElement("a");
          link.href = canvas.toDataURL();//下载链接
          // ink.href = ximg.src;//下载链接
          link.setAttribute("download","专题图.png");
          link.style.display = "none";//a标签隐藏
          document.body.appendChild(link);
          link.click();
       //----------------------------
           // 调用保存到本地的方法下载图片
            // let link = document.createElement("img");
            // link.src = canvas.toDataURL();//下载链接
            
            // this.imgsrc = canvas.toDataURL();
        });
        // 添加图例，可以设置一个空白的默认图片占位符，截好图后把图片src赋值给这个占位符，然后就相当于把图标添加到这个图片上。
    }, 
    //气泡窗
    getAttribute(){
        var _this = this; // this.getAttr = !this.getAttr;
        //var Cesium = this.Cesium;
        var handler3D = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
        handler3D.setInputAction(function(event) {	 
            var earthPosition = _this.viewer.camera.pickEllipsoid(event.position,_this.viewer.scene.globe.ellipsoid); //视角穿过球面点的位置
            var cartographic = Cesium.Cartographic.fromCartesian(earthPosition, _this.viewer.scene.globe.ellipsoid, new Cesium.Cartographic());
            console.log("视角中心笛卡尔" + earthPosition);
            console.log("视角中心弧度" + cartographic);
            var lat = Cesium.Math.toDegrees(cartographic.latitude).toFixed(2);
            var lng = Cesium.Math.toDegrees(cartographic.longitude).toFixed(2);
            var height=(_this.viewer.camera.positionCartographic.height/1000).toFixed(2); 
            console.log("--------------------------------------");
            
            // 创建气泡窗体
            var info = `经度：${lng}</br>纬度：${lat}</br>高度：${height}`
            $("#infoboxx").empty();
            $("#infoboxx").append(info);
            $("#infoboxx").show();

            // 气泡位置
            var winpos = _this.viewer.scene.cartesianToCanvasCoordinates(earthPosition); //屏幕坐标
            console.log("winpos:"+winpos);
            var bubble = document.getElementById("infoboxx");
            bubble.style.left = winpos.x  + 319 + "px";
            bubble.style.top = winpos.y  + 114 + "px";

            //位置跟随
            _this.viewer.scene.postRender.addEventListener(function(e) {
                var newpoi = Cesium.SceneTransforms.wgs84ToWindowCoordinates(_this.viewer.scene, earthPosition);
            // var newpoi = _this.viewer.scene.cartesianToCanvasCoordinates(earthPosition); //屏幕坐标
            // console.log("newpoi"+ newpoi);
                if(winpos.x!=newpoi.x){
                    
                    winpos.x = newpoi.x;
                    winpos.y = newpoi.y;
                    var bubble = document.getElementById("infoboxx");
                    bubble.style.left = winpos.x  + 319 + "px";
                    bubble.style.top = winpos.y + 114+ "px";
                };
            }
        );
        },Cesium.ScreenSpaceEventType.LEFT_CLICK);
        
        //结束查询
        handler3D.setInputAction(function(movement) {
            handler3D = handler3D.destroy(); // 销毁整个鼠标事件
            $("#infoboxx").hide();
        }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
        
    }
  },
  mounted(){
    // console.log(this.Cesium);
//     var Cesium = this.Cesium;
    var cesiumContainer = document.getElementById("cesiumContainer");
        Cesium.Ion.defaultAccessToken ='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZTA3YWQ1MC04NGEwLTRiNGItYjlmMC03YmYyYjU2NWY5OTEiLCJpZCI6OTEwMywic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIiwicHIiXSwiaWF0IjoxNTk0MTExNjM0fQ.yUm357eFGBOmUhDba64eAsSpXrYNpRg7cCpwzyz5FjE';

    var viewer = new Cesium.Viewer("cesiumContainer",{
    
        homeButton: false,    //房子图标，视角返回初始位置
        baseLayerPicker: false, //是否显示图层选择控件  
        animation: false,  //是否显示动画控件
        baseLayerPicker: false, //是否显示图层选择控件
        geocoder: false, //是否显示地名查找控件
        timeline: false, //是否显示时间线控件
        sceneModePicker: false, //是否显示投影方式控件
        navigationHelpButton: false, //是否显示帮助信息控件
        infoBox: true,  //是否显示点击要素之后显示的信息
        fullscreenButton: false,//全屏显示
        CreditsDisplay: false,
        contextOptions: {
          webgl:{
            alpha: true,
            depth:true,
            stencil:true,
            antialias:true,
            premultipliedAlpha:true,
            //通过canvas.toDataURL()实现截图需要将该项设置为true
            preserveDrawingBuffer:true,
            failIfMajorPerformanceCaveat:true
          }
        },
        // terrainProvider: new Cesium.CesiumTerrainProvider({
        //     url: Cesium.IonResource.fromAssetId(1),
        // })
        });

        var veclayer = new Cesium.WebMapTileServiceImageryProvider({
            url: "http://t0.tianditu.com/vec_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=vec&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=ebf64362215c081f8317203220f133eb",
            layer: "tdtBasicLayer",
            style: "default",
            format: "tiles",
            tileMatrixSetID: "GoogleMapsCompatible",
            show: false,
            maximumLevel: 18
            })
        viewer.imageryLayers.addImageryProvider(veclayer);

        var noticelayer = new Cesium.WebMapTileServiceImageryProvider({ //电子地图添加中文标记
            url: "http://t0.tianditu.com/cia_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=cia&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default.jpg&tk=d6a72a78a43a2c17294b72ab26354cd6",
            layer: "tdtAnnoLayer",
            style: "default",
            format: "tiles",
            tileMatrixSetID: "GoogleMapsCompatible",
            show: false,
            })
        viewer.imageryLayers.addImageryProvider(noticelayer);

        var remlayer = new Cesium.WebMapTileServiceImageryProvider({
            url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=ebf64362215c081f8317203220f133eb",
            layer: "tdtBasicLayer",
            style: "default",
            format: "tiles",
            tileMatrixSetID: "GoogleMapsCompatible",
            show: true,
            maximumLevel: 18
            })

        viewer.entities.add({
            polyline:{
                positions:[
                    Cesium.Cartesian3.fromDegrees(118.30,9.78,5000  ),
                    Cesium.Cartesian3.fromDegrees(117.53,9.89,65000 ),
                    Cesium.Cartesian3.fromDegrees(116.53,9.89,35000 ),
                    Cesium.Cartesian3.fromDegrees(115.53,9.89,5000 )],
                width:10,
                // material: new Cesium.PolylineTrailMaterialProperty({ // 尾迹线材质
                //     //指定线型的填充颜色，替换为白色。
                //     color: new Cesium.Color.fromCssColorString("rgba(70,130,180, 1.0)"),
                //     //指定轮廓线的颜色，可选的黑色。
                //     outlineColor: new Cesium.Color(70 / 255, 130 / 255, 180 / 255, 0.3),
                //     //设置尾迹线的长度在整条线中占的比例，替换数值0.3
                //     trailLength: 0.8,
                //     //数值属性，设置尾迹线从起点到终点的运行周期，单位是秒，每次转换1000.0。
                //     period: 3  
                // }),
            },
            billboard :{
                position:Cesium.Cartesian3.fromDegrees(118.30,9.78,50000 ),
                image:'/images/navigation.png',
                width:90,
                height:90,
                }
        });
        

        {       // var tileset = viewer.scene.primitives.add(
                //     new Cesium.Cesium3DTileset({
                //         url: Cesium.IonResource.fromAssetId(54482), 
                //         clampToGround: true,
                //         heightReference: Cesium.HeightReference.CLAMP_TO_GROUND 
                //     })
                //     );
                // tileset.readyPromise
                //     .then(function () {
                //     viewer.flyTo(tileset);
                // });
        }
        this.viewer = viewer;
        this.veclayer = veclayer;
        this.noticelayer = noticelayer;
        this.remlayer = remlayer;

        viewer.camera.setView({
            destination : Cesium.Cartesian3.fromDegrees(117.16, 32.71, 15000000.0)
        });

      
        viewer.entities.add({
                position:[Cesium.Cartesian3.fromDegrees(118.30,9.78,550000 )],
                billboard :{
                    image:'/images/navigation.png',
                    width:190,
                    height:190,
                }
        })


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
    margin: 0 45px 15px 45px;
    color: rgb(255, 255, 255);
    border: white 1px solid;
    border-radius: 5px;
    background-color: rgba(30, 144, 251, 0.521);
    padding: 5px;
}


.el-main{
    padding: 0 0 0 10px;
}
#cesiumContainer{
    width: 100%;
    /* height: 100%; */
}
#infoboxx{
            position: absolute;
            /* top: 100px;
            left: 100px; */
            width: 150px;
            height: 75px;
            z-index: 99;
            background-color:rgba(100, 148, 237, 0.76);
            border: dodgerblue 1px solid;
            border-radius: 10px;
            color: rgb(255, 254, 254);
            display: none;
            text-align:center;
            font-size: 18px;
        }
#panel{
    position: fixed;
    left: 300px;
    top:300px;
    z-index: 99;
}
#changelayer{
    position: fixed;
    top:140px;
    right: 10px;
    width: 140px;
    height: 56px;
    color: rgb(8, 12, 19);
    background-color: rgba(205, 248, 255, 0.527);
    border: cornflowerblue solid 1px;
    border-radius: 4px;
}
</style>
