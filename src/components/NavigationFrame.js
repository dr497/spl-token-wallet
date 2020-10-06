import React, { useState } from 'react';
import Toolbar from '@material-ui/core/Toolbar';
import AppBar from '@material-ui/core/AppBar';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import { useConnectionConfig, MAINNET_URL } from '../utils/connection';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { clusterApiUrl } from '@solana/web3.js';
import { useWalletSelector } from '../utils/wallet';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import CheckIcon from '@material-ui/icons/Check';
import AddIcon from '@material-ui/icons/Add';
import AccountIcon from '@material-ui/icons/AccountCircle';
import Divider from '@material-ui/core/Divider';
import Hidden from '@material-ui/core/Hidden';
import IconButton from '@material-ui/core/IconButton';
import SolanaIcon from './SolanaIcon';
import CodeIcon from '@material-ui/icons/Code';
import Tooltip from '@material-ui/core/Tooltip';
import { useLocalStorageState } from '../utils/utils';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import logo from '../assets/logo-big.svg';

const PaperProps = {
  style: {
    color: 'white',
    backgroundColor: 'rgb(25,34,70)',
    border: '2px solid',
    borderImage: 'linear-gradient(to right, #3333ff, #8080ff) 1 stretch',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const useStyles = makeStyles((theme) => ({
  content: {
    flexGrow: 1,
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  },
  title: {
    flexGrow: 1,
  },
  button: {
    marginLeft: theme.spacing(1),
  },
  menuItemIcon: {
    minWidth: 32,
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

export default function NavigationFrame({ children }) {
  const classes = useStyles();
  return (
    <>
      <AppBar position="static" style={{ background: 'transparent' }}>
        <Toolbar>
          <img
            src={logo}
            alt="logo"
            style={{ width: '40px', paddingRight: 10 }}
          />
          <Typography variant="h6" className={classes.title} component="h1">
            Bonfida Wallet
          </Typography>
          <Trading />
          <ShowSeedWords />
          <WalletSelector />
          <NetworkSelector />
        </Toolbar>
      </AppBar>
      <main className={classes.content}>{children}</main>
      <Footer />
    </>
  );
}

function NetworkSelector() {
  const { endpoint, setEndpoint } = useConnectionConfig();
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();

  const networks = [
    MAINNET_URL,
    clusterApiUrl('devnet'),
    clusterApiUrl('testnet'),
    'http://localhost:8899',
  ];

  const networkLabels = {
    [MAINNET_URL]: 'Mainnet Beta',
    [clusterApiUrl('devnet')]: 'Devnet',
    [clusterApiUrl('testnet')]: 'Testnet',
  };

  return (
    <>
      <Hidden xsDown>
        <Button
          style={{ borderRadius: 0 }}
          variant="outlined"
          color="primary"
          onClick={(e) => setAnchorEl(e.target)}
          className={classes.button}
        >
          {networkLabels[endpoint] ?? 'Network'}
        </Button>
      </Hidden>
      <Hidden smUp>
        <Tooltip title="Select Network" arrow>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.target)}>
            <SolanaIcon />
          </IconButton>
        </Tooltip>
      </Hidden>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        getContentAnchorEl={null}
        PaperProps={PaperProps}
      >
        {networks.map((network) => (
          <MenuItem
            key={network}
            onClick={() => {
              setAnchorEl(null);
              setEndpoint(network);
            }}
            selected={network === endpoint}
          >
            <ListItemIcon className={classes.menuItemIcon}>
              {network === endpoint ? <CheckIcon fontSize="small" /> : null}
            </ListItemIcon>
            {network}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function WalletSelector() {
  const { addresses, walletIndex, setWalletIndex } = useWalletSelector();
  const [anchorEl, setAnchorEl] = useState(null);
  const classes = useStyles();

  if (addresses.length === 0) {
    return null;
  }

  return (
    <>
      <Hidden xsDown>
        <Button
          style={{ borderRadius: 0 }}
          variant="outlined"
          color="primary"
          onClick={(e) => setAnchorEl(e.target)}
          className={classes.button}
        >
          Account
        </Button>
      </Hidden>
      <Hidden smUp>
        <Tooltip title="Select Account" arrow>
          <IconButton color="inherit" onClick={(e) => setAnchorEl(e.target)}>
            <AccountIcon />
          </IconButton>
        </Tooltip>
      </Hidden>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        getContentAnchorEl={null}
        PaperProps={PaperProps}
      >
        {addresses.map((address, index) => (
          <MenuItem
            key={address.toBase58()}
            onClick={() => {
              setAnchorEl(null);
              setWalletIndex(index);
            }}
            selected={index === walletIndex}
          >
            <ListItemIcon className={classes.menuItemIcon}>
              {index === walletIndex ? <CheckIcon fontSize="small" /> : null}
            </ListItemIcon>
            {address.toBase58()}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => {
            setAnchorEl(null);
            setWalletIndex(addresses.length);
          }}
        >
          <ListItemIcon className={classes.menuItemIcon}>
            <AddIcon fontSize="small" />
          </ListItemIcon>
          Create Account
        </MenuItem>
      </Menu>
    </>
  );
}

const useFooterStyles = makeStyles((theme) => ({
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    margin: theme.spacing(2),
  },
}));

export function Footer() {
  const classes = useFooterStyles();
  return (
    <footer className={classes.footer}>
      <Button
        style={{ borderRadius: 0 }}
        variant="outlined"
        color="primary"
        component="a"
        target="_blank"
        rel="noopener"
        href="https://github.com/serum-foundation/spl-token-wallet"
        startIcon={<CodeIcon />}
      >
        View Source
      </Button>
    </footer>
  );
}

const ShowSeedWords = () => {
  const classes = useStyles();
  const [seedWords] = useLocalStorageState('unlocked', '');
  const [open, setOpen] = React.useState(false);
  if (!seedWords) {
    return null;
  }
  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        type="submit"
        color="primary"
        variant="outlined"
        style={{ borderRadius: 0 }}
      >
        Show Seed
      </Button>
      <Dialog open={open}>
        <DialogContent style={{ paddingTop: 16 }}>
          <DialogContentText>
            <TextField
              variant="outlined"
              fullWidth
              multiline
              margin="normal"
              value={seedWords?.mnemonic}
              label="Seed Words"
              onFocus={(e) => e.currentTarget.select()}
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
            />
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            type="submit"
            color="primary"
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Trading = () => {
  return (
    <>
      <Button
        onClick={() => (window.location.href = 'https://bonfida.com/dex')}
        type="submit"
        color="primary"
        variant="outlined"
        style={{ marginRight: '8px', borderRadius: 0 }}
      >
        Trading
      </Button>
    </>
  );
};
