import React, { useState } from 'react';
import { render } from 'react-dom';
import { ipcRenderer } from 'electron';
import { DataType } from '../MonitorSetting/Editable';

function CCXThread() {
  const [configs, setConfigs] = useState<DataType[]>([]);

  ipcRenderer.on('notifyFromMain', (e, params: DataType[]) => {
    setConfigs(params);
  });

  return (
    <div>
      {
        configs.map(config => (
          <div>
            {JSON.stringify(config)},
          </div>
        ))
      }
    </div>
  );
}

render(<CCXThread />, document.getElementById('root'));
