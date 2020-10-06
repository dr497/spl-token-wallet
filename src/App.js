import React, { Suspense } from 'react';
import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import NavigationFrame from './components/NavigationFrame';
import { ConnectionProvider } from './utils/connection';
import WalletPage from './pages/WalletPage';
import { useWallet, WalletProvider } from './utils/wallet';
import LoadingIndicator from './components/LoadingIndicator';
import { SnackbarProvider } from 'notistack';
import PopupPage from './pages/PopupPage';
import LoginPage from './pages/LoginPage';
import { theme } from './theme';
import { MarketProvider } from './utils/markets';
export default function App() {
  // TODO: add toggle for dark mode

  // Disallow rendering inside an iframe to prevent clickjacking.
  if (window.self !== window.top) {
    return null;
  }

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ConnectionProvider>
          <MarketProvider>
            <WalletProvider>
              <SnackbarProvider maxSnack={5} autoHideDuration={8000}>
                <NavigationFrame>
                  <Suspense fallback={<LoadingIndicator />}>
                    <PageContents />
                  </Suspense>
                </NavigationFrame>
              </SnackbarProvider>
            </WalletProvider>
          </MarketProvider>
        </ConnectionProvider>
      </ThemeProvider>
    </Suspense>
  );
}

function PageContents() {
  const { wallet } = useWallet();
  if (!wallet) {
    return <LoginPage />;
  }
  if (window.opener) {
    return <PopupPage opener={window.opener} />;
  }
  return <WalletPage />;
}
