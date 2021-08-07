/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/interactive-supports-focus */
import React from 'react';
import { remote } from 'electron';
import path from 'path';
import { useToggle } from 'ahooks';
import ReactECharts from 'echarts-for-react';
import option from './option';

const RESOURCES_PATH = remote.app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

export default function MonitorList() {
  // TODO: '结束此模块调试后，将这个值修改为ture'
  const [currencyContentDisplaySwtich, { toggle }] = useToggle(false);

  const currencyDetails = (
    <div
      key="currency-0"
      className="w-full flex flex-col items-center justify-between"
    >
      {/* Header */}
      <div className="flex flex-row h-12 items-center w-full">
        <div
          className="cursor-pointer w-6 h-6 ml-2 opacity-60"
          onClick={() => toggle()}
        >
          <img src={getAssetPath('icons/back.svg')} alt="back" />
        </div>
        <div className="mx-auto text-center">
          <div className="font-extrabold">AAVE</div>
          <div className="text-xs opacity-30">BUSD</div>
        </div>
      </div>
      <img
        className="w-20 h-20"
        src={getAssetPath('icons/svg/aave.svg')}
        alt="currency icon"
      />
      <div className="flex flex-col items-center">
        <div className="text-green-500">+0.23%</div>
        <div className="text-2xl">1,773.64</div>
      </div>
      <div className="w-full h-40">
        <ReactECharts
          option={option}
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );

  const currencyList = (
    <div key="currency-1" className="w-full flex flex-col items-center">
      {new Array(10).fill(0).map((d) => (
        <div
          key={d}
          className="flex flex-row items-center cursor-pointer p-1 px-2 my-2 hover:bg-black hover:bg-opacity-10 rounded-md"
          onClick={() => toggle()}
        >
          <img className="w-8 h-8" src={getAssetPath('icon.png')} alt="icon" />
          <div className="flex flex-col">
            <span>AAVE</span>
            <span style={{ fontSize: '8px', opacity: '0.6' }}>BUSD</span>
          </div>
          <div className="px-3">1,7733,283.432</div>
          <div
            className="p-1 bg-green-400 rounded-md text-white"
            style={{ fontSize: '10px' }}
          >
            +0.03%
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div
      className="flex flex-row h-full"
      style={
        {
          // width: '740px',
          // minWidth: '740px',
          // maxWidth: '740px',
          // transform: 'translateX(185px)',
        }
      }
    >
      {currencyContentDisplaySwtich ? currencyList : currencyDetails}
    </div>
  );
}
