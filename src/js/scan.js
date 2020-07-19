/*
 * @Author: zhangbo
 * @Date: 2020-07-16 11:27:44
 * @E-mail: zhangbo@geovis.com.cn
 * @LastModifiedBy: zhangbo
 * @LastEditTime: 2020-07-16 13:43:29
 * @Desc: 
 */ 

class GVScan{
  constructor(viewer,option){
    this.object=new GV.SatelliteScan(viewer,{
      position:option.position,
      tracked:option.tracked||false,
      color:option.color||Cesium.Color.RED,
      inverse:option.inverse||false,
      radius:option.radius,
      path:option.path,
    })
  }
  remove(){
    this.object.remove();
  }
  zoomTo(){
    this.object.zoomTo();
  }
}

export default GVScan;