<template>
  <div>
    <button v-if="checkArea.code !== baseArea.code" @click="backParent">返回上级</button>
    <div id="map" style="width: 1450px;height: 800px"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
export default {
  name: '',
  components: {},
  data() {
    return {
      mapData: [],
      geoJson: {},
      cityName: '中国',
      echartsMap: undefined,
      option: {},
      checkArea: {
        code: 100000,
        name: '中国',
        center: undefined,
      },
      baseMapData: [],
      baseGeoJson: {},
      baseArea: {
        code: 100000,
        name: '中国',
        center: undefined,
      },
      animationTime: 400,
    };
  },
  mounted() {
    this.cityName = '中国';
    this.echartsMap = echarts.init(document.getElementById('map'));
    // this.echartsMap.on('georoam', this.listenerZoom);
    this.echartsMap.on('click', this.mapClick);
    this.loadMapData(this.baseArea.code);
    // window.requestAnimationFrame
    // setTimeout(() => {

    // }, 16);
    // setTimeout(() => {
    //   this.mapClick({
    //     data: {
    //       name: '杭州市',
    //       code: 330100,
    //       center: [120.153576, 30.287459],
    //     },
    //   });
    // }, 5000);
    // setTimeout(() => {
    //   this.mapClick({
    //     data: {
    //       name: '昆明市',
    //       code: 530100,
    //       center: [102.712251, 25.040609],
    //     },
    //   });
    // }, 10);
  },

  methods: {
    loadMapData(areaCode, type) {
      //创建一个实例
      let mapJsonStr;
      if (areaCode.toString().endsWith('0000')) {
        mapJsonStr = require(`@/assets/map/${areaCode}.geoJson`);
      } else if (areaCode.toString().endsWith('00')) {
        mapJsonStr = require(`@/assets/map/${areaCode
          .toString()
          .substr(0, 2)
          .padEnd(6, '0000')}/${areaCode}.geoJson`);
      }
      if (mapJsonStr) {
        // if (area) {

        // }
        // const mapJsonStr = require(`@/assets/map/${areaCode}.geoJson`);
        const mapJson = mapJsonStr ? JSON.parse(JSON.stringify(mapJsonStr)) : {};
        if (mapJson.features && mapJson.features.length) {
          // console.log();
          const list = [];
          for (let i = 0; i < mapJson.features.length; i++) {
            const element = mapJson.features[i];
            const { properties } = element;
            list.push({
              name: properties.name,
              code: properties.adcode,
              center: properties.center,
            });
          }
          this.mapData = list;
        }
        if (areaCode === this.baseArea.code) {
          this.baseMapData = this.mapData;
          this.baseGeoJson = mapJson;
        }
        // const baseMapData = JSON.parse(JSON.stringify(this.baseMapData));
        const baseGeoJson = JSON.parse(
          JSON.stringify(type ? (type === 'enter' ? this.geoJson : this.baseGeoJson) : this.baseGeoJson)
        );
        if (areaCode !== this.baseArea.code) {
          baseGeoJson.features.push(...mapJson.features);
          console.log('areaCode', areaCode);
          const index = baseGeoJson.features.findIndex((element) => element.properties.adcode === areaCode);
          console.log('index', index);
          if (index > -1) {
            baseGeoJson.features.splice(index, 1);
          }
          //  if (map) {
          //   //  map.
          //  }
        }
        if (this.checkArea && this.checkArea.name) {
          this.cityName = this.checkArea.name;
        }
        this.geoJson = baseGeoJson;
        this.loadMap(this.cityName, baseGeoJson);
      }
    },
    loadMap(mapName, data) {
      if (data) {
        const zoom =
          this.checkArea.code === this.baseArea.code ? 1 : this.checkArea.code.toString().endsWith('0000') ? 10 : 40;
        const scaleLimitMap = {
          1: {
            min: 1,
            max: 10,
          },
          10: {
            min: 10,
            max: 40,
          },
          40: {
            min: 40,
            max: 1000,
          },
        };
        console.log('mapName', mapName);
        echarts.registerMap(mapName, data);
        this.option = {
          geo: {
            show: true,
            map: this.cityName,
            roam: true,
            center: this.checkArea && this.checkArea.center ? this.checkArea.center : undefined,
            label: {
              show: true,
            },
            scaleLimit: scaleLimitMap[zoom],
            selectedMode: false,
            showLegendSymbol: false,
            zoom,
            label: {
              show: true,
              color: 'inherit',
            },
            itemStyle: {
              color: '#123',
              areaColor: '#0051ad',
              borderColor: '#fff',
              borderWidth: 0.5,
            },
            blur: {},
            // data: this.mapData,
          },
          series: [
            {
              name: '数据名称',
              type: 'map',
              geoIndex: 0,
              data: this.mapData,
            },

            {
              type: 'scatter',
              name: 'test',
              coordinateSystem: 'geo',
              data: [[120.153576, 30.287459, 10]],
            },
          ],
        };
        this.echartsMap.setOption(this.option);
      }
    },
    mapClick(params) {
      const { data } = params;
      if (data && data.code.toString().endsWith('00')) {
        this.option.geo.zoom = 10;
        this.option.geo.center = data.center;
        // this.echartsMap.setOption(this.option);
        setTimeout(() => {
          this.checkArea = data;
          this.loadMapData(data.code, 'enter');
        }, this.animationTime);
      }
      console.log(params);
    },
    backParent() {
      const { code } = this.checkArea;
      if (code) {
        const areaCode = code.toString();
        this.option.geo.zoom = 0.5;
        // this.echartsMap.setOption(this.option);
        setTimeout(() => {
          if (areaCode.endsWith('0000')) {
            this.checkArea = {
              code: this.baseArea.code,
            };
            this.loadMapData(this.baseArea.code, 'leave');
          } else if (areaCode.endsWith('00')) {
            const data = {
              code: Number(areaCode.substr(0, 2).padEnd(6, '0')),
              center: this.checkArea.center,
            };
            this.checkArea = data;
            this.loadMapData(data.code, 'leave');
          } else {
            const data = {
              code: Number(areaCode.substr(0, 4).padEnd(6, '0')),
              center: this.checkArea.center,
            };
            this.checkArea = data;
            this.loadMapData(data.code, 'leave');
            // this.mapClick({
            //   data: {
            //     code: Number(areaCode.substr(0, 4).padEnd(6, '0')),
            //   },
            // });
          }
        }, this.animationTime);
      }
    },
    listenerZoom(params) {
      console.log(params);
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
#map {
  background-color: rgb(0, 174, 255);
}
</style>
