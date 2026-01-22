import React, { useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonAvatar,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonActionSheet,
  IonButton,
  IonButtons
} from '@ionic/react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { camera, mail, person, logoGoogle, logoGithub, keyOutline } from 'ionicons/icons';
import { useAuth } from '../contexts/AuthContext';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, updateProfilePicture, signOut } = useAuth();
  const [showActionSheet, setShowActionSheet] = useState(false);

  const handleLogout = async () => {
    await signOut();
    window.location.href = '/login';
  };

  const takePhoto = async (source: CameraSource) => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.DataUrl,
        source: source
      });

      if (image.dataUrl) {
        updateProfilePicture(image.dataUrl);
      }
    } catch (error) {
      console.log('Camera cancelled or error:', error);
    }
  };

  const getProviderIcon = () => {
    switch (user?.provider) {
      case 'google':
        return logoGoogle;
      case 'github':
        return logoGithub;
      default:
        return keyOutline;
    }
  };

  const getProviderLabel = () => {
    switch (user?.provider) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      default:
        return 'Email & Password';
    }
  };

  const getInitials = () => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>Logout</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Profile</IonTitle>
          </IonToolbar>
        </IonHeader>

        <div className="profile-header">
          <div className="avatar-container" onClick={() => setShowActionSheet(true)}>
            <IonAvatar className="profile-avatar">
              {user?.picture ? (
                <img src={user.picture} alt="Profile" />
              ) : (
                <div className="avatar-placeholder">{getInitials()}</div>
              )}
            </IonAvatar>
            <div className="camera-badge">
              <IonIcon icon={camera} />
            </div>
          </div>
          <h2 className="profile-name">{user?.name || 'User'}</h2>
          <p className="profile-email">{user?.email}</p>
        </div>

        <IonList inset>
          <IonItem>
            <IonIcon icon={person} slot="start" color="primary" />
            <IonLabel>
              <h3>Name</h3>
              <p>{user?.name || 'Not set'}</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon icon={mail} slot="start" color="primary" />
            <IonLabel>
              <h3>Email</h3>
              <p>{user?.email}</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon icon={getProviderIcon()} slot="start" color="primary" />
            <IonLabel>
              <h3>Sign-in Method</h3>
              <p>{getProviderLabel()}</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon icon={keyOutline} slot="start" color="primary" />
            <IonLabel>
              <h3>User ID</h3>
              <p className="user-id">{user?.id}</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header="Change Profile Picture"
          buttons={[
            {
              text: 'Take Photo',
              icon: camera,
              handler: () => takePhoto(CameraSource.Camera)
            },
            {
              text: 'Choose from Gallery',
              icon: 'images',
              handler: () => takePhoto(CameraSource.Photos)
            },
            {
              text: 'Cancel',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;
