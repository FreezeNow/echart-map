<template>
  <div style="margin-top: 20px">
    <button v-if="checkArea.code !== baseArea.code" @click="backParent">返回上级</button>
    <div id="map1" style="width: 100%;height: 800px"></div>
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
    this.echartsMap = echarts.init(document.getElementById('map1'));
    this.echartsMap.on('click', this.mapClick);
    this.loadMapData(this.baseArea.code);
  },

  methods: {
    loadMapData(areaCode) {
      //创建一个实例
      let mapJsonStr;
      if (areaCode.toString().endsWith('0000')) {
        mapJsonStr = require(`@/assets/map/${areaCode}.geoJson`);
      } else {
        const province = areaCode
          .toString()
          .substr(0, 2)
          .padEnd(6, '0000');
        const city = areaCode
          .toString()
          .substr(0, 4)
          .padEnd(6, '0');
        mapJsonStr = require(`@/assets/map/${province}/${city}.geoJson`);
      }
      if (mapJsonStr) {
        const mapJson = mapJsonStr ? JSON.parse(JSON.stringify(mapJsonStr)) : {};
        if (mapJson.features && mapJson.features.length) {
          if (!areaCode.toString().endsWith('00')) {
            const city = mapJson.features.find((element) => element.properties.adcode === areaCode);
            mapJson.features = [city];
          }
          const list = [];
          for (let i = 0; i < mapJson.features.length; i++) {
            const element = mapJson.features[i];
            const { properties } = element;
            list.push({
              name: properties.name,
              code: properties.adcode,
              center: properties.center,
              acroutes: properties.acroutes,
            });
          }

          this.mapData = list;
        }
        if (areaCode === this.baseArea.code) {
          this.baseMapData = this.mapData;
          this.baseGeoJson = mapJson;
        }
        if (this.checkArea && this.checkArea.name) {
          this.cityName = this.checkArea.name;
        }

        this.loadMap(this.cityName, mapJson);
      }
    },
    loadMap(mapName, data) {
      if (data) {
        echarts.registerMap(mapName, data);
        this.option = {
          geo: {
            show: true,
            map: this.cityName,
            roam: true,
            center: this.checkArea && this.checkArea.center ? this.checkArea.center : undefined,
            selectedMode: false,
            label: {
              show: true,
            },
            scaleLimit: {
              min: 1,
              max: 10,
            },
            showLegendSymbol: false,
            zoom: 1,
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
            blur: {
              label: {
                show: true,
                color: 'inherit',
              },
            },
            emphasis: {
              label: {
                show: true,
                color: 'inherit',
              },
            },

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
      if (data && data.code) {
        this.option.geo.zoom = 10;
        this.option.geo.center = data.center;
        // this.echartsMap.setOption(this.option);
        setTimeout(() => {
          this.checkArea = data;
          this.loadMapData(data.code);
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
            this.checkArea = undefined;
            this.loadMapData(this.baseArea.code);
          } else if (areaCode.endsWith('00')) {
            const data = {
              code: Number(areaCode.substr(0, 2).padEnd(6, '0')),
            };
            this.checkArea = data;
            this.loadMapData(data.code);
          } else {
            const data = {
              code: Number(areaCode.substr(0, 4).padEnd(6, '0')),
            };
            this.checkArea = data;
            this.loadMapData(data.code);
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
#map1 {
  background-color: rgb(0, 174, 255);
}
</style>
