import React, { type ReactNode, useCallback, useEffect } from 'react';
import { SharedErrorBoundary, Button } from './SharedErrorBoundary';
import * as Updates from 'expo-updates';
import { SplashScreen } from 'expo-router/build/exports';
import { Platform, ScrollView, Text, View } from 'react-native';
import { reportErrorToRemote } from './report-error-to-remote';

type ErrorBoundaryState = { hasError: boolean; error: unknown | null; sentLogs: boolean };

/** Returns a user-facing message string from an error. */
function getErrorMessage(error: unknown | null): string {
  if (error == null) return 'An unexpected error occurred.';
  if (typeof error === 'object' && error !== null && 'message' in error && typeof (error as Error).message === 'string') {
    return (error as Error).message;
  }
  try {
    return String(error);
  } catch {
    return 'An unexpected error occurred.';
  }
}

/** Returns the stack trace string from an error, or null. */
function getErrorStack(error: unknown | null): string | null {
  if (error == null) return null;
  if (typeof error === 'object' && error !== null && 'stack' in error && typeof (error as Error).stack === 'string') {
    return (error as Error).stack;
  }
  return null;
}

/** Device-level error boundary: shows error UI with reload/send logs and reports to remote. */
const DeviceErrorBoundary = ({
  error,
}: {
  error: unknown | null;
}) => {
  useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);
  const handleReload = useCallback(async () => {
    if (Platform.OS === 'web') {
      window.location.reload();
      return;
    }
    Updates.reloadAsync().catch(() => {});
  }, []);

  const message = getErrorMessage(error);
  const stack = getErrorStack(error);

  return (
    <SharedErrorBoundary
      isOpen
      description={message}
    >
      <View style={{ gap: 8 }}>
        {stack ? (
          <ScrollView
            style={{ maxHeight: 120 }}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            <Text style={{ color: '#959697', fontSize: 11, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }} selectable>
              {stack}
            </Text>
          </ScrollView>
        ) : null}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button color="primary" onPress={handleReload}>
            Restart app
          </Button>
        </View>
      </View>
    </SharedErrorBoundary>
  );
};

export class DeviceErrorBoundaryWrapper extends React.Component<
  {
    children: ReactNode;
  },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false, error: null, sentLogs: false };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { hasError: true, error, sentLogs: false };
  }
  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo): void {
    this.setState({ error });
    reportErrorToRemote({ error })
      .then(({ success, error: fetchError }) => {
        this.setState({ hasError: true, sentLogs: success });
      })
      .catch((reportError) => {
        this.setState({ hasError: true, sentLogs: false });
      });
  }

  render() {
    if (this.state.hasError) {
      return <DeviceErrorBoundary error={this.state.error} />;
    }
    return this.props.children;
  }
}
