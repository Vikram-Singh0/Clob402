import {
  verifyPaymentSignature,
  constructAuthorizationMessage,
  PaymentAuthMessage,
} from '../../services/aptosService';
import { Ed25519PrivateKey, Ed25519PublicKey } from '@aptos-labs/ts-sdk';

describe('AptosService', () => {
  const TEST_SENDER = '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
  const TEST_RECIPIENT = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcd';

  describe('constructAuthorizationMessage', () => {
    it('should construct message with correct structure', () => {
      const message: PaymentAuthMessage = {
        sender: TEST_SENDER,
        recipient: TEST_RECIPIENT,
        amount: 1000000,
        nonce: 12345,
        expiry: Math.floor(Date.now() / 1000) + 300,
      };

      const messageBytes = constructAuthorizationMessage(message);

      // Verify message structure
      expect(messageBytes).toBeInstanceOf(Uint8Array);
      expect(messageBytes.length).toBeGreaterThan(0);

      // Domain separator should be at the start
      const domainSeparator = new TextEncoder().encode('APTOS_PAYMENT_AUTH');
      const prefix = messageBytes.slice(0, domainSeparator.length);
      expect(Array.from(prefix)).toEqual(Array.from(domainSeparator));
    });

    it('should produce different messages for different inputs', () => {
      const message1: PaymentAuthMessage = {
        sender: TEST_SENDER,
        recipient: TEST_RECIPIENT,
        amount: 1000000,
        nonce: 12345,
        expiry: Math.floor(Date.now() / 1000) + 300,
      };

      const message2: PaymentAuthMessage = {
        ...message1,
        amount: 2000000, // Different amount
      };

      const bytes1 = constructAuthorizationMessage(message1);
      const bytes2 = constructAuthorizationMessage(message2);

      expect(Array.from(bytes1)).not.toEqual(Array.from(bytes2));
    });

    it('should be deterministic for same inputs', () => {
      const message: PaymentAuthMessage = {
        sender: TEST_SENDER,
        recipient: TEST_RECIPIENT,
        amount: 1000000,
        nonce: 12345,
        expiry: 1700000000,
      };

      const bytes1 = constructAuthorizationMessage(message);
      const bytes2 = constructAuthorizationMessage(message);

      expect(Array.from(bytes1)).toEqual(Array.from(bytes2));
    });
  });

  describe('verifyPaymentSignature', () => {
    it('should verify valid signature', () => {
      // Generate test key pair
      const privateKey = new Ed25519PrivateKey(
        '0x0000000000000000000000000000000000000000000000000000000000000001'
      );
      const publicKey = privateKey.publicKey();

      const message: PaymentAuthMessage = {
        sender: TEST_SENDER,
        recipient: TEST_RECIPIENT,
        amount: 1000000,
        nonce: 12345,
        expiry: Math.floor(Date.now() / 1000) + 300,
      };

      // Sign the message
      const messageBytes = constructAuthorizationMessage(message);
      const signature = privateKey.sign(messageBytes);

      // Verify signature
      const isValid = verifyPaymentSignature(
        TEST_SENDER,
        publicKey.toString(),
        signature.toString(),
        message
      );

      expect(isValid).toBe(true);
    });

    it('should reject invalid signature', () => {
      const privateKey = new Ed25519PrivateKey(
        '0x0000000000000000000000000000000000000000000000000000000000000001'
      );
      const publicKey = privateKey.publicKey();

      const message: PaymentAuthMessage = {
        sender: TEST_SENDER,
        recipient: TEST_RECIPIENT,
        amount: 1000000,
        nonce: 12345,
        expiry: Math.floor(Date.now() / 1000) + 300,
      };

      // Create a fake signature
      const fakeSignature = '0x' + '00'.repeat(64);

      const isValid = verifyPaymentSignature(
        TEST_SENDER,
        publicKey.toString(),
        fakeSignature,
        message
      );

      expect(isValid).toBe(false);
    });

    it('should reject signature from different key', () => {
      const privateKey1 = new Ed25519PrivateKey(
        '0x0000000000000000000000000000000000000000000000000000000000000001'
      );
      const privateKey2 = new Ed25519PrivateKey(
        '0x0000000000000000000000000000000000000000000000000000000000000002'
      );

      const message: PaymentAuthMessage = {
        sender: TEST_SENDER,
        recipient: TEST_RECIPIENT,
        amount: 1000000,
        nonce: 12345,
        expiry: Math.floor(Date.now() / 1000) + 300,
      };

      const messageBytes = constructAuthorizationMessage(message);
      const signature = privateKey1.sign(messageBytes);

      // Try to verify with different public key
      const isValid = verifyPaymentSignature(
        TEST_SENDER,
        privateKey2.publicKey().toString(),
        signature.toString(),
        message
      );

      expect(isValid).toBe(false);
    });

    it('should reject signature for modified message', () => {
      const privateKey = new Ed25519PrivateKey(
        '0x0000000000000000000000000000000000000000000000000000000000000001'
      );
      const publicKey = privateKey.publicKey();

      const originalMessage: PaymentAuthMessage = {
        sender: TEST_SENDER,
        recipient: TEST_RECIPIENT,
        amount: 1000000,
        nonce: 12345,
        expiry: Math.floor(Date.now() / 1000) + 300,
      };

      // Sign original message
      const messageBytes = constructAuthorizationMessage(originalMessage);
      const signature = privateKey.sign(messageBytes);

      // Modify the message
      const modifiedMessage: PaymentAuthMessage = {
        ...originalMessage,
        amount: 2000000, // Different amount
      };

      // Try to verify modified message with original signature
      const isValid = verifyPaymentSignature(
        TEST_SENDER,
        publicKey.toString(),
        signature.toString(),
        modifiedMessage
      );

      expect(isValid).toBe(false);
    });
  });
});

