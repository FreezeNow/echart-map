<template>
  <div>
    <button v-if="checkArea.code !== baseArea.code" @click="backParent">返回上级</button>
    <div id="map" ref="map" style="width: 100%;height: 800px"></div>
  </div>
</template>

<script>
import * as echarts from 'echarts';
export default {
  name: '',
  components: {},
  data() {
    return {
      mapData: {},
      geoJson: {},
      cityName: '中国',
      echartsMap: undefined,
      option: {},
      checkArea: {
        code: 100000,
        name: '中国',
        center: undefined,
      },
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
    this.echartsMap = echarts.init(this.$refs.map);
    this.echartsMap.on('click', this.mapClick);
    this.loadMapData(this.baseArea.code);
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
        const mapJson = mapJsonStr ? JSON.parse(JSON.stringify(mapJsonStr)) : {};
        if (mapJson.features && mapJson.features.length) {
          for (let i = 0; i < mapJson.features.length; i++) {
            const element = mapJson.features[i];
            const { properties } = element;
            this.mapData[properties.adcode] = {
              name: properties.name,
              code: properties.adcode,
              center: properties.center,
            };
          }
        }
        if (areaCode === this.baseArea.code) {
          this.baseGeoJson = mapJson;
        }
        const baseGeoJson = JSON.parse(
          JSON.stringify(type ? (type === 'enter' ? this.geoJson : this.baseGeoJson) : this.baseGeoJson)
        );
        if (areaCode !== this.baseArea.code) {
          baseGeoJson.features.push(...mapJson.features);
          const index = baseGeoJson.features.findIndex((element) => element.properties.adcode === areaCode);
          if (index > -1) {
            baseGeoJson.features.splice(index, 1);
          }
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
        echarts.registerMap(mapName, data);
        this.option = {
          geo: {
            show: true,
            map: this.cityName,
            roam: true,
            center: this.checkArea && this.checkArea.center ? this.checkArea.center : undefined,
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
          },
          series: [
            {
              name: '数据名称',
              type: 'map',
              map: this.cityName,
              geoIndex: 0,
              data: Object.values(this.mapData),
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
        setTimeout(() => {
          // 点击附近的区块时，先移除选中区块的子集，再将其本身添加回来
          let mapJsonStr;
          const areaCode = this.checkArea.code;
          const dataCode = data.code;

          let continueCode;
          if (areaCode === 100000 || (areaCode.toString().endsWith('0000') && !dataCode.toString().endsWith('0000'))) {
          } else if (
            (!areaCode.toString().endsWith('0000') && !dataCode.toString().endsWith('0000')) ||
            areaCode.toString().substr(0, 2) === dataCode.toString().substr(0, 2)
          ) {
            mapJsonStr = require(`@/assets/map/${areaCode
              .toString()
              .substr(0, 2)
              .padEnd(6, '0000')}.geoJson`);

            continueCode = dataCode.toString().substr(0, 4);
          } else {
            mapJsonStr = require(`@/assets/map/100000.geoJson`);
            continueCode = dataCode.toString().substr(0, 2);
          }
          if (continueCode) {
            const zeros = ''.padEnd(6 - continueCode.length, '0');
            for (let i = 0; i < this.geoJson?.features?.length; i++) {
              const element = this.geoJson?.features[i];
              const { properties } = element;
              const code = properties.adcode.toString();
              if (code.endsWith(zeros) || code.startsWith(continueCode)) {
                continue;
              }
              this.geoJson?.features.splice(i, 1);
              i--;
            }
          }
          if (mapJsonStr) {
            const mapJson = JSON.parse(JSON.stringify(mapJsonStr));
            const map = mapJson.features.find(
              (element) =>
                element.properties.adcode.toString() ===
                areaCode
                  .toString()
                  .substr(0, continueCode.length)
                  .padEnd(6, '0')
            );
            if (map) {
              this.geoJson.features.push(map);
            }
          }
          // 添加结束

          this.checkArea = data;
          this.loadMapData(data.code, 'enter');
        }, this.animationTime);
      }
    },
    backParent() {
      const { code } = this.checkArea;
      if (code) {
        const areaCode = code.toString();
        this.option.geo.zoom = 0.5;
        setTimeout(() => {
          this.mapData = {};
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
          }
        }, this.animationTime);
      }
    },
    listenerZoom() {},
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
