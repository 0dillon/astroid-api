import { Injectable, Logger } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { Keypair } from '@stellar/stellar-sdk';
import {
  BuildPaymentParams,
  StellarBalance,
  StellarClient,
  StellarKeypair,
  StellarNetworkName,
  StellarSubmitResult,
  StellarTransactionInfo,
  SubmitPaymentParams,
} from './stellar.interface';

/**
 * Deterministic, network-free implementation of the Stellar client. Used by
 * default (STELLAR_USE_MOCK=true) so the API is fully runnable, testable and
 * demoable without a live Horizon connection. Real keypair generation and
 * address validation still use the genuine SDK, only network I/O is simulated.
 */
@Injectable()
export class MockStellarClient implements StellarClient {
  private readonly logger = new Logger(MockStellarClient.name);
  private readonly balances = new Map<string, StellarBalance[]>();
  private readonly transactions = new Map<string, StellarTransactionInfo>();

  generateKeypair(): StellarKeypair {
    const keypair = Keypair.random();
    return { publicKey: keypair.publicKey(), secretKey: keypair.secret() };
  }

  isValidAddress(address: string): boolean {
    try {
      Keypair.fromPublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  async getBalances(address: string, _network: StellarNetworkName): Promise<StellarBalance[]> {
    return (
      this.balances.get(address) ?? [
        { asset: 'XLM', balance: '10000.0000000', assetType: 'native' },
        { asset: 'USDC', balance: '5000.0000000', assetType: 'credit_alphanum4' },
      ]
    );
  }

  async getNativeBalance(address: string, network: StellarNetworkName): Promise<string> {
    const balances = await this.getBalances(address, network);
    return balances.find((b) => b.asset === 'XLM')?.balance ?? '0.0000000';
  }

  async buildPaymentXdr(params: BuildPaymentParams): Promise<string> {
    // A deterministic placeholder envelope; real XDR is produced by HorizonClient.
    const raw = JSON.stringify({
      source: params.sourceAddress,
      destination: params.destinationAddress,
      asset: params.asset,
      amount: params.amount,
      memo: params.memo ?? null,
    });
    return Buffer.from(raw).toString('base64');
  }

  async submitPayment(params: SubmitPaymentParams): Promise<StellarSubmitResult> {
    const hash = randomBytes(32).toString('hex');
    this.transactions.set(hash, {
      hash,
      successful: true,
      ledger: Math.floor(Date.now() / 1000),
      createdAt: new Date().toISOString(),
    });
    this.logger.debug(
      `Mock payment ${params.amount} ${params.asset} -> ${params.destinationAddress} (hash ${hash.slice(0, 10)})`,
    );
    return { hash, ledger: this.transactions.get(hash)?.ledger, successful: true };
  }

  async getTransaction(
    hash: string,
    _network: StellarNetworkName,
  ): Promise<StellarTransactionInfo | null> {
    return this.transactions.get(hash) ?? null;
  }
}
