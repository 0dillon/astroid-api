import { describe, expect, it } from 'vitest';
import { RiskBand } from '@prisma/client';
import { RiskEngine } from './risk.engine';
import { RiskFactorsInput } from './risk.types';

const lowRisk: RiskFactorsInput = {
  amount: 20,
  asset: 'USDC',
  knownRecipient: true,
  recentTransactionCount: 1,
  walletAgeDays: 365,
  policyViolations: 0,
  hourUtc: 12,
};

describe('RiskEngine', () => {
  const engine = new RiskEngine();

  it('scores a small, known, seasoned transaction as Low', () => {
    const result = engine.assess(lowRisk);
    expect(result.band).toBe(RiskBand.LOW);
    expect(result.score).toBeLessThanOrEqual(20);
    expect(result.canAutoExecute).toBe(true);
  });

  it('raises score for an unknown recipient', () => {
    const known = engine.assess(lowRisk);
    const unknown = engine.assess({ ...lowRisk, knownRecipient: false });
    expect(unknown.score).toBeGreaterThan(known.score);
  });

  it('raises score for a brand-new wallet', () => {
    const result = engine.assess({ ...lowRisk, walletAgeDays: 0 });
    expect(result.score).toBeGreaterThan(engine.assess(lowRisk).score);
  });

  it('raises score for high velocity', () => {
    const result = engine.assess({ ...lowRisk, recentTransactionCount: 20 });
    expect(result.score).toBeGreaterThan(engine.assess(lowRisk).score);
  });

  it('produces a Critical band for a large unknown high-violation transfer', () => {
    const result = engine.assess({
      amount: 50_000,
      asset: 'USDC',
      knownRecipient: false,
      recentTransactionCount: 20,
      walletAgeDays: 0,
      policyViolations: 3,
      hourUtc: 2,
    });
    expect(result.band).toBe(RiskBand.CRITICAL);
    expect(result.canAutoExecute).toBe(false);
  });

  it('never exceeds 100 or drops below 0', () => {
    const result = engine.assess({
      amount: 1_000_000,
      asset: 'USDC',
      knownRecipient: false,
      recentTransactionCount: 999,
      walletAgeDays: 0,
      policyViolations: 99,
      hourUtc: 1,
    });
    expect(result.score).toBeLessThanOrEqual(100);
    expect(result.score).toBeGreaterThanOrEqual(0);
  });

  it('maps score thresholds to the correct bands', () => {
    expect(engine.toBand(0)).toBe(RiskBand.LOW);
    expect(engine.toBand(20)).toBe(RiskBand.LOW);
    expect(engine.toBand(21)).toBe(RiskBand.MEDIUM);
    expect(engine.toBand(50)).toBe(RiskBand.MEDIUM);
    expect(engine.toBand(51)).toBe(RiskBand.HIGH);
    expect(engine.toBand(80)).toBe(RiskBand.HIGH);
    expect(engine.toBand(81)).toBe(RiskBand.CRITICAL);
    expect(engine.toBand(100)).toBe(RiskBand.CRITICAL);
  });

  it('adds weight for suspicious overnight timing', () => {
    const day = engine.assess({ ...lowRisk, knownRecipient: false, hourUtc: 12 });
    const night = engine.assess({ ...lowRisk, knownRecipient: false, hourUtc: 2 });
    expect(night.score).toBeGreaterThan(day.score);
  });
});
