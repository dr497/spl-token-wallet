import React, { useState } from 'react';
import { useLocalStorageState } from '../utils/utils';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';
import Hidden from '@material-ui/core/Hidden';

const ShowSeedButton = () => {
  const [seedWords] = useLocalStorageState('unlocked', '');
  const [open, setOpen] = useState(false);
  if (!seedWords) {
    return null;
  }
  return (
    <>
      <Hidden xsDown>
        <Button
          variant="outlined"
          onClick={() => setOpen(true)}
          type="submit"
          color="primary"
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
      </Hidden>
    </>
  );
};

export default ShowSeedButton;
