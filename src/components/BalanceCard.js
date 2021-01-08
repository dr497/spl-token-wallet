import React, { useState } from 'react';
import LoadingIndicator from './LoadingIndicator';
import {
  useSolanaExplorerUrlSuffix,
  refreshAccountInfo,
} from '../utils/connection';
import {
  useBalanceInfo,
  useWallet,
  useWalletPublicKeys,
  refreshWalletPublicKeys,
} from '../utils/wallet';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import { makeStyles } from '@material-ui/core/styles';
import { getImageSource } from '../utils/icons';
import { Typography } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ZoomInIcon from '@material-ui/icons/ZoomIn';
import SendDialog from './SendDialog';
import DepositDialog from './DepositDialog';
import IconButton from '@material-ui/core/IconButton';
import AddTokenDialog from './AddTokenDialog';
import TokenInfoDialog from './TokenInfoDialog';
import DeleteIcon from '@material-ui/icons/Delete';
import CloseTokenAccountDialog from './CloseTokenAccountButton';
import Paper from '@material-ui/core/Paper';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import AddIcon from '@material-ui/icons/Add';
import Tooltip from '@material-ui/core/Tooltip';
import RefreshIcon from '@material-ui/icons/Refresh';
import addToken from '../assets/add_token.svg';

const balanceFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
  useGrouping: true,
});

const useStyles = makeStyles((theme) => ({
  address: {
    textOverflow: 'ellipsis',
    overflowX: 'hidden',
  },
  itemDetails: {
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'space-evenly',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  card: {
    height: '300px',
    width: '400px',
    maxWidth: '400px',
    color: 'white',
    backgroundColor: 'rgb(25,34,70)',
    border: '5px solid',
    borderImage: 'linear-gradient(to right, #3333ff, #8080ff) 1 stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paper: {
    background: 'transparent',
  },
}));

export default function BalancesList() {
  const wallet = useWallet();
  const [publicKeys, loaded] = useWalletPublicKeys();
  const [showAddTokenDialog, setShowAddTokenDialog] = useState(false);
  const classes = useStyles();
  return (
    <Paper elevation={0} className={classes.paper}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <Typography
            variant="h6"
            style={{ flexGrow: 1, color: 'white' }}
            component="h2"
          >
            Balances
          </Typography>
          <Tooltip title="Add Token" arrow>
            <IconButton onClick={() => setShowAddTokenDialog(true)}>
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh" arrow>
            <IconButton
              onClick={() => {
                refreshWalletPublicKeys(wallet);
                publicKeys.map((publicKey) =>
                  refreshAccountInfo(wallet.connection, publicKey, true),
                );
              }}
              style={{ marginRight: -12 }}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Grid
        container
        direction="row"
        justify="space-around"
        alignItems="center"
        spacing={5}
      >
        <Grid item>
          <BalanceCardAddToken />
        </Grid>
        {publicKeys.map((_, index) => (
          <Grid item>
            <BalanceCardItem
              publicKey={publicKeys[index]}
              key={`balance-card-item-${index}`}
            />
          </Grid>
        ))}

        {loaded ? null : <LoadingIndicator />}
      </Grid>
      <AddTokenDialog
        open={showAddTokenDialog}
        onClose={() => setShowAddTokenDialog(false)}
      />
    </Paper>
  );
}

export const BalanceCardItem = ({ publicKey }) => {
  const classes = useStyles();

  const urlSuffix = useSolanaExplorerUrlSuffix();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [tokenInfoDialogOpen, setTokenInfoDialogOpen] = useState(false);
  const [
    closeTokenAccountDialogOpen,
    setCloseTokenAccountDialogOpen,
  ] = useState(false);

  const balanceInfo = useBalanceInfo(publicKey);

  if (!balanceInfo) {
    return <LoadingIndicator delay={0} />;
  }

  let { amount, decimals, mint, tokenSymbol } = balanceInfo;

  return (
    <>
      <Card className={classes.card} variant="outlined">
        <CardContent>
          <center>
            <img
              src={getImageSource(tokenSymbol).default}
              style={{ height: '80px', paddingTop: 5, paddingRight: 5 }}
              alt={tokenSymbol}
            />
            <Typography variant="h5" component="h2">
              {balanceFormat.format(amount / Math.pow(10, decimals))}{' '}
              {tokenSymbol}
            </Typography>
            {mint ? (
              <Typography variant="caption" className={classes.address}>
                Token Address: {mint.toBase58()}
              </Typography>
            ) : null}
          </center>
        </CardContent>
        <CardActions style={{ justifyContent: 'center' }}>
          <Button
            style={{ borderRadius: 0 }}
            variant="outlined"
            color="primary"
            startIcon={<ArrowDownwardIcon />}
            onClick={() => setDepositDialogOpen(true)}
          >
            Receive
          </Button>
          <Button
            style={{ borderRadius: 0 }}
            variant="outlined"
            color="primary"
            startIcon={<ArrowUpwardIcon />}
            onClick={() => setSendDialogOpen(true)}
          >
            Send
          </Button>
          <Button
            style={{ borderRadius: 0 }}
            variant="outlined"
            color="primary"
            startIcon={<ZoomInIcon />}
            onClick={() =>
              (window.location.href =
                `https://explorer.solana.com/account/${publicKey.toBase58()}` +
                urlSuffix)
            }
          >
            Explore
          </Button>
        </CardActions>
        <CardActions style={{ justifyContent: 'center' }}>
          {mint && amount === 0 ? (
            <Button
              color="secondary"
              size="small"
              startIcon={<DeleteIcon />}
              onClick={() => setCloseTokenAccountDialogOpen(true)}
            />
          ) : null}
        </CardActions>
      </Card>
      <SendDialog
        open={sendDialogOpen}
        onClose={() => setSendDialogOpen(false)}
        balanceInfo={balanceInfo}
        publicKey={publicKey}
      />
      <DepositDialog
        open={depositDialogOpen}
        onClose={() => setDepositDialogOpen(false)}
        balanceInfo={balanceInfo}
        publicKey={publicKey}
      />
      <TokenInfoDialog
        open={tokenInfoDialogOpen}
        onClose={() => setTokenInfoDialogOpen(false)}
        balanceInfo={balanceInfo}
        publicKey={publicKey}
      />
      <CloseTokenAccountDialog
        open={closeTokenAccountDialogOpen}
        onClose={() => setCloseTokenAccountDialogOpen(false)}
        balanceInfo={balanceInfo}
        publicKey={publicKey}
      />
    </>
  );
};

export const BalanceCardAddToken = () => {
  const classes = useStyles();
  const [showAddTokenDialog, setShowAddTokenDialog] = useState(false);

  return (
    <>
      <Card className={classes.card} variant="outlined">
        <CardContent>
          <Grid
            container
            direction="row"
            justify="space-around"
            alignItems="center"
            spacing={5}
          >
            <Grid item>
              <IconButton onClick={() => setShowAddTokenDialog(true)}>
                <img src={addToken} alt="" style={{ paddingTop: 40 }} />
              </IconButton>
              <Typography variant="h5" component="h2">
                Add Token
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      <AddTokenDialog
        open={showAddTokenDialog}
        onClose={() => setShowAddTokenDialog(false)}
      />
    </>
  );
};
