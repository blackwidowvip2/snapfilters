import React from 'react';
import { useStore } from '../store/useStore';
import styles from './Preview.module.css';

export const Preview: React.FC = () => {
  const { capturedImage, setCapturedImage } = useStore();

  if (!capturedImage) return null;

  const handleSave = () => {
    const a = document.createElement('a');
    a.href = capturedImage;
    a.download = `snapfilter-${Date.now()}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setCapturedImage(null);
  };

  return (
    <div className={styles.wrap}>
      <img className={styles.img} src={capturedImage} alt="Foto" />
      <div className={styles.actions}>
        <button className={styles.btn} onClick={() => setCapturedImage(null)}>
          Slet
        </button>
        <button className={`${styles.btn} ${styles.primary}`} onClick={handleSave}>
          Gem
        </button>
      </div>
    </div>
  );
};
