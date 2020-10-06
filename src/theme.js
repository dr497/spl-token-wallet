import { createMuiTheme } from '@material-ui/core/styles';
export const theme = createMuiTheme({
  palette: {
    main: 'rgb(19, 24, 47)',
    background: {
      default: 'rgb(19, 24, 47)',
    },
  },
  //
  overrides: {
    MuiDialog: {
      color: 'white',
      root: {
        color: 'white',
      },
      paperScrollPaper: {
        color: 'white',
        backgroundColor: 'rgb(25,34,70)',
        border: '5px solid',
        borderImage: 'linear-gradient(to right, #3333ff, #8080ff) 1 stretch',
        alignItems: 'center',
        justifyContent: 'center',
      },
    },
    MuiDialogContent: {
      root: {
        color: 'white',
      },
    },
    MuiTypography: {
      colorPrimary: {
        color: 'white',
      },
      colorTextSecondary: {
        color: 'white',
      },
    },
    MuiDialogContentText: {
      root: {
        color: 'white',
      },
    },
    MuiTab: {
      wrapper: {
        color: 'white',
      },
    },
    MuiInputBase: {
      inputMultiline: {
        color: 'white',
      },
    },
    MuiButton: {
      label: {
        color: 'white',
      },
    },
    MuiInputLabel: {
      root: {
        color: 'white',
      },
    },
    MuiSvgIcon: {
      root: {
        fill: 'white',
      },
    },
    PrivateTabIndicator: {
      root: {
        height: '4px',
      },
    },
    MuiOutlinedInput: {
      input: {
        color: 'white',
      },
    },
    MuiMenu: {
      list: {
        color: 'white',
        background: 'rgb(25,34,70)',
      },
    },
    MuiFormHelperText: {
      root: {
        color: 'white',
      },
    },
  },
});
