import styled from "styled-components";

export const Wrap = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-start;
`;

export const Avatar = styled.img`
  width: 84px;
  height: 84px;
  border-radius: 14px;
  object-fit: cover;
  border: 1px solid rgba(0,0,0,0.08);
`;

export const Name = styled.div`
  font-size: 18px;
  font-weight: 700;
`;

export const Desc = styled.p`
  margin: 8px 0 0 0;
  font-size: 13px;
  line-height: 1.5;
  color: rgba(0,0,0,0.65);
`;
