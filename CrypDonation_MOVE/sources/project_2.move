module CrypDonation_MOVE::project_2;
use std::string::{String};
use sui::url::{Self, Url};
use sui::clock::{Self, Clock};
use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::balance::{Self, Balance};
use sui::event;
// use sui::transfer;
// use sui::object::{Self, UID, ID};
use sui::tx_context::{Self, TxContext};
use sui::package;
use sui::display;

// === Errors ===
const EProjectExpired: u64 = 1;
const EInvalidAmount: u64 = 2;
const EProjectNotActive: u64 = 4;
const EWrongAdminCap: u64 = 5;
const EProjectNotFailed: u64 = 6; 
const EWrongProjectNFT: u64 = 7;

// === Enums ===
public enum ProjectStatus has store, drop, copy {
    ACTIVE,
    SUCCESS,
    FAILED,
    CANCELLED
}

// === Structs ===
public struct PROJECT_2 has drop {}

public struct ProjectAdminCap has key, store {
    id: UID,
    project_id: ID
}

public struct Reward has store, drop {
    amount: u64,
    title: String,
    description: String
}

public struct Project has key {
    id: UID,
    title: String,
    description: String,
    category: String,
    thumbnail: Url,
    cover_image: Url,
    goal_amount: u64,
    raised_amount: u64,
    balance: Balance<SUI>,
    supporters_count: u64,
    created_at: u64,
    duration: u64,
    rewards: vector<Reward>,
    status: ProjectStatus
}

public struct DonationNFT has key, store {
    id: UID,
    project_id: ID,
    project_title: String,
    amount_donated: u64,
    img_url: Url,
    timestamp_ms: u64
}

// === Events ===
public struct DonationEvent has copy, drop {
    project_id: ID,
    donor: address,
    amount: u64,
    timestamp: u64
}

public struct StatusChanged has copy, drop {
    project_id: ID,
    status: ProjectStatus
}

// === Init ===
fun init(otw: PROJECT_2, ctx: &mut TxContext) {
    let keys = vector[
        b"name".to_string(),
        b"image_url".to_string(),
        b"description".to_string(),
    ];
    let values = vector[
        b"{project_title} Supporter NFT".to_string(),
        b"{img_url}".to_string(),
        b"Proof of donation for {project_title}".to_string(),
    ];
    let publisher = package::claim(otw, ctx);
    let mut display = display::new_with_fields<DonationNFT>(
        &publisher, keys, values, ctx
    );
    display::update_version(&mut display);
    transfer::public_share_object(display);
    package::burn_publisher(publisher);
}

// === Public Functions ===
public fun create_project(
    title: String,
    description: String,
    category: String,
    thumbnail_url: vector<u8>,
    cover_url: vector<u8>,
    goal_amount: u64, 
    duration: u64,
    rewards: vector<Reward>,
    clock: &Clock, 
    ctx: &mut TxContext
) : ID {
    let project_uid = object::new(ctx);
    let project_id = object::uid_to_inner(&project_uid);

    let project = Project {
        id: project_uid,
        title,
        description,
        category,
        thumbnail: url::new_unsafe_from_bytes(thumbnail_url),
        cover_image: url::new_unsafe_from_bytes(cover_url),
        goal_amount,
        raised_amount: 0,
        balance: balance::zero(),
        supporters_count: 0,
        created_at: clock::timestamp_ms(clock),
        duration,
        rewards,
        status: ProjectStatus::ACTIVE,
    };

    let admin_cap = ProjectAdminCap {
        id: object::new(ctx),
        project_id: project_id
    };

    let id = project.id.to_inner();

    transfer::share_object(project);
    transfer::public_transfer(admin_cap, tx_context::sender(ctx));

    id
}

public fun donate(
    project: &mut Project,
    payment: Coin<SUI>, 
    clock: &Clock,
    ctx: &mut TxContext
) {
    assert!(project.status == ProjectStatus::ACTIVE, EProjectNotActive);

    let current_time = clock::timestamp_ms(clock);
    let deadline = project.created_at + project.duration;
    assert!(current_time <= deadline, EProjectExpired);

    let amount = coin::value(&payment);
    assert!(amount > 0, EInvalidAmount);

    balance::join(&mut project.balance, coin::into_balance(payment));
    project.raised_amount = project.raised_amount + amount;
    project.supporters_count = project.supporters_count + 1;

    if (project.raised_amount >= project.goal_amount) {
        project.status = ProjectStatus::SUCCESS;
    };

    let nft = DonationNFT {
        id: object::new(ctx),
        project_id: object::uid_to_inner(&project.id),
        project_title: project.title, 
        amount_donated: amount,
        img_url: project.thumbnail, 
        timestamp_ms: current_time
    };
    transfer::public_transfer(nft, tx_context::sender(ctx));

    event::emit(DonationEvent {
        project_id: object::uid_to_inner(&project.id),
        donor: tx_context::sender(ctx),
        amount,
        timestamp: current_time
    });
}

public fun check_project_status(project: &mut Project, clock: &Clock) {
    if (project.status != ProjectStatus::ACTIVE) { return };
    let current_time = sui::clock::timestamp_ms(clock);
    let deadline = project.created_at + project.duration;

    if (current_time > deadline) {
        if (project.raised_amount >= project.goal_amount) {
            project.status = ProjectStatus::SUCCESS;
        } else {
            project.status = ProjectStatus::FAILED;
        };
        event::emit(StatusChanged {
            project_id: object::uid_to_inner(&project.id),
            status: project.status
        });
    };
}

public fun refund_donation(
    project: &mut Project,
    nft: DonationNFT,
    ctx: &mut TxContext
) {
    let status = project.status;
    assert!(status == ProjectStatus::FAILED || status == ProjectStatus::CANCELLED, EProjectNotFailed);
    let DonationNFT { id, project_id, amount_donated, .. } = nft;
    assert!(object::uid_to_inner(&project.id) == project_id, EWrongProjectNFT);
    object::delete(id);
    let refund_coin = coin::take(&mut project.balance, amount_donated, ctx);
    transfer::public_transfer(refund_coin, tx_context::sender(ctx));
}

public fun cancel_project(cap: &ProjectAdminCap, project: &mut Project, _ctx: &mut TxContext) {
    assert!(cap.project_id == object::uid_to_inner(&project.id), EWrongAdminCap);
    assert!(project.status == ProjectStatus::ACTIVE, EProjectNotActive);
    project.status = ProjectStatus::CANCELLED;
    event::emit(StatusChanged { project_id: cap.project_id, status: ProjectStatus::CANCELLED });
}

public fun withdraw_funds(cap: &ProjectAdminCap, project: &mut Project, ctx: &mut TxContext) {
    assert!(cap.project_id == object::uid_to_inner(&project.id), EWrongAdminCap);
    let total_amount = balance::value(&project.balance);
    let cash = coin::take(&mut project.balance, total_amount, ctx);
    transfer::public_transfer(cash, tx_context::sender(ctx));
}