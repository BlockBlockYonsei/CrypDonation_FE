import React from "react";
import * as S from "./Add-Influencer.style";
import type { Influencer } from "../influencer-details/types";


type Props = {
  isOpen: boolean;
  onClose: () => void;
  myInfluencers: Influencer[];        
  onAdd: (inf: Influencer) => void;     
};


export function AddInfluencerModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <S.Overlay onClick={onClose} role="presentation">
      <S.Modal onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <S.Header>
          <S.Title>인플루언서 추가</S.Title>
          <S.CloseBtn onClick={onClose} aria-label="Close">
            ×
          </S.CloseBtn>
        </S.Header>

        <S.Body>
          <S.Label>이름으로 검색</S.Label>

          <S.Input placeholder="인플루언서 이름을 입력하세요" />

          {/* 데모용 자동완성 리스트(고정 UI) */}
          <S.Dropdown>
            <S.Item type="button">
              <S.ItemMain>테스터훈</S.ItemMain>
              <S.ItemSub>0x12ab...90cd</S.ItemSub>
            </S.Item>

            <S.Item type="button">
              <S.ItemMain>오빠두엑셀</S.ItemMain>
              <S.ItemSub>0x98fe...11aa</S.ItemSub>
            </S.Item>

            <S.Item type="button">
              <S.ItemMain>디지털거북이</S.ItemMain>
              <S.ItemSub>0x77cc...33dd</S.ItemSub>
            </S.Item>
          </S.Dropdown>

          {/* 데모용 상태 메시지(원하면 한 줄만 남기고 나머지 삭제) */}
          <S.Status $error>이미 추가한 인플루언서 입니다.</S.Status>
          {/* <S.Status $error>아직 인플루언서가 가입하지 않았습니다!</S.Status> */}

          <S.Actions>
            <S.SecondaryBtn type="button" onClick={onClose}>
              취소
            </S.SecondaryBtn>
            <S.PrimaryBtn type="button">추가하기</S.PrimaryBtn>
          </S.Actions>
        </S.Body>
      </S.Modal>
    </S.Overlay>
  );
}
