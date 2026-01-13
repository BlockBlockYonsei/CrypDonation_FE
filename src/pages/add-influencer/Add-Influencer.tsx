import { useState, useEffect } from "react";
import * as S from "./Add-Influencer.style";
import type { Influencer, TagId } from "../influencer-details/types";
import { TAGS } from "../../assets/tags";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  myInfluencers: Influencer[];
  onAdd: (inf: Influencer) => void;
  currentWalletAddress: string;
};

export function AddInfluencerModal({
  isOpen,
  onClose,
  myInfluencers,
  onAdd,
  currentWalletAddress,
}: Props) {
  const [name, setName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [description, setDescription] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [selectedTags, setSelectedTags] = useState<TagId[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState(false);

  // 모달이 열릴 때 폼을 리셋하고 현재 지갑 주소를 자동으로 채움
  useEffect(() => {
    if (isOpen) {
      setName("");
      setDescription("");
      setProfileImageUrl("");
      setLinks([""]);
      setSelectedTags([]);
      setStatusMessage(null);
      setStatusError(false);
      if (currentWalletAddress) {
        setWalletAddress(currentWalletAddress);
      } else {
        setWalletAddress("");
      }
    }
  }, [isOpen, currentWalletAddress]);

  if (!isOpen) return null;

  const resetForm = () => {
    setName("");
    setWalletAddress("");
    setDescription("");
    setProfileImageUrl("");
    setLinks([""]);
    setSelectedTags([]);
    setStatusMessage(null);
    setStatusError(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    if (!name.trim() || !walletAddress.trim()) {
      setStatusMessage("이름과 지갑 주소는 필수입니다.");
      setStatusError(true);
      return;
    }

    const isDuplicate = myInfluencers.some(
      (inf) =>
        inf.name === name.trim() ||
        inf.wallet.walletAddress === walletAddress.trim()
    );

    if (isDuplicate) {
      setStatusMessage("이미 추가한 인플루언서 입니다.");
      setStatusError(true);
      return;
    }

    const validLinks = links.filter((link) => link.trim() !== "");

    const newInfluencer: Influencer = {
      id: `local-${Date.now()}`,
      name: name.trim(),
      description: description.trim() || "설명이 아직 등록되지 않았어요.",
      img: profileImageUrl.trim() || "",
      creator_urls: validLinks,
      wallet: {
        walletAddress: walletAddress.trim(),
        suiBalanceMist: "0",
        suiBalanceSuiDisplay: "0",
      },
      tags: selectedTags,
    };

    onAdd(newInfluencer);
    setStatusMessage("인플루언서를 추가했습니다!");
    setStatusError(false);
    handleClose();
  };

  return (
    <S.Overlay onClick={handleClose} role="presentation">
      <S.Modal
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <S.Header>
          <S.Title>인플루언서 추가</S.Title>
          <S.CloseBtn onClick={handleClose} aria-label="Close">
            ×
          </S.CloseBtn>
        </S.Header>

        <S.Body>
          <S.Label>인플루언서 이름</S.Label>
          <S.Input
            placeholder="인플루언서 이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <S.Label style={{ marginTop: 16 }}>지갑 주소</S.Label>
          <S.Input
            placeholder="도네이션을 받을 지갑 주소를 입력하세요 (현재 지갑 주소가 자동으로 채워집니다)"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />

          <S.Label style={{ marginTop: 16 }}>프로필 이미지 URL (선택)</S.Label>
          <S.Input
            placeholder="프로필 이미지 URL을 입력하세요"
            value={profileImageUrl}
            onChange={(e) => setProfileImageUrl(e.target.value)}
          />

          <S.Label style={{ marginTop: 16 }}>한 줄 소개</S.Label>
          <S.Input
            as="textarea"
            rows={3}
            placeholder="팬들에게 보여질 한 줄 소개를 적어주세요"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ resize: "vertical", paddingTop: 8, paddingBottom: 8 }}
          />

          <S.Label style={{ marginTop: 16 }}>채널/링크 (선택)</S.Label>
          <S.LinkList>
            {links.map((link, index) => (
              <S.LinkItem key={index}>
                <S.LinkInput
                  placeholder="유튜브, 치지직 등 채널 링크"
                  value={link}
                  onChange={(e) => {
                    const newLinks = [...links];
                    newLinks[index] = e.target.value;
                    setLinks(newLinks);
                  }}
                />
                {links.length > 1 && (
                  <S.RemoveLinkButton
                    type="button"
                    onClick={() => {
                      const newLinks = links.filter((_, i) => i !== index);
                      setLinks(newLinks);
                    }}
                  >
                    삭제
                  </S.RemoveLinkButton>
                )}
              </S.LinkItem>
            ))}
            <S.AddLinkButton
              type="button"
              onClick={() => setLinks([...links, ""])}
            >
              + 링크 추가
            </S.AddLinkButton>
          </S.LinkList>

          <S.TagSection>
            <S.Label>태그 선택 (선택)</S.Label>
            <S.TagGrid>
              {Object.entries(TAGS).map(([id, label]) => {
                const tagId = Number(id) as TagId;
                return (
                  <S.TagCheckbox key={tagId}>
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tagId)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTags([...selectedTags, tagId]);
                        } else {
                          setSelectedTags(
                            selectedTags.filter((t) => t !== tagId)
                          );
                        }
                      }}
                    />
                    <span>{label}</span>
                  </S.TagCheckbox>
                );
              })}
            </S.TagGrid>
          </S.TagSection>

          {statusMessage && (
            <S.Status $error={statusError}>{statusMessage}</S.Status>
          )}

          <S.Actions>
            <S.SecondaryBtn type="button" onClick={handleClose}>
              취소
            </S.SecondaryBtn>
            <S.PrimaryBtn
              type="button"
              onClick={handleSubmit}
              disabled={!name.trim() || !walletAddress.trim()}
            >
              추가하기
            </S.PrimaryBtn>
          </S.Actions>
        </S.Body>
      </S.Modal>
    </S.Overlay>
  );
}
