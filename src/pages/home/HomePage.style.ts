import styled from "styled-components";

const ui = {
  bg: "#EEF1F4",
  topBarBg: "#FFFFFF",
  border: "#C9D0D9",
  muted: "#8B95A1",
  text: "#111827",
  cardFill: "#9AA3AF",
  cardStroke: "#5B6470",
  buttonBg: "#1F2937",
  buttonText: "#FFFFFF",
};

const layout = {
  pagePaddingX: "24px",
  contentPaddingTop: "56px",
  maxWidth: "1200px",
  gridGap: "56px",
  cardWidth: "220px",
  cardAvatar: "150px",
  cardNameWidth: "140px",
  cardNameHeight: "20px",
  donateWidth: "260px",
  donateHeight: "64px",
  radiusSm: "10px",
  radiusMd: "14px",
  line: "2px",
};

export const Page = styled.div`
  min-height: 100vh;
  background: ${ui.bg};
  color: ${ui.text};
`;

//----Nav Bar
export const TopBar = styled.header`
  height: 64px;
  background: ${ui.topBarBg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 ${layout.pagePaddingX};
`;

export const Brand = styled.div`
  font-family: "Arial Black", "Arial Bold", "Segoe UI Black",
    "Helvetica Neue Condensed Black", Arial, sans-serif;

  font-size: 22px;
  font-weight: 900; /* Black 계열 강조 */
  letter-spacing: -0.4px;
  line-height: 1;
  white-space: nowrap;
`;


export const WalletArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const WalletText = styled.div`
  font-size: 14px;
  color: ${ui.muted};
`;

export const Avatar = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: ${ui.muted};
`;

export const Divider = styled.div`
  height: 1px;
  background: ${ui.border};
`;

export const Content = styled.main`
  padding: ${layout.contentPaddingTop} ${layout.pagePaddingX} 80px;
  max-width: ${layout.maxWidth};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

//----기본 UI
export const Grid = styled.section`
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(${layout.cardWidth}, 1fr));
  gap: ${layout.gridGap};
  justify-items: center;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(3, minmax(${layout.cardWidth}, 1fr));
  }

  @media (max-width: 820px) {
    grid-template-columns: repeat(2, minmax(${layout.cardWidth}, 1fr));
    gap: 36px;
  }

  @media (max-width: 520px) {
    grid-template-columns: repeat(1, minmax(${layout.cardWidth}, 1fr));
  }
`;

export const StreamerCard = styled.div`
  width: ${layout.cardWidth};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  cursor: pointer;
  user-select: none;
`;

//---- 스트리머 프로필사진  
export const StreamerAvatar = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 999px;
  overflow: hidden;
  border: 2px sold ${ui.cardStroke};
  background: ${ui.cardFill};

  perspective: 900px;
  /* hover하면 내부가 회전 */
  &:hover > div {
    transform: rotateY(180deg);
  }
`;

export const AvatarInner = styled.div`
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 999px;
  transition: transform 0.65s ease;
  transform-style: preserve-3d;
`;

export const AvatarFront = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 999px;
  overflow: hidden;
  border: 2px solid ${ui.cardStroke};
  background: ${ui.cardFill};
  backface-visibility: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const AvatarBack = styled.div`
  position: absolute;
  inset: 0;
  border-radius: 999px;
  border: 2px solid ${ui.cardStroke};
  background: ${ui.buttonBg};
  color: ${ui.buttonText};

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;

  font-size: 12px;
  line-height: 1.4;
  text-align: center;

  transform: rotateY(180deg);
  backface-visibility: hidden;
`;


//---- 스트리머 이름
export const StreamerName = styled.div`
  width: ${layout.cardNameWidth};
  height: ${layout.cardNameHeight};
  border-radius: ${layout.radiusSm};
  background: ${ui.cardFill};
  opacity: 0.85;
  text-align: center;
`;

//---- 스트리머 더하기
export const AddCard = styled.div`
  width: ${layout.cardWidth};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
`;

export const AddCircle = styled.button`
  width: ${layout.cardAvatar};
  height: ${layout.cardAvatar};
  border-radius: 999px;
  border: ${layout.line} dashed ${ui.cardStroke};
  background: #fff;

  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;
  padding: 0;
`;

export const AddPlus = styled.img`
  width: 48px;   
  height: 48px;
  object-fit: contain;
`;

export const AddLabel = styled.div`
  font-size: 14px;
  color: ${ui.cardStroke};
  font-weight: 600;
`;

//---- 도네이션
export const DonateButton = styled.button`
  margin-top: 56px;
  width: ${layout.donateWidth};
  height: ${layout.donateHeight};
  border-radius: ${layout.radiusMd};
  border: 0;
  background: ${ui.buttonBg};
  color: ${ui.buttonText};
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;

  &:active {
    transform: translateY(1px);
  }
`;
