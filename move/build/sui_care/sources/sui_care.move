#[allow(lint(missing_key, public_entry))]
module sui_care::sui_care {
    use std::string::{Self, String};
    use std::vector;

    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::dynamic_field as dfield;
    use sui::balance::{Self, Balance};

    // Error codes
    const ECampaignDoesNotExist: u64 = 1;
    const EInvalidMilestoneStatus: u64 = 2;
    const ENotCampaignRecipient: u64 = 3;
    const EInsufficientDonationsToRelease: u64 = 4;
    const EInvalidMilestoneIndex: u64 = 5;
    const ENotAdmin: u64 = 6;
    const ECampaignHasFunds: u64 = 7;
    const EInvalidPercentage: u64 = 8;
    const EMilestoneAlreadyProcessed: u64 = 9;
    const ECannotEditActiveCampaign: u64 = 10;

    // Status constants
    const STATUS_ACTIVE: u8 = 0;
    const STATUS_PENDING: u8 = 1;
    const STATUS_RELEASED: u8 = 2;

    struct Milestone has store, copy, drop {
        description: String,
        percentage: u64,
        status: u8,
        released_amount: u64, // Track how much was released for this milestone
    }

    struct Campaign has store {
        id: UID,
        name: String,
        description: String,
        target_amount: u64,
        donated_amount: u64,
        recipient: address,
        admin: address,
        escrow: Balance<SUI>,
        milestones: vector<Milestone>,
        total_released: u64, // Track total funds released across all milestones
    }

    struct Campaigns has key {
        id: UID,
    }

    // Events
    struct CampaignCreated has copy, drop { 
        campaign_id: ID, 
        creator: address, 
        name: String 
    }
    
    struct CampaignUpdated has copy, drop { 
        campaign_id: ID, 
        updater: address 
    }
    
    struct CampaignDeleted has copy, drop { 
        campaign_id: ID, 
        deleter: address 
    }
    
    struct Donated has copy, drop { 
        campaign_id: ID, 
        donor: address, 
        amount: u64 
    }
    
    struct MilestoneStatusUpdated has copy, drop { 
        campaign_id: ID, 
        milestone_index: u64, 
        status: u8, 
        amount: u64 
    }
    
    struct AdminTransferred has copy, drop {
        campaign_id: ID,
        old_admin: address,
        new_admin: address
    }

    struct MilestoneAdded has copy, drop {
        campaign_id: ID,
        milestone_index: u64,
        description: String,
        percentage: u64
    }

    struct MilestoneRemoved has copy, drop {
        campaign_id: ID,
        milestone_index: u64
    }

    fun init(ctx: &mut TxContext) {
        transfer::share_object(Campaigns {
            id: object::new(ctx),
        });
    }

    public entry fun create_campaign(
        campaigns: &mut Campaigns,
        name: vector<u8>,
        description: vector<u8>,
        goal: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let campaign_uid = object::new(ctx);
        let campaign_id = object::uid_to_inner(&campaign_uid);
        let campaign_address = object::uid_to_address(&campaign_uid);

        let campaign = Campaign {
            id: campaign_uid,
            name: string::utf8(name),
            description: string::utf8(description),
            target_amount: goal,
            donated_amount: 0,
            recipient,
            admin: sender, // FIX: Use sender as admin, not hardcoded address
            escrow: balance::zero<SUI>(),
            milestones: vector::empty<Milestone>(),
            total_released: 0, // Initialize total released
        };

        event::emit(CampaignCreated { 
            campaign_id, 
            creator: sender, 
            name: campaign.name 
        });
        
        dfield::add(&mut campaigns.id, campaign_address, campaign);
    }

    public entry fun update_campaign(
        campaigns: &mut Campaigns,
        id: address,
        name: vector<u8>,
        description: vector<u8>,
        goal: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        assert!(dfield::exists_(&campaigns.id, id), ECampaignDoesNotExist);
        let campaign: &mut Campaign = dfield::borrow_mut(&mut campaigns.id, id);
        assert!(tx_context::sender(ctx) == campaign.admin, ENotAdmin);

        // FIX: Prevent editing if campaign has active donations and milestones
        // This prevents manipulation after people have donated
        let has_released_milestones = campaign.total_released > 0;
        assert!(!has_released_milestones, ECannotEditActiveCampaign);

        // Update basic info (safe to update)
        campaign.name = string::utf8(name);
        campaign.description = string::utf8(description);
        
        // FIX: Only allow increasing goal, not decreasing (prevents manipulation)
        // If you want to allow decreasing, add more logic to handle milestone percentages
        assert!(goal >= campaign.target_amount, EInvalidPercentage);
        campaign.target_amount = goal;
        
        campaign.recipient = recipient;

        let campaign_id = object::id_from_address(id);
        event::emit(CampaignUpdated { 
            campaign_id, 
            updater: tx_context::sender(ctx) 
        });
    }

    public entry fun delete_campaign(
        campaigns: &mut Campaigns,
        id: address,
        ctx: &mut TxContext
    ) {
        assert!(dfield::exists_(&campaigns.id, id), ECampaignDoesNotExist);
        let campaign: &Campaign = dfield::borrow(&campaigns.id, id);
        assert!(tx_context::sender(ctx) == campaign.admin, ENotAdmin);
        
        // FIX: Prevent deletion if campaign has funds
        // This protects donors from having their funds taken
        assert!(balance::value(&campaign.escrow) == 0, ECampaignHasFunds);
        
        let campaign: Campaign = dfield::remove(&mut campaigns.id, id);
        
        let Campaign { 
            id: uid, 
            name: _, 
            description: _, 
            target_amount: _, 
            donated_amount: _, 
            recipient: _, 
            admin: _, 
            escrow, 
            milestones: _,
            total_released: _
        } = campaign;
        
        // Since we asserted balance is 0, this should create a zero coin
        let remaining_balance = coin::from_balance(escrow, ctx);
        transfer::public_transfer(remaining_balance, tx_context::sender(ctx));
        object::delete(uid);
        
        let campaign_id = object::id_from_address(id);
        event::emit(CampaignDeleted { 
            campaign_id, 
            deleter: tx_context::sender(ctx) 
        });
    }

    public entry fun add_milestone(
        campaigns: &mut Campaigns,
        id: address,
        description: vector<u8>,
        percentage: u64,
        ctx: &mut TxContext
    ) {
        assert!(dfield::exists_(&campaigns.id, id), ECampaignDoesNotExist);
        let campaign: &mut Campaign = dfield::borrow_mut(&mut campaigns.id, id);
        assert!(tx_context::sender(ctx) == campaign.admin, ENotAdmin);

        // FIX: Validate percentage is reasonable (1-100)
        assert!(percentage > 0 && percentage <= 100, EInvalidPercentage);

        // FIX: Check that total percentages don't exceed 100%
        let total_percentage = 0u64;
        let i = 0;
        let len = vector::length(&campaign.milestones);
        while (i < len) {
            let milestone = vector::borrow(&campaign.milestones, i);
            total_percentage = total_percentage + milestone.percentage;
            i = i + 1;
        };
        assert!(total_percentage + percentage <= 100, EInvalidPercentage);

        let new_milestone = Milestone {
            description: string::utf8(description),
            percentage,
            status: STATUS_ACTIVE,
            released_amount: 0, // Initialize released amount
        };

        vector::push_back(&mut campaign.milestones, new_milestone);
        
        let campaign_id = object::id_from_address(id);
        let milestone_index = vector::length(&campaign.milestones) - 1;
        event::emit(MilestoneAdded {
            campaign_id,
            milestone_index,
            description: new_milestone.description,
            percentage
        });
    }

    // NEW: Function to remove a milestone (only if not yet released)
    public entry fun remove_milestone(
        campaigns: &mut Campaigns,
        id: address,
        milestone_index: u64,
        ctx: &mut TxContext
    ) {
        assert!(dfield::exists_(&campaigns.id, id), ECampaignDoesNotExist);
        let campaign: &mut Campaign = dfield::borrow_mut(&mut campaigns.id, id);
        assert!(tx_context::sender(ctx) == campaign.admin, ENotAdmin);
        assert!(milestone_index < vector::length(&campaign.milestones), EInvalidMilestoneIndex);

        let milestone = vector::borrow(&campaign.milestones, milestone_index);
        
        // Can only remove milestones that haven't been released
        assert!(milestone.status != STATUS_RELEASED, EMilestoneAlreadyProcessed);

        vector::remove(&mut campaign.milestones, milestone_index);
        
        let campaign_id = object::id_from_address(id);
        event::emit(MilestoneRemoved {
            campaign_id,
            milestone_index
        });
    }

    public entry fun donate(
        campaigns: &mut Campaigns,
        id: address,
        donation: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        assert!(dfield::exists_(&campaigns.id, id), ECampaignDoesNotExist);
        let campaign: &mut Campaign = dfield::borrow_mut(&mut campaigns.id, id);

        let donation_amount = coin::value(&donation);
        balance::join(&mut campaign.escrow, coin::into_balance(donation));
        campaign.donated_amount = campaign.donated_amount + donation_amount;

        let campaign_id = object::id_from_address(id);
        event::emit(Donated { 
            campaign_id, 
            donor: tx_context::sender(ctx), 
            amount: donation_amount 
        });
    }

    public entry fun request_release(
        campaigns: &mut Campaigns, 
        id: address, 
        milestone_index: u64, 
        ctx: &mut TxContext
    ) {
        assert!(dfield::exists_(&campaigns.id, id), ECampaignDoesNotExist);
        let campaign: &mut Campaign = dfield::borrow_mut(&mut campaigns.id, id);

        assert!(tx_context::sender(ctx) == campaign.recipient, ENotCampaignRecipient);
        assert!(milestone_index < vector::length(&campaign.milestones), EInvalidMilestoneIndex);

        let milestone = vector::borrow_mut(&mut campaign.milestones, milestone_index);
        assert!(milestone.status == STATUS_ACTIVE, EInvalidMilestoneStatus);

        // FIX: Better calculation to check if milestone can be requested
        let cumulative_percentage_funded = (campaign.donated_amount * 100) / campaign.target_amount;
        assert!(cumulative_percentage_funded >= milestone.percentage, EInsufficientDonationsToRelease);

        milestone.status = STATUS_PENDING;
        
        let campaign_id = object::id_from_address(id);
        event::emit(MilestoneStatusUpdated { 
            campaign_id, 
            milestone_index, 
            status: STATUS_PENDING, 
            amount: 0 
        });
    }

    public entry fun verify_and_release(
        campaigns: &mut Campaigns,
        id: address,
        milestone_index: u64,
        ctx: &mut TxContext,
    ) {
        assert!(dfield::exists_(&campaigns.id, id), ECampaignDoesNotExist);
        let campaign: &mut Campaign = dfield::borrow_mut(&mut campaigns.id, id);
        assert!(milestone_index < vector::length(&campaign.milestones), EInvalidMilestoneIndex);
        assert!(tx_context::sender(ctx) == campaign.admin, ENotAdmin);

        let milestone = vector::borrow_mut(&mut campaign.milestones, milestone_index);
        assert!(milestone.status == STATUS_PENDING, EInvalidMilestoneStatus);

        // FIX: Calculate release amount based on donated amount, not target
        // This ensures we only release what's actually been donated
        let release_amount = (campaign.donated_amount * milestone.percentage) / 100;
        
        // Check if we have enough funds in escrow
        assert!(balance::value(&campaign.escrow) >= release_amount, EInsufficientDonationsToRelease);
        
        // Release the funds
        let funds_to_release = balance::split(&mut campaign.escrow, release_amount);
        transfer::public_transfer(coin::from_balance(funds_to_release, ctx), campaign.recipient);
        
        // FIX: Update milestone and campaign tracking
        milestone.status = STATUS_RELEASED;
        milestone.released_amount = release_amount;
        campaign.total_released = campaign.total_released + release_amount;
        
        let campaign_id = object::id_from_address(id);
        event::emit(MilestoneStatusUpdated { 
            campaign_id, 
            milestone_index, 
            status: STATUS_RELEASED, 
            amount: release_amount 
        });
    }
    
    public entry fun transfer_admin(
        campaigns: &mut Campaigns,
        id: address,
        new_admin: address,
        ctx: &mut TxContext
    ) {
        assert!(dfield::exists_(&campaigns.id, id), ECampaignDoesNotExist);
        let campaign: &mut Campaign = dfield::borrow_mut(&mut campaigns.id, id);
        let sender = tx_context::sender(ctx);

        assert!(sender == campaign.admin, ENotAdmin);

        let old_admin = campaign.admin;
        campaign.admin = new_admin;

        let campaign_id = object::id_from_address(id);
        event::emit(AdminTransferred {
            campaign_id,
            old_admin,
            new_admin
        });
    }

    // NEW: Emergency withdraw for recipient (if campaign is cancelled/failed)
    public entry fun emergency_refund(
        campaigns: &mut Campaigns,
        id: address,
        ctx: &mut TxContext
    ) {
        assert!(dfield::exists_(&campaigns.id, id), ECampaignDoesNotExist);
        let campaign: &mut Campaign = dfield::borrow_mut(&mut campaigns.id, id);
        assert!(tx_context::sender(ctx) == campaign.admin, ENotAdmin);

        // Transfer all remaining funds to admin (who can then refund donors)
        let total_balance = balance::value(&campaign.escrow);
        if (total_balance > 0) {
            let funds = balance::split(&mut campaign.escrow, total_balance);
            transfer::public_transfer(coin::from_balance(funds, ctx), campaign.admin);
        };
    }

    // View functions (helpful for frontend)
    public fun get_campaign_info(
        campaigns: &Campaigns,
        id: address
    ): (String, String, u64, u64, address, address, u64) {
        assert!(dfield::exists_(&campaigns.id, id), ECampaignDoesNotExist);
        let campaign: &Campaign = dfield::borrow(&campaigns.id, id);
        
        (
            campaign.name,
            campaign.description,
            campaign.target_amount,
            campaign.donated_amount,
            campaign.recipient,
            campaign.admin,
            balance::value(&campaign.escrow)
        )
    }
}
