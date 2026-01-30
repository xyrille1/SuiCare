module sui_care::sui_care {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use std::string::{Self, String};
    use sui::object::{Self, ID, UID};
    use sui::event;
    use sui::table::{Self, Table};
    use std::vector;

    // A single donation record
    struct Donation has store, copy, drop {
        donor: address,
        amount: u64,
        timestamp: u64,
    }

    // A campaign for donations.
    struct Campaign has key, store {
        id: UID,
        creator: address,
        name: String,
        description: String,
        goal: u64,
        raised: u64,
        donations: Table<u64, Donation>, // Stores donation history
        donation_count: u64,
    }

    // A verified victim registry.
    struct VerifiedVictimRegistry has key {
        id: UID,
        verified_addresses: Table<address, bool>,
    }

    // Capability to add verified victims.
    struct AdminCapability has key {
        id: UID,
    }

    // Event emitted when a new campaign is created.
    struct CampaignCreated has copy, drop {
        id: ID,
        creator: address,
        name: String,
    }

    // Event emitted when a donation is made.
    struct Donated has copy, drop {
        campaign_id: ID,
        donor: address,
        amount: u64,
    }

    // Event for when a victim is verified
    struct VictimVerified has copy, drop {
        victim_address: address,
        verified_by: address,
    }

    // Error for when the donation amount is too low
    const EDonationTooLow: u64 = 0;

    // Minimum donation amount to prevent spam
    const MIN_DONATION: u64 = 1000000; // 0.001 SUI

    fun init(ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        transfer::transfer(AdminCapability {
            id: object::new(ctx),
        }, sender);

        transfer::share_object(VerifiedVictimRegistry {
            id: object::new(ctx),
            verified_addresses: table::new(ctx),
        });
    }

    public fun create_campaign(
        name: vector<u8>,
        description: vector<u8>,
        goal: u64,
        ctx: &mut TxContext,
    ) {
        let campaign_id = object::new(ctx);
        let sender = tx_context::sender(ctx);

        event::emit(CampaignCreated {
            id: object::id(&campaign_id),
            creator: sender,
            name: string::utf8(name),
        });

        transfer::public_transfer(
            Campaign {
                id: campaign_id,
                creator: sender,
                name: string::utf8(name),
                description: string::utf8(description),
                goal,
                raised: 0,
                donations: table::new(ctx),
                donation_count: 0,
            },
            sender,
        );
    }

    public fun verify_victim(
        _cap: &AdminCapability,
        registry: &mut VerifiedVictimRegistry,
        victim_address: address,
        ctx: &mut TxContext,
    ) {
        table::add(&mut registry.verified_addresses, victim_address, true);
        event::emit(VictimVerified {
            victim_address,
            verified_by: tx_context::sender(ctx),
        })
    }

    public entry fun donate(
        campaign: &mut Campaign,
        amount: Coin<SUI>,
        ctx: &mut TxContext,
    ) {
        let amount_value = coin::value(&amount);
        assert!(amount_value >= MIN_DONATION, EDonationTooLow);

        let sender = tx_context::sender(ctx);

        let donation = Donation {
            donor: sender,
            amount: amount_value,
            timestamp: tx_context::epoch_timestamp_ms(ctx),
        };
        table::add(&mut campaign.donations, campaign.donation_count, donation);
        campaign.donation_count = campaign.donation_count + 1;

        campaign.raised = campaign.raised + amount_value;
        transfer::public_transfer(amount, campaign.creator);

        event::emit(Donated {
            campaign_id: object::id(campaign),
            donor: sender,
            amount: amount_value,
        });
    }

    public fun is_victim_verified(registry: &VerifiedVictimRegistry, victim_address: address): bool {
        table::contains(&registry.verified_addresses, victim_address)
    }

    // View function to get total number of donations for a campaign
    public fun get_donation_count(campaign: &Campaign): u64 {
        campaign.donation_count
    }

    // View function to get donations for a campaign with pagination
    public fun get_donations(campaign: &Campaign, start: u64, limit: u64): vector<Donation> {
        let result = vector::empty<Donation>();
        let i = start;
        let end = start + limit;
        if (end > campaign.donation_count) {
            end = campaign.donation_count;
        };

        while (i < end) {
            vector::push_back(&mut result, *table::borrow(&campaign.donations, i));
            i = i + 1;
        };
        result
    }
}
