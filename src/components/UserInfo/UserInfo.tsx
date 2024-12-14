import styles from './UserInfo.module.css';
import { useAuth } from '../../context/AuthContext';

function UserInfo() {
  const { user, loading, signOut } = useAuth();
  const { displayName, photoURL, authorizations } = user || {};

  console.log('auth user is?', authorizations)

  console.log('got user', photoURL)

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.userInfo}>
      <img src={photoURL || ''} alt={displayName || ''} className={styles.avatarImg} />
      <div className={styles.displayName}>
        {displayName}
      </div>
      {authorizations &&
        <div>
          {authorizations.inventory &&
            <div>
              {authorizations.inventory['loren-inventory'] && 'loren-inventory' + ' ' + authorizations.inventory['loren-inventory'].role}
            </div>
            }
        </div>}
      <button onClick={signOut} className={styles.signOutButton}>
        Sign Out
      </button>
    </div>
  );
}

export default UserInfo;