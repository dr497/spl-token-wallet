import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useLocalStorageState } from '../utils/utils';
import Button from '@material-ui/core/Button';
import fetch from 'node-fetch';
import { useSnackbar } from 'notistack';
import { useWalletPublicKeys } from '../utils/wallet';
import Hidden from '@material-ui/core/Hidden';

const useStyles = makeStyles((theme) => ({
  button: {
    marginRight: theme.spacing(1),
    borderRadius: 0,
  },
}));

const AirdropButton = () => {
  const [publicKeys, loaded] = useWalletPublicKeys();
  const classes = useStyles();
  const [airdropClaimed, setAirdropClaimed] = useLocalStorageState(
    'airdropClaimed',
    false,
  );
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const onClick = async () => {
    try {
      let id = enqueueSnackbar('Requesting airdrop...', {
        variant: 'info',
        persist: true,
      });
      console.log('publicKeys[0].toBase58()', publicKeys[0].toBase58());
      const result = await postSolAirdrop(publicKeys[0].toBase58());
      console.log('result', result);

      closeSnackbar(id);
      if (result.success) {
        enqueueSnackbar('Airdrop confirmed', {
          variant: 'success',
          autoHideDuration: 15000,
        });
        setAirdropClaimed(true);
      } else {
        enqueueSnackbar(`Failed - ${result.data}`, {
          variant: 'error',
          autoHideDuration: 15000,
        });
      }
    } catch (err) {
      enqueueSnackbar('Airdrop failed - Try again', {
        variant: 'error',
        autoHideDuration: 15000,
      });
    }
  };

  if (airdropClaimed || !loaded) {
    return null;
  }

  return (
    <>
      <Hidden xsDown>
        <Button
          variant="outlined"
          color="primary"
          disabled={airdropClaimed}
          onClick={onClick}
          className={classes.button}
        >
          Claim Airdrop
        </Button>
      </Hidden>
    </>
  );
};

export default AirdropButton;

const AIRDROP_URL = 'https://wallet-api.bonfida.com/airdrop/post';

export async function apiPost(path, body, headers) {
  try {
    let response = await fetch(path, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: headers,
    });
    if (!response.ok) {
      return [];
    }
    let json = await response.json();
    return json;
  } catch (err) {
    console.log(err);
    return [];
  }
}

const getAirdrop = async (address) => {
  try {
    const response = await fetch(AIRDROP_URL + address);
    if (!response.ok) {
      return new Error(
        `Error getting airdrop - Response status ${response.status}`,
      );
    }
    const json = await response.json();
    return json;
  } catch (err) {
    return new Error(`Error getting airdrop ${err}`);
  }
};

async function postSolAirdrop(address) {
  console.log('Address', address);
  const results = await apiPost(
    AIRDROP_URL,
    { publicKey: address },
    { jdksnjfsdnfj: 'sdjnfkdnfjkdsnf', 'Content-Type': 'application/json' },
  );
  if (results.length === 0) {
    return { success: false, data: 'Try again later' };
  }
  return results;
}
