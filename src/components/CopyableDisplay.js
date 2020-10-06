import React, { useRef } from 'react';
import { TextField } from '@material-ui/core';
import CopyIcon from 'mdi-material-ui/ContentCopy';
import { makeStyles } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import QrcodeIcon from 'mdi-material-ui/Qrcode';
import QRCode from 'qrcode.react';
import DialogContent from '@material-ui/core/DialogContent';
import IconButton from '@material-ui/core/IconButton';
import Dialog from '@material-ui/core/Dialog';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    alignItems: 'baseline',
  },
  buttonContainer: {
    color: 'rgb(127, 131, 247)',
    display: 'flex',
    justifyContent: 'space-evenly',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
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

export default function CopyableDisplay({
  value,
  label,
  autoFocus,
  qrCode,
  helperText,
}) {
  const { enqueueSnackbar } = useSnackbar();
  const textareaRef = useRef();
  const classes = useStyles();
  const copyLink = () => {
    let textArea = textareaRef.current;
    if (textArea) {
      textArea.select();
      document.execCommand('copy');
      enqueueSnackbar(`Copied ${label}`, {
        variant: 'info',
        autoHideDuration: 2500,
      });
    }
  };

  return (
    <div className={classes.root}>
      <TextField
        inputRef={(ref) => (textareaRef.current = ref)}
        multiline
        autoFocus={autoFocus}
        value={value}
        readOnly
        onFocus={(e) => e.currentTarget.select()}
        className={classes.textArea}
        fullWidth
        helperText={helperText}
        label={label}
        spellCheck={false}
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
      <IconButton onClick={copyLink}>
        <CopyIcon />
      </IconButton>
      {qrCode ? <Qrcode value={qrCode === true ? value : qrCode} /> : null}
    </div>
  );
}

const useQrCodeStyles = makeStyles((theme) => ({
  qrcodeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
}));

function Qrcode({ value }) {
  const [showQrcode, setShowQrcode] = React.useState(false);
  const classes = useQrCodeStyles();

  return (
    <>
      <IconButton onClick={() => setShowQrcode(true)}>
        <QrcodeIcon />
      </IconButton>
      <Dialog open={showQrcode} onClose={() => setShowQrcode(false)}>
        <DialogContent className={classes.qrcodeContainer}>
          <QRCode value={value} size={256} includeMargin />
        </DialogContent>
      </Dialog>
    </>
  );
}
