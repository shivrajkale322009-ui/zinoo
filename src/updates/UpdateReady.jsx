import { useEffect } from 'react';
import { markUpdateScreenReady } from './liveUpdates';

export default function UpdateReady({ children }) {
  useEffect(() => { markUpdateScreenReady(); }, []);
  return children;
}
