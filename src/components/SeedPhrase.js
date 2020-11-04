import React, { useState } from 'react';
import { useLocalStorageState } from '../utils/utils';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Dialog from '@material-ui/core/Dialog';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles((theme) => ({
  button: {
    marginLeft: theme.spacing(1),
  },
}));

const ShowSeedButton = () => {
  // const classes = useStyles();
  const [seedWords] = useLocalStorageState('unlocked', '');
  const [open, setOpen] = useState(false);
  if (!seedWords) {
    return null;
  }
  return (
    <>
      <Button onClick={() => setOpen(true)} type="submit" color="inherit">
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
              // InputLabelProps={{
              //   classes: {
              //     root: classes.cssLabel,
              //     focused: classes.cssFocused,
              //   },
              // }}
              // InputProps={{
              //   classes: {
              //     root: classes.cssOutlinedInput,
              //     focused: classes.cssFocused,
              //     notchedOutline: classes.notchedOutline,
              //   },
              // }}
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

export default ShowSeedButton;
