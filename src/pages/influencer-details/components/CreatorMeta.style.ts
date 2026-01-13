import styled from "styled-components";

export const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 10px;
`;

export const MetaRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 8px 0;
`;

export const MetaLabel = styled.div`
  font-size: 13px;
  color: rgba(0,0,0,0.6);
`;

export const MetaValue = styled.div`
  font-size: 13px;
  color: rgba(0,0,0,0.85);
  text-align: right;
  word-break: break-all;
`;

export const Divider = styled.div`
  height: 1px;
  background: rgba(0,0,0,0.08);
  margin: 14px 0;
`;

export const List = styled.ul`
  margin: 0;
  padding-left: 18px;
`;

export const Item = styled.li`
  margin: 6px 0;
`;

export const Link = styled.a`
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
`;
