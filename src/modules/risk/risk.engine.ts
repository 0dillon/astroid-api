import { Injectable } from '@nestjs/common';
import { RiskBand } from '@prisma/client';
import { clamp } from '../../utils/decimal.util';
import {
  RiskAssessment,
  RiskFactorScore,
  RiskFactorsInput,
  RISK_WEIGHTS,
} from './risk.types';

/**
 * Pure risk-scoring engine. Produces a 0-100 composite score from weighted
 * factors and maps it to a band:
 *   0-20 Low, 21-50 Medium, 51-80 High, 81-100 Critical.
 * Critical transactions can never auto-execute (must go through approval).
 * Contains no I/O and is fully unit-tested.
 */
@Injectable()
export class RiskEngine {
  /** Amount (in asset units) at which the amount factor saturates to full weight. */
  private static readonly AMOUNT_SATURATION = 10_000;
  /** Recent transaction count at which the velocity factor saturates. */
  private static readonly VELOCITY_SATURATION = 20;
  /** Wallet age (days) beyond which the wallet is considered fully seasoned. */
  private static readonly WALLET_SEASONED_DAYS = 90;

  assess(input: RiskFactorsInput): RiskAssessment {
    const factors: RiskFactorScore[] = [
      this.amountFactor(input.amount),
      this.recipientFactor(input.knownRecipient),
      this.velocityFactor(input.recentTransactionCount),
      this.walletAgeFactor(input.walletAgeDays),
      this.policyFactor(input.policyViolations),
      this.timingFactor(input.hourUtc),
    ];

    const score = Math.round(
      clamp(
        factors.reduce((sum, factor) => sum + factor.contribution, 0),
        0,
        100,
      ),
    );
    const band = this.toBand(score);
    return { score, band, factors, canAutoExecute: band !== RiskBand.CRITICAL };
  }

  /** Maps a numeric score to its band per the PRD thresholds. */
  toBand(score: number): RiskBand {
    if (score <= 20) {
      return RiskBand.LOW;
    }
    if (score <= 50) {
      return RiskBand.MEDIUM;
    }
    if (score <= 80) {
      return RiskBand.HIGH;
    }
    return RiskBand.CRITICAL;
  }

  private amountFactor(amount: number): RiskFactorScore {
    const ratio = clamp(amount / RiskEngine.AMOUNT_SATURATION, 0, 1);
    return {
      factor: 'amount',
      weight: RISK_WEIGHTS.amount,
      contribution: ratio * RISK_WEIGHTS.amount,
      detail: `Amount ${amount}`,
    };
  }

  private recipientFactor(known: boolean): RiskFactorScore {
    return {
      factor: 'unknownRecipient',
      weight: RISK_WEIGHTS.unknownRecipient,
      contribution: known ? 0 : RISK_WEIGHTS.unknownRecipient,
      detail: known ? 'Known recipient' : 'Recipient never paid before',
    };
  }

  private velocityFactor(count: number): RiskFactorScore {
    const ratio = clamp(count / RiskEngine.VELOCITY_SATURATION, 0, 1);
    return {
      factor: 'velocity',
      weight: RISK_WEIGHTS.velocity,
      contribution: ratio * RISK_WEIGHTS.velocity,
      detail: `${count} recent transactions`,
    };
  }

  private walletAgeFactor(days: number): RiskFactorScore {
    const seasoned = clamp(days / RiskEngine.WALLET_SEASONED_DAYS, 0, 1);
    return {
      factor: 'walletAge',
      weight: RISK_WEIGHTS.walletAge,
      contribution: (1 - seasoned) * RISK_WEIGHTS.walletAge,
      detail: `Wallet age ${days} day(s)`,
    };
  }

  private policyFactor(violations: number): RiskFactorScore {
    // Each violation adds half the weight, saturating at 2 violations.
    const ratio = clamp(violations / 2, 0, 1);
    return {
      factor: 'policyViolations',
      weight: RISK_WEIGHTS.policyViolations,
      contribution: ratio * RISK_WEIGHTS.policyViolations,
      detail: `${violations} policy violation(s)`,
    };
  }

  private timingFactor(hourUtc?: number): RiskFactorScore {
    // Overnight window (00:00-05:00 UTC) is treated as mildly suspicious.
    const suspicious = hourUtc !== undefined && hourUtc >= 0 && hourUtc < 5;
    return {
      factor: 'suspiciousTiming',
      weight: RISK_WEIGHTS.suspiciousTiming,
      contribution: suspicious ? RISK_WEIGHTS.suspiciousTiming : 0,
      detail: suspicious ? 'Overnight transaction' : 'Normal hours',
    };
  }
}
