import React, { useEffect, useState } from 'react';
import {
  QueryClient,
  QueryClientProvider,
} from 'react-query';
import { withLDProvider } from 'launchdarkly-react-client-sdk';
import { ReactQueryDevtools } from 'react-query/devtools';
import TagManager from 'react-gtm-module';
import PropTypes from 'prop-types';
import Link from 'next/link';
import { Provider } from 'react-redux';
import { ChakraProvider } from '@chakra-ui/react';
import { CacheProvider } from '@chakra-ui/next-js';
import { PrismicProvider } from '@prismicio/react';
import { PrismicPreview } from '@prismicio/next';
import { repositoryName } from '../../prismicio';
import wrapper from '../store';
import CustomTheme from '../../styles/theme';
import NavbarSession from '../common/components/Navbar';
import AuthProvider from '../common/context/AuthContext';
import ConnectionProvider from '../common/context/ConnectionContext';
import Footer from '../common/components/Footer';
import Helmet from '../common/components/Helmet';
import InterceptionLoader from '../common/components/InterceptionLoader';

import '../../styles/globals.css';
import '../../styles/react-tags-input.css';
import '../../styles/markdown.css';
import '../../styles/phoneInput/index.css';
import '../../styles/datePicker.css';

import '@fontsource/lato/100.css';
import '@fontsource/lato/300.css';
import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/900.css';

function InternalLinkComponent(props) {
  return <Link {...props} />;
}

function App({ Component, ...rest }) {
  const [hasMounted, setHasMounted] = useState(false);
  const { store, props } = wrapper.useWrappedStore(rest);
  const pageProps = props?.pageProps || {};

  const queryClient = new QueryClient();

  useEffect(() => {
    setHasMounted(true);
    TagManager.initialize({ gtmId: process.env.TAG_MANAGER_KEY });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Helmet
          {...pageProps.seo}
        />
        <CacheProvider>
          <ChakraProvider resetCSS theme={CustomTheme}>

            <AuthProvider>
              <ConnectionProvider>
                {hasMounted && <NavbarSession pageProps={pageProps} translations={pageProps?.translations} />}
                <InterceptionLoader />

                <PrismicProvider internalLinkComponent={InternalLinkComponent}>
                  <PrismicPreview repositoryName={repositoryName}>
                    <Component {...pageProps} />
                  </PrismicPreview>
                </PrismicProvider>

                {hasMounted && <Footer pageProps={pageProps} />}
              </ConnectionProvider>
            </AuthProvider>
          </ChakraProvider>
        </CacheProvider>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
    </QueryClientProvider>
  );
}

App.propTypes = {
  pageProps: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  Component: PropTypes.elementType.isRequired,
};

export default withLDProvider({
  clientSideID: process.env.LD_CLIENT_ID,
  options: {
    bootstrap: 'localStorage',
  },
})(App);
