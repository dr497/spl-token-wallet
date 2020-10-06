import React, { useEffect, useState } from 'react';
import {
  generateMnemonicAndSeed,
  hasLockedMnemonicAndSeed,
  loadMnemonicAndSeed,
  mnemonicToSeed,
  storeMnemonicAndSeed,
} from '../utils/wallet-seed';
import Container from '@material-ui/core/Container';
import LoadingIndicator from '../components/LoadingIndicator';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { Typography } from '@material-ui/core';
import TextField from '@material-ui/core/TextField';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import { useCallAsync } from '../utils/notifications';
import Link from '@material-ui/core/Link';
import { makeStyles } from '@material-ui/core/styles';
import clsx from 'clsx';

const useStyles = makeStyles((theme) => ({
  buttonContainer: {
    color: 'rgb(127, 131, 247)',
    display: 'flex',
    justifyContent: 'space-evenly',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  card: {
    color: 'white',
    backgroundColor: 'rgb(25,34,70)',
    border: '5px solid',
    borderImage: 'linear-gradient(to right, #3333ff, #8080ff) 1 stretch',
    alignItems: 'center',
    justifyContent: 'center',
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

export default function LoginPage() {
  const [restore, setRestore] = useState(false);
  return (
    <Container maxWidth="sm">
      {restore ? (
        <RestoreWalletForm goBack={() => setRestore(false)} />
      ) : (
        <>
          {hasLockedMnemonicAndSeed() ? <LoginForm /> : <CreateWalletForm />}
          <br />
          <Link
            style={{ cursor: 'pointer', color: 'white' }}
            onClick={() => setRestore(true)}
          >
            Restore existing wallet
          </Link>
        </>
      )}
    </Container>
  );
}

function CreateWalletForm() {
  const [mnemonicAndSeed, setMnemonicAndSeed] = useState(null);
  useEffect(() => {
    generateMnemonicAndSeed().then(setMnemonicAndSeed);
  }, []);
  const [savedWords, setSavedWords] = useState(false);
  const callAsync = useCallAsync();

  function submit(password) {
    const { mnemonic, seed } = mnemonicAndSeed;
    callAsync(storeMnemonicAndSeed(mnemonic, seed, password), {
      progressMessage: 'Creating wallet...',
      successMessage: 'Wallet created',
    });
  }

  if (!savedWords) {
    return (
      <SeedWordsForm
        mnemonicAndSeed={mnemonicAndSeed}
        goForward={() => setSavedWords(true)}
      />
    );
  }

  return (
    <ChoosePasswordForm
      mnemonicAndSeed={mnemonicAndSeed}
      goBack={() => setSavedWords(false)}
      onSubmit={submit}
    />
  );
}

function SeedWordsForm({ mnemonicAndSeed, goForward }) {
  const [confirmed, setConfirmed] = useState(false);
  const classes = useStyles();
  return (
    <Card className={classes.card} variant="outlined">
      <CardContent style={{ color: 'white' }}>
        <Typography variant="h5" gutterBottom>
          Create New Wallet
        </Typography>
        <Typography paragraph>
          Create a new wallet to hold Solana and SPL tokens.
        </Typography>
        <Typography>
          Please write down the following twelve words and keep them in a safe
          place:
        </Typography>
        {mnemonicAndSeed ? (
          <TextField
            variant="outlined"
            fullWidth
            multiline
            margin="normal"
            value={mnemonicAndSeed.mnemonic}
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
        ) : (
          <LoadingIndicator />
        )}
        <Typography paragraph>
          Your private keys are only stored on your current computer or device.
          You will need these words to restore your wallet if your browser's
          storage is cleared or your device is damaged or lost.
        </Typography>
        <FormControlLabel
          control={
            <StyledCheckbox
              checked={confirmed}
              disabled={!mnemonicAndSeed}
              onChange={(e) => setConfirmed(e.target.checked)}
            />
          }
          label="I have saved these words in a safe place."
        />
      </CardContent>
      <CardActions style={{ justifyContent: 'flex-end' }}>
        <Button
          className={classes.buttonContainer}
          color="primary"
          disabled={!confirmed}
          onClick={goForward}
          variant="outlined"
        >
          Continue
        </Button>
      </CardActions>
    </Card>
  );
}

function ChoosePasswordForm({ goBack, onSubmit }) {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const classes = useStyles();

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Choose a Password (Optional)
        </Typography>
        <Typography>
          Optionally pick a password to protect your wallet.
        </Typography>
        <TextField
          variant="outlined"
          fullWidth
          margin="normal"
          label="New Password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        <TextField
          variant="outlined"
          fullWidth
          margin="normal"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
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
        <Typography>
          If you forget your password you will need to restore your wallet using
          your seed words.
        </Typography>
      </CardContent>
      <CardActions style={{ justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          className={classes.buttonContainer}
          onClick={goBack}
          color="primary"
        >
          Back
        </Button>
        <Button
          className={classes.buttonContainer}
          variant="outlined"
          color="primary"
          disabled={password !== passwordConfirm}
          onClick={() => onSubmit(password)}
        >
          Create Wallet
        </Button>
      </CardActions>
    </Card>
  );
}

function LoginForm() {
  const classes = useStyles();
  const [password, setPassword] = useState('');
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const callAsync = useCallAsync();

  function submit() {
    callAsync(loadMnemonicAndSeed(password, stayLoggedIn), {
      progressMessage: 'Unlocking wallet...',
      successMessage: 'Wallet unlocked',
    });
  }

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Unlock Wallet
        </Typography>
        <TextField
          variant="outlined"
          fullWidth
          margin="normal"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        <FormControlLabel
          control={
            <Checkbox
              checked={stayLoggedIn}
              onChange={(e) => setStayLoggedIn(e.target.checked)}
            />
          }
          label="Keep wallet unlocked"
        />
      </CardContent>
      <CardActions style={{ justifyContent: 'flex-end' }}>
        <Button color="primary" onClick={submit}>
          Unlock
        </Button>
      </CardActions>
    </Card>
  );
}

function RestoreWalletForm({ goBack }) {
  const classes = useStyles();
  const [mnemonic, setMnemonic] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const callAsync = useCallAsync();

  function submit() {
    callAsync(
      mnemonicToSeed(mnemonic).then((seed) =>
        storeMnemonicAndSeed(mnemonic, seed, password),
      ),
    );
  }

  return (
    <Card className={classes.card}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Restore Existing Wallet
        </Typography>
        <Typography>
          Restore your wallet using your twelve seed words. Note that this will
          delete any existing wallet on this device.
        </Typography>
        <TextField
          variant="outlined"
          fullWidth
          multiline
          rows={3}
          margin="normal"
          label="Seed Words"
          value={mnemonic}
          onChange={(e) => setMnemonic(e.target.value)}
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
        <TextField
          variant="outlined"
          fullWidth
          margin="normal"
          label="New Password (Optional)"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        <TextField
          variant="outlined"
          fullWidth
          margin="normal"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          value={passwordConfirm}
          onChange={(e) => setPasswordConfirm(e.target.value)}
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
      </CardContent>
      <CardActions style={{ justifyContent: 'space-between' }}>
        <Button
          className={classes.buttonContainer}
          variant="outlined"
          color="primary"
          onClick={goBack}
        >
          Cancel
        </Button>
        <Button
          className={classes.buttonContainer}
          variant="outlined"
          color="primary"
          disabled={password !== passwordConfirm}
          onClick={submit}
        >
          Restore
        </Button>
      </CardActions>
    </Card>
  );
}

const useStylesCheckBox = makeStyles({
  root: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  icon: {
    borderRadius: 3,
    width: 16,
    height: 16,
    boxShadow:
      'inset 0 0 0 1px rgba(16,22,26,.2), inset 0 -1px 0 rgba(16,22,26,.1)',
    backgroundColor: '#f5f8fa',
    backgroundImage:
      'linear-gradient(180deg,hsla(0,0%,100%,.8),hsla(0,0%,100%,0))',
    '$root.Mui-focusVisible &': {
      outline: '2px auto rgba(19,124,189,.6)',
      outlineOffset: 2,
    },
    'input:hover ~ &': {
      backgroundColor: '#ebf1f5',
    },
    'input:disabled ~ &': {
      boxShadow: 'none',
      background: 'rgba(206,217,224,.5)',
    },
  },
  checkedIcon: {
    backgroundColor: '#137cbd',
    backgroundImage:
      'linear-gradient(180deg,hsla(0,0%,100%,.1),hsla(0,0%,100%,0))',
    '&:before': {
      display: 'block',
      width: 16,
      height: 16,
      backgroundImage:
        "url(\"data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath" +
        " fill-rule='evenodd' clip-rule='evenodd' d='M12 5c-.28 0-.53.11-.71.29L7 9.59l-2.29-2.3a1.003 " +
        "1.003 0 00-1.42 1.42l3 3c.18.18.43.29.71.29s.53-.11.71-.29l5-5A1.003 1.003 0 0012 5z' fill='%23fff'/%3E%3C/svg%3E\")",
      content: '""',
    },
    'input:hover ~ &': {
      backgroundColor: '#106ba3',
    },
  },
});

function StyledCheckbox(props) {
  const classes = useStylesCheckBox();

  return (
    <Checkbox
      className={classes.root}
      disableRipple
      color="default"
      checkedIcon={<span className={clsx(classes.icon, classes.checkedIcon)} />}
      icon={<span className={classes.icon} />}
      inputProps={{ 'aria-label': 'decorative checkbox' }}
      {...props}
    />
  );
}
