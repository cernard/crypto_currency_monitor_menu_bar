import * as echarts from 'echarts';

const option = {
  grid: {
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    axisLabel: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: false,
    },
  },
  yAxis: {
    type: 'value',
    axisLabel: {
      show: false,
    },
    axisLine: {
      show: false,
    },
    axisTick: {
      show: false,
    },
    splitLine: {
      show: false,
    },
    scale: true,
  },
  series: [
    {
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line',
      itemStyle: {
        opacity: 0,
      },
      lineStyle: {
        color: 'rgba(238, 205, 73, 100)',
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          {
            offset: 0,
            color: 'rgb(235, 208, 100)', // 0% 处的颜色
          },
          // {
          //   offset: 0.5,
          //   color: 'rgba(238, 205, 73, 0.5)', // 0% 处的颜色
          // },
          {
            offset: 0.8,
            color: 'rgb(255, 255, 255)', // 100% 处的颜色
          },
        ]),
      },
    },
  ],
  tooltip: {
    show: true,
    formatter: (param: any) => {
      return '123 $';
    },
    padding: 0,
    backgroundColor: 'transparent',
    borderWidth: 0,
    textStyle: {
      color: 'rgba(238, 205, 73, 100)',
      fontSize: 12,
    },
    extraCssText: 'box-shadow: 0 0 0px rgba(0, 0, 0, 0);',
    position: ([x, y]: number[]) => {
      return [x + 10, y + 10];
    },
  },
};

export default option;
