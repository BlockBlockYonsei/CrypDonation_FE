import styled from "styled-components";

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
`;

export const Modal = styled.div`
  width: min(520px, calc(100vw - 32px));
  max-height: calc(100vh - 64px);
  border-radius: 14px;
  background: #fff;
  overflow: hidden;
  display: flex;
  flex-direction: column;
`;

export const Header = styled.div`
  padding: 16px 16px 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 18px;
`;

export const CloseBtn = styled.button`
  border: 0;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
`;

export const Body = styled.div`
  padding: 16px 24px 20px 16px; /* 오른쪽 padding을 스크롤바 공간 확보를 위해 더 크게 */
  overflow-y: auto;
  overflow-x: hidden;
  flex: 1;
  max-height: calc(100vh - 120px);
  background: #fff;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  box-sizing: border-box;
  
  /* 스크롤바 스타일링 - border-radius 안쪽에 위치하도록 */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 0 0 14px 0;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
    
    &:hover {
      background: rgba(0, 0, 0, 0.3);
    }
  }
  
  /* Firefox 스크롤바 */
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
`;

export const Label = styled.div`
  font-size: 13px;
  margin-bottom: 8px;
  color: #444;
`;

export const Input = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid #ddd;
  outline: none;
  box-sizing: border-box;
`;

export const Dropdown = styled.div`
  margin-top: 8px;
  border: 1px solid #eee;
  border-radius: 10px;
  overflow: hidden;
`;

export const Item = styled.button`
  width: 100%;
  padding: 12px;
  border: 0;
  background: #fff;
  text-align: left;
  cursor: pointer;
  display: flex;
  align-items: baseline;
  justify-content: space-between;

  &:hover {
    background: #f7f7f7;
  }
`;

export const ItemMain = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

export const ItemSub = styled.div`
  font-size: 12px;
  color: #777;
`;

export const Status = styled.div<{ $error?: boolean }>`
  margin-top: 10px;
  font-size: 13px;
  color: ${(p) => (p.$error ? "#c0392b" : "#2d3436")};
`;

export const Actions = styled.div`
  margin-top: 16px;
  margin-bottom: 4px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

export const SecondaryBtn = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
`;

export const PrimaryBtn = styled.button`
  height: 40px;
  padding: 0 14px;
  border-radius: 10px;
  border: 0;
  background: #111;
  color: #fff;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const LinkItem = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0; /* flex 아이템이 부모를 넘지 않도록 */
`;

export const LinkInput = styled(Input)`
  flex: 1;
  min-width: 0; /* flex 아이템이 부모를 넘지 않도록 */
`;

export const SmallButton = styled.button`
  height: 36px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
  background: #fff;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;

  &:hover {
    background: #f7f7f7;
  }
`;

export const AddLinkButton = styled(SmallButton)`
  border-color: #111;
  background: #111;
  color: #fff;

  &:hover {
    background: #333;
  }
`;

export const RemoveLinkButton = styled(SmallButton)`
  border-color: #e74c3c;
  color: #e74c3c;

  &:hover {
    background: #ffeaea;
  }
`;

export const TagSection = styled.div`
  margin-top: 16px;
`;

export const TagGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

export const TagCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  user-select: none;

  &:hover {
    background: #f7f7f7;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
`;
