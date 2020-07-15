<template>
  <div class="container">
    <div id="cesiumContainer">
    </div>

    <button id="step1" @click="enemyStart">
      step1
    </button> 
    <button id="step2">
      step2
    </button>   
  </div>
</template>
 
<script>
import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js"

export default {
  name: "war",
  data() {
    return {
      // modelUrl: "./Cesium_Air.glb",
      // modelUrl: "src/assets/models/CesiumAir/Cesium_Air.glb"
      
    };
  },
  methods: {
    //敌机入侵
    enemyStart(){
      var _this = this;
      let data = [];
      let dataship = [];
      //干扰机路径
      data[0] = [
        { longitude: 117.95, dimension: 9.78,  height: 70000,  time: 0   },
        { longitude: 117.08, dimension: 9.86,  height: 70000,  time: 30  },
        { longitude: 116.63, dimension: 9.94,  height: 70000,  time: 60  },
        { longitude: 115.96, dimension: 10.1,  height: 70000,  time: 100 },
        { longitude: 115.06, dimension: 10.21, height: 70000,  time: 150 },
        // { longitude: 113.06, dimension: 9.49, height: 50000, time: 440 }
      ];
      //船路径data[1] = [{ longitude: 115.28, dimension: 9.89, height: 10, time: 0 }, { longitude: 114.91, dimension: 9.52, height:10, time: 40 }, { longitude: 114.53, dimension: 9.46, height: 10, time: 100 }, { longitude: 113.92, dimension: 9.36, height: 10, time: 280 }, { longitude: 113.44, dimension: 9.37, height: 10, time: 360 },{ longitude: 113.06, dimension: 9.49, height: 10, time: 440 }];
      //圆锥路径
      data[1] = [
        { longitude: 117.95, dimension: 9.78,  height: 47000,  time: 0 },
        { longitude: 117.08, dimension: 9.86,  height: 47000,  time: 30 },
        { longitude: 116.63, dimension: 9.94,  height: 47000,  time: 60  },
        { longitude: 115.96, dimension: 10.1,  height: 47000,  time: 100 },
        { longitude: 115.06, dimension: 10.21, height: 47000,  time: 150 },
        // { longitude: 113.06, dimension: 9.49, height: 32000, time: 440 }
      ];
      //船路径,点击div后 动态的add船的运行path
      dataship[0] = [
        { longitude: 113.06, dimension: 9.49, height: 5000, time: 0   },
        { longitude: 113.44, dimension: 9.37, height: 5000, time: 40  },
        { longitude: 113.92, dimension: 9.36, height: 5000, time: 60  },
        { longitude: 114.53, dimension: 9.46, height: 5000, time: 80  },
        { longitude: 114.91, dimension: 9.52, height: 5000, time: 110 },
        { longitude: 115.28, dimension: 9.89, height: 5000, time: 150 },
      ];
      dataship[1] = [
        { longitude: 112.06, dimension: 9.09,  height: 5000, time: 0   },
        { longitude: 112.78, dimension: 10.26, height: 5000, time: 40  },
        { longitude: 113.44, dimension: 10.66, height: 5000, time: 60  },
        { longitude: 114.55, dimension: 10.52, height: 5000, time: 80  },
        { longitude: 115,    dimension: 10.07, height: 5000, time: 110 },
        { longitude: 115.55, dimension: 10.91, height: 5000, time: 150 },
      ];
      // dataship[2] = [
      //   { longitude: 115.28, dimension: 9.89, height: 5000, time: 0 },
      //   { longitude: 114.91, dimension: 9.52, height: 5000, time: 40 },
      //   { longitude: 114.53, dimension: 9.46, height: 5000, time: 100 },
      //   { longitude: 113.92, dimension: 9.36, height: 5000, time: 280 },
      //   { longitude: 113.44, dimension: 9.37, height: 5000, time: 360 },
      //   { longitude: 113.06, dimension: 9.49, height: 5000, time: 440 }
      // ];      
      // 起始时间
      let start = Cesium.JulianDate.fromDate(new Date(2017, 7, 11));
      // 结束时间
      let stop = Cesium.JulianDate.addSeconds(start,150,new Cesium.JulianDate());

      // 设置始时钟始时间
      _this.viewer.clock.startTime = start.clone();
      // 设置时钟当前时间
      _this.viewer.clock.currentTime = start.clone();
      // 设置始终停止时间
      _this.viewer.clock.stopTime = stop.clone();
      // 时间速率，数字越大时间过的越快
      _this.viewer.clock.multiplier = 10;
      // 时间轴
      _this.viewer.timeline.zoomTo(start, stop);
      // 循环执行,即为2，到达终止时间，重新从起点时间开始
    //  _this. viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
     _this. viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;

      // for (let j = 0; j < data.length; j++) {
        let property00 = computeFlight(data[0]);
        let property01 = computeFlight(data[1]);
        //console.log(property)
        // 添加飞机模型-----------------------------------------------------------
        let planeModel00 = _this.viewer.entities.add({
          // 和时间轴关联
          availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
              start: start,
              stop: stop
            })
          ]),
          position: property00,
          path: {
            show: true,
            leadTime: 0,
          //trailTime: 60,  让路径持续显示
            width: 10,
            resolution: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: Cesium.Color.PALEGOLDENROD
            })
          },
          // 根据所提供的速度计算模型的朝向
          orientation: new Cesium.VelocityOrientationProperty(property00),
          // 模型数据
          model: {
            uri:"/models/CesiumAir/Cesium_Air.glb",
            
            // uri:this.modelUrl,
            minimumPixelSize: 128,
            scale: 1
          },
        });
        //添加圆锥--------------------------------------------------------------
        let planeModel01 = _this.viewer.entities.add({
          // 和时间轴关联
          availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
              start: start,
              stop: stop
            })
          ]),
          position: property01,
          // 根据所提供的速度计算模型的朝向
          orientation: new Cesium.VelocityOrientationProperty(property01),
          // 模型数据
          cylinder: {
            //圆锥
            length: 50000.0,
            topRadius: 0.0,
            bottomRadius: 70000.0,
            material: Cesium.Color.RED.withAlpha(0.4)
          }
        });
      //添加船-----------------------------------------------
      for (let j = 0; j < dataship.length; j++) {
        let propertyship = computeFlight(dataship[j]);
        //console.log(property)
        // 添加飞机模型
        let shipModel = _this.viewer.entities.add({
          // 和时间轴关联
          availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
              start: start,
              stop: stop
            })
          ]),
          position: propertyship,
          path: {
            show: true,
            leadTime: 0,
          //trailTime: 60,  让路径持续显示
            width: 10,
            resolution: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: Cesium.Color.PALEGOLDENROD
            })
          },
          // 根据所提供的速度计算模型的朝向
          orientation: new Cesium.VelocityOrientationProperty(propertyship),
          // 模型数据
          model: {
            uri:"/models/GroundVehicle/GroundVehicle.glb",
            // uri:this.modelUrl,
            minimumPixelSize: 78,
            scale: 1
          },
        });
      }
      function computeFlight(source) {
        // 取样位置 相当于一个集合----计算路径
        let property = new Cesium.SampledPositionProperty();
        for (let i = 0; i < source.length; i++) {
          let time = Cesium.JulianDate.addSeconds(
            start,
            source[i].time,
            new Cesium.JulianDate()
          );
          let position = Cesium.Cartesian3.fromDegrees(
            source[i].longitude,
            source[i].dimension,
            source[i].height
          );
          // 添加位置，和时间对应
          property.addSample(time, position);
        }
        return property;
      }
    },
    //我方船只出错
    shipError(){

    }
  },
  mounted() {
    var Cesium = this.Cesium;
    var cesiumContainer = document.getElementById("cesiumContainer");
    Cesium.Ion.defaultAccessToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwZTA3YWQ1MC04NGEwLTRiNGItYjlmMC03YmYyYjU2NWY5OTEiLCJpZCI6OTEwMywic2NvcGVzIjpbImFzbCIsImFzciIsImFzdyIsImdjIiwicHIiXSwiaWF0IjoxNTk0MTExNjM0fQ.yUm357eFGBOmUhDba64eAsSpXrYNpRg7cCpwzyz5FjE";
    var viewer = new Cesium.Viewer("cesiumContainer", {
      animation: false, //是否显示动画控件
      baseLayerPicker: true, //是否显示图层选择控件
      geocoder: false, //是否显示地名查找控件
      timeline: true, //是否显示时间线控件
      sceneModePicker: false, //是否显示投影方式控件
      navigationHelpButton: false, //是否显示帮助信息控件
      infoBox: true, //是否显示点击要素之后显示的信息
      CreditsDisplay: false,
      shouldAnimate: true,
      terrainProvider: new Cesium.CesiumTerrainProvider({
        url: Cesium.IonResource.fromAssetId(1)
      })
    });
    viewer.scene.debugShowFramesPerSecond = true; //显示帧率
    viewer.scene.globe.enableLighting = true; //启用光照

    viewer.imageryLayers.addImageryProvider(
      // new Cesium.WebMapTileServiceImageryProvider({
      //   url:
      //     "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=ebf64362215c081f8317203220f133eb",
      //   layer: "tdtBasicLayer",
      //   style: "default",
      //   format: "tiles",
      //   tileMatrixSetID: "GoogleMapsCompatible",
      //   show: true,
      //   maximumLevel: 18
      // })
      new Cesium.UrlTemplateImageryProvider({
          // url: "http://t0.tianditu.com/img_w/wmts?service=wmts&request=GetTile&version=1.0.0&LAYER=img&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&style=default&format=tiles&tk=d6a72a78a43a2c17294b72ab26354cd6",
          url: "https://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
          layer: "tdtBasicLayer",
          style: "default",
          format: "image/jpeg",
          tileMatrixSetID: "GoogleMapsCompatible"
      })
    );
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(115.1, 4, 350000.0),
      orientation: {
        heading: Cesium.Math.toRadians(0, 0),
        pitch: Cesium.Math.toRadians(-25),
        roll: 0.0
      }
    });
    this.viewer = viewer;
  }
};
</script>
 

<style scoped>
.container {
  width: 100%;
  height: 100%;
}
#cesiumContainer {
  width: 80%;
  height: 80%;
}
#menu {
  background-color: rgb(226, 226, 226);
  font-size: 25px;
  height: 100%;
  padding-top: 15px;
  color: dodgerblue;
  overflow: hidden;
  box-sizing: border-box;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  margin-bottom: 15px;
  color: black;
  border: white 1px solid;
}

.el-main {
  padding: 0 0 0 10px;
}
</style>
