export const LOOP_MASTER_ENABLED = process.env.LOOP_MASTER_ENABLED !== 'false';
export const MIN_LOOP_LENGTH = Number(process.env.MIN_LOOP_LENGTH ?? 5);
export const BONUS_METERS_PER_HEX = Number(process.env.BONUS_METERS_PER_HEX ?? 75);

