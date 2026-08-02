import { Module } from '@nestjs/common';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { WalletRepository } from './wallet.repository';

/**
 * Wallet module. Exports the service so the transactions pipeline can resolve a
 * sender wallet, check its status and read its network.
 */
@Module({
  controllers: [WalletController],
  providers: [WalletService, WalletRepository],
  exports: [WalletService],
})
export class WalletModule {}
