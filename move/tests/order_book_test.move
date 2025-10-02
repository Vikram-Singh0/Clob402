#[test_only]
module clob_strategy_vault::order_book_tests {
    use std::signer;
    use aptos_framework::timestamp;
    use clob_strategy_vault::order_book::{Self, OrderBook};

    const ORDER_SIDE_BID: u8 = 0;
    const ORDER_SIDE_ASK: u8 = 1;

    #[test(admin = @clob_strategy_vault)]
    public fun test_initialize_order_book(admin: &signer) {
        // Initialize order book
        order_book::initialize_order_book(admin);
        
        // Verify order book exists
        let admin_addr = signer::address_of(admin);
        assert!(exists<OrderBook>(admin_addr), 1);
    }

    #[test(admin = @clob_strategy_vault, user = @0x123)]
    #[expected_failure(abort_code = 1, location = clob_strategy_vault::order_book)]
    public fun test_place_order_without_initialization(admin: &signer, user: &signer) {
        let admin_addr = signer::address_of(admin);
        
        // Try to place order without initialization (should fail)
        order_book::place_order(user, admin_addr, 100, 50, ORDER_SIDE_BID);
    }

    #[test(admin = @clob_strategy_vault, user = @0x123, framework = @0x1)]
    public fun test_place_bid_order(admin: &signer, user: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        
        // Initialize order book
        order_book::initialize_order_book(admin);
        let admin_addr = signer::address_of(admin);
        
        // Place a bid order
        order_book::place_order(user, admin_addr, 100, 50, ORDER_SIDE_BID);
        
        // Verify order was placed (order_id 1)
        let order = order_book::get_order(admin_addr, 1);
        assert!(order.price == 100, 1);
        assert!(order.quantity == 50, 2);
        assert!(order.side == ORDER_SIDE_BID, 3);
    }

    #[test(admin = @clob_strategy_vault, user = @0x123, framework = @0x1)]
    public fun test_place_ask_order(admin: &signer, user: &signer, framework: &signer) {
        // Initialize timestamp for testing
        timestamp::set_time_has_started_for_testing(framework);
        
        // Initialize order book
        order_book::initialize_order_book(admin);
        let admin_addr = signer::address_of(admin);
        
        // Place an ask order
        order_book::place_order(user, admin_addr, 100, 50, ORDER_SIDE_ASK);
        
        // Verify order was placed
        let order = order_book::get_order(admin_addr, 1);
        assert!(order.price == 100, 1);
        assert!(order.quantity == 50, 2);
        assert!(order.side == ORDER_SIDE_ASK, 3);
    }

    #[test(admin = @clob_strategy_vault, user = @0x123, framework = @0x1)]
    #[expected_failure(abort_code = 3, location = clob_strategy_vault::order_book)]
    public fun test_place_order_with_zero_price(admin: &signer, user: &signer, framework: &signer) {
        timestamp::set_time_has_started_for_testing(framework);
        order_book::initialize_order_book(admin);
        let admin_addr = signer::address_of(admin);
        
        // Try to place order with zero price (should fail)
        order_book::place_order(user, admin_addr, 0, 50, ORDER_SIDE_BID);
    }

    #[test(admin = @clob_strategy_vault, user = @0x123, framework = @0x1)]
    #[expected_failure(abort_code = 4, location = clob_strategy_vault::order_book)]
    public fun test_place_order_with_zero_quantity(admin: &signer, user: &signer, framework: &signer) {
        timestamp::set_time_has_started_for_testing(framework);
        order_book::initialize_order_book(admin);
        let admin_addr = signer::address_of(admin);
        
        // Try to place order with zero quantity (should fail)
        order_book::place_order(user, admin_addr, 100, 0, ORDER_SIDE_BID);
    }

    #[test(admin = @clob_strategy_vault, user = @0x123, framework = @0x1)]
    public fun test_cancel_order(admin: &signer, user: &signer, framework: &signer) {
        timestamp::set_time_has_started_for_testing(framework);
        order_book::initialize_order_book(admin);
        let admin_addr = signer::address_of(admin);
        
        // Place an order
        order_book::place_order(user, admin_addr, 100, 50, ORDER_SIDE_BID);
        
        // Cancel the order
        order_book::cancel_order(user, admin_addr, 1);
        
        // Verify order was cancelled (status = 2)
        let order = order_book::get_order(admin_addr, 1);
        assert!(order.status == 2, 1);
    }

    #[test(admin = @clob_strategy_vault, user1 = @0x123, user2 = @0x456, framework = @0x1)]
    #[expected_failure(abort_code = 6, location = clob_strategy_vault::order_book)]
    public fun test_cancel_order_unauthorized(
        admin: &signer,
        user1: &signer,
        user2: &signer,
        framework: &signer
    ) {
        timestamp::set_time_has_started_for_testing(framework);
        order_book::initialize_order_book(admin);
        let admin_addr = signer::address_of(admin);
        
        // User1 places an order
        order_book::place_order(user1, admin_addr, 100, 50, ORDER_SIDE_BID);
        
        // User2 tries to cancel user1's order (should fail)
        order_book::cancel_order(user2, admin_addr, 1);
    }

    #[test(admin = @clob_strategy_vault, user = @0x123, facilitator = @0x789, framework = @0x1)]
    public fun test_fill_order_partially(
        admin: &signer,
        user: &signer,
        facilitator: &signer,
        framework: &signer
    ) {
        timestamp::set_time_has_started_for_testing(framework);
        order_book::initialize_order_book(admin);
        let admin_addr = signer::address_of(admin);
        
        // Place an order
        order_book::place_order(user, admin_addr, 100, 50, ORDER_SIDE_BID);
        
        // Partially fill the order
        order_book::fill_order(facilitator, admin_addr, 1, 30);
        
        // Verify partial fill
        let order = order_book::get_order(admin_addr, 1);
        assert!(order.filled_quantity == 30, 1);
        assert!(order.status == 3, 2); // STATUS_PARTIALLY_FILLED
    }

    #[test(admin = @clob_strategy_vault, user = @0x123, facilitator = @0x789, framework = @0x1)]
    public fun test_fill_order_completely(
        admin: &signer,
        user: &signer,
        facilitator: &signer,
        framework: &signer
    ) {
        timestamp::set_time_has_started_for_testing(framework);
        order_book::initialize_order_book(admin);
        let admin_addr = signer::address_of(admin);
        
        // Place an order
        order_book::place_order(user, admin_addr, 100, 50, ORDER_SIDE_BID);
        
        // Completely fill the order
        order_book::fill_order(facilitator, admin_addr, 1, 50);
        
        // Verify complete fill
        let order = order_book::get_order(admin_addr, 1);
        assert!(order.filled_quantity == 50, 1);
        assert!(order.status == 1, 2); // STATUS_FILLED
    }

    #[test(admin = @clob_strategy_vault, user = @0x123, framework = @0x1)]
    public fun test_get_user_orders(admin: &signer, user: &signer, framework: &signer) {
        timestamp::set_time_has_started_for_testing(framework);
        order_book::initialize_order_book(admin);
        let admin_addr = signer::address_of(admin);
        let user_addr = signer::address_of(user);
        
        // Place multiple orders
        order_book::place_order(user, admin_addr, 100, 50, ORDER_SIDE_BID);
        order_book::place_order(user, admin_addr, 110, 30, ORDER_SIDE_ASK);
        
        // Get user's orders
        let user_orders = order_book::get_user_orders(admin_addr, user_addr);
        assert!(std::vector::length(&user_orders) == 2, 1);
    }

    #[test(admin = @clob_strategy_vault, user = @0x123, framework = @0x1)]
    public fun test_multiple_orders_sequential_ids(
        admin: &signer,
        user: &signer,
        framework: &signer
    ) {
        timestamp::set_time_has_started_for_testing(framework);
        order_book::initialize_order_book(admin);
        let admin_addr = signer::address_of(admin);
        
        // Place multiple orders and verify sequential IDs
        order_book::place_order(user, admin_addr, 100, 50, ORDER_SIDE_BID);
        order_book::place_order(user, admin_addr, 110, 30, ORDER_SIDE_ASK);
        order_book::place_order(user, admin_addr, 120, 20, ORDER_SIDE_BID);
        
        let order1 = order_book::get_order(admin_addr, 1);
        let order2 = order_book::get_order(admin_addr, 2);
        let order3 = order_book::get_order(admin_addr, 3);
        
        assert!(order1.order_id == 1, 1);
        assert!(order2.order_id == 2, 2);
        assert!(order3.order_id == 3, 3);
    }
}

