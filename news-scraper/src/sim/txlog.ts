// src/sim/txlog.ts
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const LOG_PATH = path.join(__dirname, '..', '..', 'data', 'txlog.json');

export type SimTx = {
  id: string;
  type: 'author' | 'topic';
  name: string;
  timestamp: number;
};

export function logSimTx(type: 'author'|'topic', name: string): SimTx {
  const tx: SimTx = {
    id: crypto.randomUUID(),
    type,
    name,
    timestamp: Date.now(),
  };
  const all = getTxLog();
  all.push(tx);
  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.writeFileSync(LOG_PATH, JSON.stringify(all, null, 2));
  return tx;
}

export function getTxLog(): SimTx[] {
  if (!fs.existsSync(LOG_PATH)) return [];
  return JSON.parse(fs.readFileSync(LOG_PATH, 'utf8'));
}
