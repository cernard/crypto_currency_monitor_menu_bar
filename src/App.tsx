import {
  BrowserRouter as Router,
  Switch,
  Route,
  NavLink,
} from 'react-router-dom';
import { nativeImage, remote } from 'electron';
import './App.global.css';
import { Stage, Layer, Image as KonvaImage, Text } from 'react-konva';
import { useCounter } from 'ahooks';
import Konva from 'konva';
import React, { useMemo, useRef, useState } from 'react';
import useImage from 'use-image';
import path from 'path';
import MonitorList from './components/MonitorList';
import MonitorSetting from './components/MonitorSetting';
import monitorSVG from '../assets/icons/monitor.svg';
import exchangeSVG from '../assets/icons/exchange.svg';
import settingSVG from '../assets/icons/setting.svg';

const fs = require('fs');

const RESOURCES_PATH = remote.app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

export default function App() {
  const [current, { inc, dec }] = useCounter(0);
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

  const [image] = useImage(getAssetPath('icons/color/aave.svg'));

  return (
    <Router>
      <div className="flex flex-row w-full h-full">
        <div className="flex flex-col items-center">
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
                className="block p-1 rounded-md bg-white bg-opacity-0"
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
                className="block p-1 rounded-md bg-white bg-opacity-0"
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
        <div>
          <Stage className="bg-black" ref={stageRef} width={104} height={24}>
            <Layer>
              {/* 加密货币图标 */}
              <KonvaImage image={image} x={3} y={3} width={18} height={18} />
              {/* 加密货币名字 */}
              <Text
                fontSize={8}
                fontFamily="yuanti"
                text="AAVE"
                fill="#ffffff"
                x={28}
                y={3}
              />
              {/* 加密货币基础货币 */}
              <Text
                fontSize={6}
                fontFamily="yuanti"
                text={`${current}`}
                fill="#ffffff"
                x={31}
                y={14}
              />
              {/* 加密货币价格 */}
              <Text
                fontSize={12}
                fontFamily="yuanti"
                text="3,2321"
                fill="#ffffff"
                x={52}
                y={6}
              />
              {/* 加密货币走势（涨/跌） */}
            </Layer>
          </Stage>
          <button onClick={() => inc()} type="button">
            Inc
          </button>
          <button onClick={() => dec()} type="button">
            Dec
          </button>
        </div>
        <div>
          <Switch>
            {/* <Route path="/" component={Monito} /> */}
            <Route path="/monitor-list" component={MonitorList} />
            <Route path="/monitor-setting" component={MonitorSetting} />
          </Switch>
        </div>
      </div>
    </Router>
  );
}
