import { CesiumBar } from "gv-cesium-plugins/dist/extension.umd";

/*
 * @Author: zhangbo
 * @Date: 2020-07-16 14:17:11
 * @E-mail: zhangbo@geovis.com.cn
 * @LastModifiedBy: zhangbo
 * @LastEditTime: 2020-07-16 16:57:58
 * @Desc: 
 */
const fs =
  `
#ifdef GL_OES_standard_derivatives
#extension GL_OES_standard_derivatives : enable
#endif

uniform vec4 color;
uniform float time;

varying float v_width;

float getPointOnLine(vec2 p0, vec2 p1, float x)
{
    float slope = (p0.y - p1.y) / (p0.x - p1.x);
    return slope * (x - p0.x) + p0.y;
}

czm_material czm_getMaterial(czm_materialInput materialInput)
{
    czm_material material = czm_getDefaultMaterial(materialInput);

    vec2 st = materialInput.st;

    float wap = 0.15;//abs(fwidth(st.s)) * 10.0 * czm_pixelRatio;
#ifdef GL_OES_standard_derivatives
    
    float rest = time * wap;
    float base = time;
#else
    float base = 0.975; // 2.5% of the line will be the arrow head
#endif

    vec2 center = vec2(base+wap, 0.5);
    float ptOnUpperLine = getPointOnLine(vec2(base, 1.0), center, st.s);
    float ptOnLowerLine = getPointOnLine(vec2(base, 0.0), center, st.s);

    float halfWidth = 0.15;
    float s = step(0.5 - halfWidth, st.t);
    s *= 1.0 - step(0.5 + halfWidth, st.t);
    s *= 1.0 - step(base, st.s);

    float t = step(base, materialInput.st.s);
    t *= 1.0 - step(ptOnUpperLine, st.t);
    t *= step(ptOnLowerLine, st.t);

    // Find the distance from the closest separator (region between two colors)
    float dist;
    if (st.s < base)
    {
        float d1 = abs(st.t - (0.5 - halfWidth));
        float d2 = abs(st.t - (0.5 + halfWidth));
        dist = min(d1, d2);
    }
    else if(st.s>base+wap){
        float d1 = abs(st.t - (0.5 - halfWidth));
        float d2 = abs(st.t - (0.5 + halfWidth));
        dist = min(d1, d2);
    }
    else
    {
        float d1 = czm_infinity;
        if (st.t < 0.5 - halfWidth && st.t > 0.5 + halfWidth)
        {
            d1 = abs(st.s - base);
        }
        float d2 = abs(st.t - ptOnUpperLine);
        float d3 = abs(st.t - ptOnLowerLine);
        dist = min(min(d1, d2), d3);
    }
    
    vec4 outsideColor = vec4(0.0);
    vec4 currentColor = mix(outsideColor, color, clamp(t, 0.0, 1.0));
    vec4 outColor = czm_antialias(outsideColor, color, currentColor, dist);

    outColor = czm_gammaCorrect(outColor);
    material.diffuse = outColor.rgb;
    material.alpha = outColor.a;
    return material;
}
`
export default class FlowArrowMaterial {
  constructor(option = {}) {
    this._color = option.color || CesiumBar.Color.RED;
    this._duration = option.duration || 10.0;
    this._definitionChanged = new Cesium.Event();
    this._time = 0;

    this._definitionChanged = new Cesium.Event();
  }
  get isConstant() {
    return false;
  }
  get definitionChanged() {
    return this._definitionChanged;
  }
  get duration() {
    return this._duration;
  }

  get color() {
    return this._color;
  }
  set color(value) {
    const oldValue = this.color;
    this._color = value;
    if (oldValue !== value && this.definitionChanged) {
      this.definitionChanged.raiseEvent(this, 'color', value, oldValue);
    }
  }
  getType() {
    return 'FlowArrowMaterial';
  }
  getValue(time, result) {
    if (!Cesium.defined(result)) {
      result = {};
    }
    this._time += 0.001;
    if (this._time > 1.0) {
      this._time = 0.0;
    }
    result.color = this.color || Cesium.Color.WHITE;
    result.time = this._time;
    return result;
  }
  equals(other) {
    return (this === other || (other instanceof FlowArrowMaterial &&
      Cesium.Property.equals(this.color, other.color)))
  }
}

Cesium.Material.FlowArrowMaterialType = 'FlowArrowMaterial';
Cesium.Material._materialCache.addMaterial(Cesium.Material.FlowArrowMaterialType, {
  fabric: {
    type: Cesium.Material.FlowArrowMaterialType,
    uniforms: {
      color: new Cesium.Color(1, 0, 0, 1),
      time: 0

    },
    source: fs
  },

  translucent: function () {
    return true
  }
})