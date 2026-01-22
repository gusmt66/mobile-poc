import React, { useState } from 'react';
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonItem,
  IonList,
  IonText,
  IonIcon,
  IonSpinner,
  useIonRouter
} from '@ionic/react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { logoGithub, mail } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { signInWithEmail, signUpWithEmail, signInWithGoogleCredential, signInWithGitHub } = useAuth();
  const router = useIonRouter();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = isSignUp
      ? await signUpWithEmail(email, password)
      : await signInWithEmail(email, password);

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      router.push('/tabs/tab1', 'forward', 'replace');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setError(null);
    if (credentialResponse.credential) {
      const { error } = await signInWithGoogleCredential(credentialResponse.credential);
      if (error) {
        setError(error.message);
      } else {
        router.push('/tabs/tab1', 'forward', 'replace');
      }
    } else {
      setError('Google sign-in failed: No credential received');
    }
  };

  const handleGoogleError = () => {
    setError('Google sign-in failed. Please try again.');
  };

  const handleGitHubLogin = async () => {
    setError(null);
    setLoading(true);
    const { error } = await signInWithGitHub();
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push('/tabs/tab1', 'forward', 'replace');
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" fullscreen>
        <div className="login-container">
          <div className="login-header">
            <img src="/logo.png" alt="Company Logo" className="login-logo" />
            <h1>{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
            <p>{isSignUp ? 'Sign up to get started' : 'Sign in to continue'}</p>
          </div>

          {error && (
            <IonText color="danger" className="error-message">
              <p>{error}</p>
            </IonText>
          )}

          <div className="oauth-buttons">
            <div className="google-login-wrapper">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="filled_blue"
                size="large"
                width="100%"
                text="continue_with"
              />
            </div>

            <IonButton
              expand="block"
              onClick={handleGitHubLogin}
              disabled={loading}
              className="github-button"
              color="dark"
            >
              <IonIcon slot="start" icon={logoGithub} />
              Continue with GitHub
            </IonButton>
          </div>

          <div className="divider">
            <span>or</span>
          </div>

          <form onSubmit={handleEmailAuth}>
            <IonList>
              <IonItem>
                <IonInput
                  type="email"
                  label="Email"
                  labelPlacement="floating"
                  value={email}
                  onIonInput={(e) => setEmail(e.detail.value || '')}
                  required
                />
              </IonItem>
              <IonItem>
                <IonInput
                  type="password"
                  label="Password"
                  labelPlacement="floating"
                  value={password}
                  onIonInput={(e) => setPassword(e.detail.value || '')}
                  required
                />
              </IonItem>
            </IonList>

            <IonButton
              expand="block"
              type="submit"
              disabled={loading}
              className="email-button"
            >
              {loading ? (
                <IonSpinner name="crescent" />
              ) : (
                <>
                  <IonIcon slot="start" icon={mail} />
                  {isSignUp ? 'Sign Up' : 'Sign In'} with Email
                </>
              )}
            </IonButton>
          </form>

          <div className="toggle-auth-mode">
            <IonText>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <span className="toggle-link" onClick={() => setIsSignUp(!isSignUp)}>
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </span>
            </IonText>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Login;
