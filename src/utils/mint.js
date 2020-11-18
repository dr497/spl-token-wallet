import { PublicKey } from '@solana/web3.js';
import { AuthorityType, Token, u64 } from '@solana/spl-token';
import { createAccount } from './account';

const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA',
);

export const createNewToken = async (
  connection,
  feePayer: string,
  mintAuthority: string,
  freezeAuthority: string,
  decimals: number,
) => {
  const token = await Token.createMint(
    connection,
    await createAccount(feePayer),
    new PublicKey(mintAuthority),
    freezeAuthority ? new PublicKey(freezeAuthority) : null,
    decimals,
    TOKEN_PROGRAM_ID,
  );
  return token.publicKey.toString();
};

export const editToken = async (
  connection,
  feePayer: string,
  tokenAddress: string,
  newAuthority: string,
  currentAuthority: string,
  authorityType: AuthorityType,
) => {
  const tokenPublicKey = new PublicKey(tokenAddress);

  const token = new Token(
    connection,
    tokenPublicKey,
    TOKEN_PROGRAM_ID,
    await createAccount(feePayer),
  );

  await token.setAuthority(
    tokenPublicKey,
    newAuthority ? new PublicKey(newAuthority) : null,
    authorityType,
    await createAccount(currentAuthority),
    [],
  );
};

export const createTokenAccount = async (
  connection,
  feePayer: string,
  tokenAddress: string,
  owner: string,
) => {
  const token = new Token(
    connection,
    new PublicKey(tokenAddress),
    TOKEN_PROGRAM_ID,
    await createAccount(feePayer),
  );

  return (await token.createAccount(new PublicKey(owner))).toString();
};

export const mintToken = async (
  connection,
  feePayer: string,
  tokenAddress: string,
  mintAuthority: string,
  destinationAccount: string,
  amount: u64,
) => {
  const token = new Token(
    connection,
    new PublicKey(tokenAddress),
    TOKEN_PROGRAM_ID,
    await createAccount(feePayer),
  );

  return await token.mintTo(
    new PublicKey(destinationAccount),
    await createAccount(mintAuthority),
    [],
    amount,
  );
};

export const freezeAccount = async (
  connection,
  feePayer: string,
  tokenAddress: string,
  accountToFreeze: string,
  freezeAuthority: string,
) => {
  const token = new Token(
    connection,
    new PublicKey(tokenAddress),
    TOKEN_PROGRAM_ID,
    await createAccount(feePayer),
  );

  await token.freezeAccount(
    new PublicKey(accountToFreeze),
    await createAccount(freezeAuthority),
    [],
  );
};

export const thawAccount = async (
  connection,
  feePayer: string,
  tokenAddress: string,
  accountToThaw: string,
  freezeAuthority: string,
) => {
  const token = new Token(
    connection,
    new PublicKey(tokenAddress),
    TOKEN_PROGRAM_ID,
    await createAccount(feePayer),
  );

  await token.thawAccount(
    new PublicKey(accountToThaw),
    await createAccount(freezeAuthority),
    [],
  );
};

export const transferTokens = async (
  connection,
  feePayer: string,
  tokenAddress: string,
  sourceAccount: string,
  destAccount: string,
  owner: string,
  amount: u64,
) => {
  const token = new Token(
    connection,
    new PublicKey(tokenAddress),
    TOKEN_PROGRAM_ID,
    await createAccount(feePayer),
  );

  await token.transfer(
    new PublicKey(sourceAccount),
    new PublicKey(destAccount),
    await createAccount(owner),
    [],
    amount,
  );
};

export const setTokenAccountOwner = async (
  connection,
  feePayer: string,
  tokenAddress: string,
  tokenAccount: string,
  currentAuthority: string,
  newAuthority: string,
) => {
  const token = new Token(
    connection,
    new PublicKey(tokenAddress),
    TOKEN_PROGRAM_ID,
    await createAccount(feePayer),
  );

  await token.setAuthority(
    new PublicKey(tokenAccount),
    new PublicKey(newAuthority),
    'AccountOwner',
    await createAccount(currentAuthority),
    [],
  );
};

export const burnTokens = async (
  connection,
  feePayer: string,
  tokenAddress: string,
  tokenAccount: string,
  owner: string,
  amount: u64,
) => {
  const token = new Token(
    connection,
    new PublicKey(tokenAddress),
    TOKEN_PROGRAM_ID,
    await createAccount(feePayer),
  );

  await token.burn(
    new PublicKey(tokenAccount),
    await createAccount(owner),
    [],
    amount,
  );
};

export const closeAccount = async (
  connection,
  feePayer: string,
  tokenAddress: string,
  tokenAccount: string,
  destinationAccount: string,
  owner: string,
) => {
  const token = new Token(
    connection,
    new PublicKey(tokenAddress),
    TOKEN_PROGRAM_ID,
    await createAccount(feePayer),
  );

  await token.closeAccount(
    new PublicKey(tokenAccount),
    new PublicKey(destinationAccount),
    await createAccount(owner),
    [],
  );
};

export const setTokenAccountCloser = async (
  connection,
  feePayer: string,
  tokenAddress: string,
  tokenAccount: string,
  currentAuthority: string,
  newAuthority: string,
) => {
  const token = new Token(
    connection,
    new PublicKey(tokenAddress),
    TOKEN_PROGRAM_ID,
    await createAccount(feePayer),
  );

  await token.setAuthority(
    new PublicKey(tokenAccount),
    newAuthority ? new PublicKey(newAuthority) : null,
    'CloseAccount',
    await createAccount(currentAuthority),
    [],
  );
};
