import React, { useState } from "react"
import {
  Page,
  TopBar,
  Brand,
  WalletArea,
  WalletText,
  Avatar,
  Divider,
  Content,
  Grid,
  StreamerCard,
  StreamerAvatar,
  StreamerName,
  AddCard,
  AddCircle,
  AddPlus,
  AddLabel,
  DonateButton,
  AvatarInner,
  AvatarFront,
  AvatarBack,
} from "./HomePage.style";

import { INFLUENCERS_MOCK } from "../../assets/mock/influencers.mock";
import type { Influencer } from "../influencer-details/types";

import PlusIcon from "../../assets/Plus.png";

import Modal from "../../components/Modal/Modal"
import InfluencerDetailsContent from "../influencer-details/Influencer-Details";

import { AddInfluencerModal } from "../add-influencer/Add-Influencer"; // 경로 맞게 수정

// 업데이트 해야할 기능들
export default function Home(){
    const walletAddress = "0x1234...5678" // TODO: 지갑연결후 하드코딩 해제 필수!!
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [myInfluencers, setMyInfluencers] = useState<Influencer[]>([]);

    
    const onDonate = () => {
        // TODO: Donate flow 연결
        console.log("Donate Clicked")
    };

    const onAddStreamer = () => {
        // TODO: Add Stramer 모달/페이지 이동 연결
        console.log("Add Influencer Clicked")
        setIsAddModalOpen(true);
    }

    const [detailOpen, setDetailOpen] = useState(false)
    const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null)

    const onOpenDetail = (s: Influencer) => {
        setSelectedInfluencer(s);
        setDetailOpen(true);
    }

    const onCloseDetail = () => {
        setDetailOpen(false);
        setSelectedInfluencer(null);
    }

    const handleAddInfluencer = (inf: Influencer) => {
        // 중복 방지는 모달에서도 하지만, Home에서도 2중 방어 권장
        setMyInfluencers((prev) => {
        if (prev.some((p) => p.id === inf.id)) return prev;
        return [...prev, inf];
        });
    };


//-------------------------- html ----------

    return (
        <Page>
            <TopBar>
                <Brand>Crypto Donation</Brand>
                <WalletArea>
                    <WalletText>{walletAddress}</WalletText>
                    <Avatar aria-label="profile" />
                </WalletArea>
            </TopBar>

        <Divider />

        <Content>
            <Grid>
                {INFLUENCERS_MOCK.map((i) => (
                    <StreamerCard key = {i.id} tabIndex={0}>
                        <StreamerAvatar role="button"
                         tabIndex={0} onClick={() => onOpenDetail(i)}
                        >
                            <AvatarInner>
                                <AvatarFront>
                                    <img src={i.img} alt={i.name} />
                                </AvatarFront>

                                <AvatarBack>
                                    {i.description}
                                </AvatarBack>
                            </AvatarInner>
                        </StreamerAvatar>

                        <StreamerName>{i.name}</StreamerName>
                    </StreamerCard>
                ))}

                <AddCard role = "button" onClick={(e) => {e.stopPropagation(); onAddStreamer();}}>
                    <AddCircle>
                        <AddPlus src={PlusIcon} alt="Add streamer" />
                    </AddCircle>
                    <AddLabel>Add Influencer</AddLabel>
                </AddCard>
            </Grid>

            <DonateButton onClick={onDonate}>Donate</DonateButton>
        </Content>
        <Modal open = {detailOpen} onClose={onCloseDetail}>
            {selectedInfluencer && (
                <InfluencerDetailsContent influencer={selectedInfluencer}/>
            )}
        </Modal>
        <AddInfluencerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        myInfluencers={myInfluencers}
        onAdd={handleAddInfluencer}
      />

    </Page>
    )
}