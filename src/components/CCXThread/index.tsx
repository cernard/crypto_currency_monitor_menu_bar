/* eslint-disable new-cap */
import React, { useState } from 'react';
import { render } from 'react-dom';
import { ipcRenderer } from 'electron';
import { useInterval } from 'ahooks';
import ccxt, { Exchange } from 'ccxt';
import { DataType } from '../MonitorSetting/Editable';

function CCXThread() {
  const [configs, setConfigs] = useState<DataType[]>([]);
  const instanceMap: Map<string, Exchange> = new Map<string, Exchange>();

  ipcRenderer.on('notifyFromMain', (e, params: DataType[]) => {
    setConfigs(params);
  });

  // useInterval(() => {
  //   configs.forEach((config) => {
  //     let exchangeInstance: Exchange | undefined;
  //     if (instanceMap.has(config.exchange)) {
  //       exchangeInstance = instanceMap.get(config.exchange);
  //     } else if (ccxt.exchanges.includes(config.exchange)) {
  //       exchangeInstance = new ccxt[config.exchange]();
  //       if (exchangeInstance) {
  //         instanceMap.set(config.exchange, exchangeInstance);
  //       }
  //     }
  //   });
  // }, 2000);

  return (
    <div>
      {configs.map((config, index) => (
        <div>{JSON.stringify(config)},</div>
      ))}
    </div>
  );
}

render(<CCXThread />, document.getElementById('root'));
