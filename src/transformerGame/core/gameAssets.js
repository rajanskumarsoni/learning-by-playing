import angryManagerImg from '../../assets/angry_manager.png';
import managerDaikiImg from '../../assets/manager_daiki.png';
import managerRyokoImg from '../../assets/manager_ryoko.png';
import managerViktorImg from '../../assets/manager_viktor.png';
import managerHiroshiImg from '../../assets/manager_hiroshi.png';
import mentorAdaImg from '../../assets/mentor_ada.jpg';
import heroImg from '../../assets/hero.png';
import devilImg from '../../assets/devil.png';

export {
  angryManagerImg,
  managerDaikiImg,
  managerRyokoImg,
  managerViktorImg,
  managerHiroshiImg,
  mentorAdaImg,
  heroImg,
  devilImg
};

export const AI_MANAGER_AVATARS = {
  angry_manager: angryManagerImg,
  manager_daiki: managerDaikiImg,
  manager_ryoko: managerRyokoImg,
  manager_viktor: managerViktorImg,
  manager_hiroshi: managerHiroshiImg,
  mentor_ada: mentorAdaImg
};

export function getManagerAvatar(avatarKey) {
  return AI_MANAGER_AVATARS[avatarKey] || mentorAdaImg;
}
