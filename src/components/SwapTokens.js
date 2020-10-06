import React, { useEffect, useState } from 'react';
import Typography from '@material-ui/core/Typography';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import { makeStyles } from '@material-ui/core';
import DialogForm from './DialogForm';
import { MARKETS } from '@project-serum/serum';
import { placeOrder } from '../utils/send';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import { getDecimalCount, roundToDecimal } from '../utils/utils';
import {
  useMarket,
  useMarkPrice,
  useSelectedBaseCurrencyAccount,
  useSelectedQuoteCurrencyAccount,
  // useOpenOrders,
  useSelectedOpenOrdersAccount,
} from '../utils/markets';
import { useSendConnection, refreshAccountInfo } from '../utils/connection';
import {
  useWallet,
  refreshWalletPublicKeys,
  useBalanceInfo,
} from '../utils/wallet';
import WalletSwap from '../utils/walletSwap';
import LoadingIndicator from './LoadingIndicator';
import { settleFunds } from '../utils/send';
import { useSnackbar } from 'notistack';
import { sleep } from '../utils/utils';

const USE_MARKETS = MARKETS.filter((e) => !e.deprecated);

let PAIRS = USE_MARKETS.map((e) => e.name.split('/')[0]);
PAIRS.push('USDC', 'USDT');

PAIRS = [...new Set(PAIRS)];

const balanceFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
  useGrouping: true,
});

const useStyles = makeStyles((theme) => ({
  tabs: {
    marginBottom: theme.spacing(1),
    borderBottom: `1px solid ${theme.palette.background.paper}`,
  },
  formControl: {
    width: '100%',
  },
  buttonContainer: {
    color: 'linear-gradient(to right, #3333ff, #8080ff) 1 stretch',
    display: 'flex',
    justifyContent: 'space-evenly',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  selectBorder: {
    '& .MuiOutlinedInput-notchedOutline': {
      border: '2px solid',
      borderImage: 'linear-gradient(to right, #3333ff, #8080ff) 1 stretch',
    },
  },
  input: {
    color: 'white',
    borderColor: 'white',
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    width: 200,
  },

  cssLabel: {
    color: 'white',
  },

  cssOutlinedInput: {
    color: 'white',
    '&$cssFocused $notchedOutline': {
      borderColor: `linear-gradient(to right, #3333ff, #8080ff) 1 stretch`,
    },
  },

  cssFocused: {},

  notchedOutline: {
    border: '1px solid',
    borderImage: 'linear-gradient(to right, #3333ff, #8080ff) 1 stretch',
  },
}));

const notify = (message) => {
  console.log(message);
};

export default function SwapTokensDialog({ open, onClose }) {
  const classes = useStyles();
  const [fromCoin, setFromCoin] = useState('USDC');
  const [toCoin, setToCoin] = useState('SOL');
  const [pairExists, setPairExists] = useState(true);
  const [size, setSize] = useState(1);
  const [, setSubmitting] = useState(false);
  const [side, setSide] = useState('buy');
  // const openOrders = useOpenOrders();
  const openOrdersTest = useSelectedOpenOrdersAccount(true);
  const { baseCurrency, quoteCurrency, market, setMarketAddress } = useMarket();
  const openOrdersAccount = useSelectedOpenOrdersAccount(true);

  const baseCurrencyAccount = useSelectedBaseCurrencyAccount();
  const quoteCurrencyAccount = useSelectedQuoteCurrencyAccount();

  const [baseCurrencyPubkey, setBaseCurrencyPubkey] = useState(
    baseCurrencyAccount ? true : false,
  );

  const [quoteCurrencyPubkey, setQuoteCurrencyPubkey] = useState(
    quoteCurrencyAccount ? true : false,
  );

  let idConversionSuccessFul;

  let conversionFailed = false;
  const markPrice = useMarkPrice();
  const sendConnection = useSendConnection();
  const { wallet } = useWallet();

  let priceDecimalCount = market?.tickSize && getDecimalCount(market.tickSize);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const onChangeFrom = (e) => {
    setFromCoin(e.target.value);
  };

  const onChangeTo = (e) => {
    setToCoin(e.target.value);
  };

  const onChangeSize = (e) => {
    setSize(parseFloat(e.target.value));
  };

  useEffect(() => {
    setPairExists(doesPairExist(fromCoin, toCoin));
    if (findMarketAddress(fromCoin, toCoin)) {
      setMarketAddress(findMarketAddress(fromCoin, toCoin));
    }
  }, [fromCoin, setMarketAddress, toCoin]);

  useEffect(() => {
    if (fromCoin === 'USDC' || fromCoin === 'USDT') {
      setSide('buy');
    } else {
      setSide('sell');
    }
  }, [fromCoin, toCoin]);

  useEffect(() => {
    setQuoteCurrencyPubkey(quoteCurrencyAccount ? true : false);
    setBaseCurrencyPubkey(baseCurrencyAccount ? true : false);
  }, [baseCurrencyAccount, quoteCurrencyAccount]);

  const balanceInfo = useBalanceInfo(
    fromCoin === quoteCurrency
      ? quoteCurrencyAccount?.pubkey
      : baseCurrencyAccount?.pubkey,
  );

  async function onSettleFunds() {
    try {
      const walletSwap = new WalletSwap(wallet.publicKey.toBase58());
      const secretKey = wallet.account.secretKey;
      await settleFunds({
        market,
        openOrders: openOrdersAccount,
        connection: sendConnection,
        wallet: walletSwap,
        baseCurrencyAccount,
        quoteCurrencyAccount,
        secretKey: secretKey,
      });
    } catch (e) {
      notify({
        message: 'Error settling funds',
        description: e.message,
        type: 'error',
      });
    }
  }

  async function onSubmit(isMarketOrder) {
    const parsedPrice = !isMarketOrder
      ? parseFloat(markPrice)
      : isMarketOrder
      ? side === 'buy'
        ? parseFloat(roundToDecimal(markPrice * 1.05, priceDecimalCount))
        : parseFloat(roundToDecimal(markPrice * 0.95, priceDecimalCount))
      : null;

    const parsedSize = parseFloat(size);

    setSubmitting(true);
    const walletSwap = new WalletSwap(wallet.publicKey.toBase58());
    const secretKey = wallet.account.secretKey;
    let idConverting = enqueueSnackbar('Converting...', {
      variant: 'info',
      persist: false,
    });
    try {
      await placeOrder({
        side,
        price: parsedPrice,
        size: parsedSize,
        orderType: 'ioc',
        market,
        connection: sendConnection,
        walletSwap,
        secretKey,
        baseCurrencyAccount: baseCurrencyAccount?.pubkey,
        quoteCurrencyAccount: quoteCurrencyAccount?.pubkey,
        openOrders: openOrdersTest,
      });
    } catch (e) {
      conversionFailed = true;
      console.warn(e);
      notify({
        message: 'Error placing order',
        description: e.message,
        type: 'error',
      });
      enqueueSnackbar(`Error converting funds, ${e.message}`, {
        variant: 'error',
        persist: false,
      });
    } finally {
      setSubmitting(false);
      if (!conversionFailed) {
        closeSnackbar(idConverting);
        idConversionSuccessFul = enqueueSnackbar('Conversion successful..', {
          variant: 'success',
          persist: false,
        });
      }
    }
    if (!conversionFailed) {
      let idSettling = enqueueSnackbar('Settling Funds...', {
        variant: 'info',
        persist: false,
      });
      try {
        await onSettleFunds();
      } catch (e) {
        console.warn(e);
        notify({
          message: 'Error settling funds',
          description: e.message,
          type: 'error',
        });
        enqueueSnackbar(
          `Error settling funds, please settle manually. ${e.message}`,
          {
            variant: 'error',
            persist: false,
          },
        );
      } finally {
        refreshWalletPublicKeys(wallet);
        refreshAccountInfo(
          wallet.connection,
          baseCurrencyAccount?.pubkey,
          true,
        );
        refreshAccountInfo(
          wallet.connection,
          quoteCurrencyAccount.pubkey,
          true,
        );
        setSubmitting(false);
        closeSnackbar(idSettling);
        let idFundSettled = enqueueSnackbar('Funds settled', {
          variant: 'success',
          persist: false,
        });
        closeSnackbar(idFundSettled);
        closeSnackbar(idConversionSuccessFul);
        await sleep(1000);
        onClose();
      }
    }
  }

  return (
    <DialogForm open={open} onClose={onClose}>
      <DialogTitle>Swap Tokens</DialogTitle>
      <DialogContent>
        <Grid
          container
          direction="column"
          justify="center"
          alignItems="center"
          spacing={5}
        >
          <Grid item>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel
                id="demo-simple-select-outlined-label"
                style={{ color: 'white' }}
              >
                From Coin
              </InputLabel>
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={fromCoin}
                onChange={onChangeFrom}
                label="From Coin"
                className={classes.selectBorder}
              >
                <MenuItem value="">
                  <em>From Coin</em>
                </MenuItem>
                {PAIRS.map((e) => {
                  return <MenuItem value={e}>{e}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel id="demo-simple-select-outlined-label">
                To Coin
              </InputLabel>
              <Select
                labelId="demo-simple-select-outlined-label"
                id="demo-simple-select-outlined"
                value={toCoin}
                onChange={onChangeTo}
                label="To Coin"
                className={classes.selectBorder}
                style={{ color: 'white' }}
              >
                <MenuItem value="">
                  <em>To Coin</em>
                </MenuItem>
                {PAIRS.map((e) => {
                  return <MenuItem value={e}>{e}</MenuItem>;
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <TextField
              id="outlined-number"
              label="Size"
              type="number"
              onChange={onChangeSize}
              variant="outlined"
              value={size}
              InputLabelProps={{
                classes: {
                  root: classes.cssLabel,
                  focused: classes.cssFocused,
                },
              }}
              InputProps={{
                classes: {
                  root: classes.cssOutlinedInput,
                  focused: classes.cssFocused,
                  notchedOutline: classes.notchedOutline,
                },
              }}
              helperText={
                <>
                  <Typography variant="body2">
                    Max:{' '}
                    {balanceFormat.format(
                      balanceInfo?.amount / Math.pow(10, balanceInfo?.decimals),
                    )}
                    .
                  </Typography>
                </>
              }
            />
          </Grid>
        </Grid>
        {!pairExists && (
          <Typography style={{ paddingTop: 20 }}>
            The pair {fromCoin}/{toCoin} is not supported yet
          </Typography>
        )}
        {!quoteCurrencyPubkey && pairExists && (
          <Typography style={{ paddingTop: 20 }}>
            {quoteCurrency} account does not exist
          </Typography>
        )}
        {!baseCurrencyPubkey && pairExists && (
          <Typography style={{ paddingTop: 20 }}>
            {baseCurrency} account does not exist
          </Typography>
        )}
        {pairExists &&
        markPrice &&
        baseCurrencyPubkey &&
        quoteCurrencyPubkey ? (
          <>
            <center>
              <Typography style={{ paddingTop: 20 }}>
                {' '}
                Approximate price:
              </Typography>
              <br />
              <Typography>
                1 {baseCurrency} ={' '}
                {roundToDecimal(markPrice, priceDecimalCount)}
                {quoteCurrency}{' '}
              </Typography>
            </center>
          </>
        ) : !pairExists ? null : (
          <LoadingIndicator />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          variant="outlined"
          onClick={onClose}
          color="primary"
          className={classes.buttonContainer}
        >
          Close
        </Button>
        <Button
          variant="outlined"
          type="submit"
          color="primary"
          disabled={
            !pairExists ||
            size < 0.0001 ||
            !quoteCurrencyPubkey ||
            !baseCurrencyPubkey
          }
          className={classes.buttonContainer}
          onClick={() => onSubmit(true)}
        >
          Convert
        </Button>
      </DialogActions>
    </DialogForm>
  );
}

const doesPairExist = (fromCoin, toCoin) => {
  const pairs = MARKETS.map((e) => e.name);
  return (
    pairs.includes(fromCoin + '/' + toCoin) ||
    pairs.includes(toCoin + '/' + fromCoin)
  );
};

const findMarketAddress = (fromCoin, toCoin) => {
  if (
    USE_MARKETS.filter((e) => e.name === fromCoin + '/' + toCoin).length > 0
  ) {
    return USE_MARKETS.filter(
      (e) => e.name === fromCoin + '/' + toCoin,
    )[0].address.toBase58();
  }
  if (
    USE_MARKETS.filter((e) => e.name === toCoin + '/' + fromCoin).length > 0
  ) {
    return USE_MARKETS.filter(
      (e) => e.name === toCoin + '/' + fromCoin,
    )[0].address.toBase58();
  }
};
