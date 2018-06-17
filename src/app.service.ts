import { Injectable } from '@nestjs/common';
import * as StellarSdk from 'stellar-sdk';

const request = require('request');
const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
StellarSdk.Network.useTestNetwork();

const masterAccount = {
  publicKey: 'GC75O5KKVQI2DMB54EUJJZ5PFSTQBBA6EM3UOIPTWH5IL4OBLUDLN6SO',
  secret: 'SDJWV5DOFNV7PJXYA5NXZJGKFOUKFXS22B3B34UHK27TDJIDELIOBZDW'
};

// publicKey: GCNK2HMLX7HNGO4G37TPUXDPCATISBYYQFVV5OUEOIKYFLQOZ6XJFQKS
// secret: SCVFP54YJTC2YQXDT5IPGE5KQECGHDT3E2DBTSCUXPGPX2EEHZ5LZ57G

@Injectable()
export class AppService {
  async account(key: string): Promise<any> {    
    let account = await server.loadAccount(key);
    return account;
  }

  generate(): any {    
    var pair = StellarSdk.Keypair.random();
    return {
      publicKey: pair.publicKey(),
      secret: pair.secret()
    };
  }

  async activate(publicKey: string): Promise<any> {
    let sourceKeys = StellarSdk.Keypair.fromSecret(masterAccount.secret);
    let fromAccount = await server.loadAccount(sourceKeys.publicKey());
    let transaction = new StellarSdk.TransactionBuilder(fromAccount)
      .addOperation(StellarSdk.Operation.createAccount({
        destination: publicKey,
        startingBalance: '1'
      }))
      .build();
    transaction.sign(sourceKeys);
    let result = await server.submitTransaction(transaction);
    return result;
  }

  async send(secret: string, to: string, amount: number, memo: string): Promise<any> {
    let sourceKeys = StellarSdk.Keypair.fromSecret(secret);
    let fromAccount = await server.loadAccount(sourceKeys.publicKey());
    let transaction = new StellarSdk.TransactionBuilder(fromAccount)
      .addOperation(StellarSdk.Operation.payment({
        destination: to,
        // Because Stellar allows transaction in many currencies, you must
        // specify the asset type. The special "native" asset represents Lumens.
        asset: StellarSdk.Asset.native(),
        amount: String(amount)
      }))
      // A memo allows you to add your own metadata to a transaction. It's
      // optional and does not affect how Stellar treats the transaction.
      .addMemo(StellarSdk.Memo.text(memo))
      .build();    
    transaction.sign(sourceKeys);
    let result = await server.submitTransaction(transaction);
    return result;
  }
}
