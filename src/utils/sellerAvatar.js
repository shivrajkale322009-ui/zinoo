import avatar1 from '../assets/seller-avatars/seller-avatar-1.svg';
import avatar2 from '../assets/seller-avatars/seller-avatar-2.svg';
import avatar3 from '../assets/seller-avatars/seller-avatar-3.svg';
import avatar4 from '../assets/seller-avatars/seller-avatar-4.svg';
import avatar5 from '../assets/seller-avatars/seller-avatar-5.svg';

const SELLER_DEFAULT_AVATARS = [avatar1, avatar2, avatar3, avatar4, avatar5];

const hashSellerId = (value) => {
  let hash = 0;
  const source = String(value || 'zinoo-seller');
  for (let index = 0; index < source.length; index += 1) {
    hash = ((hash << 5) - hash + source.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
};

export const getSellerAvatar = (user = {}) => {
  const uploaded = user.photoURL || user.profilePhotoURL || user.profileImageUrl || user.avatarUrl || '';
  const sellerId = user.uid || user.id || user.sellerId || user.email || user.phoneNumber || user.displayName || user.businessName;
  const defaultAvatar = SELLER_DEFAULT_AVATARS[hashSellerId(sellerId) % SELLER_DEFAULT_AVATARS.length];

  return {
    src: uploaded || defaultAvatar,
    fallbackSrc: uploaded ? defaultAvatar : '',
    isDefault: !uploaded
  };
};

export default getSellerAvatar;
