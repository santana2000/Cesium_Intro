	<template>
	<div>
		<div class="body-content">
			<div id="cesiumContainer"></div>
			<Button type="primary" class="addpoint" @click="addPoint">画一个点</Button>
			<Button type="primary" class="addline" @click="addLinenew">画一条线</Button>
			<Button type="primary" class="addPolygon" @click="addPolygon">画多边形</Button>
			<Button type="primary" class="addWaterPolygon" @click="addWaterPolygon">画个水域</Button>
			<Button type="primary" class="clearHandle" @click="clearHandle">清除</Button>
			<!--<Button type="primary" class="clearWaterHandle" @click="clearWaterHandle">清除水域</Button>-->
		</div>
		<div v-show="showPointAlert" class="pointAlert" id="pointAlertdiv">
			<point-alert ref="pointAlert"></point-alert>
		</div>
	</div>
</template>
<script>
	/**创建一个地球实例，
	 * 实现可以画点，画线，画多边形
	 * 绘制点线面
	 */
	import Cesium from 'cesium/Cesium'
	import widgets from 'cesium/Widgets/widgets.css'
	import pointAlert from '../alert/pointAlert'
	export default {
		name: "cesiumtrack",
		components:{
			pointAlert
		},
		data(){
			return{
				viewer:{},
				pointData:[],
				pointArrays:[],
				lineArrays:[],
				lineEntity:{},
				polygonEntity:{},
				showPointAlert:false,
			}
		},
		mounted(){
			/**
			 * 申请的Token
			 */
			Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI5NjdlNjRjYS05N2JkLTQ2NGEtOGMwMC1iNTJiODU3ODg3NjIiLCJpZCI6OTAyNCwic2NvcGVzIjpbImFzciIsImdjIl0sImlhdCI6MTU1MzIzNDA5MX0.42PHrQXl4JTZ6XU6NSDXYONI2rDKJbZBx1f8ImTZscQ';
			/**
			 * 产生一个地球实例
			 */
			var viewer = new Cesium.Viewer('cesiumContainer', {
				terrainProvider : Cesium.createWorldTerrain(),//地形
				imageryProvider : new Cesium.UrlTemplateImageryProvider({
					url:"http://mt1.google.cn/vt/lyrs=s&hl=zh-CN&x={x}&y={y}&z={z}&s=Gali",
					proxy:new Cesium.DefaultProxy('/proxy/')
				}),
				animation: false, //是否显示动画控件(左下方那个)
				baseLayerPicker: false, //是否显示图层选择控件
				geocoder: true, //是否显示地名查找控件
				timeline: false, //是否显示时间线控件
				sceneModePicker: false, //是否显示投影方式控件
				navigationHelpButton: false, //是否显示帮助信息控件
				infoBox: false, //是否显示点击要素之后显示的信息
				selectionIndicator:false,//聚焦绿框，选中一个实体时是否显示聚焦信息
				requestWaterMask: true,//显示水域
			});
			/**
			 * 载入3d地图，有地理信息生产出的数据文件
			 */
			var village = new Cesium.Cesium3DTileset({
				url: 'http://192.168.1.214/filesroot/weihai/tileset.json',
				//目前，加上下边这两个属性，可以实现随级别加载相应瓦片
				maximumScreenSpaceError: 2,//默认16,最大屏幕空间错误
				maximumMemoryUsage:1024
			});
			village.readyPromise.then(function(tileset) {
				viewer.scene.primitives.add(tileset);
				/**
				 * -2.5 代表接近垂直俯视视角
				 * tileset.boundingSphere.radius * 2.0 缩小两倍
				 * 视野会定位到模型所带的坐标位置。
				 */
				viewer.zoomTo(tileset,new Cesium.HeadingPitchRange(0.0, -2.5, tileset.boundingSphere.radius * 2.0));

			}).otherwise(function(error) {
				console.log(error);
			});


			//单击事件监听
			var handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
			var _this = this
			handler.setInputAction(function (movement) {
				var pick = viewer.scene.pick(movement.position);
				if (Cesium.defined(pick)) {
					// console.log(pick.id.data)//data里存的对象数据
					if(pick.id && pick.id.data){
						_this.showPointAlert = true
						var cartesian2Dpoint = Cesium.SceneTransforms.wgs84ToWindowCoordinates(_this.viewer.scene, pick.id.data.position)
						//屏幕坐标
						var cartesian2D = {
							x:cartesian2Dpoint.x.toFixed(0),
							y:cartesian2Dpoint.y.toFixed(0)
						}
						var alertDiv = document.getElementById("pointAlertdiv");
						var top = Number(Number(cartesian2D.y) - 30) + "px"
						console.log(top)
						var left = Number(Number(cartesian2D.x) + 30) + "px"
						console.log(left)
						alertDiv.style.top = top
						alertDiv.style.left = left
						_this.$refs.pointAlert.point = pick.id.data
					}
				}
			}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
			this.viewer = viewer
		},
		methods:{
			/**
			 * 在地图上添加点位标记
			 */
			addPoint(){
				let _this=this
				_this.drawPoint(function(positions){
					let wgs84_positions = [];
					var positions3 = []
					for(let i=0; i<positions.length; i++){
						var cartesian2 = Cesium.SceneTransforms.wgs84ToWindowCoordinates(_this.viewer.scene, positions[i])
						var cartesian22 = {
							x:cartesian2.x.toFixed(0),
							y:cartesian2.y.toFixed(0)
						}
						positions3.push(cartesian22)
						let wgs84_point = _this.Cartesian3_to_WGS84({
							x: positions[i].x,
							y: positions[i].y,
							z: positions[i].z
						});
						wgs84_positions.push(wgs84_point);
					}
					console.log(wgs84_positions);
					console.log(positions3)
				});
			},

			//画线按钮
			addLinenew(){
				let _this = this
				this.drawLineString(function(positions){
					let wgs84_positions = [];
					let arrays = [];
					var arrays3d = []
					for(let i=0; i<positions.length; i++){
						let wgs84_point = _this.Cartesian3_to_WGS84({
							x: positions[i].x,
							y: positions[i].y,
							z: positions[i].z
						});
						wgs84_positions.push(wgs84_point);
					}
					var num = 0
					wgs84_positions.forEach(e => {
						arrays.push(e.lng)
						arrays.push(e.lat)
						//画czml数据
						arrays3d.push(num)//时间标记
						arrays3d.push(e.lng)
						arrays3d.push(e.lat)
						arrays3d.push(e.alt)//海拔高度
						num+=10//事件标记累加
					})
					_this.lineArrays = arrays
					_this.viewer.entities.remove(_this.viewer.entities.getById("lineEntity"))
					_this.showLine(arrays)
					console.log(arrays3d)
				});
			},
			/**
			 * 绘制的时候是在一定高度绘制了一条线，
			 * 绘制完，把原来的线清除，根据原来线的坐标，重新绘制贴合模型的线
			 */
			showLine(arrays){
				let _this = this
				this.viewer.entities.add({
					polyline : {
						positions : Cesium.Cartesian3.fromDegreesArray(arrays),
						clampToGround : true,
						width : 5,
						material : Cesium.Color.RED
					}
				});
			},
			/**
			 * 画多边形按钮
			 * 目前，绘制多边形最好把视角调到垂直，这样偏移会小不少
			 */
			addPolygon(){
				let _this = this
				_this.drawPolygon(function(positions){
					let wgs84_positions = [];
					let arrays = []
					for(let i=0; i<positions.length; i++){
						let wgs84_point = _this.Cartesian3_to_WGS84({
							x: positions[i].x,
							y: positions[i].y,
							z: positions[i].z
						});
						wgs84_positions.push(wgs84_point);
					}
					wgs84_positions.forEach(e => {
						arrays.push(e.lng)
						arrays.push(e.lat)
					})
					console.log(wgs84_positions);
					console.log(arrays)
					_this.pointArrays = arrays
					// _this.clearHandle()//清除画出的平面网格，再从新绘制3d网格
					_this.viewer.entities.remove(_this.viewer.entities.getById("polygonEntity"))
					_this.showPolygon()
				});
			},
			//显示画好的多边形
			showPolygon(){
				var _this = this
				this.viewer.entities.add({
					polygon : {//使用经纬度坐标
						hierarchy : new Cesium.PolygonHierarchy(
							Cesium.Cartesian3.fromDegreesArray(_this.pointArrays)),
						material : Cesium.Color.RED.withAlpha(0.5),
						/**
						 * 显示网格覆盖的区域
						 * Cesium.ClassificationType.BOTH 显示3d部分和平面部分
						 * Cesium.ClassificationType.CESIUM_3D_TILE 只显示3d部分
						 * Cesium.ClassificationType.TERRAIN 只显示平面部分
						 */
						classificationType : Cesium.ClassificationType.BOTH,
					}
				});
			},
			/**
			 * 绘制水域
			 */
			addWaterPolygon(){
				let _this = this
				_this.drawPolygon(function(positions){
					let wgs84_positions = [];
					let arrays = []
					for(let i=0; i<positions.length; i++){
						let wgs84_point = _this.Cartesian3_to_WGS84({
							x: positions[i].x,
							y: positions[i].y,
							z: positions[i].z
						});
						wgs84_positions.push(wgs84_point);
					}
					wgs84_positions.forEach(e => {
						arrays.push(e.lng)
						arrays.push(e.lat)
					})
					console.log(wgs84_positions);
					console.log(arrays)
					// _this.clearHandle()//清除画出的平面网格，再从新绘制3d网格
					_this.viewer.entities.remove(_this.viewer.entities.getById("polygonEntity"))
					_this.drawWaterPolygon(positions)
				});
			},
			/**
			 * 绘制水域
			 */
			drawWaterPolygon(arrays) {
				var _this = this
				var polygon = new Cesium.PolygonGeometry({
					polygonHierarchy : new Cesium.PolygonHierarchy(arrays),
					extrudedHeight:0,
					height:0,
					vertexFormat : Cesium.EllipsoidSurfaceAppearance.VERTEX_FORMAT,
					// perPositionHeight : true//注释掉此属性水面就贴地
				});
				/**
				 * 创建一个Cesium的原始对象
				 */
				var River=new Cesium.GroundPrimitive ({
					geometryInstances : new Cesium.GeometryInstance({
						geometry :polygon
					}),
					appearance : new Cesium.EllipsoidSurfaceAppearance({
						aboveGround : true
					}),
					show : true,
					/**
					 * 显示网格覆盖的区域
					 * Cesium.ClassificationType.BOTH 显示3d部分和平面部分
					 * Cesium.ClassificationType.CESIUM_3D_TILE 只显示3d部分
					 * Cesium.ClassificationType.TERRAIN 只显示平面部分
					 */
					classificationType : Cesium.ClassificationType.BOTH,
				});
				/**
				 * 创建一个材质对象，
				 * 水材质
				 */
				var  River_Material =new Cesium.Material({
					fabric : {
						type : 'Water',
						uniforms : {
							normalMap:'./static/image/waterNormals.jpg',
							frequency: 100.0,
							animationSpeed: 0.01,
							amplitude: 10.0
						}
					}
				});
				/**
				 * 把原始对象的材质设置成我们创建的水材质
				 */
				River.appearance.material = River_Material;
				_this.viewer.scene.groundPrimitives .add(River);
			},

			//画点
			drawPoint(callback){
				var _this = this;
				//坐标存储
				var positions = [];
				var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);

				//单击鼠标左键画点
				var pinBuilder = new Cesium.PinBuilder();
				handler.setInputAction(function (movement) {
					console.log(movement.position)
					//获取点位的三维坐标（x，y，z）
					let ray=_this.viewer.camera.getPickRay(movement.position),
					 	cartesian=_this.viewer.scene.globe.pick(ray,_this.viewer.scene),
					 	cartographic=Cesium.Cartographic.fromCartesian(cartesian),
					 	lng=Cesium.Math.toDegrees(cartographic.longitude),//经度值
					 	lat=Cesium.Math.toDegrees(cartographic.latitude),//纬度值
					 	mapPosition={x:lng,y:lat,z:cartographic.height},//cartographic.height的值为地形高度。
						//把三维坐标转成笛卡尔坐标，供添加实体时使用
					 	newposition = Cesium.Cartesian3.fromDegrees(mapPosition.x,mapPosition.y,mapPosition.z);

					var cartesianold = _this.viewer.scene.camera.pickEllipsoid(movement.position, _this.viewer.scene.globe.ellipsoid);
					positions.push(cartesianold);
					//把newposition传给实体使用
					var num = Math.random(100);
					_this.viewer.entities.add({
						id:"point"+num,
						name: 'Blank blue pin',
						position: newposition,
						billboard: {
							image: pinBuilder.fromText('冒泡', Cesium.Color.ROYALBLUE, 48).toDataURL(),
							// image: pinBuilder.fromColor(Cesium.Color.ROYALBLUE, 48).toDataURL(),
							verticalOrigin: Cesium.VerticalOrigin.BOTTOM
						},
						data:{
							id:123,
							name:"xxx细雨",
							position: cartesian
						}
					});
				}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

				//单击鼠标右键结束画点
				handler.setInputAction(function (movement) {
					handler.destroy();
					callback(positions);
				}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
			},
			//画线
			drawLineString(callback){
				var _this = this;
				var PolyLinePrimitive = (function () {
					function _(positions) {
						this.options = {
							id:"lineEntity",
							polyline: {
								positions: [],
								material: Cesium.Color.RED,
								width:3,
								clampToGround : true,
							}
						};
						this.positions = positions;
						this._init();
					}

					_.prototype._init = function () {
						var _self = this;
						var _update = function () {
							return _self.positions;
						};
						//实时更新polyline.positions
						this.options.polyline.positions = new Cesium.CallbackProperty(_update, false);
						_this.viewer.entities.add(this.options);
					};
					return _;
				})();

				var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
				var positions = [];
				var poly = undefined;
				//鼠标左键单击画点
				handler.setInputAction(function (movement) {

					let ray=_this.viewer.camera.getPickRay(movement.position),
						cartesians=_this.viewer.scene.globe.pick(ray,_this.viewer.scene),
						cartographic=Cesium.Cartographic.fromCartesian(cartesians),
						lng=Cesium.Math.toDegrees(cartographic.longitude),//经度值
						lat=Cesium.Math.toDegrees(cartographic.latitude),//纬度值
						mapPosition={x:lng,y:lat,z:cartographic.height},//cartographic.height的值为地形高度。
						//把三维坐标转成笛卡尔坐标，供添加实体时使用
						newposition = Cesium.Cartesian3.fromDegrees(mapPosition.x,mapPosition.y,mapPosition.z);

					// var cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.position, _this.viewer.scene.globe.ellipsoid);
					var cartesian = newposition
					if (positions.length == 0) {
						positions.push(cartesian.clone());
					}
					positions.push(cartesian);
				}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
				//鼠标移动
				handler.setInputAction(function (movement) {

					let ray=_this.viewer.camera.getPickRay(movement.endPosition),
						cartesians=_this.viewer.scene.globe.pick(ray,_this.viewer.scene),
						cartographic=Cesium.Cartographic.fromCartesian(cartesians),
						lng=Cesium.Math.toDegrees(cartographic.longitude),//经度值
						lat=Cesium.Math.toDegrees(cartographic.latitude),//纬度值
						mapPosition={x:lng,y:lat,z:cartographic.height},//cartographic.height的值为地形高度。
						//把三维坐标转成笛卡尔坐标，供添加实体时使用
						newposition = Cesium.Cartesian3.fromDegrees(mapPosition.x,mapPosition.y,mapPosition.z);

					// var cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.endPosition, _this.viewer.scene.globe.ellipsoid);
					var cartesian = newposition
					if (positions.length >= 2) {
						if (!Cesium.defined(poly)) {
							poly = new PolyLinePrimitive(positions);
						} else {
							if(cartesian != undefined){
								positions.pop();
								cartesian.y += (1 + Math.random());
								positions.push(cartesian);
							}
						}
					}
				}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
				//单击鼠标右键结束画线
				handler.setInputAction(function (movement) {
					handler.destroy();
					callback(positions);
				}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
			},
			//画面
			drawPolygon(callback){
				var _this = this;
				var PolygonPrimitive = (function () {
					function _(positions) {
						this.options = {
							id:"polygonEntity",
							name: '多边形',
							polygon: {
								hierarchy: [],
								perPositionHeight: true,
								//.withAlpha(0.5),目前加上透明度报错了，
								material: Cesium.Color.RED,
							},
						};
						this.hierarchy = positions;
						this._init();
					}

					_.prototype._init = function () {
						var _self = this;
						var _update = function () {
							return _self.hierarchy;
						};
						//实时更新polygon.hierarchy
						this.options.polygon.hierarchy = new Cesium.CallbackProperty(_update, false);
						_this.viewer.entities.add(this.options);
					};
					return _;
				})();

				var handler = new Cesium.ScreenSpaceEventHandler(_this.viewer.scene.canvas);
				var positions = [];
				var poly = undefined;

				//鼠标单击画点
				handler.setInputAction(function (movement) {

					let ray=_this.viewer.camera.getPickRay(movement.position),
						cartesians=_this.viewer.scene.globe.pick(ray,_this.viewer.scene),
						cartographic=Cesium.Cartographic.fromCartesian(cartesians),
						lng=Cesium.Math.toDegrees(cartographic.longitude),//经度值
						lat=Cesium.Math.toDegrees(cartographic.latitude),//纬度值
						mapPosition={x:lng,y:lat,z:cartographic.height},//cartographic.height的值为地形高度。
						//把三维坐标转成笛卡尔坐标，供添加实体时使用
						newposition = Cesium.Cartesian3.fromDegrees(mapPosition.x,mapPosition.y,mapPosition.z);

					// var cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.position, _this.viewer.scene.globe.ellipsoid);
					var cartesian = newposition
					if (positions.length == 0) {
						positions.push(cartesian.clone());
					}
					positions.push(cartesian);
				}, Cesium.ScreenSpaceEventType.LEFT_CLICK);
				//鼠标移动
				handler.setInputAction(function (movement) {

					let ray=_this.viewer.camera.getPickRay(movement.endPosition),
						cartesians=_this.viewer.scene.globe.pick(ray,_this.viewer.scene),
						cartographic=Cesium.Cartographic.fromCartesian(cartesians),
						lng=Cesium.Math.toDegrees(cartographic.longitude),//经度值
						lat=Cesium.Math.toDegrees(cartographic.latitude),//纬度值
						mapPosition={x:lng,y:lat,z:cartographic.height},//cartographic.height的值为地形高度。
						//把三维坐标转成笛卡尔坐标，供添加实体时使用
						newposition = Cesium.Cartesian3.fromDegrees(mapPosition.x,mapPosition.y,mapPosition.z);

					// var cartesian = _this.viewer.scene.camera.pickEllipsoid(movement.endPosition, _this.viewer.scene.globe.ellipsoid);
					var cartesian = newposition
					if (positions.length >= 2) {
						if (!Cesium.defined(poly)) {
							poly = new PolygonPrimitive(positions);
						} else {
							if(cartesian != undefined){
								positions.pop();
								cartesian.y += (1 + Math.random());
								positions.push(cartesian);
							}
						}
					}
				}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);
				//鼠标右键单击结束绘制
				handler.setInputAction(function (movement) {
					handler.destroy();
					callback(positions);
				}, Cesium.ScreenSpaceEventType.RIGHT_CLICK);
			},
			//画矩形
			drawRect(callback){
				let _self = this;
				let pointsArr = [];
				_self.shape= {
					points:[],
					rect:null,
					entity:null
				};
				var tempPosition;
				var handle = new Cesium.ScreenSpaceEventHandler(_self.viewer.scene.canvas);
				//鼠标左键单击画点
				handle.setInputAction(function(click){
					tempPosition = _self.getPointFromWindowPoint(click.position);
					//选择的点在球面上
					if(tempPosition){
						if(_self.shape.points.length==0) {
							pointsArr.push(tempPosition);
							_self.shape.points.push(_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(tempPosition));
							_self.shape.rect=Cesium.Rectangle.fromCartographicArray(_self.shape.points);
							_self.shape.rect.east+=0.000001;
							_self.shape.rect.north+=0.000001;
							_self.shape.entity= _self.viewer.entities.add({
								rectangle : {
									coordinates :_self.shape.rect,
									material : Cesium.Color.BLACK.withAlpha(0.4),
									outline : true,
									outlineWidth: 2,
									outlineColor : Cesium.Color.RED,
									height:0
								}
							});
							_self.bufferEntity = _self.shape.entity;
						}
						else{
							handle.removeInputAction(Cesium.ScreenSpaceEventType.MOUSE_MOVE);
							handle.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
							callback(pointsArr);
						}
					}
				},Cesium.ScreenSpaceEventType.LEFT_CLICK);
				//鼠标移动
				handle.setInputAction(function(movement){
					if(_self.shape.points.length==0){
						return;
					}
					var moveEndPosition = _self.getPointFromWindowPoint(movement.endPosition);
					//选择的点在球面上
					if(moveEndPosition){
						pointsArr[1] = moveEndPosition;
						_self.shape.points[1]=_self.viewer.scene.globe.ellipsoid.cartesianToCartographic(moveEndPosition);
						_self.shape.rect= Cesium.Rectangle.fromCartographicArray(_self.shape.points);
						if(_self.shape.rect.west==_self.shape.rect.east)
							_self.shape.rect.east+=0.000001;
						if(_self.shape.rect.south==_self.shape.rect.north)
							_self.shape.rect.north+=0.000001;
						_self.shape.entity.rectangle.coordinates = _self.shape.rect;
					}
				},Cesium.ScreenSpaceEventType.MOUSE_MOVE);
			},
			//清除所有Entity和ImageryLayers
			clearHandle() {
				//移除所有实体Entity
				this.viewer.entities.removeAll();//清除点、线、面
			},
			clearWaterHandle() {
				//水域使用的groundPrimitives，如果以后有其他模块页使用到这个对象，清除时会出现问题
				this.viewer.scene.groundPrimitives.removeAll()
			},
			getPointFromWindowPoint(point){
				if(this.viewer.scene.terrainProvider.constructor.name=="EllipsoidTerrainProvider") {
					return this.viewer.camera.pickEllipsoid(point,this.viewer.scene.globe.ellipsoid);
				} else {
					var ray=this.viewer.scene.camera.getPickRay(point);
					return this.viewer.scene.globe.pick(ray,this.viewer.scene);
				}
			},
			//笛卡尔坐标系转WGS84坐标系
			Cartesian3_to_WGS84(point) {
				var cartesian33 = new Cesium.Cartesian3(point.x, point.y, point.z);
				var cartographic = Cesium.Cartographic.fromCartesian(cartesian33);
				var lat = Cesium.Math.toDegrees(cartographic.latitude);
				var lng = Cesium.Math.toDegrees(cartographic.longitude);
				var alt = cartographic.height;
				return {lat: lat, lng: lng, alt: alt};
			},
			//WGS84坐标系转笛卡尔坐标系
			WGS84_to_Cartesian3(point) {
				var car33 = Cesium.Cartesian3.fromDegrees(point.lng, point.lat, point.alt);
				var x = car33.x;
				var y = car33.y;
				var z = car33.z;
				return {x: x, y: y, z: z};
			}
		},
	}
</script>
<style>
	.pointAlert{
		position: absolute;
		width: 260px;
		height: 200px;
		background-color: aliceblue;
		border-radius: 5px;
	}
</style>
<style scoped>
	.addpoint {
		position: absolute;
		top: 150px;
		right: 50px;
	}
	.addline {
		position: absolute;
		top: 190px;
		right: 50px;
	}
	.addPolygon {
		position: absolute;
		top: 230px;
		right: 50px;
	}
	.addWaterPolygon {
		position: absolute;
		top: 270px;
		right: 50px;
	}
	.clearHandle{
		position: absolute;
		top: 310px;
		right: 50px;
	}
</style>
