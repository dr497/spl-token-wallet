import React from 'react';
import { useLocalStorageState } from '../utils/utils';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Hidden from '@material-ui/core/Hidden';

const useStyles = makeStyles((theme) => ({
  button: {
    marginLeft: theme.spacing(1),
    borderRadius: 0,
  },
}));

const LogOffButton = () => {
  const [walletUnlocked, setWalletUnlocked] = useLocalStorageState(
    'unlocked',
    null,
  );
  const [walletLocked, setWalletLocked] = useLocalStorageState('locked', null);
  const onClick = () => {
    setWalletLocked(null);
    setWalletUnlocked(null);
    window.location.reload(false);
  };
  const classes = useStyles();
  if (walletLocked || walletUnlocked) {
    return (
      <>
        <Hidden xsDown>
          <Button
            variant="outlined"
            color="primary"
            onClick={onClick}
            className={classes.button}
          >
            Log out
          </Button>
        </Hiden>
      </>
    );
  }
  return null;
};

export default LogOffButton;
