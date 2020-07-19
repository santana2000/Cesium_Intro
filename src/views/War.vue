<template>
  <div class="container">
    <div id="cesiumContainer">
        <gv-navigation ref='navi' 
          :zoom="false" 
          :reset="false" 
          :sceneMode="false" 
          :scale="false"
          :linked="linked">
        </gv-navigation>
      <div id="infobox"></div>
    </div>
    <!-- 敌机出动干扰 -->
    <el-button id="step1" @click="enemyStart">Step1</el-button>
    <!-- 视图级别放大，看到船向岛台发出信号，视图收回，岛台向飞艇和另外岛发信号 -->
    <el-button id="step2" @click="shipError">Step2</el-button>
    <!-- 我方飞艇出动 -->
    <el-button id="step3" @click="ourPlane">Step3</el-button>
    <!-- 敌机飞走，船正常行驶 ,清除原有entity,绘制新entity,此时使用数组反转生成新路径-->
    <el-button id="step4" @click="backNormal">Step4</el-button> 

    <el-button id="stepx" @click="tempStopTime">{{go}}</el-button> 
    <!-- <el-button id="stepx" @click="backNormal">{{go}}</el-button>  -->
    <!-- <el-button id="step5" @click="addScan1">Step5</el-button> -->
    <!-- <el-button id="step5" @click="addScan">Step6</el-button> -->
    <!-- <el-button @click="randomRotate">{{timer?"停止转动":"开始转动"}}</el-button> -->

  </div>
</template>
 
<script>
// import * as Cesium from "@/../node_modules/cesium/Source/Cesium.js";
import $ from "jquery";
// import * as cesiumpro from 'cesiumpro'
import GVScan from "../js/scan";
import {
  gvNavigation
} from 'gv-cesium-plugins'
import 'gv-cesium-plugins/dist/theme/default.css'
// import FlowArrowMaterial from '../js/flowArrow'

export default {
  name: "war",
  data() {
    return {
      timer:undefined,
      linked:true,
      go:"暂停",
      // fy:'',
    };
  },
  components: {gvNavigation},
  methods: {
    //暂停
    tempStopTime(){
      var _this = this;

      if(this.go == "暂停"){
        this.go = "开始";
      _this.viewer.clock.multiplier = 0; 

      }else if(this.go == "开始"){
        this.go = "暂停";
      _this.viewer.clock.multiplier = 6; // 时间速率，数字越大时间过的越快
      }
    },
    //指南针
    randomRotate() {
      const ele = $('.navigation-class .compass')
      if(this.timer){
        clearInterval(this.timer);
        this.timer=undefined;
        this.linked=true;
        return;
      }
      this.linked=false;
      this.timer=setInterval(() => {
        const random = Math.random() * 60;
        const angle = random - 30; //随机旋转的角度在-30~30文章
        ele.css('transform', 'rotate(' + angle + 'deg)')
      }, 200)
    },
    stopRotate() {
      const ele = $('.navigation-class .compass')
      if(this.timer){
        clearInterval(this.timer);
        this.timer=undefined;
        this.linked=true;
        return;
      }
    },
    //飞线
    flowLine() {
      var _this = this;
      const points = [{
          lon: 114.51,
          lat: 9.92
        },{
          lon: 114.65,
          lat:8.86
        }
      ];
      let start0 = Cesium.JulianDate.fromDate(new Date(2017, 8, 11, 10)); // 起始时间
      let startline = Cesium.JulianDate.addSeconds(start0, 40, new Cesium.JulianDate());
      let stopline = Cesium.JulianDate.addSeconds(startline, 38, new Cesium.JulianDate());
      // _this.viewer.clock.multiplier = 2; // 时间速率，数字越大时间过的越快
      //this.时钟与速率是否能在每一个时间段中单独修改
      const data = {
        image: "./dot.png",
        from: {lon: 115.53,lat: 9.89},
        to: points,
        height: 30000, //抛物线最大高度
        multiplier: 10, //流动速度
        lineColor: [30, 255, 79, 255],
        start:startline,
        stop:stopline
      };
      var fy = new GV.FlyLineByCZML(_this.viewer, data);
      fy.add();
      this.fy = fy;
      // window.viewer.flyTo(fy.ds)
    },
    addScan(path,position) {
      var _this = this;
      var pathz = path;
      
      this.scan = new GVScan(_this.viewer, {
        position: position,
        inverse: true,
        color:Cesium.Color.RED.withAlpha(0.3),
        path:pathz,
        radius:80000
      });
      // this.scan.zoomTo();
    },
    addScan1(position) {
      var _this = this;
      // const position = Cesium.Cartesian3.fromDegrees(115.53, 9.89, 75000);
      // const position = positon;
      this.scan1 = new GVScan(_this.viewer, 
        { position, 
          inverse: true ,
          color:Cesium.Color.GREEN.withAlpha(0.3),
          radius: 100000
          });
      // this.scan.zoomTo();
    },
    addScan2(position) {
      var _this = this;

      // if (this.scan) {
      //   this.scan.remove();
      //   this.scan = undefined;
      //   return;
      // }
      this.scan2 = new GVScan(_this.viewer, 
        { position, 
          inverse: true ,
          color:Cesium.Color.GREEN.withAlpha(0.5),
          radius: 120000
        });
      // this.scan.zoomTo();
    },
    //指南针随时间变化
    addRadar(){
      let _this = this;
      // console.log(_this.viewer.clock.currentTime);
      let start0 = Cesium.JulianDate.fromDate(new Date(2017, 8, 11, 10)); // 起始时间
      let start = Cesium.JulianDate.addSeconds(start0, 39, new Cesium.JulianDate());
      let x = Cesium.JulianDate.compare(start,_this.viewer.clock.currentTime);
      var planexEntity = _this.viewer.entities.getById("plane1");
      var shipPosition = planexEntity.position.getValue(
        _this.viewer.clock.currentTime
      );
      // console.log(x);
      // console.log(shipPosition);
      if(x < 0){
        this.randomRotate();
        // this.addScan1(shipPosition);
        // if (this.scan1) {
        // setTimeout(this.scan1.remove(),10000000) 
        // // this.scan1 = undefined;
        // return;
        // }
        _this.viewer.clock.onTick.removeEventListener(this.addRadar);
      }
    },
    addRadar2(){
      let _this = this;
      // console.log(_this.viewer.clock.currentTime);
      let start0 = Cesium.JulianDate.fromDate(new Date(2017, 8, 11, 10)); // 起始时间
      let start = Cesium.JulianDate.addSeconds(start0, 119, new Cesium.JulianDate());
      let x = Cesium.JulianDate.compare(start,_this.viewer.clock.currentTime);

      var planeEntity = _this.viewer.entities.getById("feiting0");
      var shipPosition = planeEntity.position.getValue(
            _this.viewer.clock.currentTime
          );
      var planeEntity2 = _this.viewer.entities.getById("feiting1");
      var shipPosition2 = planeEntity2.position.getValue(
            _this.viewer.clock.currentTime
          );
      // console.log(x);
      // console.log(shipPosition);
      // console.log(shipPosition2);
      if(x < 0){
        this.addScan1(shipPosition);
        this.addScan2(shipPosition2);
        // if (this.scan1) {
        // setTimeout(this.scan1.remove(),10000000) 
        // // this.scan1 = undefined;
        // return;
        // }
        _this.viewer.clock.onTick.removeEventListener(this.addRadar2);
        this.scan.remove();

      }
    },

    //敌机入侵************************************************************************************************************************************
    enemyStart() {
      var _this = this;
      // _this.viewer.entities.removeAll();
      // if(this.fy){
      //   this.fy.remove(); 
      // }
 
      let data = [];
      let dataship = [];
      //干扰机路径
      data[0] = [
        { longitude: 118.30,  dimension: 9.78, height: 125000, time: 0   },
        { longitude: 117.64,  dimension: 9.8,  height: 125000, time: 10  },
        { longitude: 116.99,  dimension: 9.85, height: 125000, time: 20  },
        { longitude: 116.13,  dimension: 9.83, height: 125000, time: 30  } ,
        { longitude: 115.53,  dimension: 9.89, height: 125000, time: 40  },
        { longitude: 115.53,  dimension: 9.89, height: 125000, time: 160 },
        // { longitude: 115.532, dimension: 9.89, height: 105000, time: 160 },
        { longitude: 115.53,  dimension: 9.89, height: 125000, time: 170  },
        { longitude: 116.13,  dimension: 9.83, height: 125000, time: 180  } ,
        { longitude: 116.99,  dimension: 9.85, height: 125000, time: 190  },
        { longitude: 118.30,  dimension: 9.78, height: 125000, time: 200   },

      ];
      //船路径,点击div后 动态的add船的运行path
      dataship[0] = [
        { longitude: 112.35,  dimension: 10.48, height: 5000, time: 0   },
        { longitude: 112.78, dimension: 10.01, height: 5000, time: 4  },
        { longitude: 113.20, dimension: 9.99, height: 5000, time: 8  },
        { longitude: 113.62, dimension: 9.99, height: 5000, time: 12  },
        { longitude: 114.16, dimension: 10.08, height: 5000, time: 16  },
        { longitude: 114.59, dimension: 10.08, height: 5000, time: 20  },
        { longitude: 114.94, dimension: 10.08, height: 5000, time: 24  },
        { longitude: 115.24, dimension: 10.08, height: 5000, time: 28  },
        { longitude: 115.37, dimension: 10.08, height: 5000, time: 32  },
        { longitude: 115.43, dimension: 10.08, height: 5000, time: 36  },
        { longitude: 115.29, dimension: 10.08, height: 5000, time: 40  },
        { longitude: 115.29, dimension: 10.08, height: 5000, time: 160  },
        { longitude: 114.96, dimension: 10.08, height: 5000, time: 170  },
        { longitude: 114.47, dimension: 10.08, height: 5000, time: 182  },
        { longitude: 114.47, dimension: 10.08, height: 5000, time: 200  },
      ];
      dataship[1] =[
        { longitude: 113.77, dimension: 11.91, height: 5000, time: 0 },
        { longitude: 113.63, dimension: 11.48, height: 5000, time: 4 }, 
        { longitude: 113.62, dimension: 10.87, height: 5000, time: 8 }, 
        { longitude: 113.64, dimension: 10.35, height: 5000, time: 12 }, 
        { longitude: 113.69, dimension: 9.83,  height: 5000, time: 16 },
        { longitude: 113.92, dimension: 9.39,  height: 5000, time: 20 },
        { longitude: 114.16, dimension: 9.19,  height: 5000, time: 24 }, 
        { longitude: 114.67, dimension: 9.17,  height: 5000, time: 32 },
        { longitude: 115.11, dimension: 9.33,  height: 5000, time: 40 }, 
        // { longitude: 115.46, dimension: 9.55,  height: 5000, time: 36 },
        // { longitude: 115.82, dimension: 9.98,  height: 5000, time: 40 }, 
        { longitude: 115.11, dimension: 9.33,  height: 5000, time: 160 }, 
        { longitude: 115.95, dimension: 10.43, height: 5000, time: 170 }, 
        { longitude: 116.01, dimension: 10.86, height: 5000, time: 182 },
        { longitude: 116.01, dimension: 10.86, height: 5000, time: 200 }];

      dataship[2] = [
        { longitude: 112.03, dimension: 10.60, height: 10, time: 0 }, 
        { longitude: 112.44, dimension: 10.38, height: 10, time: 4 }, 
        { longitude: 112.86, dimension: 10.24, height: 10, time: 8 }, 
        { longitude: 113.32, dimension: 10.07, height: 10, time: 12 }, 
        { longitude: 113.70, dimension: 9.96,  height: 10, time: 16 }, 
        { longitude: 114.14, dimension: 9.95,  height: 10, time: 20 }, 
        { longitude: 114.50, dimension: 10.00, height: 10, time: 24 },
        { longitude: 114.82, dimension: 10.06, height: 10, time: 26 }, 
        { longitude: 115.06, dimension: 10.01, height: 10, time: 28 }, 
        { longitude: 115.27, dimension: 9.91,  height: 10, time: 30 }, 
        { longitude: 115.48, dimension: 9.80,  height: 10, time: 32 }, 
        { longitude: 115.88, dimension: 10.0,  height: 10, time: 40 }, 
        { longitude: 115.88, dimension: 10.0,  height: 10, time: 160 },
        { longitude: 115.73, dimension: 9.38,  height: 10, time: 170 },
        { longitude: 115.80, dimension: 8.87,  height: 10, time: 182 },
        { longitude: 115.80, dimension: 8.87,  height: 10, time: 200 }];

      let start = Cesium.JulianDate.fromDate(new Date(2017, 8, 11, 10)); // 起始时间
      let stop = Cesium.JulianDate.addSeconds(
        start,
        200,
        new Cesium.JulianDate()
      ); // 结束时间

      _this.viewer.clock.startTime = start.clone(); // 设置始时钟始时间
      _this.viewer.clock.currentTime = start.clone(); // 设置时钟当前时间
      _this.viewer.clock.stopTime = stop.clone(); // 设置始终停止时间
      _this.viewer.clock.multiplier = 6; // 时间速率，数字越大时间过的越快
      _this.viewer.timeline.zoomTo(start, stop); // 时间轴
      // 循环执行,即为2，到达终止时间，重新从起点时间开始
      // _this. viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      _this.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;

      // for (let j = 0; j < data.length; j++) {
      let property00 = computeFlight(data[0]);
      // let property01 = computeFlight(data[1]);
      // let property02 = computeFlight(data[2]);
      //console.log(property)

      // 添加飞机模型-----------------------------------------------------------
      let planeModel00 = _this.viewer.entities.add({
        // 和时间轴关联
        id:'plane1',
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
          // trailTime: 10,  //让路径持续显示
          width: 3,
          resolution: 1,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.3,
            color: Cesium.Color.PALEGOLDENROD.withAlpha(0.8)
          })
        },
        // 根据所提供的速度计算模型的朝向
        orientation: new Cesium.VelocityOrientationProperty(property00),
        // 模型数据
        model: {
          uri: "/models/CesiumAir/Cesium_Air.glb",
          minimumPixelSize: 88,
          scale: 1
        }
      });
      // 定义雷达路径------------------
      var planeEntity = _this.viewer.entities.getById("plane1");
      var planePosition = planeEntity.position.getValue(
        _this.viewer.clock.currentTime
      );
      var pathbo = _this.viewer.entities.add({
        position: property00,
        availability:new Cesium.TimeIntervalCollection([new Cesium.TimeInterval({
        start:start,
        stop:stop
      })]),
        orientation: new Cesium.VelocityOrientationProperty(property00),
        path: {
            show: true,
            leadTime: 0,
            trailTime: 10,  //让路径持续显示
            resolution: 1,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.3,
              color: Cesium.Color.PALEGOLDENROD
            }),
            // width:8
        },
      });
      this.addScan(pathbo,planePosition);
      //添加船-----------------------------------------------
      for (let j = 0; j < dataship.length; j++) {
        let propertyship = computeFlight(dataship[j]);
        //console.log(property)
        // 添加飞机模型
        let shipModel = _this.viewer.entities.add({
          id: "ship" + j,
          // 和时间轴关联,
          // name:"  ",
          availability: new Cesium.TimeIntervalCollection([
            new Cesium.TimeInterval({
              start: start,
              stop: stop
            })
          ]),
          position: propertyship,
          // path: {
          //   show: true,
          //   leadTime: 0,
          //   //trailTime: 60,  让路径持续显示
          //   width: 10,
          //   resolution: 1,
          //   material: new Cesium.PolylineGlowMaterialProperty({
          //     glowPower: 0.3,
          //     color: Cesium.Color.PALEGOLDENROD
          //   })
          // },
          // 根据所提供的速度计算模型的朝向
          orientation: new Cesium.VelocityOrientationProperty(propertyship),
          // 模型数据
          model: {
            uri: "/models/dao_dan_ting.glb",
            // uri:this.modelUrl,
            minimumPixelSize: 75,
            scale: 1
          }
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
      //出现雷达
      // 
      // _this.viewer.clock.onTick.addEventListener(this.addRadar);
      
      //点击船出现弹窗------------------------------------------------------------------------
      var handler = new Cesium.ScreenSpaceEventHandler(
        _this.viewer.scene.canvas
      );

      handler.setInputAction(function(movement) {
        var pick = _this.viewer.scene.pick(movement.position);
        var earthPosition = _this.viewer.camera.pickEllipsoid(
          movement.position,
          _this.viewer.scene.globe.ellipsoid
        ); //视角穿过球面点的位置
        if (Cesium.defined(pick) && pick.id.id === "ship0") {
          //console.log(pick);   -----整个对象
          var shipEntity = _this.viewer.entities.getById("ship0");
          var shipPosition = shipEntity.position.getValue(
            _this.viewer.clock.currentTime
          );
          console.log(shipEntity);
          // 创建气泡窗体
          var info = `名称：辽宁舰</br>编号：03279</br>`;
          $("#infobox").empty();
          $("#infobox").append(info);
          $("#infobox").show();
          // 气泡位置
          // var winpos = _this.viewer.scene.cartesianToCanvasCoordinates(earthPosition); //屏幕坐标
          var winpos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            _this.viewer.scene,
            shipPosition
          );
          console.log("winpos:" + winpos);
          var bubble = document.getElementById("infobox");
          bubble.style.left = winpos.x + "px";
          bubble.style.top = winpos.y + 20 + "px";
          //位置跟随----------------------------------------------------
          _this.viewer.scene.postRender.addEventListener(function(e) {
            var shipEntity = _this.viewer.entities.getById("ship0");
            var shipPosition = shipEntity.position.getValue(
              _this.viewer.clock.currentTime
            );
            var newpoi = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
              _this.viewer.scene,
              shipPosition
            );
            if (winpos.x != newpoi.x) {
              winpos.x = newpoi.x;
              winpos.y = newpoi.y;
              var bubble = document.getElementById("infobox");
              bubble.style.left = winpos.x + "px";
              bubble.style.top = winpos.y + 20 + "px";
            }
          }); //----------------------------------------------------------
        } else if (Cesium.defined(pick) && pick.id.id === "ship1") {
          var shipEntity = _this.viewer.entities.getById("ship1");
          var shipPosition = shipEntity.position.getValue(
            _this.viewer.clock.currentTime
          );
          console.log("船位置" + shipPosition);
          console.log("earthPosition" + earthPosition);
          //console.log(pick.id);-----这个实体
          var info = `名称：山东舰</br>编号：06185</br>`;
          $("#infobox").empty();
          $("#infobox").append(info);
          $("#infobox").show();
          var winpos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            _this.viewer.scene,
            shipPosition
          );
          console.log("winpos:" + winpos);
          var bubble = document.getElementById("infobox");
          bubble.style.left = winpos.x + 59 + "px";
          bubble.style.top = winpos.y + 34 + "px";
          //位置跟随----------------------------------------------------
          _this.viewer.scene.postRender.addEventListener(function(e) {
            var shipEntity = _this.viewer.entities.getById("ship1");
            var shipPosition = shipEntity.position.getValue(
              _this.viewer.clock.currentTime
            );
            var newpoi = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
              _this.viewer.scene,
              shipPosition
            );
            // var newpoi = _this.viewer.scene.cartesianToCanvasCoordinates(earthPosition); //屏幕坐标
            // console.log("newpoi"+ newpoi);
            if (winpos.x != newpoi.x) {
              winpos.x = newpoi.x;
              winpos.y = newpoi.y;
              var bubble = document.getElementById("infobox");
              bubble.style.left = winpos.x + 59 + "px";
              bubble.style.top = winpos.y + 34 + "px";
            }
          }); //----------------------------------------------------------
        } else if (Cesium.defined(pick) && pick.id.id === "ship2") {
          var shipEntity = _this.viewer.entities.getById("ship2");
          var shipPosition = shipEntity.position.getValue(
            _this.viewer.clock.currentTime
          );
          var info = `名称：海洋舰</br>编号：05381</br>`;
          $("#infobox").empty();
          $("#infobox").append(info);
          $("#infobox").show();
          // var winpos = _this.viewer.scene.cartesianToCanvasCoordinates(earthPosition); //屏幕坐标
          var winpos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
            _this.viewer.scene,
            shipPosition
          );
          console.log("winpos:" + winpos);
          var bubble = document.getElementById("infobox");
          bubble.style.left = winpos.x + 40 + "px";
          bubble.style.top = winpos.y + 240 + "px";
          //位置跟随----------------------------------------------------
          _this.viewer.scene.postRender.addEventListener(function(e) {
            var shipEntity = _this.viewer.entities.getById("ship2");
            var shipPosition = shipEntity.position.getValue(
              _this.viewer.clock.currentTime
            );
            var newpoi = Cesium.SceneTransforms.wgs84ToWindowCoordinates(
              _this.viewer.scene,
              shipPosition
            );
            if (winpos.x != newpoi.x) {
              winpos.x = newpoi.x;
              winpos.y = newpoi.y;
              var bubble = document.getElementById("infobox");
              bubble.style.left = winpos.x + 40 + "px";
              bubble.style.top = winpos.y + 240 + "px";
            }
          });
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
      // 结束查询
      handler.setInputAction(function(movement) {
        // handler = handler.destroy();
        $("#infobox").hide();
      }, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
    },
    //我方船发信号************************************************************************************************************************
    shipError() {
      var _this = this;
      _this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(115.1, 6, 150000.0),
        orientation: {
          heading: Cesium.Math.toRadians(0, 0),
          pitch: Cesium.Math.toRadians(-25),
          roll: 0.0
        }
      });
      _this.viewer.clock.multiplier = 10; // 时间速率，数字越大时间过的越快

      this.flowLine();
    },
    //我方飞艇****************************************************************************************************************************
    ourPlane() {
      var _this = this;
      _this.viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(115.1, 3, 300000.0),
        orientation: {
          heading: Cesium.Math.toRadians(0, 0),
          pitch: Cesium.Math.toRadians(-25),
          roll: 0.0
        }
      });
      let ourFly = [];
      //飞艇路径
      ourFly[0] = [
        { longitude: 112.95,  dimension: 9.6,   height: 5000,    time: 0   },
        { longitude: 113.05,  dimension: 9.78,  height: 45000,  time: 5  },
        { longitude: 113.43,  dimension: 9.87, height:  85000,  time: 10  },
        { longitude: 113.65,  dimension: 10.12,  height: 100000, time: 15  },
        { longitude: 114.05,  dimension: 10.13,  height: 105000, time: 20  },
        { longitude: 114.14,  dimension: 10.23, height: 105000, time: 25  },
        { longitude: 114.56,  dimension: 10.35, height: 105000, time: 40  },
        // { longitude: 115.35,  dimension: 10.01, height: 105000, time: 40 },
        { longitude: 114.56, dimension: 10.35, height: 105000, time: 80 },
        { longitude: 113.351, dimension: 10.01, height: 105000, time: 120 },
        
      ];
      ourFly[1] = [
        { longitude: 114.00,  dimension: 8.81,   height: 5000,  time: 0   },
        { longitude: 114.15,  dimension: 8.93,  height: 45000,  time: 5  },
        { longitude: 114.38,  dimension: 9.04, height:  85000,  time: 10  },
        { longitude: 114.54,  dimension: 9.20,  height: 100000, time: 15  },
        { longitude: 114.68,  dimension: 9.34, height: 105000, time: 20  },
        { longitude: 114.84,  dimension: 9.44, height: 105000,  time: 25  },
        { longitude: 114.99,  dimension: 9.50, height: 105000,  time: 40 },
        // { longitude: 115.22,  dimension: 9.74, height: 105000,  time: 40 },
        { longitude: 114.99,  dimension: 9.50, height: 105000,  time: 80 },
        { longitude: 113.91,  dimension: 9.41, height: 105000,  time: 120 },
        
       
      ];
      // 运行 等待 再运行 
      let start0 = Cesium.JulianDate.fromDate(new Date(2017, 8, 11, 10)); // 起始时间
      let start = Cesium.JulianDate.addSeconds(start0, 80, new Cesium.JulianDate());
      // start.secondsOfDay = 40;
      console.log(start);
      let stop = Cesium.JulianDate.addSeconds(
        start,
        120,
        new Cesium.JulianDate()
      ); // 结束时间

      _this.viewer.clock.startTime = start.clone(); // 设置始时钟始时间
      _this.viewer.clock.currentTime = start.clone(); // 设置时钟当前时间
      _this.viewer.clock.stopTime = stop.clone(); // 设置始终停止时间
      _this.viewer.clock.multiplier = 6; // 时间速率，数字越大时间过的越快
      _this.viewer.timeline.zoomTo(start, stop); // 时间轴
      // 循环执行,即为2，到达终止时间，重新从起点时间开始
      // _this. viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      _this.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;

      for (let j = 0; j < ourFly.length; j++) {
        let property00 = computeFlight(ourFly[j]);
        // 添加飞艇模型-----------------------------------------------------------
        let planeModel00 = _this.viewer.entities.add({
          id:"feiting"+j,
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
            trailTime: 6,  //让路径持续显示
            width: 3,
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
            uri: "/models/FeiTing.glb",
            minimumPixelSize: 88,
            scale: 1
          }
        });
      }
      //后面单独封装出来这个函数
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
      _this.viewer.clock.onTick.addEventListener(this.addRadar2);

    },
    //恢复正常***************************************************************************************
    backNormal(){
      var _this = this;
      let start0 = Cesium.JulianDate.fromDate(new Date(2017, 8, 11, 10)); // 起始时间
      let start = Cesium.JulianDate.addSeconds(start0, 160, new Cesium.JulianDate());
      // start.secondsOfDay = 40;
      console.log(start);
      let stop = Cesium.JulianDate.addSeconds(
        start,
        40,
        new Cesium.JulianDate()
      ); // 结束时间

      _this.viewer.clock.startTime = start.clone(); // 设置始时钟始时间
      _this.viewer.clock.currentTime = start.clone(); // 设置时钟当前时间
      _this.viewer.clock.stopTime = stop.clone(); // 设置始终停止时间
      _this.viewer.clock.multiplier = 6; // 时间速率，数字越大时间过的越快
      _this.viewer.timeline.zoomTo(start, stop); // 时间轴
      // 循环执行,即为2，到达终止时间，重新从起点时间开始
      // _this. viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      _this.viewer.clock.clockRange = Cesium.ClockRange.CLAMPED;

      this.stopRotate();
      setTimeout(this.scan1.remove(),70000) 
      setTimeout(this.scan2.remove(),70000) 
      
    }
  },


  //***************************************************************************** *********************************************************/
  //***************************************************************************** *********************************************************/
  mounted() {
    // var Cesium = this.Cesium;
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
      infoBox: false, //是否显示点击要素之后显示的信息
      fullscreenButton: false, //全屏显示
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
        url:
          "https://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
        layer: "tdtBasicLayer",
        style: "default",
        format: "image/jpeg",
        tileMatrixSetID: "GoogleMapsCompatible"
      })
    );
    // this.$refs.navi.init(viewer);
    viewer.entities.add({
        // 和时间轴关联
        id:'tower1',
        position: new Cesium.Cartesian3.fromDegrees(115.53, 9.89, 10),
        // 模型数据
        model: {
          uri: "/models/XinHaoTa.glb",
          minimumPixelSize: 68,
          // scale: 1
        }
      });
      this.scanT1 = new GVScan(viewer, {
        position:new Cesium.Cartesian3.fromDegrees(115.53, 9.89, 300),
        radius:60000,
        inverse: true,
        color:Cesium.Color.GREEN.withAlpha(0.8),
      });
      viewer.entities.add({
        // 和时间轴关联
        id:'tower2',
        position: new Cesium.Cartesian3.fromDegrees(114.51, 9.92, 10),
        // 模型数据
        model: {
          uri: "/models/XinHaoTa.glb",
          minimumPixelSize: 68,
          // scale: 1
        }
      });
      this.scanT2 = new GVScan(viewer, {
        position: new Cesium.Cartesian3.fromDegrees(114.51, 9.92, 300),
        radius:60000,
        inverse: true,
        color:Cesium.Color.GREEN.withAlpha(0.8),
      });
      viewer.entities.add({
        // 和时间轴关联
        id:'tower3',
        position: new Cesium.Cartesian3.fromDegrees(114.65, 8.86, 10),
        // 模型数据
        model: {
          uri: "/models/XinHaoTa.glb",
          minimumPixelSize: 68,
          // scale: 1
        }
      });
      this.scanT3 = new GVScan(viewer, {
        position: new Cesium.Cartesian3.fromDegrees(114.65, 8.86, 300),
        radius:60000,
        inverse: true,
        color:Cesium.Color.GREEN.withAlpha(0.8),
      });
        

    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(115.1, 3, 300000.0),
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
  width: 100%;
  height: 80%;
  margin-bottom: 20px;
}
#infobox {
  position: absolute;
  /* top: 100px;*/
  /* left: 50px;  */
  width: 150px;
  height: 55px;
  z-index: 99;
  background-color: rgba(100, 148, 237, 0.76);
  border: dodgerblue 1px solid;
  border-radius: 10px;
  color: rgb(255, 254, 254);
  display: none;
  text-align: center;
  font-size: 18px;
}
</style>
