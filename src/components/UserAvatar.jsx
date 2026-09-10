import React, { useEffect, useState } from 'react';
import { getSellerAvatar } from '../utils/sellerAvatar';

function UserAvatar({ profile, fallbackLabel = 'User', className = '', useSellerDefault = false }) {
  const uploadedPhoto = profile?.photoURL
    || profile?.profilePhotoURL
    || profile?.profileImageUrl
    || profile?.profileImageURL
    || profile?.profilePicture
    || profile?.avatarUrl
    || profile?.avatarURL
    || '';
  const sellerAvatar = useSellerDefault ? getSellerAvatar(profile) : { src: uploadedPhoto, fallbackSrc: '' };
  const [imageSrc, setImageSrc] = useState(sellerAvatar.src);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageSrc(sellerAvatar.src);
    setImageFailed(false);
  }, [sellerAvatar.src, sellerAvatar.fallbackSrc]);

  const handleImageError = () => {
    if (sellerAvatar.fallbackSrc && imageSrc !== sellerAvatar.fallbackSrc) {
      setImageSrc(sellerAvatar.fallbackSrc);
      return;
    }
    setImageFailed(true);
  };

  const initials = (profile?.displayName || profile?.name || profile?.businessName || profile?.email || fallbackLabel)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || fallbackLabel.charAt(0).toUpperCase();

  return (
    <span className={`user-avatar ${className}`.trim()} aria-hidden="true">
      {imageSrc && !imageFailed
        ? <img src={imageSrc} alt="" onError={handleImageError} />
        : <span>{initials}</span>}
    </span>
  );
}

export default UserAvatar;
