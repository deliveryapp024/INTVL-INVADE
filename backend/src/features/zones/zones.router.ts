import { Router } from 'express';
import prisma from '../../lib/prisma';
import { getWeeklyCycleWindowUtc } from './zone-cycle';
import * as h3 from 'h3-js';

const router = Router();

router.get('/owned', async (req, res) => {
  const userId = (req as any).user?.id || (req.query.userId as string) || 'test-user-id';
  const cycleAt = req.query.at ? new Date(String(req.query.at)) : new Date();
  const { cycleKey } = getWeeklyCycleWindowUtc(cycleAt);

  const owned = await prisma.zoneOwnership.findMany({
    where: { cycleKey, ownerUserId: userId },
    select: { h3Index: true, ownerDistanceM: true, tieBreakFirstAt: true }
  });

  res.json({
    status: 'success',
    data: { cycleKey, userId, zones: owned }
  });
});

router.get('/ownerships/current', async (req, res) => {
  const cycleAt = req.query.at ? new Date(String(req.query.at)) : new Date();
  const { cycleKey } = getWeeklyCycleWindowUtc(cycleAt);

  const h3IndicesParam = req.query.h3Indices ? String(req.query.h3Indices) : '';
  const h3Indices = h3IndicesParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const where: any = { cycleKey };
  if (h3Indices.length > 0) where.h3Index = { in: h3Indices };

  const ownerships = await prisma.zoneOwnership.findMany({
    where,
    select: { h3Index: true, ownerUserId: true, ownerDistanceM: true, tieBreakFirstAt: true }
  });

  res.json({
    status: 'success',
    data: { cycleKey, ownerships }
  });
});

router.get('/current', async (req, res) => {
  const userId = (req as any).user?.id || (req.query.userId as string) || 'test-user-id';
  const cycleAt = req.query.at ? new Date(String(req.query.at)) : new Date();
  const { cycleKey } = getWeeklyCycleWindowUtc(cycleAt);

  const ownerships = await prisma.zoneOwnership.findMany({
    where: { cycleKey },
    select: { h3Index: true, ownerUserId: true }
  });

  const loopBonus = await prisma.runZoneContribution.findMany({
    where: { cycleKey, userId, source: 'LOOP_BONUS' },
    select: { h3Index: true }
  });
  const loopBonusSet = new Set(loopBonus.map((r) => r.h3Index));

  res.json({
    status: 'success',
    data: {
      cycleKey,
      zones: ownerships.map((o) => ({
        h3_index: o.h3Index,
        owner_user_id: o.ownerUserId,
        is_loop_bonus: loopBonusSet.has(o.h3Index),
        boundary: h3
          .cellToBoundary(o.h3Index, true)
          .map(([lat, lng]) => ({ latitude: lat, longitude: lng }))
      }))
    }
  });
});

export default router;
