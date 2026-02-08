module CrypDonation_MOVE::dashboard_2;
// use sui::object::{Self, UID, ID};
use sui::tx_context::{Self, TxContext};
// use sui::transfer;
use std::vector;

// === Errors ===
const EDuplicateError: u64 = 0;

// === Structs ===

/// 대시보드: 생성된 모든 프로젝트의 ID를 저장하는 공유 객체
public struct Dashboard has key {
    id: UID,
    project_ids: vector<ID>
}

/// 관리자 권한 (대시보드 유지보수용)
public struct AdminCap has key, store {
    id: UID,
}

// === Init ===

fun init(ctx: &mut TxContext) {
    let admin_cap = AdminCap { id: object::new(ctx) };
    
    transfer::transfer(admin_cap, tx_context::sender(ctx));

    // 대시보드 초기화 및 공유
    let dashboard = Dashboard {
        id: object::new(ctx),
        project_ids: vector::empty<ID>()
    };

    transfer::share_object(dashboard);
}

// === Public Functions ===

/// 새로운 프로젝트 ID 등록 (누구나 호출 가능)
/// project 모듈에서 create_project 호출 후, 반환된 ID를 이용해 이 함수를 호출합니다.
public fun register_project(
    self: &mut Dashboard,
    project_id: ID
) {
    // 중복 등록 방지
    assert!(!vector::contains(&self.project_ids, &project_id), EDuplicateError);
    
    vector::push_back(&mut self.project_ids, project_id);
}

// === Admin Functions ===

/// 부적절한 프로젝트 링크 삭제 (관리자 전용)
public fun remove_project(
    _cap: &AdminCap, 
    self: &mut Dashboard,
    project_id: ID
) {
    let (exists, index) = vector::index_of(&self.project_ids, &project_id);
    if (exists) {
        vector::remove(&mut self.project_ids, index);
    };
}

// === Getter Functions ===

/// 등록된 모든 프로젝트 ID 반환
public fun get_projects(self: &Dashboard): vector<ID> {
    self.project_ids
}

/// 현재 등록된 프로젝트 개수 반환 (유틸리티)
public fun get_project_count(self: &Dashboard): u64 {
    vector::length(&self.project_ids)
}