/*
 * @Author: zhangbo
 * @Date: 2020-07-17 14:19:18
 * @E-mail: zhangbo@geovis.com.cn
 * @LastModifiedBy: zhangbo
 * @LastEditTime: 2020-07-17 14:35:59
 * @Desc: 
 */ 
export default class GVFlight{
  constructor(viewer,options={}){
    this._viewer=viewer;
    this._options=options;
  }
  createPath(){
    const viewer=this._viewer;
    const position=this._options.position;
    this._entity=viewer.entities.add({
      position : position,

      //Automatically compute orientation based on position movement.
      orientation : new Cesium.VelocityOrientationProperty(position),
  
      //Load the Cesium plane model to represent the entity
      model : {
          uri : './Cesium_Air.glb',
          minimumPixelSize : 64
      },
  
      //Show the path as a pink line sampled in 1 second increments.
      path : {
          resolution : 1,
          material : new Cesium.PolylineGlowMaterialProperty({
              glowPower : 0.1,
              color : Cesium.Color.YELLOW
          }),
          width : 10
      }
    })
  }
  zoomTo(){
    this._viewer.flyTo(this._entity);
  }
}