import * as migration_20260203_214729 from './20260203_214729';
import * as migration_20260203_221027 from './20260203_221027';
import * as migration_20260204_000001 from './20260204_000001';
import * as migration_20260204_000002 from './20260204_000002';
import * as migration_20260204_000003 from './20260204_000003';
import * as migration_20260204_000004 from './20260204_000004';
import * as migration_20260204_000005 from './20260204_000005';
import * as migration_20260204_000006 from './20260204_000006';
import * as migration_20260204_000007 from './20260204_000007';
import * as migration_20260204_000008 from './20260204_000008';

export const migrations = [
  {
    up: migration_20260203_214729.up,
    down: migration_20260203_214729.down,
    name: '20260203_214729',
  },
  {
    up: migration_20260203_221027.up,
    down: migration_20260203_221027.down,
    name: '20260203_221027',
  },
  {
    up: migration_20260204_000001.up,
    down: migration_20260204_000001.down,
    name: '20260204_000001',
  },
  {
    up: migration_20260204_000002.up,
    down: migration_20260204_000002.down,
    name: '20260204_000002',
  },
  {
    up: migration_20260204_000003.up,
    down: migration_20260204_000003.down,
    name: '20260204_000003',
  },
  {
    up: migration_20260204_000004.up,
    down: migration_20260204_000004.down,
    name: '20260204_000004',
  },
  {
    up: migration_20260204_000005.up,
    down: migration_20260204_000005.down,
    name: '20260204_000005',
  },
  {
    up: migration_20260204_000006.up,
    down: migration_20260204_000006.down,
    name: '20260204_000006',
  },
  {
    up: migration_20260204_000007.up,
    down: migration_20260204_000007.down,
    name: '20260204_000007',
  },
  {
    up: migration_20260204_000008.up,
    down: migration_20260204_000008.down,
    name: '20260204_000008',
  },
];
