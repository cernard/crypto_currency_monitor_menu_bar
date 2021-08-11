import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from 'react-router-dom';
import { nativeImage, remote } from 'electron';
import './App.global.css';
import { Stage, Layer, Image as KonvaImage, Text } from 'react-konva';
import React, { useMemo, useRef, useState } from 'react';
import useImage from 'use-image';
import path from 'path';
import MonitorList from './components/MonitorList';
import MonitorSetting from './components/MonitorSetting';
import monitorSVG from '../assets/icons/monitor.svg';
import exchangeSVG from '../assets/icons/exchange.svg';
import MonitorCurrencyDTO from './entities/MonitorCurrencyDTO';

const fs = require('fs');
const shortNumber = require('short-number');

const RESOURCES_PATH = remote.app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};


export default function App() {
  const [simpleCurrencyInfo, setSimpleCurrencyInfo] = useState<
    MonitorCurrencyDTO
  >({
    base: 'None',
    quote: 'None',
    price: 12,
    icon: 'icon.png',
    trend: 'up',
  });

  /*   const { data, loading, run, cancel } = useRequest(
    new Promise((resolve, reject) => {
      fetch('http://yapi.smart-xwork.cn/mock/83109/sce')
        .then((rep) => rep.json())
        .then((_data) => {
          if (_data) {
            setSimpleCurrencyInfo({
              ...simpleCurrencyInfo,
              base: _data.base,
              quote: _data.quote,
              price: _data.price,
              trend: _data.trend,
              icon: _data.icon,
            });
          }
          return resolve(_data);
        })
        .catch((err) => reject(err));
    }),
    {
      pollingInterval: 30000,
      pollingWhenHidden: false,
      throwOnError: true,
      manual: true,
    }
  ); */

  /**
   * 动态生成Menubar icon
   */
  const stageRef = useRef<any>(null);
  if (stageRef.current) {
    const canvasX1 = stageRef.current.toDataURL({
      pixelRatio: 1,
    });
    const canvasX2 = stageRef.current.toDataURL({
      pixelRatio: 2,
    });
    const b64X1 = canvasX1.split(',')[1];
    const b64X2 = canvasX2.split(',')[1];

    if (!fs.existsSync(getAssetPath('/tmp'))) {
      fs.mkdirSync(getAssetPath('/tmp'));
    }

    // 保存文件
    fs.writeFileSync(
      getAssetPath(`/tmp/canvas@1x.png`),
      Buffer.from(b64X1, 'base64')
    );
    fs.writeFileSync(
      getAssetPath(`/tmp/canvas@2x.png`),
      Buffer.from(b64X2, 'base64')
    );

    const mb: any = remote.getGlobal('mb');
    let image = nativeImage.createFromPath(getAssetPath(`/tmp/canvas.png`));
    image = image.resize({
      width: 104,
      height: 24,
    });

    mb.tray.setImage(image);
  }

  const [image] = useImage(
    getAssetPath(simpleCurrencyInfo.icon ? simpleCurrencyInfo.icon : 'icon.png')
  );

  const trendColor = useMemo(() => {
    switch (simpleCurrencyInfo.trend) {
      case 'up':
        return '#29D18F';
      case 'down':
        return '#FF7979';
      default:
        return '#ffffff';
    }
  }, [simpleCurrencyInfo.trend]);

  const shortPrice = useMemo(() => shortNumber(simpleCurrencyInfo?.price), [
    simpleCurrencyInfo.price,
  ]);

  return (
    <Router>
      <div className="flex flex-row w-full h-full">
        <div className="w-12 h-full">
          {/* Menu bar */}
          <div className="h-full flex flex-col items-center shadow-lg">
            <div className="flex flex-col justify-center items-center w-12 h-12">
              {/* <img className="w-8 h-8 mt-2" src={monitorSVG} alt="Setting icon" /> */}
              <span className="text-2xl">M</span>
            </div>
            <div
              style={{ width: '80%', height: '1px' }}
              className="bg-gray-200"
            />
            <ul className="w-12 h-full flex flex-col items-center">
              <li className="mt-4">
                <NavLink
                  to="/monitor-list"
                  className="block p-1 rounded-md bg-black bg-opacity-0"
                  activeClassName="bg-opacity-20"
                >
                  <img
                    className="w-8 h-8 filter hover:drop-shadow-lg"
                    src={monitorSVG}
                    alt="Setting icon"
                  />
                </NavLink>
              </li>
              <li className="mt-4">
                <NavLink
                  to="/monitor-setting"
                  className="block p-1 rounded-md bg-black bg-opacity-0"
                  activeClassName="bg-opacity-20"
                >
                  <img
                    className="w-8 h-8 filter hover:drop-shadow-lg"
                    src={exchangeSVG}
                    alt="Exchanges icon"
                  />
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
        <div style={{ display: 'none' }} className="overflow-scroll">
          <Stage className="bg-black" ref={stageRef} width={104} height={24}>
            <Layer>
              {/* 加密货币图标 */}
              <KonvaImage image={image} x={3} y={3} width={18} height={18} />
              {/* 加密货币名字 */}
              <Text
                fontSize={8}
                fontFamily="yuanti"
                text={simpleCurrencyInfo.base}
                fill="#ffffff"
                x={25}
                y={3}
              />
              {/* 加密货币基础货币 */}
              <Text
                fontSize={7}
                fontFamily="yuanti"
                text={simpleCurrencyInfo.quote}
                fill="#ffffff"
                x={25}
                y={14}
              />
              {/* 加密货币价格 */}
              <Text
                fontSize={12}
                fontFamily="yuanti"
                text={shortNumber(simpleCurrencyInfo?.price)}
                fill={trendColor}
                x={104 - shortPrice.length * 5 - 14}
                y={6}
              />
            </Layer>
          </Stage>
        </div>
        <div className="w-full h-full overflow-scroll">
          <Switch>
            <Route path="/" component={MonitorSetting} />
            <Route path="/monitor-list" component={MonitorList} />
            <Route path="/monitor-setting" component={MonitorSetting} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}
