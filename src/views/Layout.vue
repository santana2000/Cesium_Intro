<template>
 <div id="panel">
   <input type="text" placeholder="输入名称" v-model="addnew"> <button>添加</button>
    <div class="panelz" id="left">

    </div>

    <button id="toR">增加</button>
    <button id="toL">删除</button>

    <div class="panelz" id="right">
      
    </div>

 </div>
</template>

<script>
export default {
  name:"layout",
  data () {
    return {
        addnew:'',
        leftArr:[],
        rightArr:[],
        

    }
  },
  methods:{
    getArr1(){

    },
    getArr2(){

    },
    //无论增加还是减少，都需要渲染一遍列表
    updateList(){

    },

    
    
    
  }
}
</script>

<style  scoped>
.panel{

  margin: auto;
  width: 60%;
  height: 300px;
  background-color: white;
  border: dimgray solid 1px;


}
.panelz{
  width: 300px;
  height: 300px;
  background-color: darkgrey;
  border: dimgray solid 1px;
  display: inline-block;
}
button{
  display: inline-block;
}
</style>>

</style>