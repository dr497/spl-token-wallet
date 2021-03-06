import EventEmitter from 'eventemitter3';
import { PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import nacl from 'tweetnacl';

const providerUrl = 'http://localhost:3001/';
const network = 'https://solana-api.projectserum.com';

// export default class WalletSwap extends EventEmitter {
//   constructor(publicKey) {
//     super();
//     this._providerUrl = new URL(providerUrl);
//     this._providerUrl.hash = new URLSearchParams({
//       // origin: window.location.origin,
//       network,
//     }).toString();
//     this._publicKey = publicKey;
//     this._autoApprove = true;
//     this._popup = null;
//     this._handlerAdded = false;
//     this._nextRequestId = 1;
//     this._responsePromises = new Map();
//   }
//
//   _handleMessage = (e) => {
//     if (e.origin === this._providerUrl.origin && e.source === this._popup) {
//       if (e.data.method === 'connected') {
//         const newPublicKey = new PublicKey(e.data.params.publicKey);
//         if (!this._publicKey || !this._publicKey.equals(newPublicKey)) {
//           this._handleDisconnect();
//           this._publicKey = newPublicKey;
//           this._autoApprove = !!e.data.params.autoApprove;
//           this.emit('connect', this._publicKey);
//         }
//       } else if (e.data.method === 'disconnected') {
//         this._handleDisconnect();
//       } else if (e.data.result || e.data.error) {
//         if (this._responsePromises.has(e.data.id)) {
//           const [resolve, reject] = this._responsePromises.get(e.data.id);
//           if (e.data.result) {
//             resolve(e.data.result);
//           } else {
//             reject(new Error(e.data.error));
//           }
//         }
//       }
//     }
//   };
//
//   _handleDisconnect = () => {
//     if (this._publicKey) {
//       this._publicKey = null;
//       this.emit('disconnect');
//     }
//     this._responsePromises.forEach(([resolve, reject], id) => {
//       this._responsePromises.delete(id);
//       reject('Wallet disconnected');
//     });
//   };
//
//   _sendRequest = async (method, params) => {
//     if (!this.connected) {
//       throw new Error('Wallet not connected');
//     }
//     const requestId = this._nextRequestId;
//     ++this._nextRequestId;
//     return new Promise((resolve, reject) => {
//       this._responsePromises.set(requestId, [resolve, reject]);
//       this._popup.postMessage(
//         {
//           jsonrpc: '2.0',
//           id: requestId,
//           method,
//           params,
//         },
//         this._providerUrl.origin,
//       );
//       if (!this.autoApprove) {
//         this._popup.focus();
//       }
//     });
//   };
//
//   get publicKey() {
//     return this._publicKey;
//   }
//
//   get connected() {
//     return this._publicKey !== null;
//   }
//
//   get autoApprove() {
//     return this._autoApprove;
//   }
//
//   connect = () => {
//     if (this._popup) {
//       this._popup.close();
//     }
//     if (!this._handlerAdded) {
//       this._handlerAdded = true;
//       window.addEventListener('message', this._handleMessage);
//       window.addEventListener('beforeunload', this.disconnect);
//     }
//     window.name = 'parent';
//     this._popup = window.open(
//       this._providerUrl.toString(),
//       '_blank',
//       'location,resizable,width=460,height=675',
//     );
//     return new Promise((resolve) => {
//       this.once('connect', resolve);
//     });
//   };
//
//   disconnect = () => {
//     if (this._popup) {
//       this._popup.close();
//     }
//     this._handleDisconnect();
//   };
//
//   signTransaction = async (transaction, secretKey) => {
//     // const response = await this._sendRequest('signTransaction', {
//     //   message: bs58.encode(transaction.serializeMessage()),
//     // });
//     let message = bs58.encode(transaction.serializeMessage());
//     let signature = bs58.encode(
//       nacl.sign.detached(bs58.decode(message), secretKey),
//     );
//     signature = bs58.decode(signature);
//     // const signature = bs58.decode(response.signature);
//     const publicKey = new PublicKey(this._publicKey);
//     transaction.addSignature(publicKey, signature);
//     return transaction;
//   };
// }

class WalletSwap extends EventEmitter {
  constructor(publicKey) {
    var _this;

    super();
    this._publicKey = publicKey;
    _this = this;

    this._handleMessage = (e) => {
      if (e.origin === this._providerUrl.origin && e.source === this._popup) {
        if (e.data.method === 'connected') {
          const newPublicKey = new PublicKey(e.data.params.publicKey);

          if (!this._publicKey || !this._publicKey.equals(newPublicKey)) {
            this._handleDisconnect();

            this._publicKey = newPublicKey;
            this._autoApprove = !!e.data.params.autoApprove;
            this.emit('connect', this._publicKey);
          }
        } else if (e.data.method === 'disconnected') {
          this._handleDisconnect();
        } else if (e.data.result || e.data.error) {
          if (this._responsePromises.has(e.data.id)) {
            const [resolve, reject] = this._responsePromises.get(e.data.id);

            if (e.data.result) {
              resolve(e.data.result);
            } else {
              reject(new Error(e.data.error));
            }
          }
        }
      }
    };

    this._handleDisconnect = () => {
      if (this._publicKey) {
        this._publicKey = null;
        this.emit('disconnect');
      }

      this._responsePromises.forEach(([resolve, reject], id) => {
        this._responsePromises.delete(id);

        reject('Wallet disconnected');
      });
    };

    this._sendRequest = async function (method, params) {
      if (!_this.connected) {
        throw new Error('Wallet not connected');
      }

      const requestId = _this._nextRequestId;
      ++_this._nextRequestId;
      return new Promise((resolve, reject) => {
        _this._responsePromises.set(requestId, [resolve, reject]);

        _this._popup.postMessage(
          {
            jsonrpc: '2.0',
            id: requestId,
            method,
            params,
          },
          _this._providerUrl.origin,
        );

        if (!_this.autoApprove) {
          _this._popup.focus();
        }
      });
    };

    this.connect = () => {
      if (this._popup) {
        this._popup.close();
      }

      if (!this._handlerAdded) {
        this._handlerAdded = true;
        window.addEventListener('message', this._handleMessage);
        window.addEventListener('beforeunload', this.disconnect);
      }

      window.name = 'parent';
      this._popup = window.open(
        this._providerUrl.toString(),
        '_blank',
        'location,resizable,width=460,height=675',
      );
      return new Promise((resolve) => {
        this.once('connect', resolve);
      });
    };

    this.disconnect = () => {
      if (this._popup) {
        this._popup.close();
      }

      this._handleDisconnect();
    };

    this.signTransaction = async function (transaction) {
      const response = await _this._sendRequest('signTransaction', {
        message: bs58.encode(transaction.serializeMessage()),
      });
      const signature = bs58.decode(response.signature);
      const publicKey = new PublicKey(response.publicKey);
      transaction.addSignature(publicKey, signature);
      return transaction;
    };

    this._providerUrl = new URL(providerUrl);
    this._providerUrl.hash = new URLSearchParams({
      origin: window.location.origin,
      network,
    }).toString();
    this._publicKey = null;
    this._autoApprove = false;
    this._popup = null;
    this._handlerAdded = false;
    this._nextRequestId = 1;
    this._responsePromises = new Map();
  }

  get publicKey() {
    return this._publicKey;
  }

  get connected() {
    return this._publicKey !== null;
  }

  get autoApprove() {
    return this._autoApprove;
  }
}

export default WalletSwap;
//# sourceMappingURL=index.modern.js.map
