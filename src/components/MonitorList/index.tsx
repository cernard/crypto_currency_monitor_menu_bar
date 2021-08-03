import React from 'react';
import { remote } from 'electron';
import path from 'path';

const RESOURCES_PATH = remote.app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../assets');

const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

export default function MonitorList() {
  return (
    <div className="w-full flex flex-col items-center justify-center">
      Monitor List
    </div>
  );
}
